import { lazyRoute } from '../../app/lazyRoute.js'

// Record, Attendance and PE results are pushed screens. They stay in the tab that opened them (Today or More);
// opened directly, they belong to More. nav marks the laptop sidebar row.
export default [
  { path: '/record', tab: 'inherit', defaultTab: 'more', parent: '/more', nav: 'record', title: 'Record', component: lazyRoute(() => import('./Record.jsx')) },
  { path: '/attendance', tab: 'inherit', defaultTab: 'more', parent: '/more', nav: 'attendance', title: 'Attendance', component: lazyRoute(() => import('./Attendance.jsx')) },
  { path: '/pe', tab: 'inherit', defaultTab: 'more', parent: '/more', nav: 'pe', title: 'PE results', component: lazyRoute(() => import('./PE.jsx')) },
]
