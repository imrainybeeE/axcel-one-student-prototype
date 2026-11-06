import { lazyRoute } from '../../app/lazyRoute.js'

// The component gallery. Not in the navigation; open /kit directly.
export default [
  { path: '/kit', tab: 'inherit', defaultTab: 'more', parent: '/more', title: 'Components', component: lazyRoute(() => import('./Kit.jsx')) },
]
