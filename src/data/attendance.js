// Term 2 attendance totals from Bentley's Axcel One account.
export const term = { name: 'Term 2', start: '2026-06-15', end: '2026-11-20' }

export const attendance = { days: 94, present: 91, absent: 3, late: 0, percent: 96.8 }

// Individual dates and reasons are intentionally omitted from this public prototype.
export function schoolDays() { return [] }
export function attendanceSummary() { return attendance }
