// The school day as data: which kind of day a date is, its lessons as absolute times,
// and the now-block model for any instant. Shared by Today and Timetable.
import { dayPlan, subjects, teachers, JOIN_OPENS_MINUTES_BEFORE } from '../data/timetable.js'
import { events } from '../data/calendar.js'
import { addDays, dayOfWeek, schoolInstant, schoolMinutes, schoolParts, formatMinutes } from './time.js'

const HOLIDAY_KINDS = new Set(['public-holiday', 'holiday'])
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** The holiday event covering an ISO date, if any. */
export function holidayOn(iso) {
  return events.find((e) => HOLIDAY_KINDS.has(e.category) && e.start <= iso && iso <= (e.end || e.start)) || null
}

/** Normalise one timetable item into what screens need. */
function toItem(raw, iso, online, index) {
  const startMin = schoolMinutes(raw.start)
  const endMin = schoolMinutes(raw.end)
  const base = {
    id: `${iso}-${index}`,
    kind: raw.kind,
    start: raw.start, end: raw.end, startMin, endMin,
    startsAt: schoolInstant(iso, startMin), endsAt: schoolInstant(iso, endMin),
  }
  if (raw.kind === 'lesson') {
    const s = subjects[raw.subject]
    const t = s.teacher ? teachers[s.teacher] : null
    return {
      ...base, subjectId: raw.subject, title: s.name, short: s.short,
      teacher: t?.name || null, teacherShort: t?.short || null, room: s.room || null, online, meet: raw.meet || null,
      place: online ? 'online' : (s.room || 'On campus'),
    }
  }
  if (raw.kind === 'break') return { ...base, title: raw.label }
  return { ...base, kind: 'event', title: raw.label, place: online ? 'online' : 'School' }
}

/**
 * One school date: { iso, kind: 'school' | 'weekend' | 'holiday', online, reason, items, lessons }.
 * reason is the holiday's title or null.
 */
export function getDay(iso) {
  const dow = dayOfWeek(iso)
  const holiday = holidayOn(iso)
  if (holiday) return { iso, dow, kind: 'holiday', online: false, reason: holiday.title, holiday, items: [], lessons: [] }
  if (dow === 0 || dow === 6) return { iso, dow, kind: 'weekend', online: false, reason: null, items: [], lessons: [] }
  const [y, m, d] = iso.split('-').map(Number)
  const plan = dayPlan(new Date(y, m - 1, d), iso)
  const items = plan.items.map((raw, i) => toItem(raw, iso, plan.online, i))
  return { iso, dow, kind: items.length ? 'school' : 'weekend', online: plan.online, reason: null, items, lessons: items.filter((i) => i.kind !== 'break') }
}

/** The next school day after iso, with the holidays skipped on the way. */
export function nextSchoolDay(iso) {
  const skipped = []
  for (let n = 1; n < 60; n++) {
    const day = getDay(addDays(iso, n))
    if (day.kind === 'school') return { ...day, skipped, first: day.lessons[0] || null, daysAway: n }
    if (day.kind === 'holiday') skipped.push(day)
  }
  return null
}

/** "tomorrow" or the weekday name ("Tuesday"). */
export function dayName(toIso, daysAway) {
  if (daysAway === 1) return 'tomorrow'
  return WEEKDAYS[dayOfWeek(toIso)]
}

export function isJoinOpen(item, nowMs) {
  if (!item || !item.meet) return false
  return nowMs >= item.startsAt - JOIN_OPENS_MINUTES_BEFORE * 60000 && nowMs < item.endsAt
}

export function joinOpensAt(item) {
  return item ? formatMinutes(item.startMin - JOIN_OPENS_MINUTES_BEFORE) : ''
}

const ceilMin = (ms) => Math.max(0, Math.ceil(ms / 60000))

/**
 * The now block for an instant.
 * state: 'before' | 'lesson' | 'between' | 'break' | 'after' | 'noschool'
 * Fields used by the NowBlock: item (what the block is about), minutes (countdown number),
 * progress (0..1, lessons and breaks), endsAt / startsAt, next (the Next row), following (next lesson after a break),
 * join ({ open, opensAt } or null), nextDay (after school and no school), day.
 */
export function nowModel(nowMs, { forceEmpty = false } = {}) {
  const p = schoolParts(nowMs)
  const day = getDay(p.iso)
  const base = { nowMs, iso: p.iso, day, online: day.online }

  if (forceEmpty || day.kind !== 'school') {
    const nextDay = nextSchoolDay(p.iso)
    const todayEvents = events.filter((e) => e.start === p.iso && e.time && !HOLIDAY_KINDS.has(e.category))
    return { ...base, state: 'noschool', reason: forceEmpty ? null : day.reason, weekend: day.kind === 'weekend', nextDay, todayEvents, next: null }
  }

  const items = day.items
  const lessonsAfter = (ms) => items.filter((i) => i.kind !== 'break' && i.startsAt >= ms)
  const current = items.find((i) => nowMs >= i.startsAt && nowMs < i.endsAt) || null
  const join = (item) => (item && item.meet ? { open: isJoinOpen(item, nowMs), opensAt: joinOpensAt(item) } : null)

  if (current && current.kind !== 'break') {
    const next = lessonsAfter(current.endsAt)[0] || null
    return {
      ...base, state: 'lesson', item: current,
      minutes: ceilMin(current.endsAt - nowMs),
      progress: (nowMs - current.startsAt) / (current.endsAt - current.startsAt),
      join: join(current), next, nextJoin: join(next),
    }
  }
  if (current && current.kind === 'break') {
    const following = lessonsAfter(current.endsAt)[0] || null
    return {
      ...base, state: 'break', item: current,
      minutes: ceilMin(current.endsAt - nowMs),
      progress: (nowMs - current.startsAt) / (current.endsAt - current.startsAt),
      following, next: following, nextJoin: join(following), join: null,
    }
  }
  const upcoming = lessonsAfter(nowMs)
  if (upcoming.length) {
    const item = upcoming[0]
    const before = nowMs < items[0].startsAt
    const next = upcoming[1] || null
    return {
      ...base, state: before ? 'before' : 'between', item,
      minutes: ceilMin(item.startsAt - nowMs),
      join: join(item), next, nextJoin: join(next),
    }
  }
  return { ...base, state: 'after', nextDay: nextSchoolDay(p.iso), next: null, lastEnd: items[items.length - 1].end }
}

/** The rest of the day after the Next row, for the laptop rail. */
export function laterItems(model) {
  if (!model.day || model.day.kind !== 'school' || !model.next) return []
  return model.day.items.filter((i) => i.startsAt > model.next.startsAt)
}
