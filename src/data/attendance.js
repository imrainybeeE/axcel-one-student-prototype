// Attendance as daily records for 2025 and 2026. The Term 2 2026 totals match Bentley's account (94 days, 3 absent);
// every date and every other term is made-up sample data, so no real absence dates or reasons are published.
import { addDays, dayOfWeek } from '../lib/time.js'
import { getNow, isoDate } from './clock.js'

export const terms = [
  { id: '2026-2', year: 2026, name: 'Term 2', start: '2026-06-15', end: '2026-11-20' },
  { id: '2026-1', year: 2026, name: 'Term 1', start: '2026-01-07', end: '2026-06-05' },
  { id: '2025-2', year: 2025, name: 'Term 2', start: '2025-06-16', end: '2025-11-21' },
  { id: '2025-1', year: 2025, name: 'Term 1', start: '2025-01-08', end: '2025-06-06' },
]
export const years = [2026, 2025]

// Days with no school inside a term: public holidays and the school's breaks (inclusive ranges)
const OFF = [
  ['2025-01-28', '2025-01-31', 'Chinese New Year'], ['2025-03-31', '2025-04-04', 'Hari Raya break'], ['2025-05-01', '2025-05-01', 'Labour Day'],
  ['2025-05-12', '2025-05-12', 'Wesak Day'], ['2025-06-02', '2025-06-02', "Agong's Birthday"], ['2025-06-27', '2025-06-27', 'Awal Muharram'],
  ['2025-08-25', '2025-09-01', 'Mid-term break'], ['2025-09-05', '2025-09-05', 'Maulidur Rasul'], ['2025-09-16', '2025-09-16', 'Malaysia Day'],
  ['2025-10-20', '2025-10-20', 'Deepavali'],
  ['2026-02-16', '2026-02-20', 'Chinese New Year'], ['2026-03-20', '2026-03-24', 'Hari Raya break'], ['2026-05-01', '2026-05-01', 'Labour Day'],
  ['2026-05-27', '2026-05-27', 'Hari Raya Haji'], ['2026-06-01', '2026-06-01', "Agong's Birthday"], ['2026-06-16', '2026-06-16', 'Awal Muharram'],
  ['2026-08-26', '2026-08-28', 'Mid-term break'], ['2026-08-31', '2026-08-31', 'Merdeka Day'], ['2026-09-16', '2026-09-16', 'Malaysia Day'], ['2026-10-26', '2026-10-26', 'Replacement holiday'],
  ['2026-11-06', '2026-11-10', 'Deepavali break'],
]
const offOn = (iso) => OFF.find(([a, b]) => a <= iso && iso <= b)?.[2] || null

// Made-up absences and lates, each with the reason the school recorded (the old app's codes: planned absence,
// medical, bereavement, no reason given). Term 2 2026 keeps the account's 3 absences and no lates.
const ABSENT = new Map([
  ['2025-02-19', 'Medical, with a certificate'], ['2025-07-23', 'Planned absence'], ['2025-07-24', 'Planned absence'],
  ['2025-10-08', 'Bereavement'], ['2026-04-14', 'Medical, with a certificate'], ['2026-04-15', 'Medical, with a certificate'],
  ['2026-07-21', 'No reason given'], ['2026-09-08', 'Planned absence'], ['2026-09-09', 'Planned absence'],
])
// Lates: the time the student signed in
const LATE = new Map([['2025-03-11', '8.32'], ['2025-09-24', '8.26'], ['2026-01-27', '8.41'], ['2026-05-12', '8.32']])

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
