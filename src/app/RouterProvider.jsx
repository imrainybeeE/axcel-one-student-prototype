// The history-API router's provider: owns the location, scroll restoration and focus after route changes.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, addTransitionType } from 'react'
import { flushSync } from 'react-dom'
import {
  RouterContext, internal, matchRoute, withDemoParams, withBasePath, appPathname, tabFor, entries, scrollByIdx, scrollByPath, openerByIdx,
  lastPathByTab, seq, describeOpener, findOpener, edgeNav, underStore,
} from './router.js'
import { zoomState, zoomBackFrom, beginRouteTransition, routeCommitted, forgetZoom } from './zoom.js'

export function RouterProvider({ routes, children }) {
  const [isPending, startTransition] = useTransition()
  const [pendingTo, setPendingTo] = useState(null)
  const [loc, setLoc] = useState(() => {
    const idx = window.history.state?.idx ?? 0
    const path = appPathname(window.location.pathname)
    const m = matchRoute(routes, path)
    const tab = window.history.state?.tab || tabFor(m?.route, null)
    window.history.replaceState({ ...window.history.state, idx, tab }, '')
    entries[idx] = { path, search: window.location.search, tab }
    return { path, search: window.location.search, idx, tab, type: 'initial', key: ++seq.key }
  })
  const locRef = useRef(loc)
  useLayoutEffect(() => { locRef.current = loc }, [loc])

  const commit = useCallback((next) => {
    // The edge swipe already drew the way back: land at once, outside a transition (so React starts no view
    // transition), dropping the screen drawn underneath in the same synchronous render, so no frame shows neither
    if (next.type === 'edge') {
      forgetZoom(locRef.current.idx)
      flushSync(() => {
        underStore.set(null)
        setLoc({ ...next, y: edgeNav.y })
      })
      return
    }
    if (next.type === 'pop') zoomBackFrom(locRef.current.idx)
    if (next.type !== 'none') beginRouteTransition()
    const vt = zoomState.pending === 'in' ? 'nav-zoom' : zoomState.pending === 'out' ? 'nav-unzoom'
      : next.type === 'push' ? 'nav-forward' : next.type === 'pop' ? 'nav-back' : next.type === 'tab' ? 'nav-tab' : 'nav-none'
    setPendingTo(next.path + next.search)
    startTransition(() => {
      addTransitionType(vt)
      setLoc(next)
    })
  }, [])

  // The provider's navigate, exposed through the module-level api
  useEffect(() => {
    internal.api = {
      routes,
      navigate(to, { replace, type, tab, carry }) {
        const cur = locRef.current
        const href = carry ? withDemoParams(to) : withBasePath(to)
        const url = new URL(href, window.location.origin)
        const path = appPathname(url.pathname)
        if (type !== 'none') {
          scrollByIdx.set(cur.idx, window.scrollY)
          scrollByPath.set(cur.path + cur.search, window.scrollY)
          openerByIdx.set(cur.idx, describeOpener(document.activeElement))
        }
        const m = matchRoute(routes, path)
        const nextTab = tab || tabFor(m?.route, cur.tab)
        const idx = replace ? cur.idx : cur.idx + 1
        const state = { idx, tab: nextTab }
        if (replace) window.history.replaceState(state, '', href)
        else window.history.pushState(state, '', href)
        entries[idx] = { path, search: url.search, tab: nextTab }
        if (!replace) entries.length = idx + 1
        commit({ path, search: url.search, idx, tab: nextTab, type, key: ++seq.key })
      },
    }
    return () => { internal.api = null }
  }, [routes, commit])

  // Browser Back and Forward
  useEffect(() => {
    const onPop = (e) => {
      const cur = locRef.current
      scrollByIdx.set(cur.idx, window.scrollY)
      scrollByPath.set(cur.path + cur.search, window.scrollY)
      const idx = e.state?.idx ?? 0
      const path = appPathname(window.location.pathname)
      const m = matchRoute(routes, path)
      const tab = e.state?.tab || tabFor(m?.route, cur.tab)
      entries[idx] = { path, search: window.location.search, tab }
      // The browser may have animated the back swipe itself (a Safari tab, Android's back gesture): then land at
      // once, as the edge swipe does, rather than run the pop transition a second time
      if (!edgeNav.pending && e.hasUAVisualTransition && idx < cur.idx) edgeNav.y = scrollByIdx.get(idx) ?? 0
      const type = edgeNav.pending || (e.hasUAVisualTransition && idx < cur.idx) ? 'edge' : idx < cur.idx ? 'pop' : 'push'
      edgeNav.pending = false
      commit({ path, search: window.location.search, idx, tab, type, key: ++seq.key })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [routes, commit])

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  // After each committed route change: remember the tab's path, restore scroll, move focus.
  useLayoutEffect(() => {
    lastPathByTab[loc.tab] = loc.path + loc.search
    if (loc.type === 'initial' || loc.type === 'none') return
    let y = 0
    if (loc.type === 'pop') y = scrollByIdx.get(loc.idx) ?? 0
    else if (loc.type === 'tab') y = scrollByPath.get(loc.path + loc.search) ?? 0
    else if (loc.type === 'edge') y = loc.y ?? 0
    window.scrollTo({ top: y, left: 0, behavior: 'instant' })
    if (loc.type !== 'edge') routeCommitted()
    const opener = loc.type === 'pop' || loc.type === 'edge' ? findOpener(openerByIdx.get(loc.idx)) : null
    const target = opener || document.querySelector('#main h1')
    if (target) target.focus({ preventScroll: true })
  }, [loc])

  const match = useMemo(() => matchRoute(routes, loc.path) || { route: routes[routes.length - 1], params: {} }, [routes, loc.path])
  const query = useMemo(() => new URLSearchParams(loc.search), [loc.search])

  const value = useMemo(() => ({
    loc, route: match.route, params: match.params, query, tab: loc.tab,
    pending: isPending, pendingTo: isPending ? pendingTo : null,
  }), [loc, match, query, isPending, pendingTo])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}
