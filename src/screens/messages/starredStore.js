// Starred messages, saved on this device: a copy of each message ({ id, thread, from, text, file, at }), so the Starred
// list can show it without opening the chat. Starring is private: nobody else sees it.
import { useSyncExternalStore } from 'react'
const key = 'axcel-demo-starred'
let entries = []
try {
  const saved = JSON.parse(localStorage.getItem(key) || '[]')
  if (Array.isArray(saved)) entries = saved.filter((item) => item && typeof item.id === 'string' && typeof item.thread === 'string')
} catch { /* Storage may be unavailable. */ }
const listeners = new Set()
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener) }
const snapshot = () => entries
export function useStarred() { return useSyncExternalStore(subscribe, snapshot, snapshot) }
/** Star (or with starred=false, unstar) a message: { id, thread, from, text, file, at }. */
export function setStarred(message, starred) {
  entries = entries.filter((item) => !(item.id === message.id && item.thread === message.thread))
  if (starred) entries = [...entries, message]
  try { localStorage.setItem(key, JSON.stringify(entries)) } catch { /* Keep the current session usable. */ }
  listeners.forEach((listener) => listener())
}
