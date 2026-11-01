// The screen under a pushed one while the edge swipe drags it away (edgeBack.js): the previous route, drawn live
// and inert at the scroll it was left at. It exists only during the gesture; the router drops it in the same render
// as the real pop, so the hand-off never flashes.
import { Suspense, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { RouterContext, internal, matchRoute, underStore } from './router.js'
import { UnderlayContext } from './underlay.js'
import { Screen } from './Screen.jsx'

export function EdgeUnderlay() {
  const u = useSyncExternalStore(underStore.subscribe, underStore.get, () => null)
  return u ? <Under u={u} /> : null
}

function Under({ u }) {
  const scroller = useRef(null)
  const value = useMemo(() => {
    const routes = internal.api.routes
    const m = matchRoute(routes, u.path) || { route: routes[routes.length - 1], params: {} }
    return {
      loc: { path: u.path, search: u.search, idx: u.idx, tab: u.tab, type: 'none', key: 'under' },
      route: m.route, params: m.params, query: new URLSearchParams(u.search), tab: u.tab, pending: false, pendingTo: null,
    }
  }, [u])
  // Its own scroller, at the saved scroll: sticky bars and the scroll edge work as they do on the page
  useLayoutEffect(() => { if (scroller.current) scroller.current.scrollTop = u.y }, [u])
  const Comp = value.route.component
  return (
    <div className="edge-under" inert aria-hidden="true">
      <div ref={scroller} className="edge-under-scroll">
        <div className="main">
          <div className="route">
            <RouterContext.Provider value={value}>
              <UnderlayContext.Provider value>
                <Suspense fallback={<Screen title={value.route.title}>{null}</Screen>}>
                  <Comp params={value.params} />
                </Suspense>
              </UnderlayContext.Provider>
            </RouterContext.Provider>
          </div>
        </div>
      </div>
      <div className="edge-under-dim" />
    </div>
  )
}
