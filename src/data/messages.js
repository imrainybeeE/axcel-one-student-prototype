// Made-up message threads. Each thread holds only its latest message here, which is all Today shows; the earlier ones
// are in messageHistory.js and join their threads when a Messages screen loads.
// Times are school-style; `day` is an ISO date.
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
      { id: 'k4', from: 'them', day: '2026-11-02', time: '7.05', text: 'Please upload your reading log before Friday.' },
    ],
  },
  {
    id: 'phoenix',
    kind: 'class',
    title: '7 Phoenix',
    subtitle: 'Class group, 26 students and 3 teachers',
    initials: '7P',
    unread: 0,
    replyPolicy: 'everyone',
    messages: [
      { id: 'o4', from: 'Nur Aina', day: '2026-11-02', time: '9.06', text: 'Thank you sir', reactions: [{ emoji: '🙏', by: 'others', count: 4 }] },
    ],
  },
  {
    id: 'junhao',
    kind: 'direct',
    title: 'Lee Jun Hao',
    subtitle: '7 Phoenix',
    initials: 'LJ',
    unread: 0,
    messages: [
      { id: 'j3', from: 'them', day: '2026-11-01', time: '8.03', text: 'same lol. Dr Wong said we can ask in class' },
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
      { id: 'a2', from: 'them', day: '2026-10-31', time: '8.30', text: 'Fun Run this Saturday, wear your house shirt. Gates open at 7.15.' },
    ],
  },
  {
    id: 'priya',
    kind: 'direct',
    title: 'Priya Menon',
    subtitle: '7 Phoenix',
    initials: 'PM',
    unread: 0,
    messages: [
      { id: 'p2', from: 'them', day: '2026-10-27', time: '6.35', text: 'Sent to your school email!' },
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
      { id: 't2', from: 'them', day: '2026-10-21', time: '3.52', text: 'Yes, by 8.15 tomorrow please. The demerit stays, but this will not count as missing work.' },
    ],
  },
]

// People a student can start a chat with (search in New message). All made up; student IDs start 00 so they can
// never be a real student's ID.
export const contacts = {
  teachers: [
    { id: 'kavitha', name: 'Ms Kavitha Nair', detail: 'Homeroom teacher, English', initials: 'KN' },
    { id: 'tan', name: 'Mr Daniel Tan', detail: 'Mathematics', initials: 'DT' },
    { id: 'wong', name: 'Dr Wong Mei Ling', detail: 'Physics and Chemistry', initials: 'WM' },
    { id: 'nurul', name: 'Puan Nurul Huda', detail: 'Bahasa Melayu', initials: 'NH' },
    { id: 'arjun', name: 'Mr Arjun Pillai', detail: 'Global Perspectives', initials: 'AP' },
    { id: 'chloe', name: 'Ms Chloe Lim', detail: 'ICT', initials: 'CL' },
  ],
  staff: [
    { id: 'farah-c', name: 'Ms Farah Aziz', detail: 'School counsellor', initials: 'FA' },
    { id: 'grace', name: 'Mrs Grace Tan', detail: 'Librarian', initials: 'GT' },
    { id: 'hafiz', name: 'Mr Hafiz Rahman', detail: 'IT support', initials: 'HR' },
  ],
  students: [
    { id: 'junhao', name: 'Lee Jun Hao', detail: '7 Phoenix', studentId: '00BP101', initials: 'LJ' },
    { id: 'priya', name: 'Priya Menon', detail: '7 Phoenix', studentId: '00BP102', initials: 'PM' },
    { id: 'aina', name: 'Nur Aina Zulkifli', detail: '7 Phoenix', studentId: '00BP103', initials: 'NA' },
    { id: 'ethan', name: 'Ethan Ong', detail: '7 Lyra', studentId: '00BP104', initials: 'EO' },
    { id: 'aiden', name: 'Aiden Lau', detail: '8 Orion', studentId: '00BP105', initials: 'AL' },
    { id: 'siti', name: 'Siti Hajar Ismail', detail: '8 Lyra', studentId: '00BP106', initials: 'SH' },
    { id: 'marcus', name: 'Marcus Lim', detail: '9 Phoenix', studentId: '00BP107', initials: 'ML' },
    { id: 'kavya', name: 'Kavya Raj', detail: '7 Orion', studentId: '00BP108', initials: 'KR' },
  ],
}

export const safetyNote = 'Messages are for school. Teachers can read class groups, and you can report any message that worries you.'
