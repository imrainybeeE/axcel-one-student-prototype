import { useSyncExternalStore } from 'react'
const key = 'axcel-demo-blocked'
let entries = []
try {
  const saved = JSON.parse(localStorage.getItem(key) || '[]')
  if (Array.isArray(saved)) entries = saved.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string')
} catch { /* Storage may be unavailable. */ }
const listeners = new Set()
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener) }
const snapshot = () => entries
export function useBlocked() { return useSyncExternalStore(subscribe, snapshot, snapshot) }
export function setBlockedPerson(person, blocked) {
  entries = entries.filter((item) => item.id !== person.id)
  if (blocked) entries = [...entries, person]
  try { localStorage.setItem(key, JSON.stringify(entries)) } catch { /* Keep the current session usable. */ }
  listeners.forEach((listener) => listener())
}
