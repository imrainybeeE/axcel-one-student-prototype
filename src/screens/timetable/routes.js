import { lazy } from 'react'

export default [
  { path: '/timetable', tab: 'timetable', root: true, title: 'Timetable', component: lazy(() => import('./Timetable.jsx')) },
]
