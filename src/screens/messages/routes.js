import { lazyRoute } from '../../app/lazyRoute.js'

const Messages = lazyRoute(() => import('./Messages.jsx'))

// split: on a laptop the inbox and the open conversation are one screen (the list stays, only the thread changes)

export default [
  { path: '/messages', tab: 'messages', root: true, title: 'Messages', split: 'messages', component: Messages },
  { path: '/messages/starred', tab: 'messages', parent: '/messages', title: 'Starred', split: 'messages', component: Messages },
  { path: '/messages/:id', tab: 'messages', parent: '/messages', title: 'Message', split: 'messages', component: Messages },
]
