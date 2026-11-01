// Made-up school calendar for October to December 2026.
// category: 'event' | 'holiday' | 'public-holiday' | 'exam' | 'term' | 'assembly' | 'meeting' | 'class'
// audience: 'Whole school' | 'Secondary' | '8 Orion' | 'Years 7 to 10'

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
  { id: 'e1', title: 'Online learning day', category: 'class', audience: 'Years 7 to 10', start: '2026-10-20', allDay: true, note: 'Lessons run online. Join each lesson from your timetable.' },
  { id: 'e2', title: 'Online learning day', category: 'class', audience: 'Years 7 to 10', start: '2026-10-21', allDay: true, note: 'Lessons run online. Join each lesson from your timetable.' },
  { id: 'e3', title: 'Algebra quiz', category: 'class', audience: '8 Orion', start: '2026-10-22', time: '10.50', end: '11.35', note: 'Moved from Wednesday. Bring a calculator.' },
  { id: 'e4', title: 'Fun Run', category: 'event', audience: 'Whole school', start: '2026-10-24', time: '7.30', end: '11.00', place: 'Main field', note: 'Wear your house shirt. Gates open at 7.15.' },
  { id: 'e5', title: 'Deepavali replacement holiday', category: 'public-holiday', audience: 'Whole school', start: '2026-10-26', allDay: true, note: 'No school.' },
  { id: 'e6', title: 'School assembly', category: 'assembly', audience: 'Secondary', start: '2026-10-30', time: '8.15', end: '9.00', place: 'Hall' },
  { id: 'e7', title: 'Reading log due', category: 'class', audience: '8 Orion', start: '2026-10-23', time: '3.15', note: 'Upload in Messages to Ms Kavitha.' },
  { id: 'e8', title: 'Parent-teacher meeting', category: 'meeting', audience: 'Secondary', start: '2026-11-04', time: '2.00', end: '6.00', place: 'Classrooms', note: 'Lessons end at 12.20.' },
  { id: 'e9', title: 'Final exams', category: 'exam', audience: 'Secondary', start: '2026-11-09', end: '2026-11-13', allDay: true, note: 'Your exam timetable is below each day.' },
  { id: 'e10', title: 'Mathematics paper 1', category: 'exam', audience: 'Year 8', start: '2026-11-09', time: '8.30', end: '10.00', place: 'Hall' },
  { id: 'e11', title: 'Science paper', category: 'exam', audience: 'Year 8', start: '2026-11-10', time: '8.30', end: '10.00', place: 'Hall' },
  { id: 'e12', title: 'English paper', category: 'exam', audience: 'Year 8', start: '2026-11-11', time: '8.30', end: '10.00', place: 'Hall' },
  { id: 'e13', title: 'Last day of term', category: 'term', audience: 'Whole school', start: '2026-11-27', allDay: true, note: 'School ends at 12.20.' },
  { id: 'e14', title: 'Year-end holiday', category: 'holiday', audience: 'Whole school', start: '2026-11-28', end: '2027-01-03', allDay: true },
  { id: 'e15', title: 'Merdeka Day', category: 'public-holiday', audience: 'Whole school', start: '2026-08-31', allDay: true },
  { id: 'e16', title: 'Malaysia Day', category: 'public-holiday', audience: 'Whole school', start: '2026-09-16', allDay: true },
  { id: 'e17', title: 'Sports Day', category: 'event', audience: 'Whole school', start: '2026-10-09', time: '7.30', end: '12.30', place: 'Main field' },
  { id: 'e18', title: 'Mid-term exams', category: 'exam', audience: 'Secondary', start: '2026-10-12', end: '2026-10-16', allDay: true },
  { id: 'e19', title: 'Science fair', category: 'event', audience: 'Secondary', start: '2026-11-19', time: '9.00', end: '12.00', place: 'Hall' },
  { id: 'e20', title: 'Christmas concert', category: 'event', audience: 'Whole school', start: '2026-11-26', time: '6.00', end: '8.00', place: 'Hall', note: 'Families welcome.' },
]
