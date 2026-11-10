// What you sent in each chat this session (nothing is really sent). Kept in memory so a chat still shows it when you
// come back to it, and the Starred list can open it; a reload clears it.
const sent = new Map()
export const sentIn = (thread) => sent.get(thread) || []
export const keepSent = (thread, messages) => { sent.set(thread, messages) }
