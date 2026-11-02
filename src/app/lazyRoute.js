// A lazily loaded screen that can also be fetched ahead of time, so a tap never waits for its code.
import { lazy } from 'react'

const loaders = []

/** lazy() plus a registered loader: lazyRoute(() => import('./Timetable.jsx')) */
export function lazyRoute(load) {
  let promise = null
  const once = () => (promise ??= load())
  loaders.push(once)
  return lazy(once)
}

/** Fetch every screen's code once the first screen is up and the main thread is idle. */
export function preloadRoutes() {
  const run = () => { for (const load of loaders) load().catch(() => {}) }
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2000 })
  else setTimeout(run, 1000)
}
