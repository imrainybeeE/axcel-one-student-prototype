// Router state and hooks (no components). The provider is RouterProvider.jsx, links are Link.jsx.
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { TAB_ROOTS } from './nav.js'

export const RouterContext = createContext(null)

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Convert a browser URL path into the app's route path. */
export function appPathname(pathname) {
  if (!BASE_PATH) return pathname || '/'
  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) return '/'
  return pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) : pathname || '/'
}

/** Add Vite's deployment prefix to an internal route while keeping local paths unchanged. */
export function sitePathname(pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (!BASE_PATH || path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path
  return `${BASE_PATH}${path}`
}

export function assetPath(pathname) {
  return `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, '')}`
}

export function withBasePath(to) {
  const url = new URL(to, window.location.origin)
  return sitePathname(appPathname(url.pathname)) + url.search + url.hash
}

/* ---------- Matching ---------- */
function compile(pattern) {
  if (pattern === '*') return { pattern, re: /^.*$/, keys: [] }
  const keys = []
  const src = pattern.replace(/\/+$/, '').replace(/:([A-Za-z0-9_]+)/g, (_, k) => { keys.push(k); return '([^/]+)' })
  return { pattern, re: new RegExp(`^${src || ''}/?$`), keys }
}

export function matchRoute(routes, pathname) {
  for (const r of routes) {
    const c = r._c || (r._c = compile(r.path))
    const m = c.re.exec(pathname)
    if (m) {
      const params = {}
      c.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]) })
      return { route: r, params }
    }
  }
  return null
}

/* ---------- Demo params that follow you around the app ---------- */
const CARRY = ['t', 'd', 'speed', 'theme', 'v']
export function withDemoParams(to, fromSearch = window.location.search) {
  const url = new URL(to, window.location.origin)
  const from = new URLSearchParams(fromSearch)
  for (const k of CARRY) if (from.has(k) && !url.searchParams.has(k)) url.searchParams.set(k, from.get(k))
  // Being offline is a device condition, so it carries; loading, empty and error belong to one screen.
  if (from.get('state') === 'offline' && !url.searchParams.has('state')) url.searchParams.set('state', 'offline')
  return sitePathname(appPathname(url.pathname)) + (url.search ? url.search : '') + url.hash
}

/* ---------- Module state (one router per page) ---------- */
export const internal = { api: null } // set by the provider
export const entries = []                 // in-app history: idx -> { path, search, tab }
export const scrollByIdx = new Map()      // idx -> scrollY when left
export const scrollByPath = new Map()     // path+search -> scrollY when left (tab switches)
export const openerByIdx = new Map()      // idx -> how to find the control that opened the next screen
export const lastPathByTab = {}           // tab -> path+search
const retapListeners = new Set()
export const seq = { key: 0 }

export function describeOpener(el) {
  if (!el || el === document.body) return null
  const a = el.closest('a[href]')
  if (a) return { href: a.getAttribute('href') }
  const id = el.closest('[data-opener]')
  if (id) return { opener: id.getAttribute('data-opener') }
  if (el.id) return { id: el.id }
  return null
}
export function findOpener(d) {
  if (!d) return null
  const main = document.getElementById('main')
  if (!main) return null
  if (d.href) return main.querySelector(`a[href="${CSS.escape(d.href)}"]`)
  if (d.opener) return main.querySelector(`[data-opener="${CSS.escape(d.opener)}"]`)
  if (d.id) return document.getElementById(d.id)
  return null
}

export function tabFor(route, currentTab) {
  if (!route) return currentTab || 'today'
  if (route.tab === 'inherit') return currentTab || route.defaultTab || 'more'
  return route.tab || currentTab || 'today'
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Navigate inside the app.
 * type: 'push' (slides in), 'pop' (slides back), 'tab' (no animation, restores scroll), 'none' (no animation, keeps scroll and focus).
 */
export function navigate(to, { replace = false, type = 'push', tab, carry = true } = {}) {
  if (!internal.api) { window.location.assign(carry ? withDemoParams(to) : withBasePath(to)); return }
  internal.api.navigate(to, { replace, type, tab, carry })
}

/** Replace query params on the current screen without moving scroll or focus. null deletes a key, demo params included. */
export function updateQuery(changes) {
  const url = new URL(window.location.href)
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === undefined) url.searchParams.delete(k)
    else url.searchParams.set(k, v)
  }
  navigate(url.pathname + url.search, { replace: true, type: 'none', carry: false })
}

/** { loc, route, params, query, tab, pending, pendingTo } */
export function useRoute() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRoute needs <RouterProvider>')
  return ctx
}

function routeTitleFor(path) {
  if (!internal.api) return ''
  const m = matchRoute(internal.api.routes, path)
  return m?.route?.title || ''
}

/**
 * Where Back goes from a pushed screen, or null on a tab root. Goes to the previous in-app entry when it is in the
 * same tab, otherwise to the route's parent (or the tab root). Shared by the Back button and the edge swipe.
 * { usePrev, prevIdx, parentPath, destPath, title }
 */
export function backTarget(loc, route) {
  if (!route || route.root || route.chrome === false) return null
  const prev = entries[loc.idx - 1]
  const parentPath = route.parent || TAB_ROOTS[loc.tab] || '/'
  const usePrev = Boolean(prev && prev.tab === loc.tab && prev.path !== loc.path)
  const destPath = usePrev ? prev.path : parentPath
  return { usePrev, prevIdx: loc.idx - 1, parentPath, destPath, title: routeTitleFor(destPath) || 'previous screen' }
}

/**
 * Back for pushed screens. label is "Back to Messages".
 */
export function useBack() {
  const { loc, route } = useRoute()
  return useMemo(() => {
    const t = backTarget(loc, route)
    if (!t) return null
    return {
      label: `Back to ${t.title}`,
      title: t.title,
      go() {
        if (t.usePrev && window.history.state?.idx === loc.idx) window.history.back()
        else navigate(t.parentPath, { replace: true, type: 'pop' })
      },
    }
  }, [loc, route])
}

/**
 * The edge swipe's hand-off to the router (edgeBack.js, EdgeUnderlay.jsx, RouterProvider.jsx).
 * pending: the next pop is the gesture's commit, so it lands at once with no second transition, at scroll y.
 * The under store holds the screen drawn under the dragged one: { path, search, tab, idx, y } or null.
 */
export const edgeNav = { pending: false, y: 0 }
let under = null
const underListeners = new Set()
export const underStore = {
  get: () => under,
  set(v) { under = v; for (const fn of underListeners) fn() },
  subscribe(fn) { underListeners.add(fn); return () => underListeners.delete(fn) },
}

/** Tab bar and sidebar behaviour for a tab link. */
export function goToTab(tab, currentTab, currentRoute) {
  const root = TAB_ROOTS[tab]
  if (tab !== currentTab) {
    navigate(lastPathByTab[tab] || root, { type: 'tab', tab })
    return
  }
  // Re-tap the active tab: scrolled -> top; top of a pushed screen -> root; root at top -> the tab's own refresh.
  if (window.scrollY > 2) {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })
    return
  }
  if (!currentRoute?.root) {
    navigate(root, { type: 'pop', tab })
    return
  }
  for (const fn of retapListeners) fn(tab)
}

/** Run handler when the active tab is re-tapped at the top of its root (Today refreshes, Timetable jumps to now). */
export function useTabRetap(tab, handler) {
  const ref = useRef(handler)
  useEffect(() => { ref.current = handler })
  useEffect(() => {
    const fn = (t) => { if (t === tab) ref.current() }
    retapListeners.add(fn)
    return () => retapListeners.delete(fn)
  }, [tab])
}
