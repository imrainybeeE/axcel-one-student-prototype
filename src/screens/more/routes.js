import { lazyRoute } from '../../app/lazyRoute.js'
import SignIn from './SignIn.jsx'

// Sign-in is not lazy: it is the first screen after sign-out and has no tab bar.
export default [
  { path: '/more', tab: 'more', root: true, title: 'More', component: lazyRoute(() => import('./More.jsx')) },
  { path: '/settings', tab: 'more', parent: '/more', nav: 'settings', title: 'Settings', component: lazyRoute(() => import('./Settings.jsx')) },
  { path: '/handbook', tab: 'more', parent: '/more', nav: 'handbook', title: 'Handbook', component: lazyRoute(() => import('./Handbook.jsx')) },
  { path: '/handbook/:id', tab: 'more', parent: '/handbook', nav: 'handbook', title: 'Handbook', component: lazyRoute(() => import('./HandbookTopic.jsx')) },
  { path: '/report', tab: 'more', parent: '/more', nav: 'report', title: 'Report', component: lazyRoute(() => import('./Report.jsx')) },
  { path: '/sign-in', tab: 'more', root: true, chrome: false, title: 'Sign in', component: SignIn },
]
