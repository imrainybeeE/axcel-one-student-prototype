// Made-up attendance for this term (Term 2: 15 June to 21 October 2026 so far).
// 82 school days: 79 present, 3 absent, 0 late. School days are generated from the term dates minus holidays.
import { isoDate } from './clock.js'

export const term = { name: 'Term 2', start: '2026-06-15', end: '2026-11-27' }

const holidays = new Set([
  '2026-08-31', // Merdeka Day
  '2026-09-16', // Malaysia Day
  // Mid-term break
  '2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21',
  '2026-08-24', '2026-08-25', '2026-08-26',
  // Teacher training day
  '2026-09-25',
])

export const absences = {
  '2026-07-22': { status: 'absent', reason: 'Medical certificate' },
  '2026-09-02': { status: 'absent', reason: 'Medical certificate' },
  '2026-10-07': { status: 'absent', reason: 'Family reason, approved' },
}

export function schoolDays(untilIso = '2026-10-21') {
  const days = []
  const d = new Date(2026, 5, 15)
  const until = new Date(untilIso + 'T00:00:00')
  while (d <= until) {
    const iso = isoDate(d)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6 && !holidays.has(iso)) {
      days.push({ date: iso, ...(absences[iso] || { status: 'present' }) })
    }
    d.setDate(d.getDate() + 1)
  }
  return days
}

export function attendanceSummary(days = schoolDays()) {
  const present = days.filter((d) => d.status === 'present').length
  const late = days.filter((d) => d.status === 'late').length
  const absent = days.filter((d) => d.status === 'absent').length
  return { days: days.length, present, late, absent, percent: Math.round(((present + late) / days.length) * 1000) / 10 }
}
