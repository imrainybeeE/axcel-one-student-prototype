import Today from './Today.jsx'

// Today is not lazy: it is the first screen and the LCP.
export default [
  { path: '/', tab: 'today', root: true, title: 'Today', component: Today },
]
