// Made-up message threads. Times are school-style; `day` is an ISO date.
// kind: 'direct' (one person), 'class' (class group, teachers can read), 'announcement' (read-only), 'staff' (teacher you message).

export const threads = [
  {
    id: 'kavitha',
    kind: 'direct',
    title: 'Ms Kavitha Nair',
    subtitle: 'Homeroom teacher, English',
    initials: 'KN',
    unread: 1,
    pinned: false,
    messages: [
      { id: 'k1', from: 'me', day: '2026-10-19', time: '4.12', text: 'Hi Ms Kavitha, is the reading log for chapters 1 to 5 or the whole book?' },
      { id: 'k2', from: 'them', day: '2026-10-19', time: '4.40', text: 'Chapters 1 to 5 for now. One short paragraph per chapter is enough.' },
      { id: 'k3', from: 'me', day: '2026-10-19', time: '4.41', text: 'Okay, thank you!', reactions: [{ emoji: '👍', by: 'them' }] },
      { id: 'k4', from: 'them', day: '2026-10-21', time: '7.05', text: 'Please upload your reading log before Friday.' },
    ],
  },
  {
    id: 'orion',
    kind: 'class',
    title: '8 Orion',
    subtitle: 'Class group, 26 students and 3 teachers',
    initials: '8O',
    unread: 0,
    replyPolicy: 'everyone',
    messages: [
      { id: 'o1', from: 'Lee Jun Hao', day: '2026-10-20', time: '8.55', text: 'Is the online class link the same as Monday?' },
      { id: 'o2', from: 'Priya Menon', day: '2026-10-20', time: '8.56', text: 'It is on the timetable, there is a Join button now' },
      { id: 'o3', from: 'Mr Daniel Tan', role: 'teacher', day: '2026-10-21', time: '9.05', text: 'Quiz moved to Thursday, same time.' },
      { id: 'o4', from: 'Nur Aina', day: '2026-10-21', time: '9.06', text: 'Thank you sir', reactions: [{ emoji: '🙏', by: 'others', count: 4 }] },
    ],
  },
  {
    id: 'junhao',
    kind: 'direct',
    title: 'Lee Jun Hao',
    subtitle: '8 Orion',
    initials: 'LJ',
    unread: 0,
    messages: [
      { id: 'j1', from: 'them', day: '2026-10-20', time: '7.48', text: 'did you finish the physics worksheet?' },
      { id: 'j2', from: 'me', day: '2026-10-20', time: '8.02', text: 'Almost, question 6 is hard' },
      { id: 'j3', from: 'them', day: '2026-10-20', time: '8.03', text: 'same lol. Dr Wong said we can ask in class' },
    ],
  },
  {
    id: 'office',
    kind: 'announcement',
    title: 'Secondary Office',
    subtitle: 'Announcements for Years 7 to 11',
    initials: 'SO',
    unread: 0,
    messages: [
      { id: 'a1', from: 'them', day: '2026-10-12', time: '9.00', text: 'Final exams run from Monday 9 to Friday 13 November. Your exam timetable will be in Calendar this week.' },
      { id: 'a2', from: 'them', day: '2026-10-19', time: '8.30', text: 'Fun Run this Saturday, wear your house shirt. Gates open at 7.15.' },
    ],
  },
  {
    id: 'priya',
    kind: 'direct',
    title: 'Priya Menon',
    subtitle: '8 Orion',
    initials: 'PM',
    unread: 0,
    messages: [
      { id: 'p1', from: 'me', day: '2026-10-15', time: '6.20', text: 'Can you send me the GP group slides?' },
      { id: 'p2', from: 'them', day: '2026-10-15', time: '6.35', text: 'Sent to your school email!' },
    ],
  },
  {
    id: 'tan',
    kind: 'direct',
    title: 'Mr Daniel Tan',
    subtitle: 'Mathematics',
    initials: 'DT',
    unread: 0,
    messages: [
      { id: 't1', from: 'me', day: '2026-10-09', time: '3.30', text: 'Sorry sir, I left my homework at home. Can I hand it in tomorrow?' },
      { id: 't2', from: 'them', day: '2026-10-09', time: '3.52', text: 'Yes, by 8.15 tomorrow please. The demerit stays, but this will not count as missing work.' },
    ],
  },
]

// People a student can start a chat with (search in New message).
export const contacts = {
  teachers: [
    { id: 'kavitha', name: 'Ms Kavitha Nair', detail: 'Homeroom teacher, English', initials: 'KN' },
    { id: 'tan', name: 'Mr Daniel Tan', detail: 'Mathematics', initials: 'DT' },
    { id: 'wong', name: 'Dr Wong Mei Ling', detail: 'Physics and Chemistry', initials: 'WM' },
    { id: 'nurul', name: 'Puan Nurul Huda', detail: 'Bahasa Melayu', initials: 'NH' },
    { id: 'arjun', name: 'Mr Arjun Pillai', detail: 'Global Perspectives', initials: 'AP' },
    { id: 'chloe', name: 'Ms Chloe Lim', detail: 'ICT', initials: 'CL' },
  ],
  students: [
    { id: 'junhao', name: 'Lee Jun Hao', detail: '8 Orion', initials: 'LJ' },
    { id: 'priya', name: 'Priya Menon', detail: '8 Orion', initials: 'PM' },
    { id: 'aina', name: 'Nur Aina Zulkifli', detail: '8 Orion', initials: 'NA' },
    { id: 'ethan', name: 'Ethan Ong', detail: '8 Lyra', initials: 'EO' },
  ],
}

export const safetyNote = 'Messages are for school. Teachers can read class groups, and you can report any message that worries you.'
