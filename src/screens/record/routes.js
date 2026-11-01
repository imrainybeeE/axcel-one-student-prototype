import { lazy } from 'react'

// Record and Attendance are pushed screens. They stay in the tab that opened them (Today or More);
// opened directly, they belong to More. nav marks the laptop sidebar row.
export default [
  { path: '/record', tab: 'inherit', defaultTab: 'more', parent: '/more', nav: 'record', title: 'Record', component: lazy(() => import('./Record.jsx')) },
  { path: '/attendance', tab: 'inherit', defaultTab: 'more', parent: '/more', nav: 'attendance', title: 'Attendance', component: lazy(() => import('./Attendance.jsx')) },
]
