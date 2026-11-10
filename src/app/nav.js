// The fixed navigation model. Tabs never change after sign-in and are never disabled.

export const TABS = [
  { id: 'today', label: 'Today', path: '/', icon: 'today' },
  { id: 'timetable', label: 'Timetable', path: '/timetable', icon: 'timetable' },
  { id: 'messages', label: 'Messages', path: '/messages', icon: 'messages' },
  { id: 'calendar', label: 'Calendar', path: '/calendar', icon: 'calendar' },
  { id: 'more', label: 'More', path: '/more', icon: 'more' },
]

export const TAB_ROOTS = Object.fromEntries(TABS.map((t) => [t.id, t.path]))

// Laptop sidebar: the four destinations, then the More rows in the same order as the More screen.
// Groups are separated by a divider. Help order (Handbook, User guides, then Report a problem) matches More.
export const SIDEBAR_GROUPS = [
  [
    { id: 'today', label: 'Today', path: '/', icon: 'today' },
    { id: 'timetable', label: 'Timetable', path: '/timetable', icon: 'timetable' },
    { id: 'messages', label: 'Messages', path: '/messages', icon: 'messages' },
    { id: 'calendar', label: 'Calendar', path: '/calendar', icon: 'calendar' },
  ],
  [
    { id: 'record', label: 'Record', path: '/record', icon: 'award' },
    { id: 'attendance', label: 'Attendance', path: '/attendance', icon: 'check-circle' },
    { id: 'pe', label: 'PE results', path: '/pe', icon: 'figure-run' },
    { id: 'handbook', label: 'Handbook', path: '/handbook', icon: 'book' },
    { id: 'guides', label: 'User guides', path: '/guides', icon: 'lightbulb' },
  ],
  [
    { id: 'settings', label: 'Settings', path: '/settings', icon: 'gear' },
    { id: 'report', label: 'Report a problem', path: '/report', icon: 'flag' },
  ],
  [
    { id: 'signout', label: 'Sign out', path: '/sign-in', icon: 'sign-out' },
  ],
]
