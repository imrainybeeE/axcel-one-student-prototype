// Small shared stores that more than one screen area reads.
import { useSyncExternalStore } from 'react'
import { threads } from '../data/messages.js'

function createStore(initial) {
  let value = initial
  const listeners = new Set()
  return {
    get: () => value,
    set(next) { value = typeof next === 'function' ? next(value) : next; listeners.forEach((fn) => fn()) },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  }
}

/* ---------- Unread conversations (tab badge, Today, Messages) ---------- */
const unread = createStore(new Set(threads.filter((t) => t.unread > 0).map((t) => t.id)))

/** Set of thread ids with unread messages. */
export const useUnreadThreads = () => useSyncExternalStore(unread.subscribe, unread.get)
export function markThreadRead(id) {
  unread.set((s) => { if (!s.has(id)) return s; const n = new Set(s); n.delete(id); return n })
}
export function markThreadUnread(id) {
  unread.set((s) => { if (s.has(id)) return s; const n = new Set(s); n.add(id); return n })
}

/* ---------- Per-device preferences (localStorage, always in try/catch) ---------- */
const prefCache = new Map()
const prefListeners = new Set()
function readPref(key, fallback) {
  if (prefCache.has(key)) return prefCache.get(key)
  let v = fallback
  try { const raw = localStorage.getItem(`axcel-${key}`); if (raw !== null) v = JSON.parse(raw) } catch { v = fallback }
  prefCache.set(key, v)
  return v
}

/** [value, setValue] for a per-device preference such as 'keepToasts'. */
export function usePref(key, fallback) {
  const value = useSyncExternalStore(
    (fn) => { prefListeners.add(fn); return () => prefListeners.delete(fn) },
    () => readPref(key, fallback),
  )
  const set = (next) => {
    prefCache.set(key, next)
    try { localStorage.setItem(`axcel-${key}`, JSON.stringify(next)) } catch { /* kept for this visit */ }
    prefListeners.forEach((fn) => fn())
  }
  return [value, set]
}
