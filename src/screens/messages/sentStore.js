// What you sent in each chat this session (nothing is really sent). Kept in memory so a chat still shows it when you
// come back to it, the inbox shows it as the chat's latest message, and the Starred list can open it; a reload clears it.
import { useSyncExternalStore } from 'react'
const sent = new Map()
const listeners = new Set()
let version = 0
export const sentIn = (thread) => sent.get(thread) || []
export const keepSent = (thread, messages) => {
  if (sent.get(thread) === messages || (!messages.length && !sent.has(thread))) return
  sent.set(thread, messages)
  version++
  listeners.forEach((l) => l())
}
/** Chats with something sent this session, including ones started from New message. */
export const sentThreads = () => [...sent.keys()].filter((id) => sent.get(id).length)
/** Re-render when anything is sent. */
export const useSent = () => useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn) }, () => version, () => 0)
