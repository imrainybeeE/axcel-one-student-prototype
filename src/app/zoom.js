// The iOS zoom transition: a tapped card grows into the screen it opens, and Back shrinks that screen into the card.
// React pairs the two as a shared element: the row (List.jsx) and the screen (Screen.jsx) are <ViewTransition>s
// with the same zoomName, so the browser morphs one rectangle into the other (styles in shell.css).
// This module only tracks direction, so the route around the morph recedes (in) or returns (out),
// and keeps the transition's bookkeeping until it has really finished.

const openedBy = new Map() // history idx of a zoomed-in screen -> true
export const zoomState = { pending: null } // 'in' | 'out' while a zoom transition is being set up

const able = () => typeof document.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** The share prop for both halves of a pair: they pair only in a zoom, so no other move (a tab switch, a push)
 *  lifts a card and a screen that happen to share a path out of the page */
export const ZOOM_SHARE = { 'nav-zoom': 'zoom', 'nav-unzoom': 'zoom', default: 'none' }

/** The shared-element name for a path: "/messages/kavitha" -> "zoom-messages-kavitha". */
export const zoomName = (path) => `zoom${String(path).split('?')[0].replace(/[^a-zA-Z0-9]+/g, '-')}`

/** Before a push from a zoomable card. */
export function zoomFrom() {
  if (!able()) return
  zoomState.pending = 'in'
  openedBy.set((window.history.state?.idx ?? 0) + 1, true)
}

/** Whether the screen at this history idx was zoomed open (the edge swipe shrinks it back by hand). */
export const wasZoomed = (idx) => openedBy.has(idx) && able()
/** The edge swipe has taken the screen back itself, so the next pop must not run the unzoom too. */
export const forgetZoom = (idx) => { openedBy.delete(idx) }

/** Before a pop: if the screen being left was zoomed open, it shrinks back into its card. */
export function zoomBackFrom(idx) {
  if (!openedBy.has(idx) || !able()) return
  openedBy.delete(idx)
  zoomState.pending = 'out'
}

/**
 * Every route change: mark the document while a transition runs (CSS swaps the SVG glass for plain blur so the
 * snapshots keep the tab bar), remember where the old page was scrolled so it recedes around what the student was
 * looking at, and clear it all when the transition finishes.
 */
export function beginRouteTransition() {
  const html = document.documentElement
  html.dataset.vt = ''
  html.style.setProperty('--vt-old-y', `${window.scrollY}px`)
}
export function routeCommitted() {
  const html = document.documentElement
  html.style.setProperty('--vt-new-y', `${window.scrollY}px`)
  const done = () => { delete html.dataset.vt; zoomState.pending = null }
  // Back with no card left to land in (reading an unread card removes it): the screen shrinks away instead (CSS)
  const now = document.activeViewTransition
  if (now && zoomState.pending === 'out') {
    now.ready.then(() => {
      if (!document.getAnimations().some((a) => a.effect?.pseudoElement?.startsWith('::view-transition-group(zoom-'))) now.types.add('nav-zoom-lost')
    }, () => {})
  }
  // The transition object exists once React has started it; fall back to a timer where it does not
  requestAnimationFrame(() => {
    const vt = document.activeViewTransition
    if (vt) vt.finished.finally(done)
    else setTimeout(done, 700)
  })
}
