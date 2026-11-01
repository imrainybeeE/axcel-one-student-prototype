import { useLayoutEffect, useRef } from 'react'
import { Icon } from './Icon.jsx'
import { Link } from '../app/Link.jsx'

/** 18 px spinner. Static under reduced motion; the changed verb always shows beside it. */
export function Spinner({ className }) {
  return <span className={className ? `spinner ${className}` : 'spinner'} aria-hidden="true" />
}

/**
 * Button.
 * variant: 'primary' (filled, one per section) | 'secondary' | 'destructive' (never filled) | 'on-now' (inside the now block) | 'plain' (text only)
 * size: 'regular' (48) | 'compact' (44, used alone)
 * loading: true shows a spinner and loadingLabel ("Joining"), width locked, aria-busy.
 * unavailable: a reason string ("Opens at 10.55"). The button stays focusable with aria-disabled and shows the reason as its label
 *   (or beside it with reasonBeside). Clicks do nothing.
 * to: renders an in-app link styled as a button. icon: leading icon name. full: full width.
 */
export function Button({
  variant = 'secondary', size = 'regular', loading = false, loadingLabel, unavailable, reasonBeside = false,
  icon, full = false, to, type = 'button', onClick, children, className, 'aria-label': ariaLabel, ...rest
}) {
  // Width lock: remember the width while idle, apply it while loading so the verb change never jumps.
  const ref = useRef(null)
  const idleWidth = useRef(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (loading) { if (!full && idleWidth.current) el.style.minWidth = `${idleWidth.current}px` }
    else { el.style.minWidth = ''; idleWidth.current = el.offsetWidth }
  })

  const disabled = Boolean(unavailable)
  const cls = [
    'btn', `btn--${variant}`, size === 'compact' && 'btn--compact', full && 'btn--full',
    disabled && 'is-unavailable', loading && 'is-loading', className,
  ].filter(Boolean).join(' ')
  const showReasonAsLabel = disabled && !reasonBeside
  const content = loading ? (
    <><Spinner /><span>{loadingLabel || children}</span></>
  ) : showReasonAsLabel ? (
    <span>{unavailable}</span>
  ) : (
    <>{icon && <Icon name={icon} size={20} />}<span>{children}</span></>
  )
  const handle = (e) => {
    if (disabled || loading) { e.preventDefault(); return }
    onClick?.(e)
  }
  const a11yLabel = disabled && ariaLabel ? `${ariaLabel}. ${unavailable}` : ariaLabel

  if (to && !disabled) {
    return <Link to={to} className={cls} onClick={handle} aria-label={a11yLabel} {...rest}>{content}</Link>
  }
  const btn = (
    <button
      ref={ref}
      type={type}
      className={cls}
      onClick={handle}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      aria-label={a11yLabel}
      {...rest}
    >
      {content}
    </button>
  )
  if (disabled && reasonBeside) {
    return <span className="btn-with-reason">{btn}<span className="btn-reason">{unavailable}</span></span>
  }
  return btn
}

/** 44 x 44 icon-only button around a 24 px glyph. label is required (it is the accessible name). */
export function IconButton({ icon, label, onClick, className, size = 24, pressed, to, ...rest }) {
  const cls = className ? `icon-btn ${className}` : 'icon-btn'
  if (to) return <Link to={to} className={cls} aria-label={label} {...rest}><Icon name={icon} size={size} /></Link>
  return (
    <button type="button" className={cls} aria-label={label} aria-pressed={pressed} onClick={onClick} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  )
}

/** A 44 px tall text link for section headers and next steps ("See all", "Calendar"). to = in-app path. */
export function TextLink({ to, href, children, className, ...rest }) {
  const cls = className ? `text-link ${className}` : 'text-link'
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  return <a href={href} className={cls} {...rest}>{children}</a>
}
