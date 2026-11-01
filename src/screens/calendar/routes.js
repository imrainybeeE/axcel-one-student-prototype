import { lazy } from 'react'

export default [
  { path: '/calendar', tab: 'calendar', root: true, title: 'Calendar', component: lazy(() => import('./Calendar.jsx')) },
]
