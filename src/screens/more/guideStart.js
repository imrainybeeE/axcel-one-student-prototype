// Getting started with Axcel One: one short part per place in the app, each with the tile of that place.
// text: one or two sentences that say what to do there. to/open: the link that takes you there.
export const GUIDE_SECTIONS = [
  {
    id: 'today', title: 'Today', icon: 'today', tone: 'var(--brand-solid)', to: '/', open: 'Open Today',
    text: 'The big card is the lesson on now, with the time left. Below it are the rest of your day, new messages and what’s coming up.',
  },
  {
    id: 'timetable', title: 'Timetable and Join', icon: 'timetable', tone: '#5856D6', to: '/timetable', open: 'Open Timetable',
    text: 'Pick a day in the strip, or choose Week. Online lessons have a Join button that turns on 5 minutes before they start.',
  },
  {
    id: 'messages', title: 'Messages and safety', icon: 'messages', tone: '#2F9E45', to: '/messages', open: 'Open Messages',
    text: 'Tap a message to react, reply, star or report it. The school can read every message, so tell a teacher if something worries you.',
  },
  {
    id: 'calendar', title: 'Calendar and key dates', icon: 'calendar', tone: '#E5483D', to: '/calendar', open: 'Open Calendar',
    text: 'Upcoming lists what’s next, and Month marks each busy day with a dot. Key dates has the year’s terms and holidays.',
  },
  {
    id: 'record', title: 'Record and attendance', icon: 'award', tone: '#E8920C', to: '/record', open: 'Open Record',
    text: 'Record shows your points and award level. Attendance and PE results are next to it in More.',
  },
  {
    id: 'settings', title: 'Settings', icon: 'gear', tone: '#8E8E93', to: '/settings', open: 'Open Settings',
    text: 'Choose Light, Dark or Automatic, and which notifications you get. Your photo and password are in your account at the top of More.',
  },
]
