// Helpers for the mini capsule (MiniBar.jsx), kept apart so the component files stay components only.
import { useEffect, useRef, useState } from 'react'

const TOP = 100 // the large title bar: a hero whose bottom has gone under it has scrolled away
const BOTTOM = 150 // the tab bar and the capsule: a hero whose top is below this has not been reached yet

/**
 * true once the element `find()` returns has scrolled away under the top bar (or, with `both`, is still below the
 * bottom bars). rAF-throttled and passive. `key` re-checks when the page's layout changes (a new view, a new day).
 */
export function useOutOfView(find, { both = false, enabled = true, key } = {}) {
  const [out, setOut] = useState(false)
  const findRef = useRef(find)
  useEffect(() => { findRef.current = find })
  useEffect(() => {
    if (!enabled) return undefined
    let raf = 0
    const check = () => {
      raf = 0
      const el = findRef.current()
      if (!el) { setOut(false); return }
      const r = el.getBoundingClientRect()
      setOut(r.bottom < TOP || (both && r.top > window.innerHeight - BOTTOM))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(check) }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on, { passive: true })
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [enabled, both, key])
  return enabled && out
}


/** true when the model has something for the capsule to carry. */
export const lessonMiniActive = (model) => Boolean(model && ['lesson', 'break', 'before', 'between'].includes(model.state))
