// School calendar dates shown in Axcel One in November 2026 and upcoming months.
// category: 'event' | 'holiday' | 'public-holiday' | 'exam' | 'term' | 'assembly' | 'meeting' | 'class'
// audience: 'Whole school' | 'Secondary' | '7 Phoenix' | 'Years 7 to 10'

export const categories = {
  event: { label: 'School event' },
  holiday: { label: 'School holiday' },
  'public-holiday': { label: 'Public holiday' },
  exam: { label: 'Exam' },
  term: { label: 'Term dates' },
  assembly: { label: 'Assembly' },
  meeting: { label: 'Parent meeting' },
  class: { label: 'Class' },
}

const listed = [
  { id: 'e1', title: 'Replacement Holiday for Selangor', category: 'public-holiday', audience: 'Whole school', start: '2026-10-26', allDay: true },
  { id: 'e2', title: 'School Assembly', category: 'assembly', audience: 'Secondary', start: '2026-10-30', allDay: true },
  { id: 'e3', title: 'Deepavali break', category: 'holiday', audience: 'Whole school', start: '2026-11-06', end: '2026-11-10', allDay: true },
  { id: 'e4', title: 'Deepavali 1st day', category: 'public-holiday', audience: 'Whole school', start: '2026-11-08', allDay: true },
  { id: 'e5', title: 'PTM 2 (Pri, Y7-Y10)', category: 'meeting', audience: 'Whole school', start: '2026-11-14', allDay: true },
  { id: 'e6', title: 'School Assembly', category: 'assembly', audience: 'Secondary', start: '2026-11-19', allDay: true },
  { id: 'e7', title: 'Term 2 ends', category: 'term', audience: 'Whole school', start: '2026-11-20', allDay: true },
  { id: 'e8', title: 'Year end holiday', category: 'holiday', audience: 'Whole school', start: '2026-11-21', end: '2026-12-31', allDay: true },
  { id: 'e9', title: 'Selangor Sultan', category: 'public-holiday', audience: 'Whole school', start: '2026-12-11', allDay: true },
  { id: 'e10', title: 'Christmas', category: 'public-holiday', audience: 'Whole school', start: '2026-12-25', allDay: true },
  { id: 'e11', title: "New Year's Day", category: 'public-holiday', audience: 'Whole school', start: '2027-01-01', allDay: true },
  { id: 'e12', title: 'Induction Day (new students)', category: 'event', audience: 'Whole school', start: '2027-01-06', allDay: true },
  { id: 'e13', title: 'Inspark Week', category: 'event', audience: 'Whole school', start: '2027-01-07', end: '2027-01-08', allDay: true },
  { id: 'e14', title: 'Term 1 starts', category: 'term', audience: 'Whole school', start: '2027-01-07', allDay: true },
  { id: 'e15', title: 'Thaipusam', category: 'public-holiday', audience: 'Whole school', start: '2027-01-22', allDay: true },
  { id: 'e16', title: 'Fun Run 10th Anniversary', category: 'event', audience: 'Whole school', start: '2027-01-30', allDay: true },
]

// Key dates as the school publishes them for each year (the old app's Key Dates page). The calendar's events below are
// built from these too, so the month view never contradicts them. 2027 holds only what the school has published so far.
// kind: 'term' | 'holiday' (school holiday) | 'festive' (a festive break; first is its 1st day) | 'public' | 'assessment'
export const keyDates = [
  { id: 'k26-t1', kind: 'term', title: 'Term 1', start: '2026-01-08', end: '2026-05-22' },
  { id: 'k26-t2', kind: 'term', title: 'Term 2', start: '2026-06-08', end: '2026-11-20' },
  { id: 'k26-h1', kind: 'holiday', title: 'School holiday 1', start: '2026-03-14', end: '2026-03-20' },
  { id: 'k26-h2', kind: 'holiday', title: 'School holiday 2', start: '2026-05-23', end: '2026-06-07' },
  { id: 'k26-h3', kind: 'holiday', title: 'School holiday 3', start: '2026-08-22', end: '2026-08-30' },
  { id: 'k26-h4', kind: 'holiday', title: 'Year end holiday', start: '2026-11-21', end: '2026-12-31' },
  { id: 'k26-f1', kind: 'festive', title: 'Chinese New Year break', short: 'Chinese New Year', start: '2026-02-14', end: '2026-02-22', length: '1 week', first: '2026-02-17' },
  { id: 'k26-f2', kind: 'festive', title: 'Hari Raya break', short: 'Hari Raya', start: '2026-03-21', end: '2026-03-29', length: '1 week', first: '2026-03-21' },
  { id: 'k26-f3', kind: 'festive', title: 'Deepavali break', short: 'Deepavali', start: '2026-11-06', end: '2026-11-10', length: '3 days', first: '2026-11-08' },
  { id: 'k26-p1', kind: 'public', title: 'Thaipusam', start: '2026-02-01' },
  { id: 'k26-p2', kind: 'public', title: 'Replacement holiday for Thaipusam', start: '2026-02-02' },
  { id: 'k26-p3', kind: 'public', title: 'Nuzul Al-Quran', start: '2026-03-07' },
  { id: 'k26-p4', kind: 'public', title: 'Labour Day', start: '2026-05-01' },
  { id: 'k26-p5', kind: 'public', title: 'Hari Raya Haji', start: '2026-05-27' },
  { id: 'k26-p6', kind: 'public', title: 'Wesak Day', start: '2026-05-31' },
  { id: 'k26-p7', kind: 'public', title: "Agong's Birthday", start: '2026-06-01' },
  { id: 'k26-p8', kind: 'public', title: 'Awal Muharam', start: '2026-06-17' },
  { id: 'k26-p9', kind: 'public', title: 'Replacement holiday for Entrepreneur Day', start: '2026-08-10' },
  { id: 'k26-p10', kind: 'public', title: "Prophet Muhammad's Birthday", start: '2026-08-25' },
  { id: 'k26-p11', kind: 'public', title: 'National Day', start: '2026-08-31' },
  { id: 'k26-p12', kind: 'public', title: 'Cuti Peristiwa SUKMA', start: '2026-09-01' },
  { id: 'k26-p13', kind: 'public', title: 'Malaysia Day', start: '2026-09-16' },
  { id: 'k26-p14', kind: 'public', title: 'Replacement Holiday for Selangor', start: '2026-10-26' },
  { id: 'k27-t1', kind: 'term', title: 'Term 1', start: '2027-01-07' },
  { id: 'k27-p1', kind: 'public', title: "New Year's Day", start: '2027-01-01' },
  { id: 'k27-p2', kind: 'public', title: 'Thaipusam', start: '2027-01-22' },
]

/** The years Key dates can show. */
export const keyDateYears = [...new Set(keyDates.map((k) => Number(k.start.slice(0, 4))))].sort()

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const whole = { audience: 'Whole school', allDay: true }
/** The key dates as calendar events: a term's first and last days, each break as a run, each holiday's own day. */
const fromKeyDates = keyDates.flatMap((k) => {
  if (k.kind === 'term') return [{ title: `${k.title} starts`, category: 'term', start: k.start }, k.end && { title: `${k.title} ends`, category: 'term', start: k.end }]
  if (k.kind === 'holiday') return [{ title: k.title, category: 'holiday', start: k.start, end: k.end }]
  if (k.kind === 'festive') return [{ title: k.title, category: 'holiday', start: k.start, end: k.end }, { title: `${k.short} 1st day`, category: 'public-holiday', start: k.first }]
  if (k.kind === 'public') return [{ title: k.title, category: 'public-holiday', start: k.start }]
  return []
}).filter((e) => e && !listed.some((h) => h.start === e.start && h.title === e.title))
  .map((e) => ({ id: `k-${e.start}-${slug(e.title)}`, ...e, ...whole }))

export const events = [...listed, ...fromKeyDates]
