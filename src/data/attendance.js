// Bentley's 2026 attendance from the Axcel One account (copied on 10 November 2026): the school's term dates and
// holidays (from the calendar's key dates), and every absence with the reason the school recorded. No lates.
import { addDays, dayOfWeek } from '../lib/time.js'
import { getNow, isoDate } from './clock.js'
import { keyDates } from './calendar.js'

export const terms = keyDates
  .filter((k) => k.kind === 'term' && k.end)
  .map((k) => ({ id: `${k.start.slice(0, 4)}-${k.title.slice(-1)}`, year: Number(k.start.slice(0, 4)), name: k.title, start: k.start, end: k.end }))
  .reverse()
export const years = [...new Set(terms.map((t) => t.year))]

// Days with no school inside a term: the school's breaks and the public holidays (inclusive ranges)
const OFF = keyDates.filter((k) => k.kind !== 'term').map((k) => [k.start, k.end || k.start, k.title])
const offOn = (iso) => OFF.find(([a, b]) => a <= iso && iso <= b)?.[2] || null

// Every absence, with the reason the school recorded
const ABSENT = new Map([
  ['2026-01-29', 'Medical'], ['2026-03-04', 'Medical'], ['2026-04-17', 'Medical'],
  ['2026-05-20', 'Planned absence'], ['2026-05-21', 'Planned absence'], ['2026-05-22', 'Planned absence'],
  ['2026-08-13', 'Medical'], ['2026-08-14', 'Medical'], ['2026-10-15', 'Planned absence'],
])
// Lates: the time the student signed in (none this year)
const LATE = new Map()

const today = () => isoDate(getNow())

/**
 * Every date of a term: { iso, status, reason? } where status is 'present' | 'late' | 'absent' (with the recorded
 * reason) | 'off' (a holiday or break, with reason) | 'weekend' | 'later' (a school day still to come). Today counts once it is a school day.
 */
export function termDays(t) {
  const now = today()
  const out = []
  for (let iso = t.start; iso <= t.end; iso = addDays(iso, 1)) {
    const dow = dayOfWeek(iso)
    const reason = offOn(iso)
    if (dow === 0 || dow === 6) out.push({ iso, status: 'weekend' })
    else if (reason) out.push({ iso, status: 'off', reason })
    else if (iso > now) out.push({ iso, status: 'later' })
    else if (ABSENT.has(iso)) out.push({ iso, status: 'absent', reason: ABSENT.get(iso) })
    else if (LATE.has(iso)) out.push({ iso, status: 'late', reason: `Late, arrived ${LATE.get(iso)}` })
    else out.push({ iso, status: 'present' })
  }
  return out
}

/** Totals for a list of days: school days so far, present (lates included in neither), late, absent and the percent in school. */
export function summarise(days) {
  const present = days.filter((d) => d.status === 'present').length
  const late = days.filter((d) => d.status === 'late').length
  const absent = days.filter((d) => d.status === 'absent').length
  const total = present + late + absent
  return { days: total, present, late, absent, percent: total ? ((present + late) / total) * 100 : 0, left: days.filter((d) => d.status === 'later').length }
}

/** A period by id: a term ('2026-2') or a whole year ('2026'). */
export function period(id) {
  const t = terms.find((x) => x.id === id)
  if (t) return { id, year: t.year, name: t.name, label: `${t.name}, ${t.year}`, terms: [t] }
  const year = Number(id)
  const ts = terms.filter((x) => x.year === year).reverse()
  return { id: String(year), year, name: `${year}`, label: `Whole year, ${year}`, terms: ts }
}

/** The term a date falls in (or the last one before it). */
export function currentTermId(iso = today()) {
  return (terms.find((t) => t.start <= iso && iso <= t.end) || terms.find((t) => t.start <= iso) || terms[terms.length - 1]).id
}

export const term = terms.find((t) => t.id === currentTermId())
export function attendanceSummary() { return summarise(termDays(term)) }
