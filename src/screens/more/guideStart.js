// Getting started with Axcel One: short sections about this app, each with the tile of the place it describes.
// tone: the section's tile colour. points: one short line each, read top to bottom.
export const GUIDE_SECTIONS = [
  {
    id: 'today', title: 'Today', icon: 'today', tone: 'var(--brand-solid)',
    lead: 'Open the app and Today shows what matters right now.',
    points: [
      'The big card is the lesson on now, with the time left and what comes next.',
      'Below it: the rest of today, new messages and what’s coming up.',
      'Tap any heading to open the full page.',
    ],
  },
  {
    id: 'timetable', title: 'Timetable and Join', icon: 'timetable', tone: '#5856D6',
    lead: 'Timetable shows one school day at a time.',
    points: [
      'Tap a day in the strip at the top, or choose Week to see Monday to Friday.',
      'Online lessons have a Join button. It turns on 5 minutes before the lesson starts.',
    ],
  },
  {
    id: 'messages', title: 'Messages and safety', icon: 'messages', tone: '#2F9E45',
    lead: 'Messages are for school: your teachers and your class.',
    points: [
      'The school can read every message, and messages can’t be deleted.',
      'Tap a message to react, reply, copy or report it.',
      'If something worries you, report it or tell a teacher. You can block someone from the chat’s menu.',
    ],
  },
  {
    id: 'calendar', title: 'Calendar and key dates', icon: 'calendar', tone: '#E5483D',
    lead: 'Calendar has school events, holidays and term dates.',
    points: [
      'Upcoming lists what’s next. Month shows the whole month, with a dot on each busy day.',
      'Key dates lists terms, holidays and breaks for the year.',
    ],
  },
  {
    id: 'record', title: 'Record and attendance', icon: 'award', tone: '#E8920C',
    lead: 'Find both in More.',
    points: [
      'Record shows your merit points, your award level and what each point was for.',
      'Attendance shows your days present, absent and late, term by term.',
    ],
  },
  {
    id: 'settings', title: 'Settings', icon: 'gear', tone: '#8E8E93',
    lead: 'Make the app work the way you like.',
    points: [
      'Choose Light, Dark or Automatic, to follow your phone.',
      'Turn notifications on or off for messages, timetable changes and school notices.',
      'Add Axcel One to your Home Screen to open it like an app.',
    ],
  },
]
