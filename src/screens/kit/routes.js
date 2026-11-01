import { lazy } from 'react'

// The component gallery. Not in the navigation; open /kit directly.
export default [
  { path: '/kit', tab: 'inherit', defaultTab: 'more', parent: '/more', title: 'Components', component: lazy(() => import('./Kit.jsx')) },
]
