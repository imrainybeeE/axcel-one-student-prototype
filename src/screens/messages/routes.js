import { lazyRoute } from '../../app/lazyRoute.js'

const Messages = lazyRoute(() => import('./Messages.jsx'))

export default [
  { path: '/messages', tab: 'messages', root: true, title: 'Messages', component: Messages },
  { path: '/messages/:id', tab: 'messages', parent: '/messages', title: 'Message', component: Messages },
]
