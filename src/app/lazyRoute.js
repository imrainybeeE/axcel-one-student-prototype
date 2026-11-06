// A lazily loaded screen whose code is fetched the moment a link to it is about to be used, so a tap
// rarely waits for it and a visit only downloads the screens it opens.
import { lazy } from 'react'

/** lazy() plus a preload(): lazyRoute(() => import('./Timetable.jsx')) */
export function lazyRoute(load) {
  let promise = null
  // Every screen but the first may use any icon or move with a transition: secondScreen.js comes with its code
  const once = () => (promise ??= Promise.all([load(), import('./secondScreen.js')]).then(([m]) => m))
  const component = lazy(once)
  component.preload = once
  return component
}

/**
 * Fetch a screen's code on intent: a pointer resting on a link, a finger landing on it, or keyboard focus.
 * resolve(href) returns the route's component (or null); preload() runs once per screen.
 */
export function preloadOnIntent(resolve) {
  const warm = (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null
    if (!a || a.target === '_blank') return
    const url = new URL(a.href, window.location.href)
    if (url.origin !== window.location.origin) return
    resolve(url.pathname)?.preload?.()?.catch(() => {})
  }
  for (const type of ['pointerover', 'touchstart', 'focusin']) document.addEventListener(type, warm, { passive: true, capture: true })
}
