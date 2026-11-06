import { useCallback, useState, useSyncExternalStore } from 'react'
import { useToast } from '../ui/toastContext.js'

/** true while a media query matches, for example useMediaQuery('(min-width: 1024px)'). */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (fn) => { const m = window.matchMedia(query); m.addEventListener('change', fn); return () => m.removeEventListener('change', fn) },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** The laptop layout (sidebar, two columns) starts at 1024 px. */
export const useLaptop = () => useMediaQuery('(min-width: 1024px)')

/**
 * Join an online lesson. The prototype does not open external Meet links: it shows "Joining"
 * for about 800 ms, then says "Physics opened in Google Meet." and returns to "Join Physics".
 * Returns { joiningId, join(item) } where item has { id, title }.
 */
export function useJoin() {
  const [joiningId, setJoiningId] = useState(null)
  const toast = useToast()
  const join = useCallback((item) => {
    setJoiningId(item.id)
    setTimeout(() => {
      setJoiningId(null)
      toast.show({ message: `${item.title} opened in Google Meet.` })
    }, 800)
  }, [toast])
  return { joiningId, join }
}

/*
 * The tab bar's minimised state, as iOS 26 (Music): scrolling down closes the bar into one circle, scrolling up or
 * reaching the top opens it again, and tapping the circle opens it without going anywhere. One shared state, so the
 * bar and whatever rides beside it (Today's mini "now" capsule) always agree.
 */
const AFTER = 120 // never minimised this close to the top
const DOWN = 16 // px of steady downward scroll that closes the bar
const UP = 8 // px of upward scroll that opens it
const barSubs = new Set()
let barMin = false
let barRun = 0 // signed distance scrolled in the current direction
const setBarMin = (v) => {
  barRun = 0
  if (v === barMin) return
  barMin = v
  for (const fn of barSubs) fn()
}
/** Open the minimised tab bar (a tap on its circle, keyboard focus, a new screen). It stays open until the next scroll down. */
export const expandTabBar = () => setBarMin(false)

let stopWatch = null
function watchScroll() {
  let last = window.scrollY
  let raf = 0
  let input = 0
  const tick = () => {
    raf = 0
    const y = window.scrollY
    const was = last
    last = y
    if (y < AFTER) { setBarMin(false); return }
    // Rubber-banding past the end: the bounce back is not the reader scrolling up
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (y > max || was > max) return
    const dy = y - was
    if (!dy) return
    barRun = Math.sign(dy) === Math.sign(barRun) ? barRun + dy : dy
    if (barRun > DOWN) setBarMin(true)
    else if (barRun < -UP) setBarMin(false)
  }
  // Only a finger, a wheel or a key moves the bar: scroll restored by a route change, or a scroll-to-top, must not
  const touched = () => { input = performance.now() }
  const onScroll = () => {
    if (performance.now() - input > 600) { last = window.scrollY; barRun = 0; if (last < AFTER) setBarMin(false); return }
    if (!raf) raf = requestAnimationFrame(tick)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  for (const t of ['wheel', 'touchmove', 'keydown']) window.addEventListener(t, touched, { passive: true })
  return () => {
    window.removeEventListener('scroll', onScroll)
    for (const t of ['wheel', 'touchmove', 'keydown']) window.removeEventListener(t, touched)
    cancelAnimationFrame(raf)
  }
}

// Module-level so React keeps one subscription per caller; the scroll watch runs while anyone is listening
const subscribeBar = (fn) => {
  barSubs.add(fn)
  if (barSubs.size === 1) stopWatch = watchScroll()
  return () => {
    barSubs.delete(fn)
    if (!barSubs.size) { stopWatch?.(); stopWatch = null; barMin = false; barRun = 0 }
  }
}
const getBarMin = () => barMin
const getBarMinServer = () => false

/** true while the floating tab bar is minimised to its circle. rAF-throttled, passive, one listener for every caller. */
export const useTabBarMinimised = () => useSyncExternalStore(subscribeBar, getBarMin, getBarMinServer)
