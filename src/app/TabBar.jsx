import { useEffect, useRef, useState } from 'react'
import { TABS, SIDEBAR_GROUPS } from './nav.js'
import { assetPath, goToTab, navigate, useRoute, withDemoParams } from './router.js'
import { useUnreadThreads } from './store.js'
import { useScrolledDown } from './hooks.js'
import { haptic } from '../ui/haptic.js'
import { Icon } from '../ui/Icon.jsx'
import { Badge } from '../ui/Tag.jsx'
import TutorIdea from '../screens/more/TutorIdea.jsx'

function useUnreadCount() {
  const n = useUnreadThreads().size
  // Installed app: mirror the count on the home-screen icon
  useEffect(() => {
    if (!('setAppBadge' in navigator) || !window.matchMedia('(display-mode: standalone)').matches) return
    if (n) navigator.setAppBadge(n).catch(() => {})
    else navigator.clearAppBadge?.().catch(() => {})
  }, [n])
  return n
}

/**
 * Phone and tablet tab bar (under 1024 px): a floating glass pill with five links, exactly one aria-current.
 * A glass lens sits under the active tab. Press and the lens grows under the finger; slide across the bar and it
 * follows; let go on a tab to go there (press-drag-release, as iOS 26). Scrolling down minimises the pill.
 */
export function TabBar() {
  const { tab, route } = useRoute()
  const unread = useUnreadCount()
  const minimised = useScrolledDown()
  const nav = useRef(null)
  const fill = useRef(null)
  const press = useRef(null) // { at, x, captured }
  const [pressAt, setPressAt] = useState(null)
  const [dragging, setDragging] = useState(false)
  // Icon bounces and lens stretches answer a change of tab, never the first paint
  const [ready, setReady] = useState(false)
  useEffect(() => { const id = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(id) }, [])
  const active = Math.max(0, TABS.findIndex((t) => t.id === tab))
  const lensAt = pressAt ?? active

  // The lens stretches the way it travels, more for a longer trip, and settles as it lands (not on first paint, not mid-drag)
  const lastAt = useRef(lensAt)
  useEffect(() => {
    const from = lastAt.current
    lastAt.current = lensAt
    const el = fill.current
    if (!ready || dragging || !el || from === lensAt || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const d = Math.min(3, Math.abs(lensAt - from))
    el.style.transformOrigin = lensAt > from ? '0% 50%' : '100% 50%'
    el.animate(
      [{ transform: 'scale(1, 1)' }, { transform: `scale(${1 + 0.12 * d}, ${1 - 0.06 * d})`, offset: 0.4 }, { transform: 'scale(1, 1)' }],
      { duration: 420, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', composite: 'add' },
    )
  }, [lensAt, ready, dragging])

  const geometry = () => {
    const r = nav.current.getBoundingClientRect()
    return { r, cell: (r.width - 8) / TABS.length }
  }
  const indexAt = (x) => {
    const { r, cell } = geometry()
    return Math.max(0, Math.min(TABS.length - 1, Math.floor((x - r.left - 4) / cell)))
  }
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const i = indexAt(e.clientX)
    press.current = { at: i, x: e.clientX }
    nav.current.style.setProperty('--px', `${e.clientX - nav.current.getBoundingClientRect().left}px`)
    setPressAt(i)
  }
  const onPointerMove = (e) => {
    const p = press.current
    if (!p) return
    const { r, cell } = geometry()
    nav.current.style.setProperty('--px', `${e.clientX - r.left}px`)
    if (!p.captured && Math.abs(e.clientX - p.x) < 10) return // a tap, not a slide
    if (!p.captured) { nav.current.setPointerCapture?.(e.pointerId); p.captured = true; setDragging(true) }
    // While dragging, the lens is under the finger exactly; it snaps to a tab only on release
    const x = Math.max(0, Math.min((TABS.length - 1) * cell, e.clientX - r.left - 4 - cell / 2))
    nav.current.style.setProperty('--lens-x', `${x}px`)
    const i = indexAt(e.clientX)
    if (i !== p.at) { p.at = i; setPressAt(i); haptic() }
  }
  const onPointerEnd = (e) => {
    const p = press.current
    press.current = null
    setPressAt(null)
    setDragging(false)
    // Slid onto another tab: go there. A plain tap is handled by the link's own click.
    if (p && p.captured && e.type === 'pointerup') goToTab(TABS[p.at].id, tab, route)
  }

  return (
    <nav
      ref={nav}
      className="tabbar glass"
      aria-label="Main"
      data-liquid=""
      data-liquid-bezel="14"
      data-liquid-strength="14"
      data-liquid-frost="3"
      data-min={minimised || undefined}
      data-pressing={pressAt != null || undefined}
      data-dragging={dragging || undefined}
      data-ready={ready || undefined}
      style={{ '--i': lensAt }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <span className="tabbar-lens" aria-hidden="true"><span ref={fill} className="tabbar-lens-fill" /></span>
      {TABS.map((t) => {
        const active = t.id === tab
        const label = t.id === 'messages' && unread ? `${t.label}, ${unread} unread` : undefined
        return (
          <a
            key={t.id}
            href={withDemoParams(t.path)}
            className="tab"
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            draggable="false"
            onClick={(e) => {
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
              e.preventDefault()
              goToTab(t.id, tab, route)
            }}
          >
            <span className="tab-plate">
              <Icon name={t.icon} filled={active} />
              {t.id === 'messages' && <Badge count={unread} className="tab-badge" />}
            </span>
            <span className="tab-label">{t.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

/** Laptop sidebar (1024 px and up): logo, the four destinations, then the More rows in More's order. */
export function Sidebar() {
  const { tab, route } = useRoute()
  const unread = useUnreadCount()
  const current = route.nav || (route.root ? tab : null)
  return (
    <nav className="sidebar glass" aria-label="Main">
      <span className="sidebar-logo">
        <img src={assetPath('brand/logo-horizontal.png')} alt="Axcel One" width="134" height="28" />
      </span>
      {SIDEBAR_GROUPS.map((group, gi) => (
        <ul key={gi} className="sidebar-group" role="list">
          {group.map((item) => {
            const active = item.id === current
            const isTab = TABS.some((t) => t.id === item.id)
            const label = item.id === 'messages' && unread ? `${item.label}, ${unread} unread` : undefined
            return (
              <li key={item.id}>
                <a
                  href={withDemoParams(item.path)}
                  className="side-link"
                  aria-current={active ? 'page' : undefined}
                  aria-label={label}
                  onClick={(e) => {
                    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                    e.preventDefault()
                    if (isTab) goToTab(item.id, tab, route)
                    else navigate(item.path, { type: 'tab', tab: 'more' })
                  }}
                >
                  <Icon name={item.icon} filled={active && isTab} />
                  <span className="side-label">{item.label}</span>
                  {item.id === 'messages' && <Badge count={unread} className="side-badge" />}
                </a>
              </li>
            )
          })}
        </ul>
      ))}
      <TutorIdea placement="sidebar" />
    </nav>
  )
}
