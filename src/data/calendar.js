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

export const events = [
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
