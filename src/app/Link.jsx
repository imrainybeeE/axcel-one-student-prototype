import { useRoute, navigate, withDemoParams, appPathname } from './router.js'
import { zoomFrom } from './zoom.js'

/**
 * An in-app link. Keeps demo params, intercepts plain clicks, marks itself pending while its screen loads.
 * zoom: the card grows into the screen it opens (iOS zoom transition); pushes only.
 */
export function Link({ to, type = 'push', replace, zoom = false, onClick, children, ...rest }) {
  const { pendingTo, tab } = useRoute()
  const href = withDemoParams(to)
  const pendingHref = new URL(href, window.location.origin)
  const pending = pendingTo && pendingTo === appPathname(pendingHref.pathname) + pendingHref.search ? true : undefined
  return (
    <a
      href={href}
      data-pending={pending}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        // On a phone a zoom opens the screen inside the current tab's stack, so Back returns to the card it came from;
        // on a laptop the sidebar shows the section the screen belongs to
        const zooming = zoom && type === 'push' && !replace
        if (zooming) zoomFrom()
        const keepTab = zooming && !window.matchMedia('(min-width: 1024px)').matches
        navigate(to, { type, replace, tab: keepTab ? tab : undefined })
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
