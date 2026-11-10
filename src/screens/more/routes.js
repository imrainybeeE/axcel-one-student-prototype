import { lazyRoute } from '../../app/lazyRoute.js'
export default [
  { path: '/more', tab: 'more', root: true, title: 'More', component: lazyRoute(() => import('./More.jsx')) },
  { path: '/settings', tab: 'more', parent: '/more', nav: 'settings', title: 'Settings', component: lazyRoute(() => import('./Settings.jsx')) },
  { path: '/settings/muted', tab: 'more', parent: '/settings', nav: 'settings', title: 'Muted chats', component: lazyRoute(() => import('./SettingsMuted.jsx')) },
  { path: '/settings/calendar', tab: 'more', parent: '/settings', nav: 'settings', title: 'Reminders', component: lazyRoute(() => import('./SettingsCalendar.jsx')) },
  { path: '/settings/calendar/:kind', tab: 'more', parent: '/settings/calendar', nav: 'settings', title: 'Reminders', component: lazyRoute(() => import('./SettingsReminder.jsx')) },
  { path: '/account', tab: 'more', parent: '/more', nav: 'settings', title: 'Account', component: lazyRoute(() => import('./Account.jsx')) },
  { path: '/account/password', tab: 'more', parent: '/account', nav: 'settings', title: 'Password', component: lazyRoute(() => import('./Password.jsx')) },
  { path: '/handbook', tab: 'more', parent: '/more', nav: 'handbook', title: 'Handbook', component: lazyRoute(() => import('./Handbook.jsx')) },
  { path: '/handbook/:id', tab: 'more', parent: '/handbook', nav: 'handbook', title: 'Handbook', component: lazyRoute(() => import('./HandbookTopic.jsx')) },
  { path: '/guides', tab: 'more', parent: '/more', nav: 'guides', title: 'User guides', component: lazyRoute(() => import('./Guides.jsx')) },
  { path: '/guides/start', tab: 'more', parent: '/guides', nav: 'guides', title: 'Getting started', component: lazyRoute(() => import('./GuideStart.jsx')) },
  { path: '/report', tab: 'more', parent: '/more', nav: 'report', title: 'Report', component: lazyRoute(() => import('./Report.jsx')) },
  { path: '/sign-in', tab: 'more', root: true, chrome: false, title: 'Sign in', component: lazyRoute(() => import('./SignIn.jsx')) },
]
