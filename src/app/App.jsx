import { Component, Suspense, ViewTransition } from 'react'
import { RouterProvider } from './RouterProvider.jsx'
import { useRoute } from './router.js'
import { routes } from './routes.js'
import { Screen } from './Screen.jsx'
import { TabBar, Sidebar } from './TabBar.jsx'
import { ToastProvider } from '../ui/Toast.jsx'
import { ErrorState } from '../ui/States.jsx'
import { EdgeUnderlay } from './EdgeUnderlay.jsx'
import { useEdgeBack } from './edgeBack.js'

// Push: the new screen slides over from the right while the old one recedes; pop reverses it.
// Exits get their own class so the screen on top (new on push, old on pop) can be raised. Tab switches cross-fade;
// query changes do not animate.
// Zoom: a card grows into the new screen (zoom.js); the routes themselves only recede and return around it.
const ENTER = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', 'nav-tab': 'nav-tab', 'nav-zoom': 'nav-zoom', 'nav-unzoom': 'nav-unzoom', default: 'none' }
const EXIT = { 'nav-forward': 'nav-forward-exit', 'nav-back': 'nav-back-exit', 'nav-tab': 'nav-tab', 'nav-zoom': 'nav-zoom-exit', 'nav-unzoom': 'nav-unzoom-exit', default: 'none' }

class RouteErrorBoundary extends Component {
  state = { failed: false, resetKey: this.props.resetKey }
  static getDerivedStateFromError() { return { failed: true } }
  // Reset on route change without remounting, so Suspense keeps the old screen while the next one loads
  static getDerivedStateFromProps(props, state) {
    return props.resetKey === state.resetKey ? null : { failed: false, resetKey: props.resetKey }
  }
  componentDidCatch(error) { console.warn('Screen failed to render', error) }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <Screen title={this.props.title || 'Axcel One'}>
        <ErrorState onRetry={() => window.location.reload()}>
          This screen did not load. Check that you are online, then try again.
        </ErrorState>
      </Screen>
    )
  }
}

/** While a screen's code arrives on first load: the frame only, no loader under a second. */
function RouteFallback({ title }) {
  return <Screen title={title}>{null}</Screen>
}

function Shell() {
  const { route, params } = useRoute()
  const chrome = route.chrome !== false
  const Comp = route.component
  const key = `${route.path}|${JSON.stringify(params)}`
  useEdgeBack()
  return (
    <>
      {chrome && <Sidebar />}
      <EdgeUnderlay />
      <main id="main" className={chrome ? 'main' : 'main main--bare'}>
        <RouteErrorBoundary resetKey={key} title={route.title}>
          <Suspense fallback={<RouteFallback title={route.title} />}>
            <ViewTransition key={key} enter={ENTER} exit={EXIT} default="none">
              <div className="route">
                <Comp params={params} />
              </div>
            </ViewTransition>
          </Suspense>
        </RouteErrorBoundary>
      </main>
      {chrome && <TabBar />}
      <div id="announcer" className="vh" aria-live="polite" aria-atomic="true" />
    </>
  )
}

export default function App() {
  return (
    <RouterProvider routes={routes}>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </RouterProvider>
  )
}
