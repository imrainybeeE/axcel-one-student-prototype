// Appearance: Light by default; Automatic (follow the device) and Dark are choices in Settings, stored per device.
// ?theme=light|dark overrides for the session without being stored.
import { useSyncExternalStore } from 'react'

const KEY = 'axcel-theme'
const PAPER = { light: '#F2F2F7', dark: '#161618' }
const listeners = new Set()
const mql = window.matchMedia('(prefers-color-scheme: dark)')

function readStored() {
  try { return localStorage.getItem(KEY) || 'light' } catch { return 'light' }
}
function urlOverride() {
  try {
    const q = new URLSearchParams(window.location.search).get('theme')
    return q === 'light' || q === 'dark' ? q : null
  } catch { return null }
}

let pref = urlOverride() || readStored()
if (!['auto', 'light', 'dark'].includes(pref)) pref = 'auto'

const resolve = (p) => (p === 'auto' ? (mql.matches ? 'dark' : 'light') : p)
let snapshot = { pref, resolved: resolve(pref) }

function apply() {
  const resolved = resolve(pref)
  const html = document.documentElement
  html.setAttribute('data-theme', resolved)
  html.setAttribute('data-theme-pref', pref)
  html.style.background = ''
  // A manual choice also sets the browser chrome colour; Automatic leaves the media pair alone.
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    if (!m.dataset.media) m.dataset.media = m.getAttribute('media') || ''
    if (pref === 'auto') { m.setAttribute('media', m.dataset.media); m.setAttribute('content', m.dataset.media.includes('dark') ? PAPER.dark : PAPER.light) } else { m.removeAttribute('media'); m.setAttribute('content', PAPER[resolved]) }
  })
  snapshot = { pref, resolved }
  listeners.forEach((fn) => fn())
}

mql.addEventListener('change', () => { if (pref === 'auto') apply() })
apply()

/** Set Automatic, Light or Dark. Saved on this device; clears any ?theme override. */
export function setThemePref(next) {
  pref = next
  try { localStorage.setItem(KEY, next) } catch { /* private mode: the choice lasts for this visit */ }
  const url = new URL(window.location.href)
  if (url.searchParams.has('theme')) {
    url.searchParams.delete('theme')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  }
  apply()
}

/** { pref: 'auto'|'light'|'dark', resolved: 'light'|'dark', setPref } */
export function useTheme() {
  const s = useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn) }, () => snapshot)
  return { ...s, setPref: setThemePref }
}
