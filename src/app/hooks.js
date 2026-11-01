import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
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

/**
 * true once the page has scrolled down 8 px in a row past `after` px; false after 8 px of upward scroll or near the top.
 * rAF-throttled and passive. Used to minimise the floating tab bar on scroll down, as iOS 26 does.
 */
export function useScrolledDown(after = 120) {
  const [down, setDown] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    let run = 0 // signed distance scrolled in the current direction
    let raf = 0
    const tick = () => {
      raf = 0
      const y = window.scrollY
      const dy = y - last
      last = y
      if (y < after) { run = 0; setDown(false); return }
      run = Math.sign(dy) === Math.sign(run) ? run + dy : dy
      if (run > 8) setDown(true)
      else if (run < -8) setDown(false)
    }
    // Only a finger or a wheel moves the bar: scroll restored by a route change must not minimise it
    let input = 0
    const touched = () => { input = performance.now() }
    const onScroll = () => {
      if (performance.now() - input > 600) { last = window.scrollY; if (last < after) setDown(false); return }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    for (const t of ['wheel', 'touchmove', 'keydown']) window.addEventListener(t, touched, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      for (const t of ['wheel', 'touchmove', 'keydown']) window.removeEventListener(t, touched)
      cancelAnimationFrame(raf)
    }
  }, [after])
  return down
}
