// The mini capsule, as Music's MiniPlayer: when a page's hero scrolls away, a glass capsule keeps its one live thing in
// reach. It floats above the tab bar and slides in beside it when the bar minimises. Every tab page gives it its own
// content (Today and Timetable the lesson, Messages the newest unread, Calendar the next event, Record and Attendance
// their figure); the shell, motion and timing are this one component.
import { useContext } from 'react'
import { createPortal } from 'react-dom'
import { useTabBarMinimised } from '../app/hooks.js'
import { UnderlayContext } from '../app/underlay.js'
import { Icon } from './Icon.jsx'
import './miniBar.css'

/**
 * The capsule. shown: slide in. onOpen and label: the whole capsule is one button that takes you to the thing.
 * tile: the 38px square at the leading edge (see MiniTile). title, sub: two lines. action: an optional MiniAction.
 * Phone and tablet only; on a laptop the page has room for everything.
 */
export function MiniBar({ shown, onOpen, label, tile, title, sub, action, haspopup }) {
  const minimised = useTabBarMinimised()
  const under = useContext(UnderlayContext) // under an edge swipe its portal would float over the dragged screen
  if (under) return null
  return createPortal(
    <div
      className="mini-bar glass"
      data-liquid=""
      data-liquid-bezel="12"
      data-liquid-strength="12"
      data-liquid-frost="3"
      data-shown={shown || undefined}
      data-min={minimised || undefined}
      inert={!shown}
      aria-hidden={!shown || undefined}
    >
      <div className="mini-bar-in">
        <button type="button" className="mini-bar-main" onClick={onOpen} aria-label={label} aria-haspopup={haspopup}>
          {tile}
          <span className="mini-bar-text">
            <span className="mini-bar-title">{title}</span>
            {sub && <span className="mini-bar-sub">{sub}</span>}
          </span>
        </button>
        {action}
      </div>
    </div>,
    document.body,
  )
}

/**
 * The leading square. kind: 'figure' (a number and its unit, white on `tone`), 'icon' (a white glyph on `tone`),
 * 'date' (weekday over day, as the Calendar icon), 'bare' (children as they are, an Avatar). tone is any CSS colour.
 */
export function MiniTile({ kind = 'figure', tone, subject, value, unit, icon, weekday, children }) {
  const style = tone ? { '--mini-tone': tone } : undefined
  if (kind === 'bare') return <span className="mini-tile mini-tile--bare" aria-hidden="true">{children}</span>
  if (kind === 'date') {
    return (
      <span className="mini-tile mini-tile--date" aria-hidden="true">
        <span className="mini-tile-wd">{weekday}</span>
        <span className="mini-tile-day">{value}</span>
      </span>
    )
  }
  if (kind === 'icon') return <span className="mini-tile" data-subject={subject} style={style} aria-hidden="true"><Icon name={icon} size={20} /></span>
  return (
    <span className="mini-tile" data-subject={subject} style={style} aria-hidden="true">
      {value}{unit && <span className="mini-tile-unit">{unit}</span>}
    </span>
  )
}

/** The trailing round button: Join (in the subject's colour) or a plain action such as New message. */
export function MiniAction({ icon, label, onClick, disabled, subject, haspopup }) {
  return (
    <button
      type="button"
      className="mini-bar-action"
      data-subject={subject}
      data-tone={subject ? 'subject' : undefined}
      onClick={onClick}
      aria-label={label}
      aria-haspopup={haspopup}
      disabled={disabled}
    >
      <Icon name={icon} size={20} />
    </button>
  )
}
