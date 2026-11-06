import { lazyRoute } from '../../app/lazyRoute.js'

export default [
  { path: '/timetable', tab: 'timetable', root: true, title: 'Timetable', component: lazyRoute(() => import('./Timetable.jsx')) },
]
