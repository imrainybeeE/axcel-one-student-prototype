// Loading, empty and error states. Skeletons use real row heights and column widths so nothing shifts.
import { useEffect, useState } from 'react'
import { Button } from './Button.jsx'
import { Notice } from './Notice.jsx'
import { Dia } from './Dia.jsx'

/** One grey block. w and h are CSS lengths. */
export function Skeleton({ w = '100%', h = '1rem', radius = 4, className }) {
  return <span className={className ? `skel ${className}` : 'skel'} style={{ width: w, height: h, borderRadius: radius }} aria-hidden="true" />
}

/**
 * Skeleton rows at the real row size. lead: 'time' | 'date' | 'avatar' | 'none'. lines: 1 or 2 meta lines.
 * Widths vary row to row so it reads as content, not stripes.
 */
export function SkeletonRows({ count = 3, lead = 'time', lines = 1 }) {
  const widths = ['62%', '48%', '70%', '55%', '66%', '44%']
  return (
    <ul className="list skel-rows" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`row skel-row${lead === 'none' ? ' row--no-lead' : ''} row--no-trail`} style={{ '--row-inset': lead === 'avatar' ? '3.5rem' : lead === 'none' ? '0px' : 'calc(var(--time-col) + 0.75rem)' }}>
          <span className="row-hit">
            {lead !== 'none' && (
              <span className="row-lead">
                {lead === 'avatar' ? <Skeleton w="44px" h="44px" radius="50%" /> : <span className={lead === 'date' ? 'lead-date' : 'lead-time'}><Skeleton w="3rem" h="1.375rem" /></span>}
              </span>
            )}
            <span className="row-body">
              <span className="skel-line"><Skeleton w={widths[i % widths.length]} h="1.125rem" /></span>
              {Array.from({ length: lines }, (_, j) => <span key={j} className="skel-line"><Skeleton w={widths[(i + j + 2) % widths.length]} h="1rem" /></span>)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Loading: the skeleton you pass as children plus a status line ("Getting today's lessons").
 * delay: show nothing before it (1000 for real waits; 0 when forced by ?state=loading).
 * After 10 s it adds a sentence and Try again (onRetry).
 */
export function LoadingState({ label, children, delay = 0, onRetry }) {
  const [shown, setShown] = useState(delay === 0)
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const a = delay ? setTimeout(() => setShown(true), delay) : null
    const b = setTimeout(() => setSlow(true), 10000)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [delay])
  return (
    <div className="loading-state">
      {shown && children}
      <p className="status-line" role="status">{shown ? label : ''}</p>
      {slow && onRetry && (
        <Notice tone="warn" action={<Button size="compact" onClick={onRetry}>Try again</Button>}>
          This is taking longer than usual. Check that you are online.
        </Notice>
      )}
    </div>
  )
}

/**
 * Empty: Dia, one sentence of what will appear here, then one next step (a Button or TextLink).
 * mood: Dia's pose ('calm' by default; 'offline' for nothing-saved-yet; null hides Dia).
 */
export function EmptyState({ title, children, action, mood = 'calm' }) {
  return (
    <div className="empty-state rise-in">
      {mood && <Dia mood={mood} size={88} />}
      {title && <p className="t-title-s">{title}</p>}
      <p className="empty-text">{children}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}

/**
 * Error notice with Try again. Keep the header, tabs and any rows already loaded around it.
 * children: what failed and what to check ("Your messages did not load. Check that you are online, then try again.")
 */
export function ErrorState({ children, onRetry, retrying = false }) {
  return (
    <Notice
      tone="error"
      action={onRetry && <Button size="compact" onClick={onRetry} loading={retrying} loadingLabel="Trying again">Try again</Button>}
    >
      {children}
    </Notice>
  )
}
