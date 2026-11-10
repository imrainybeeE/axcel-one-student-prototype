// Muted chats: { id, name, until } where until is a time in ms, or null for "until I unmute".
// Thread sets it; Settings lists it with Unmute. Saved on this device.
import { useSyncExternalStore } from 'react'
import { schoolNow } from '../../app/demo.js'
const key = 'axcel-demo-muted'
let entries = []
try {
  const saved = JSON.parse(localStorage.getItem(key) || '[]')
  if (Array.isArray(saved)) entries = saved.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string')
} catch { /* Storage may be unavailable. */ }
const listeners = new Set()
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener) }
// Times are on the school clock (the demo's ?d and ?t), as the thread sets them
const live = () => entries.filter((item) => item.until == null || item.until > schoolNow())
let cached = live()
const snapshot = () => cached
export function useMuted() { return useSyncExternalStore(subscribe, snapshot, snapshot) }
/** Mute a chat ({ id, name }) until a time in ms (null: until unmuted), or pass muted=false to unmute. */
export function setMuted(chat, muted, until = null) {
  entries = entries.filter((item) => item.id !== chat.id)
  if (muted) entries = [...entries, { id: chat.id, name: chat.name, until }]
  try { localStorage.setItem(key, JSON.stringify(entries)) } catch { /* Keep the current session usable. */ }
  cached = live()
  listeners.forEach((listener) => listener())
}
