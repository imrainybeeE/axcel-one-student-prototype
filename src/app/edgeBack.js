// The iOS edge swipe back. On a pushed screen, a finger that starts at the left edge and moves sideways drags the
// screen away 1:1 while the one under it comes back (EdgeUnderlay.jsx). On release it goes back if the finger, plus
// where its flick would carry it, has passed half the width; otherwise it springs home. Either way the spring starts
// at the finger's speed. Touch and pen only, under 1024 px.
// A screen that zoomed open from a card shrinks as it is dragged and, on release, flies back into that card.
// One number drives the look: --edge-p on <html>, 0 at rest to 1 gone (shell.css turns it into every transform).
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useRoute, backTarget, entries, scrollByIdx, edgeNav, underStore, navigate, withDemoParams, appPathname } from './router.js'
import { wasZoomed } from './zoom.js'
import { project, springFrom } from '../ui/physics.js'

const EDGE = 20 // px from the left edge where a touch may start the gesture
const SLOP = 8 // px of movement before deciding whether it is sideways
const html = () => document.documentElement
const main = () => document.getElementById('main')
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let g = null // the armed or running gesture
let settling = [] // the release animations

function setP(p, dy = 0) {
  html().style.setProperty('--edge-p', String(p))
  html().style.setProperty('--edge-dy', `${dy}px`)
}

/** Drop every trace of the gesture: after its pop has rendered, after a cancel, or if a navigation cut it short. */
function clear() {
  for (const a of settling) a.cancel()
  settling = []
  g = null
  const h = html()
  if (h.dataset.edge === undefined) return
  // Back to rest in one step: .main eases its transform (the card stack in ui.css), so hold that off while it resets
  const m = main()
  if (m) { m.style.transition = 'none'; m.style.transform = ''; m.style.clipPath = ''; m.style.opacity = '' }
  delete h.dataset.edge
  for (const k of ['--edge-p', '--edge-dy', '--edge-oy', '--edge-top', '--edge-bottom']) h.style.removeProperty(k)
  if (m) { void getComputedStyle(m).transform; m.style.transition = '' }
}

function start(e, cur) {
  const { loc, target } = cur
  // The screen to draw underneath: the previous history entry at its saved scroll, or the parent at the top
  let u
  if (target.usePrev && window.history.state?.idx === loc.idx) {
    const prev = entries[target.prevIdx]
    u = { path: prev.path, search: prev.search, tab: prev.tab, idx: target.prevIdx, y: scrollByIdx.get(target.prevIdx) ?? 0, viaHistory: true }
  } else {
    const url = new URL(withDemoParams(target.parentPath), window.location.origin)
    u = { path: url.pathname, search: url.search, tab: loc.tab, idx: loc.idx, y: 0, viaHistory: false }
  }
  g.u = u
  g.parentPath = target.parentPath
  g.path = loc.path
  g.zoom = wasZoomed(loc.idx)
  g.started = true
  edgeNav.y = u.y
  try { html().setPointerCapture(e.pointerId) } catch { /* the pointer may already be gone */ }
  const h = html()
  setP(0)
  if (g.zoom) {
    // The page is as tall as its content: shrink it about the middle of the view, and cut it to the view
    const H = window.innerHeight
    h.style.setProperty('--edge-oy', `${window.scrollY + H / 2}px`)
    h.style.setProperty('--edge-top', `${window.scrollY}px`)
    h.style.setProperty('--edge-bottom', `${Math.max(0, main().offsetHeight - window.scrollY - H)}px`)
  }
  h.dataset.edge = g.zoom ? 'zoom' : 'slide'
  underStore.set(u)
}

/** The card this screen zoomed out of, in the screen underneath, where it will be once that screen is at rest. */
function tileRect(path) {
  const under = document.querySelector('.edge-under')
  if (!under) return null
  const a = [...under.querySelectorAll('a[href]')].find((el) => appPathname(new URL(el.href).pathname) === path)
  if (!a) return null
  const r = (a.closest('.row') || a).getBoundingClientRect()
  // Undo the underlay's own recede (a scale about the middle of the view, shell.css)
  const s = new DOMMatrixReadOnly(getComputedStyle(under).transform).a || 1
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  return { x: cx + (r.left - cx) / s, y: cy + (r.top - cy) / s, w: r.width / s, h: r.height / s }
}

function release(cancelled, e) {
  const gesture = g
  const W = window.innerWidth
  // A finger that rested before letting go has no flick left in it
  const v = cancelled || e.timeStamp - gesture.lastT > 50 ? 0 : gesture.v
  const x = gesture.x
  const go = !cancelled && x + project(v) > W / 2
  const p0 = x / W
  const to = go ? 1 : 0
  const left = Math.abs(to * W - x)
  // A fast flick settles on the snappy spring, a slow release on the smooth one (tools/springs.mjs)
  const [d, b] = Math.abs(v) > 0.3 ? [0.32, 0.15] : [0.4, 0]
  const toward = go ? v : -v // px per ms in the direction it is heading
  const { easing, duration } = reduced() ? { easing: 'linear', duration: 150 } : springFrom(d, b, left > 1 ? (toward * 1000) / left : 0)
  const h = html()
  const dy0 = gesture.dy
  const tile = go && gesture.zoom ? tileRect(gesture.path) : null
  // Into a card the path no longer follows the finger, so that flight starts from rest on the smooth spring
  const fly = tile && !reduced() ? springFrom(0.4, 0, 0) : { easing, duration }
  setP(to, 0)
  settling = [h.animate([{ '--edge-p': String(p0), '--edge-dy': `${dy0}px` }, { '--edge-p': String(to), '--edge-dy': '0px' }], fly)]
  if (tile) {
    // Into the card: from where the finger left it to the card's box, keeping the top of the screen (as the unzoom
    // transition does), the corners easing to the card's, and fading out as it lands so the card itself is left
    const m = main()
    const H = window.innerHeight
    const sy = window.scrollY
    const s = tile.w / W
    const bottom = Math.max(0, m.offsetHeight - sy - tile.h / s)
    const radius = parseFloat(getComputedStyle(h).getPropertyValue('--radius')) || 26
    const cs = getComputedStyle(m) // live: read what it shows now before writing where it ends
    const from = { transform: cs.transform, clipPath: cs.clipPath, opacity: 1 }
    const end = {
      // Scaled about the middle of the view (--edge-oy), the top of the view lands on the card's top
      transform: `translate3d(${tile.x + tile.w / 2 - W / 2}px, ${tile.y - (1 - s) * (H / 2)}px, 0) scale(${s})`,
      clipPath: `inset(${sy}px 0 ${bottom}px 0 round ${radius / s}px)`,
      opacity: 0,
    }
    Object.assign(m.style, end)
    // Solid until it is nearly in the card, then the card itself takes over (as the unzoom transition's late fade)
    settling.push(m.animate([from, { opacity: 1, offset: 0.6 }, end], fly))
  }
  Promise.all(settling.map((a) => a.finished)).then(() => {
    settling = []
    if (!go) { underStore.set(null); clear(); return }
    edgeNav.pending = true
    if (gesture.u.viaHistory) window.history.back()
    else navigate(gesture.parentPath, { replace: true, type: 'edge' })
  }, () => {})
}

/** Called once by the shell. */
export function useEdgeBack() {
  const { loc, route } = useRoute()
  const target = backTarget(loc, route)
  const cur = useRef({ loc, target })
  useLayoutEffect(() => { cur.current = { loc, target } })
  const pushed = Boolean(target)

  // Pushed screens let the browser pan only up and down, so a sideways drag reaches the gesture (shell.css)
  useEffect(() => {
    if (pushed) html().dataset.pushed = ''
    else delete html().dataset.pushed
  }, [pushed])

  // The gesture's pop has rendered (or another navigation happened): drop the drag in the same frame
  useLayoutEffect(() => { clear() }, [loc.key])

  useEffect(() => {
    const onDown = (e) => {
      if (g || settling.length) return
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return
      if (e.clientX > EDGE || window.innerWidth >= 1024) return
      if (!cur.current.target || document.querySelector('dialog[open]') || document.activeViewTransition) return
      if (e.target instanceof Element && e.target.closest('[data-scroll-x]')) return
      g = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: 0, dy: 0, lastX: e.clientX, lastT: e.timeStamp, v: 0, started: false, raf: 0 }
    }
    const onMove = (e) => {
      if (!g || e.pointerId !== g.id || settling.length) return
      const dx = e.clientX - g.x0
      const dy = e.clientY - g.y0
      if (!g.started) {
        if (Math.hypot(dx, dy) < SLOP) return
        if (dx > 0 && Math.abs(dx) > 1.2 * Math.abs(dy)) start(e, cur.current)
        else { g = null; return }
      }
      // Velocity in px per ms, smoothed as the sheet's is, so one jittery sample does not decide a flick
      const v = (e.clientX - g.lastX) / Math.max(1, e.timeStamp - g.lastT)
      g.v = 0.8 * v + 0.2 * g.v
      g.lastX = e.clientX
      g.lastT = e.timeStamp
      g.x = Math.max(0, dx)
      g.dy = g.zoom ? dy : 0
      if (!g.raf) g.raf = requestAnimationFrame(() => { if (g) { g.raf = 0; setP(g.x / window.innerWidth, g.dy) } })
    }
    const onEnd = (e) => {
      if (!g || e.pointerId !== g.id || settling.length) return
      if (!g.started) { g = null; return }
      cancelAnimationFrame(g.raf)
      release(e.type === 'pointercancel', e)
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onEnd, true)
    window.addEventListener('pointercancel', onEnd, true)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('pointerup', onEnd, true)
      window.removeEventListener('pointercancel', onEnd, true)
    }
  }, [])
}
