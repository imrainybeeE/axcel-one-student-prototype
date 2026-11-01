// Bentley's 7 Phoenix timetable from Axcel One. Times use the school's 12-hour format.
export const teachers = {
  shalini: { name: 'Shalini', short: 'Shalini', initials: 'SH' },
  farah: { name: 'Farah', short: 'Farah', initials: 'FA' },
  tanJm: { name: 'Tan JM', short: 'Tan JM', initials: 'TJ' },
  teo: { name: 'Teo', short: 'Teo', initials: 'TE' },
  fifi: { name: 'Fifi', short: 'Fifi', initials: 'FI' },
  alena: { name: 'Alena', short: 'Alena', initials: 'AL' },
  aliah: { name: 'Aliah', short: 'Aliah', initials: 'AH' },
  farzana: { name: 'Farzana', short: 'Farzana', initials: 'FZ' },
  nurin: { name: 'Nurin', short: 'Nurin', initials: 'NU' },
  shwaarna: { name: 'Shwaarna', short: 'Shwaarna', initials: 'SW' },
  raudah: { name: 'Raudah', short: 'Raudah', initials: 'RA' },
  yap: { name: 'Yap YT', short: 'Yap YT', initials: 'YT' },
  hazilla: { name: 'Hazilla', short: 'Hazilla', initials: 'HZ' },
  tan: { name: 'Tan', short: 'Tan', initials: 'TA' },
  peTeam: { name: 'Aliah, Farzana, Nurin', short: 'PE team', initials: 'AF' },
}

export const subjects = {
  homeroom: { name: 'Homeroom', short: 'Homeroom', teacher: 'shalini' },
  maths: { name: 'Mathematics', short: 'Maths', teacher: 'farah' },
  mandarin: { name: 'Mandarin', short: 'Mandarin', teacher: 'tanJm' },
  physics: { name: 'Physics', short: 'Physics', teacher: 'teo' },
  english: { name: 'English', short: 'English', teacher: 'fifi' },
  gp: { name: 'Global Perspectives', short: 'GP', teacher: 'shalini' },
  tutorial: { name: 'Tutorial', short: 'Tutorial', teacher: 'alena' },
  pe: { name: 'Physical Education', short: 'PE', teacher: 'peTeam' },
  esl: { name: 'ESL', short: 'ESL', teacher: 'shwaarna' },
  ict: { name: 'ICT', short: 'ICT', teacher: 'raudah' },
  bm: { name: 'Bahasa Melayu', short: 'Bahasa Melayu', teacher: 'aliah' },
  chemistry: { name: 'Chemistry', short: 'Chemistry', teacher: 'hazilla' },
  biology: { name: 'Biology', short: 'Biology', teacher: 'tan' },
  program: { name: 'Axcel Program', short: 'Axcel Program' },
  rt: { name: 'RT', short: 'RT' },
}

const L = (start, end, subject) => ({ kind: 'lesson', start, end, subject })
const B = (start, end, label) => ({ kind: 'break', start, end, label })

// Monday to Friday, as shown in the signed-in 7 Phoenix weekly timetable.
export const week = {
  1: [L('8.15', '8.40', 'homeroom'), L('8.40', '9.25', 'maths'), L('9.25', '10.10', 'mandarin'), B('10.10', '10.30', 'Break'), L('10.30', '11.15', 'physics'), L('11.15', '12.00', 'physics'), B('12.00', '12.45', 'Lunch'), L('12.45', '1.30', 'english'), L('1.30', '2.15', 'gp'), B('2.15', '2.35', 'Break'), L('2.35', '3.20', 'gp'), L('3.20', '4.05', 'tutorial'), L('4.05', '4.15', 'rt')],
  2: [L('8.15', '8.40', 'homeroom'), L('8.40', '9.25', 'pe'), L('9.25', '10.10', 'pe'), B('10.10', '10.30', 'Break'), L('10.30', '11.15', 'mandarin'), L('11.15', '12.00', 'english'), B('12.00', '12.45', 'Lunch'), L('12.45', '1.30', 'esl'), L('1.30', '2.15', 'tutorial'), B('2.15', '2.35', 'Break'), L('2.35', '3.20', 'maths'), L('3.20', '4.05', 'maths'), L('4.05', '4.15', 'rt')],
  3: [L('8.15', '8.40', 'homeroom'), L('8.40', '9.25', 'esl'), L('9.25', '10.10', 'maths'), B('10.10', '10.30', 'Break'), L('10.30', '11.15', 'gp'), L('11.15', '12.00', 'gp'), B('12.00', '12.45', 'Lunch'), L('12.45', '1.30', 'bm'), L('1.30', '2.15', 'tutorial'), B('2.15', '2.35', 'Break'), L('2.35', '3.20', 'program'), L('3.20', '4.05', 'program'), L('4.05', '4.15', 'rt')],
  4: [L('8.15', '8.40', 'homeroom'), L('8.40', '9.25', 'maths'), L('9.25', '10.10', 'ict'), B('10.10', '10.30', 'Break'), L('10.30', '11.15', 'bm'), L('11.15', '12.00', 'bm'), B('12.00', '12.45', 'Lunch'), L('12.45', '1.30', 'english'), L('1.30', '2.15', 'tutorial'), B('2.15', '2.35', 'Break'), L('2.35', '3.20', 'biology'), L('3.20', '4.05', 'biology'), L('4.05', '4.15', 'rt')],
  5: [L('8.15', '8.40', 'homeroom'), L('8.40', '9.25', 'english'), L('9.25', '10.10', 'english'), B('10.10', '10.30', 'Break'), L('10.30', '11.15', 'chemistry'), L('11.15', '12.00', 'chemistry'), B('12.00', '12.45', 'Lunch'), L('12.45', '1.30', 'ict'), L('1.30', '2.15', 'tutorial'), B('2.15', '2.35', 'Break'), L('2.35', '3.20', 'program'), L('3.20', '4.05', 'program'), L('4.05', '4.15', 'rt')],
}

// Axcel One did not show online lessons or join links for this account, so the prototype does not invent any.
export const onlineDay = []
export const onlineDates = []
export const JOIN_OPENS_MINUTES_BEFORE = 5

export function dayPlan(date, isoDateString) {
  const dow = date.getDay()
  if (onlineDates.includes(isoDateString)) return { online: true, items: onlineDay }
  if (dow === 0 || dow === 6) return { online: false, items: [] }
  return { online: false, items: week[dow] || [] }
}
