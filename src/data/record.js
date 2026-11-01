// Made-up 2026 merit and demerit record for Aisyah.
// Merits carry points in one of three areas: attitude, skills, knowledge. Totals: Attitude 92, Skills 71, Knowledge 123 (286).
// Demerits total 5. Points = merits minus demerits = 281. Awards: Silver 300, Gold 400, Star Student 500.

export const awards = [
  { name: 'Silver', points: 300 },
  { name: 'Gold', points: 400 },
  { name: 'Star Student', points: 500 },
]

export const areas = {
  attitude: { label: 'Attitude', hint: 'How you behave and help others' },
  skills: { label: 'Skills', hint: 'Teamwork, presenting and practical work' },
  knowledge: { label: 'Knowledge', hint: 'Tests, quizzes and great work' },
}

const M = (date, title, area, points, teacher) => ({ type: 'merit', date, title, area, points, teacher })
const D = (date, title, points, teacher, note) => ({ type: 'demerit', date, title, points, teacher, note })

export const entries = [
  M('2026-10-19', 'Helped set up the chemistry lab', 'attitude', 3, 'Dr Wong Mei Ling'),
  M('2026-10-16', 'Top score in the algebra quiz', 'knowledge', 5, 'Mr Daniel Tan'),
  M('2026-10-14', 'Presented the ICT group project', 'skills', 4, 'Ms Chloe Lim'),
  D('2026-10-09', 'Homework not handed in', 2, 'Mr Daniel Tan', 'Handed in the next morning.'),
  M('2026-10-08', 'Full attendance in September', 'attitude', 5, 'Ms Kavitha Nair'),
  M('2026-10-06', 'Excellent Bahasa Melayu essay', 'knowledge', 6, 'Puan Nurul Huda'),
  M('2026-10-02', 'Led the warm-up in PE', 'skills', 3, 'Encik Farid Hassan'),
  M('2026-09-29', 'Helped a classmate catch up in maths', 'attitude', 4, 'Mr Daniel Tan'),
  M('2026-09-24', 'Science test, 92 percent', 'knowledge', 8, 'Dr Wong Mei Ling'),
  M('2026-09-18', 'Debate club, best speaker', 'skills', 6, 'Mr Arjun Pillai'),
  D('2026-09-15', 'Phone out during lesson', 3, 'Ms Chloe Lim', 'Rule 4.2 in the Student Handbook.'),
  M('2026-09-11', 'Kept the classroom tidy all week', 'attitude', 3, 'Ms Kavitha Nair'),
  M('2026-09-08', 'Mandarin speaking test, excellent', 'knowledge', 7, 'Mr Lee Wei Jie'),
  M('2026-09-03', 'Art portfolio finished early', 'skills', 5, 'Mrs Sarah Thompson'),
  M('2026-08-27', 'Volunteered at the open day', 'attitude', 6, 'Secondary Office'),
  M('2026-08-20', 'Global Perspectives research, top grade', 'knowledge', 8, 'Mr Arjun Pillai'),
  M('2026-08-12', 'Coding challenge, first place', 'skills', 8, 'Ms Chloe Lim'),
  M('2026-08-05', 'Respectful in the school assembly', 'attitude', 4, 'Secondary Office'),
  M('2026-07-29', 'Biology practical write-up', 'knowledge', 6, 'Mrs Sarah Thompson'),
  M('2026-07-21', 'Helped run the book fair', 'attitude', 6, 'Ms Kavitha Nair'),
  M('2026-07-14', 'Group science model', 'skills', 7, 'Dr Wong Mei Ling'),
  M('2026-07-07', 'Mid-year maths exam, A*', 'knowledge', 10, 'Mr Daniel Tan'),
  M('2026-06-23', 'Kind to a new student', 'attitude', 5, 'Ms Kavitha Nair'),
  M('2026-06-16', 'Music performance at assembly', 'skills', 6, 'Secondary Office'),
  M('2026-06-09', 'English reading challenge, 10 books', 'knowledge', 9, 'Ms Kavitha Nair'),
  M('2026-05-26', 'Peer mentor for Year 7', 'attitude', 13, 'Secondary Office'),
  M('2026-05-19', 'Robotics club build', 'skills', 7, 'Ms Chloe Lim'),
  M('2026-05-12', 'Chemistry quiz, full marks', 'knowledge', 8, 'Dr Wong Mei Ling'),
  M('2026-04-28', 'Always on time this month', 'attitude', 5, 'Ms Kavitha Nair'),
  M('2026-04-21', 'Sports Day relay team', 'skills', 6, 'Encik Farid Hassan'),
  M('2026-04-14', 'Spelling bee finalist', 'knowledge', 9, 'Ms Kavitha Nair'),
  M('2026-03-31', 'Helped clean up after the fair', 'attitude', 6, 'Secondary Office'),
  M('2026-03-24', 'Science fair poster', 'skills', 5, 'Dr Wong Mei Ling'),
  M('2026-03-17', 'Maths olympiad round 1', 'knowledge', 12, 'Mr Daniel Tan'),
  M('2026-03-03', 'Class representative duties', 'attitude', 7, 'Ms Kavitha Nair'),
  M('2026-02-24', 'Drama club performance', 'skills', 4, 'Mrs Sarah Thompson'),
  M('2026-02-10', 'Geography map test', 'knowledge', 10, 'Mr Arjun Pillai'),
  M('2026-01-27', 'Welcomed new classmates', 'attitude', 14, 'Ms Kavitha Nair'),
  M('2026-01-20', 'Mandarin calligraphy', 'skills', 5, 'Mr Lee Wei Jie'),
  M('2026-01-13', 'Reading test, top of the class', 'knowledge', 15, 'Ms Kavitha Nair'),
  M('2026-01-08', 'Helpful first week', 'attitude', 11, 'Ms Kavitha Nair'),
  M('2026-01-06', 'Organised the class library', 'skills', 5, 'Ms Kavitha Nair'),
  M('2026-01-05', 'Holiday reading project', 'knowledge', 10, 'Ms Kavitha Nair'),
]

export function summary(list = entries) {
  const s = { attitude: 0, skills: 0, knowledge: 0, merits: 0, demerits: 0 }
  for (const e of list) {
    if (e.type === 'merit') { s[e.area] += e.points; s.merits += e.points } else s.demerits += e.points
  }
  s.points = s.merits - s.demerits
  const next = awards.find((a) => a.points > s.points)
  const current = [...awards].reverse().find((a) => a.points <= s.points) || null
  return { ...s, nextAward: next || null, toNext: next ? next.points - s.points : 0, currentAward: current }
}
