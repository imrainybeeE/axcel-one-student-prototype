// Pinned messages per chat, saved on this device: { [thread id]: [message id, ...] } in the order they were pinned.
// A chat holds at most MAX_PINS; the thread asks before a new pin replaces the oldest.
import { useSyncExternalStore } from 'react'
const key = 'axcel-demo-pinned'
export const MAX_PINS = 3
let pins = {}
try {
  const saved = JSON.parse(localStorage.getItem(key) || '{}')
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    for (const [thread, ids] of Object.entries(saved)) if (Array.isArray(ids)) pins[thread] = ids.filter((id) => typeof id === 'string')
  }
} catch { /* Storage may be unavailable. */ }
const listeners = new Set()
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener) }
const snapshot = () => pins
export function usePinned() { return useSyncExternalStore(subscribe, snapshot, snapshot) }
/** Set a chat's pins (message ids, oldest first); only the newest MAX_PINS are kept. */
export function setPins(thread, ids) {
  pins = { ...pins, [thread]: ids.slice(-MAX_PINS) }
  try { localStorage.setItem(key, JSON.stringify(pins)) } catch { /* Keep the current session usable. */ }
  listeners.forEach((listener) => listener())
}
