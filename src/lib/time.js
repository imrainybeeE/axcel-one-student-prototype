// School time. Every format and comparison happens in Asia/Kuala_Lumpur, whatever the device's zone.
// Seed data writes times school-style ("1.30" means 1.30 pm): hours 1 to 6 are afternoon.

export const SCHOOL_TZ = 'Asia/Kuala_Lumpur'
const OFFSET = '+08:00' // Malaysia has no daylight saving

const fmtParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: SCHOOL_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', weekday: 'short',
})
const fmtLong = new Intl.DateTimeFormat('en-GB', { timeZone: SCHOOL_TZ, weekday: 'long', day: 'numeric', month: 'long' })
const fmtShort = new Intl.DateTimeFormat('en-GB', { timeZone: SCHOOL_TZ, weekday: 'short', day: 'numeric', month: 'long' })
const fmtDayMonth = new Intl.DateTimeFormat('en-GB', { timeZone: SCHOOL_TZ, day: 'numeric', month: 'short' })
const fmtDayMonthYear = new Intl.DateTimeFormat('en-GB', { timeZone: SCHOOL_TZ, day: 'numeric', month: 'short', year: 'numeric' })
const fmtWeekday = new Intl.DateTimeFormat('en-GB', { timeZone: SCHOOL_TZ, weekday: 'long' })
const fmtWeekdayShort = new Intl.DateTimeFormat('en-GB', { timeZone: SCHOOL_TZ, weekday: 'short' })

const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** Wall-clock parts of an instant in the school's zone. */
export function schoolParts(ms) {
  const p = {}
  for (const { type, value } of fmtParts.formatToParts(new Date(ms))) p[type] = value
  const hour = Number(p.hour) % 24
  const minute = Number(p.minute)
  return {
    year: Number(p.year), month: Number(p.month), day: Number(p.day), hour, minute, second: Number(p.second),
    dow: DOW[p.weekday], iso: `${p.year}-${p.month}-${p.day}`, minutes: hour * 60 + minute,
  }
}

/** "1.30" -> 810 (minutes since midnight, afternoon hours 1 to 6 moved past noon). Also takes "13.30". */
export function schoolMinutes(time) {
  const [h, m] = String(time).split(/[.:]/).map(Number)
  const hour = h >= 1 && h <= 6 ? h + 12 : h
  return hour * 60 + (m || 0)
}

/** The absolute instant of a school date ("2026-10-21") at a school time ("10.30" or minutes). */
export function schoolInstant(iso, time = 0) {
  const mins = typeof time === 'number' ? time : schoolMinutes(time)
  const hh = String(Math.floor(mins / 60)).padStart(2, '0')
  const mm = String(mins % 60).padStart(2, '0')
  return Date.parse(`${iso}T${hh}:${mm}:00${OFFSET}`)
}

/** School-style time for an instant: 9.00, 10.30, 1.30 (no am or pm). */
export function formatTime(ms) {
  const { hour, minute } = schoolParts(ms)
  return `${hour % 12 || 12}.${String(minute).padStart(2, '0')}`
}

/** School-style time from minutes since midnight. */
export function formatMinutes(mins) {
  const h = Math.floor(mins / 60) % 24
  return `${h % 12 || 12}.${String(mins % 60).padStart(2, '0')}`
}

/** "Wednesday 21 October" */
export const formatLongDate = (ms) => fmtLong.format(new Date(ms)).replace(',', '')
/** "Wed 21 October" */
export const formatShortDate = (ms) => fmtShort.format(new Date(ms)).replace(',', '')
/** "Wednesday" */
export const formatWeekday = (ms) => fmtWeekday.format(new Date(ms))
/** "Wed" */
export const formatWeekdayShort = (ms) => fmtWeekdayShort.format(new Date(ms))

/** Instant at school midnight for an ISO date. */
export const isoToMs = (iso) => schoolInstant(iso, 0)

/** Add days to an ISO date string. */
export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Whole days from ISO a to ISO b. */
export function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000)
}

/** 0 (Sunday) to 6 for an ISO date. */
export const dayOfWeek = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay()

/** Message list times: "10.12" today, "Yesterday", "Mon" within 6 days, "12 Oct", "12 Oct 2025". */
export function formatMessageTime(ms, nowMs) {
  const a = schoolParts(ms)
  const b = schoolParts(nowMs)
  const diff = daysBetween(a.iso, b.iso)
  if (diff <= 0) return formatTime(ms)
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return formatWeekdayShort(ms)
  return a.year === b.year ? fmtDayMonth.format(new Date(ms)) : fmtDayMonthYear.format(new Date(ms))
}

/** "20 min", "1 h 20 min", "2 h" */
export function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

/** Spoken form: "1 hour 20 minutes" */
export function speakDuration(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const hs = h ? `${h} ${h === 1 ? 'hour' : 'hours'}` : ''
  const ms = m || !h ? `${m} ${m === 1 ? 'minute' : 'minutes'}` : ''
  return [hs, ms].filter(Boolean).join(' ')
}
