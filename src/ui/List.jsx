import { useContext, useId, ViewTransition } from 'react'
import { Link } from '../app/Link.jsx'
import { Icon } from './Icon.jsx'
import { Num, Time } from './Num.jsx'
import { Tag } from './Tag.jsx'
import { zoomName } from '../app/zoom.js'
import { UnderlayContext } from '../app/underlay.js'

/** Section heading (Title S) with an optional 44 px trailing link. */
export function SectionHeader({ title, id, action, level = 2 }) {
  const H = `h${level}`
  return (
    <div className="section-head">
      <H id={id} className="t-title-s">{title}</H>
      {action}
    </div>
  )
}

/**
 * A grouped list: optional Title S header, then rows on the page with inset dividers.
 * Groups sit 24 px apart. Pass action for a header link ("See all").
 */
export function Group({ title, action, children, label, className, as = 'ul' }) {
  const id = useId()
  const L = as
  return (
    <section className={className ? `group ${className}` : 'group'} aria-labelledby={title ? id : undefined} aria-label={title ? undefined : label}>
      {title && <SectionHeader title={title} id={id} action={action} />}
      <L className="list" role="list">{children}</L>
    </section>
  )
}

/** Time column: "11.00" in Time L (or Time M with size="m"), optional end time and tag under it. */
export function TimeLead({ time, end, tag, size = 'l' }) {
  return (
    <span className={`lead-time lead-time--${size}`}>
      <Time value={time} className={size === 'l' ? 't-time-l' : undefined} />
      {end && <Time value={end} className="lead-time-end" />}
      {tag && <Tag>{tag}</Tag>}
    </span>
  )
}

/** Date column: "24" in Time L wide figures, the weekday or month under it in ink-soft. */
export function DateLead({ day, label }) {
  return (
    <span className="lead-date">
      <Num wide className="t-time-l">{day}</Num>
      <span className="lead-date-label">{label}</span>
    </span>
  )
}

// Divider inset = lead width + the 12 px column gap, so dividers start at the text.
const INSETS = { time: 'calc(var(--time-col) + 0.75rem)', date: 'calc(2.75rem + 0.75rem)', avatar: '3.5rem', icon: 'calc(var(--tile) + 0.75rem)', diamond: '2.25rem', none: '0px' }

/**
 * One row on the page. Never a card.
 * to (in-app path) or onClick makes the row one link or button. trailing sits outside that target when
 * trailingAction is true (for a nested 44 px button such as Join); otherwise it is part of the row.
 * leadKind ('time' | 'date' | 'avatar' | 'icon' | 'diamond' | 'none') sets the divider inset.
 * chevron: only on rows that push a screen. tone: 'unread' makes the title bold.
 * zoom: the row grows into the screen it opens (iOS zoom transition).
 */
export function Row({
  to, onClick, lead, leadKind = lead ? 'time' : 'none', title, titleExtra, meta, meta2, trailing, trailingAction = false,
  chevron = false, className, titleAs: TitleTag = 'span', clamp = false, 'aria-label': ariaLabel, opener, zoom = false, ...rest
}) {
  const under = useContext(UnderlayContext)
  const interactive = Boolean(to || onClick)
  const body = (
    <>
      {lead && <span className="row-lead">{lead}</span>}
      <span className="row-body">
        <TitleTag className="row-title">{title}{titleExtra}</TitleTag>
        {meta && <span className={clamp ? 'row-meta clamp-2' : 'row-meta'}>{meta}</span>}
        {meta2 && <span className="row-meta">{meta2}</span>}
      </span>
      {!trailingAction && (trailing || chevron) && (
        <span className="row-trail">{trailing}{chevron && <Icon name="chevron-right" size={20} className="row-chevron" />}</span>
      )}
    </>
  )
  const cls = [
    'row', !lead && 'row--no-lead', !(trailing || chevron) && 'row--no-trail', interactive && 'row--link', zoom && to && 'row--zoom', className,
  ].filter(Boolean).join(' ')
  const span = trailingAction ? 'row-hit row-hit--partial' : 'row-hit'
  const row = (
    <li className={cls} style={{ '--row-inset': INSETS[leadKind] ?? leadKind }} {...rest}>
      {to ? (
        <Link to={to} className={span} aria-label={ariaLabel} data-opener={opener} zoom={zoom}>{body}</Link>
      ) : onClick ? (
        <button type="button" className={span} onClick={onClick} aria-label={ariaLabel} data-opener={opener}>{body}</button>
      ) : (
        <span className={span}>{body}</span>
      )}
      {trailingAction && trailing && <span className="row-trail row-trail--action">{trailing}</span>}
    </li>
  )
  // A zooming row and the screen it opens share a name, so React morphs one into the other (not under an edge swipe,
  // where the screen it opened is still mounted on top and the name would be taken twice)
  return zoom && to && !under ? <ViewTransition name={zoomName(to)} share="zoom" default="none">{row}</ViewTransition> : row
}
