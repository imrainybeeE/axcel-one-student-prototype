// What you sent in each chat this session (nothing is really sent). Kept in memory so a chat still shows it when you
// come back to it, the inbox shows it as the chat's latest message, and the Starred list can open it; a reload clears it.
// Sent offline, a message waits ("queued"); when the connection is back the shell calls flushQueued(), wherever you
// are, and every waiting message goes Sending, then sent.
import { useSyncExternalStore } from 'react'
const sent = new Map()
const listeners = new Set()
let version = 0
const changed = () => { version++; listeners.forEach((l) => l()) }
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const NONE = []

export const sentIn = (thread) => sent.get(thread) || NONE
/** Change one chat's sent messages: fn gets the current list and returns the new one. */
export function updateSent(thread, fn) {
  const before = sentIn(thread)
  const after = fn(before)
  if (after === before) return
  sent.set(thread, after)
  changed()
}
/** Chats with something sent this session, including ones started from New message. */
export const sentThreads = () => [...sent.keys()].filter((id) => sent.get(id).length)
/** Re-render when anything is sent. */
export const useSent = () => useSyncExternalStore(subscribe, () => version, () => 0)
/** One chat's sent messages, live. */
export const useSentIn = (thread) => useSyncExternalStore(subscribe, () => sentIn(thread), () => NONE)

const step = (from, to) => {
  let any = false
  for (const [id, list] of sent) {
    if (!list.some((m) => m.status === from)) continue
    any = true
    sent.set(id, list.map((m) => (m.status === from ? { ...m, status: to, ...(to ? {} : { justSent: true }) } : m)))
  }
  if (any) changed()
  return any
}
let sending = null
/** Back online: everything waiting goes out, Sending for a moment, then sent. */
export function flushQueued() {
  if (!step('queued', 'sending') || sending) return
  sending = setTimeout(() => { sending = null; step('sending', undefined) }, 900)
}
