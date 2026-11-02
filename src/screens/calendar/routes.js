import { lazyRoute } from '../../app/lazyRoute.js'

export default [
  { path: '/calendar', tab: 'calendar', root: true, title: 'Calendar', component: lazyRoute(() => import('./Calendar.jsx')) },
]
