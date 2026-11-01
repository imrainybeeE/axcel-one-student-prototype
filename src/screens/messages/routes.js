import { lazy } from 'react'

const Thread = lazy(() => import('./Thread.jsx'))

export default [
  { path: '/messages', tab: 'messages', root: true, title: 'Messages', component: lazy(() => import('./Messages.jsx')) },
  { path: '/messages/:id', tab: 'messages', parent: '/messages', title: 'Message', component: Thread },
]
