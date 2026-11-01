// 8 Orion's timetable. Times are written school-style ("1.30" means 1.30 pm); use toMinutes() from clock.js.
// Online days use the same lessons with Google Meet links instead of rooms.

export const teachers = {
  kavitha: { name: 'Ms Kavitha Nair', short: 'Ms Kavitha', initials: 'KN' },
  tan: { name: 'Mr Daniel Tan', short: 'Mr Tan', initials: 'DT' },
  wong: { name: 'Dr Wong Mei Ling', short: 'Dr Wong', initials: 'WM' },
  nurul: { name: 'Puan Nurul Huda', short: 'Puan Nurul', initials: 'NH' },
  arjun: { name: 'Mr Arjun Pillai', short: 'Mr Arjun', initials: 'AP' },
  chloe: { name: 'Ms Chloe Lim', short: 'Ms Chloe', initials: 'CL' },
  lee: { name: 'Mr Lee Wei Jie', short: 'Mr Lee', initials: 'LW' },
  farid: { name: 'Encik Farid Hassan', short: 'Encik Farid', initials: 'FH' },
  sarah: { name: 'Mrs Sarah Thompson', short: 'Mrs Thompson', initials: 'ST' },
}

export const subjects = {
  esl: { name: 'English as a Second Language', short: 'English', teacher: 'kavitha', room: 'B2-04' },
  maths: { name: 'Mathematics', short: 'Maths', teacher: 'tan', room: 'B2-07' },
  physics: { name: 'Physics', short: 'Physics', teacher: 'wong', room: 'Lab 2' },
  chemistry: { name: 'Chemistry', short: 'Chemistry', teacher: 'wong', room: 'Lab 1' },
  biology: { name: 'Biology', short: 'Biology', teacher: 'sarah', room: 'Lab 3' },
  bm: { name: 'Bahasa Melayu', short: 'BM', teacher: 'nurul', room: 'B1-02' },
  mandarin: { name: 'Mandarin', short: 'Mandarin', teacher: 'lee', room: 'B1-05' },
  gp: { name: 'Global Perspectives', short: 'GP', teacher: 'arjun', room: 'B2-01' },
  ict: { name: 'ICT', short: 'ICT', teacher: 'chloe', room: 'Computer Lab' },
  pe: { name: 'Physical Education', short: 'PE', teacher: 'farid', room: 'Sports hall' },
  art: { name: 'Art and Design', short: 'Art', teacher: 'sarah', room: 'Art room' },
}

const L = (start, end, subject) => ({ kind: 'lesson', start, end, subject })
const B = (start, end, label) => ({ kind: 'break', start, end, label })

// Normal (on-campus) week. Wednesday is today's template too.
export const week = {
  1: [L('8.15', '9.00', 'maths'), L('9.00', '9.45', 'esl'), B('9.45', '10.05', 'Break'), L('10.05', '10.50', 'chemistry'), L('10.50', '11.35', 'mandarin'), L('11.35', '12.20', 'gp'), B('12.20', '1.00', 'Lunch'), L('1.00', '1.45', 'pe'), L('1.45', '2.30', 'pe'), L('2.30', '3.15', 'bm')],
  2: [L('8.15', '9.00', 'esl'), L('9.00', '9.45', 'biology'), B('9.45', '10.05', 'Break'), L('10.05', '10.50', 'maths'), L('10.50', '11.35', 'ict'), L('11.35', '12.20', 'ict'), B('12.20', '1.00', 'Lunch'), L('1.00', '1.45', 'art'), L('1.45', '2.30', 'art'), L('2.30', '3.15', 'mandarin')],
  3: [L('8.15', '9.00', 'esl'), L('9.00', '9.45', 'maths'), B('9.45', '10.05', 'Break'), L('10.05', '10.50', 'physics'), L('10.50', '11.35', 'bm'), L('11.35', '12.20', 'gp'), B('12.20', '1.00', 'Lunch'), L('1.00', '1.45', 'ict'), L('1.45', '2.30', 'biology'), L('2.30', '3.15', 'maths')],
  4: [L('8.15', '9.00', 'chemistry'), L('9.00', '9.45', 'chemistry'), B('9.45', '10.05', 'Break'), L('10.05', '10.50', 'esl'), L('10.50', '11.35', 'maths'), L('11.35', '12.20', 'mandarin'), B('12.20', '1.00', 'Lunch'), L('1.00', '1.45', 'gp'), L('1.45', '2.30', 'physics'), L('2.30', '3.15', 'bm')],
  5: [L('8.15', '9.00', 'biology'), L('9.00', '9.45', 'esl'), B('9.45', '10.05', 'Break'), L('10.05', '10.50', 'physics'), L('10.50', '11.35', 'maths'), L('11.35', '12.20', 'bm'), B('12.20', '1.00', 'Lunch'), L('1.00', '1.30', 'ict'), { kind: 'event', start: '1.30', end: '3.15', label: 'Clubs and activities' }],
}

// Online-day timetable: shorter 30-minute lessons, each with a Meet link (made-up codes).
export const onlineDay = [
  { ...L('9.00', '9.30', 'esl'), meet: 'https://meet.google.com/abc-defg-hij' },
  { ...L('9.30', '10.00', 'maths'), meet: 'https://meet.google.com/bcd-efgh-ijk' },
  B('10.00', '10.30', 'Break'),
  { ...L('10.30', '11.00', 'physics'), meet: 'https://meet.google.com/cde-fghi-jkl' },
  { ...L('11.00', '11.30', 'bm'), meet: 'https://meet.google.com/def-ghij-klm' },
  B('11.30', '1.00', 'Lunch'),
  { ...L('1.00', '1.30', 'gp'), meet: 'https://meet.google.com/efg-hijk-lmn' },
  { ...L('1.30', '2.00', 'ict'), meet: 'https://meet.google.com/fgh-ijkl-mno' },
]

// Days that run the online timetable (Y7-Y10 online learning days).
export const onlineDates = ['2026-10-20', '2026-10-21']

// Join links open this many minutes before a lesson starts.
export const JOIN_OPENS_MINUTES_BEFORE = 5

export function dayPlan(date, isoDateString) {
  const dow = date.getDay()
  if (onlineDates.includes(isoDateString)) return { online: true, items: onlineDay }
  if (dow === 0 || dow === 6) return { online: false, items: [] }
  return { online: false, items: week[dow] || [] }
}
