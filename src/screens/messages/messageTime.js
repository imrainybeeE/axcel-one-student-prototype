// Time helpers for messages. Seed messages carry a school-style time ("4.12") and a day; times before 7 are pm.
import { schoolInstant, formatTime } from '../../lib/time.js'

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 86400000

/** Absolute time of a seed message. School-style hours under 7 are afternoon or evening. */
export function messageAt(m) {
  const [h, min] = m.time.split('.').map(Number)
  const hour = h < 7 ? h + 12 : h
  return schoolInstant(m.day, hour * 60 + (min || 0))
}

export function lastOf(thread) {
  const m = thread.messages[thread.messages.length - 1]
  return { ...m, at: m.at ?? messageAt(m) } // sent this session: a time in ms
}

const dayStart = (ms) => schoolInstant(new Date(ms + 8 * 3600000).toISOString().slice(0, 10), 0)

/** "10.12" today, "Yesterday", "Mon" within a week, else "12 Oct". */
export function whenLabel(at, now) {
  const days = Math.round((dayStart(now) - dayStart(at)) / DAY_MS)
  if (days <= 0) return formatTime(at)
  if (days === 1) return 'Yesterday'
  const d = new Date(at + 8 * 3600000)
  if (days < 7) return WEEKDAY[d.getUTCDay()]
  return `${d.getUTCDate()} ${MONTH[d.getUTCMonth()]}`
}

/** Date separator in a thread: "Today", "Yesterday" or "Mon 19 October". */
export function separatorLabel(at, now) {
  const days = Math.round((dayStart(now) - dayStart(at)) / DAY_MS)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  const d = new Date(at + 8 * 3600000)
  const long = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${WEEKDAY[d.getUTCDay()]} ${d.getUTCDate()} ${long[d.getUTCMonth()]}`
}

export function kindWord(t) {
  if (t.kind === 'class') return 'Class group'
  if (t.kind === 'announcement') return 'Announcement'
  return isStudent(t) ? 'Classmate' : 'Teacher'
}

export const isStudent = (t) => t.kind === 'direct' && /^\d+ [A-Z]/.test(t.subtitle || '')
