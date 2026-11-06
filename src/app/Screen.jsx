// The frame every screen renders inside: the sticky 44 px bar, the large title on tab roots
// (collapsing into the bar as it scrolls away), document.title and the route announcement.
import { useContext, useEffect, useRef, useState, ViewTransition } from 'react'
import { useBack, useRoute } from './router.js'
import { announce } from './announce.js'
import { IconButton } from '../ui/Button.jsx'
import { zoomName, ZOOM_SHARE } from './zoom.js'
import { UnderlayContext } from './underlay.js'

let announcedKey = 0

/**
 * <Screen title="Messages" action={<Button ...>New message</Button>}>...</Screen>
 * title: 15 characters or fewer, no possessives. It becomes the h1, the bar title and "Messages - Axcel One".
 * action: at most one trailing control (44 x 44 icon button or a 44 px text button). The thread header may pass two.
 * titleContent: replaces the bar title on pushed screens (for example a name with a sub-line). Use with tall.
 * tall: 56 px bar (thread header). width: 'wide' (default, two columns on laptop) | 'narrow' (720 px column).
 * subtitle: a quiet line under the large title (Today's date).
 * heading: a ref to the page's own big heading (a pushed screen that draws one); on a phone the bar's title then
 *   appears only once that heading has scrolled under the bar, so the title never shows twice.
 */
export function Screen({ title, action, titleContent, tall = false, width = 'wide', subtitle, heading, children, className }) {
  const { loc, route } = useRoute()
  const back = useBack()
  const under = useContext(UnderlayContext)
  const root = Boolean(route.root)
  const [collapsed, setCollapsed] = useState(false)
  const [headingGone, setHeadingGone] = useState(false)
  const sentinel = useRef(null)
  const bar = useRef(null)

  // document.title on every change; the polite announcement once per navigation (never on first load)
  useEffect(() => {
    if (under) return // the screen under an edge swipe is not the page yet
    document.title = `${title} - Axcel One`
    if (loc.type !== 'initial' && loc.type !== 'none' && announcedKey !== loc.key) {
      announcedKey = loc.key
      announce(title)
    }
  }, [title, loc.key, loc.type, under])

  // Large title collapse: a sentinel under the h1 tells the bar when the title has scrolled under it.
  // On pushed screens the same sentinel (top of the content) shows the hairline once content scrolls under the bar.
  useEffect(() => {
    if (!sentinel.current) return
    const h = bar.current ? bar.current.offsetHeight : 44
    const io = new IntersectionObserver(([e]) => setCollapsed(!e.isIntersecting && e.boundingClientRect.top < h), {
      rootMargin: `-${h}px 0px 0px 0px`, threshold: 0,
    })
    io.observe(sentinel.current)
    return () => io.disconnect()
  }, [])

  // The page's own heading, when it has one: the bar's title waits until it has gone under the bar
  useEffect(() => {
    const el = heading?.current
    if (!el) return
    const h = bar.current ? bar.current.offsetHeight : 44
    const io = new IntersectionObserver(([e]) => setHeadingGone(!e.isIntersecting && e.boundingClientRect.top < h), {
      rootMargin: `-${h}px 0px 0px 0px`, threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [heading])

  const frame = (
    <div className={`screen screen--${width}${className ? ` ${className}` : ''}`} data-root={root || undefined}>
      <header ref={bar} className={`bar${tall ? ' bar--tall' : ''}`} data-collapsed={collapsed || undefined}>
        <div className="bar-lead">
          {!root && back && <IconButton icon="chevron-left" label={back.label} onClick={back.go} className="bar-back" data-liquid="" data-liquid-bezel="12" data-liquid-strength="10" />}
        </div>
        {root ? (
          <div className="bar-title" aria-hidden="true">{title}</div>
        ) : (
          <h1 className="bar-title" tabIndex={-1} data-wait={heading ? '' : undefined} data-shown={headingGone || undefined}>{titleContent || title}</h1>
        )}
        <div className="bar-trail">{action}</div>
      </header>
      {root ? (
        <div className="large-title">
          <h1 className="t-title-l" tabIndex={-1}>{title}</h1>
          <div ref={sentinel} className="large-title-sentinel" aria-hidden="true" />
          {subtitle && <p className="large-title-sub">{subtitle}</p>}
        </div>
      ) : (
        <>
          {/* On a laptop a pushed screen also gets a large title (as iPad apps do); the bar's h1 shows once it scrolls away */}
          {!titleContent && <div className="large-title large-title--pushed" aria-hidden="true"><p className="t-title-l">{title}</p></div>}
          <div ref={sentinel} className="large-title-sentinel" aria-hidden="true" />
        </>
      )}
      <div className="screen-body">{children}</div>
    </div>
  )
  // The screen is one half of a zoom pair with the row that opened it (zoom.js); under an edge swipe it is not
  return under ? frame : <ViewTransition name={zoomName(loc.path)} share={ZOOM_SHARE} default="none">{frame}</ViewTransition>
}

/** A titled placeholder for screens that are not built yet. */
export function Placeholder({ title, children }) {
  return (
    <Screen title={title}>
      <p className="placeholder-text">{children || `${title} is being built. Everything else in the app works.`}</p>
    </Screen>
  )
}
