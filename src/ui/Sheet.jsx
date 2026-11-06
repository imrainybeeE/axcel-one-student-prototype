// Sheets and dialogs on native <dialog> (showModal: the page goes inert, Escape is a close request).
// Phone: bottom sheet with a grabber, medium (50dvh) and large detents, drag only on the grabber strip.
// 768 px and up: a centred 560 px dialog. One sheet at a time. A dirty form asks before it is thrown away.
import { useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { Icon } from './Icon.jsx'
import { rubber, project, springFrom } from './physics.js'
import { UnderlayContext } from '../app/underlay.js'
import './sheet.css'

const openSheets = new Set() // close functions of open top-level sheets

const wide = () => window.matchMedia('(min-width: 768px)').matches

/** Resolve after the element's running animations finish (never waits on transitionend), with a time cap. */
function settled(el, cap = 700) {
  if (!el) return Promise.resolve()
  void getComputedStyle(el).transform
  const anims = el.getAnimations ? el.getAnimations({ subtree: true }) : []
  return Promise.race([
    Promise.all(anims.map((a) => a.finished.catch(() => {}))),
    new Promise((r) => setTimeout(r, cap)),
  ])
}

/**
 * Shared open/close machinery. Returns { ref, panelRef, requestClose }.
 * onClose is called when the user asks to close (Close, Escape, backdrop, drag); the parent then sets open=false.
 */
function useModal({ open: wanted, onClose, nested = false, guard, onClosed }) {
  // A sheet never opens in the screen drawn under an edge swipe (its URL may still say it was open)
  const under = useContext(UnderlayContext)
  const open = wanted && !under
  const ref = useRef(null)
  const panelRef = useRef(null)
  const opener = useRef(null)
  const onCloseRef = useRef(onClose)
  const guardRef = useRef(guard)
  const onClosedRef = useRef(onClosed)
  useEffect(() => { onCloseRef.current = onClose; guardRef.current = guard; onClosedRef.current = onClosed })

  const requestClose = useCallback((force = false) => {
    if (!force && guardRef.current && guardRef.current()) return
    onCloseRef.current?.()
  }, [])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      if (!nested) for (const close of [...openSheets]) close()
      opener.current = document.activeElement
      // The page recedes around the part of it the student was looking at (card stack, ui.css)
      document.documentElement.style.setProperty('--stack-y', `${window.scrollY}px`)
      d.showModal()
      // First focus on the sheet's title (VoiceOver reads it first), not a ring round the close button
      d.querySelector('.sheet-title')?.focus({ preventScroll: true })
      d.dataset.state = 'enter'
      void d.offsetHeight
      requestAnimationFrame(() => { if (d.dataset.state === 'enter') d.dataset.state = 'open' })
    } else if (!open && d.open) {
      d.dataset.state = 'leave'
      settled(panelRef.current).then(() => {
        if (d.dataset.state !== 'leave') return
        d.close()
        d.dataset.state = 'closed'
        if (panelRef.current) panelRef.current.style.transition = '' // a flick's close timing, set by the drag
        d.style.removeProperty('--sheet-dim')
        onClosedRef.current?.()
        const o = opener.current
        if (o && o.isConnected) o.focus({ preventScroll: true })
      })
    }
  }, [open, nested])

  // Register so opening another sheet closes this one
  useEffect(() => {
    if (!open || nested) return
    const close = () => requestClose(true)
    openSheets.add(close)
    return () => openSheets.delete(close)
  }, [open, nested, requestClose])

  // Escape: handle ourselves so the close animates and a dirty form is guarded
  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onCancel = (e) => { e.preventDefault(); requestClose() }
    // If the browser closes it anyway (repeated Escape), keep the parent in step
    const onNativeClose = () => { if (d.dataset.state !== 'leave' && d.dataset.state !== 'closed') { d.dataset.state = 'closed'; onCloseRef.current?.() } }
    d.addEventListener('cancel', onCancel)
    d.addEventListener('close', onNativeClose)
    return () => { d.removeEventListener('cancel', onCancel); d.removeEventListener('close', onNativeClose) }
  }, [requestClose])

  // Unmounting while open (route change): close cleanly
  useEffect(() => () => { const d = ref.current; if (d?.open) d.close() }, [])

  return { ref, panelRef, requestClose }
}

/**
 * Sheet.
 * title (required, the visible name), open, onClose.
 * detents: ['large'] (compose, report) | ['medium', 'large'] (resizable) | ['content'] (fits its content, caps at large).
 * closeLabel: 'Close' or 'Cancel', said by the round close button at the leading edge. trailing: the one prominent action (Done, Send) as a node.
 * dirty + discardLabel ("Discard message"): Escape, backdrop and drag ask first; Close does too.
 * footer: optional sticky node under the body. initialFocus: a ref to focus first (defaults to the first control).
 */
export function Sheet({
  open, onClose, title, children, detents = ['content'], closeLabel = 'Close', trailing, footer,
  dirty = false, discardLabel = 'Discard changes', keepLabel = 'Keep editing', className, nested = false, initialFocus,
}) {
  const titleId = useId()
  // While it slides away the sheet keeps what it last showed, even if the screen has already cleared it (a sheet
  // that empties at once collapses mid-slide). Stored as state from the last open render, React's pattern for it.
  const [kept, setKept] = useState({ children, title, trailing, footer })
  if (open && (kept.children !== children || kept.title !== title || kept.trailing !== trailing || kept.footer !== footer)) {
    setKept({ children, title, trailing, footer })
  }
  const view = open ? { children, title, trailing, footer } : kept
  const [askDiscard, setAskDiscard] = useState(false)
  const dirtyRef = useRef(dirty)
  useEffect(() => { dirtyRef.current = dirty })
  const guard = () => { if (dirtyRef.current) { setAskDiscard(true); return true } return false }
  const resizable = detents.length > 1
  const [detent, setDetent] = useState(detents[0])
  const [drag, setDrag] = useState(0)
  const dragging = useRef(null)
  // Back to the first detent once closed, ready for the next open
  const onClosed = () => { setDetent(detents[0]); setDrag(0) }
  const { ref, panelRef, requestClose } = useModal({ open, onClose, nested, guard, onClosed })

  useEffect(() => {
    if (open && initialFocus?.current) requestAnimationFrame(() => initialFocus.current?.focus())
  }, [open, initialFocus])

  /* Drag on the grabber and title strip only */
  const onPointerDown = (e) => {
    if (wide() || e.button !== 0 || e.target.closest('button:not(.sheet-grabber), a, input')) return
    const panel = panelRef.current
    e.currentTarget.setPointerCapture(e.pointerId)
    panel.style.willChange = 'transform'
    dragging.current = { y: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0, dy: 0, raf: 0, moved: false }
    panel.dataset.dragging = ''
  }
  const onPointerMove = (e) => {
    const g = dragging.current
    if (!g) return
    // Velocity in px/ms, smoothed so one jittery sample does not decide a flick
    const v = (e.clientY - g.lastY) / Math.max(1, e.timeStamp - g.lastT)
    g.v = 0.8 * v + 0.2 * g.v
    g.lastY = e.clientY
    g.lastT = e.timeStamp
    let dy = e.clientY - g.y
    if (Math.abs(dy) > 4) g.moved = true
    if (dy < 0) {
      // Up: a medium sheet grows freely to large; past that it rubber-bands, as UIKit does at an edge
      const free = resizable && detent === 'medium' ? medOffset() : 0
      const over = -dy - free
      if (over > 0) dy = -(free + rubber(over, panelRef.current.offsetHeight))
    }
    g.dy = dy
    // One frame at a time, always with the latest offset (never a stale one queued earlier); the dim lifts as the
    // sheet goes down, as UIKit's does
    if (!g.raf) {
      g.raf = requestAnimationFrame(() => {
        g.raf = 0
        if (dragging.current !== g) return
        setDrag(g.dy)
        const p = panelRef.current
        const visible = p ? (detent === 'medium' ? p.offsetHeight - medOffset() : p.offsetHeight) : 1
        p?.closest('dialog')?.style.setProperty('--sheet-dim', String(Math.min(1, Math.max(0, 1 - Math.max(g.dy, 0) / visible))))
      })
    }
  }
  const onPointerUp = (e) => {
    const g = dragging.current
    if (!g) return
    // A finger that rested before letting go has no flick left in it
    const v = e.timeStamp - g.lastT > 50 ? 0 : g.v
    dragging.current = null
    cancelAnimationFrame(g.raf)
    const panel = panelRef.current
    panel.style.willChange = ''
    delete panel.dataset.dragging
    const dy = g.dy ?? 0
    // Where the flick would land decides, not where the finger let go
    let projected = dy + project(v)
    const h = panel.getBoundingClientRect().height
    const visible = detent === 'medium' ? h - medOffset() : h
    if (!g.moved) { setDrag(0); panel.closest('dialog')?.style.removeProperty('--sheet-dim'); return }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // With unsaved text it asks first, and the sheet springs back to wait for the answer
    if (projected > visible * 0.5 && guard()) projected = 0
    if (projected > visible * 0.5) {
      // Carry on down at the finger's speed (the drag stays until onClosed), never back up first
      const left = Math.max(1, window.innerHeight - panel.getBoundingClientRect().top)
      const { easing, duration } = reduce ? { easing: 'linear', duration: 150 } : springFrom(0.32, 0, (Math.max(v, 0) * 1000) / left)
      panel.style.transition = `transform ${duration}ms ${easing}`
      requestClose()
      return
    }
    let next = detent
    if (resizable) {
      if (detent === 'large' && projected > visible * 0.2) next = 'medium'
      else if (detent === 'medium' && projected < -60) next = 'large'
    }
    // Back to the same detent the spring starts at the finger's speed; a quick flick settles on the snappy spring,
    // a slow release on the smooth one (a detent change uses the plain springs: its distance is not the drag's)
    const spring = Math.abs(v) > 0.3 ? [0.32, 0.15, 'snappy'] : [0.4, 0, 'smooth']
    let settle = `transform var(--dur-spring-${spring[2]}) var(--spring-${spring[2]})`
    let ms = 600
    if (next === detent && !reduce && Math.abs(dy) > 1) {
      const { easing, duration } = springFrom(spring[0], spring[1], (Math.max(dy > 0 ? -v : v, 0) * 1000) / Math.abs(dy))
      settle = `transform ${duration}ms ${easing}`
      ms = duration + 50
    }
    panel.style.transition = settle
    panel.closest('dialog')?.style.removeProperty('--sheet-dim') // the dim comes back with it
    setTimeout(() => { panel.style.transition = '' }, ms)
    if (next !== detent) setDetent(next)
    setDrag(0)
  }
  const medOffset = () => {
    const p = panelRef.current
    if (!p) return 0
    return Math.max(0, p.getBoundingClientRect().height - window.innerHeight * 0.5)
  }

  const onBackdrop = (e) => { if (e.target === e.currentTarget) requestClose() }

  return (
    <dialog
      ref={ref}
      className={`sheet sheet--${detents.includes('large') && !detents.includes('medium') ? 'large' : detents[0]}${className ? ` ${className}` : ''}`}
      data-detent={detent}
      aria-labelledby={titleId}
      onClick={onBackdrop}
    >
      <div ref={panelRef} className="sheet-panel" style={{ '--drag': `${drag}px` }}>
        <div className="sheet-strip" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          {resizable ? (
            <button
              type="button"
              className="sheet-grabber"
              aria-label={detent === 'large' ? 'Make the sheet smaller' : 'Make the sheet full height'}
              onClick={() => setDetent(detent === 'large' ? 'medium' : 'large')}
            ><span /></button>
          ) : (
            <span className="sheet-grabber sheet-grabber--static" aria-hidden="true"><span /></span>
          )}
          <div className="sheet-head">
            <div className="sheet-head-lead">
              {/* iOS 26: a round glass close button with a dark cross; it still says Close or Cancel to a screen reader */}
              <button type="button" className="sheet-close" aria-label={closeLabel} onClick={() => requestClose()}><Icon name="close" size={15} /></button>
            </div>
            <h2 id={titleId} className="sheet-title t-title-s" tabIndex={-1}>{view.title}</h2>
            <div className="sheet-head-trail">{view.trailing}</div>
          </div>
        </div>
        <div className="sheet-body">{view.children}</div>
        {view.footer && <div className="sheet-footer">{view.footer}</div>}
      </div>
      {askDiscard && (
        <ActionSheet
          open={askDiscard}
          nested
          onClose={() => setAskDiscard(false)}
          title="Discard what you typed?"
          actions={[{ label: discardLabel, destructive: true, onSelect: () => { setAskDiscard(false); requestClose(true) } }]}
          cancelLabel={keepLabel}
        />
      )}
    </dialog>
  )
}

/**
 * Action sheet: a short title (and optional one-sentence message), choices named by their result,
 * destructive choices first in red, Cancel last. No scrolling.
 * actions: [{ label, onSelect, destructive? }]
 */
export function ActionSheet({ open, onClose, title, message, actions, cancelLabel = 'Cancel', nested = false }) {
  const titleId = useId()
  const msgId = useId()
  const { ref, panelRef, requestClose } = useModal({ open, onClose, nested })
  const cancelRef = useRef(null)
  useEffect(() => { if (open) requestAnimationFrame(() => cancelRef.current?.focus()) }, [open])
  const sorted = [...actions].sort((a, b) => Number(Boolean(b.destructive)) - Number(Boolean(a.destructive)))
  return (
    <dialog ref={ref} className="sheet sheet--action" aria-labelledby={titleId} aria-describedby={message ? msgId : undefined} onClick={(e) => { if (e.target === e.currentTarget) requestClose() }}>
      <div ref={panelRef} className="sheet-panel">
        <div className="action-sheet">
          <div className="action-sheet-group glass">
            <div className="action-sheet-head">
              <h2 id={titleId} className="t-title-s">{title}</h2>
              {message && <p id={msgId} className="action-sheet-msg">{message}</p>}
            </div>
            <ul className="action-sheet-list" role="list">
              {sorted.map((a) => (
                <li key={a.label}>
                  <button type="button" className={`action-sheet-btn${a.destructive ? ' is-destructive' : ''}`} onClick={() => { a.onSelect?.() }}>
                    {a.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button ref={cancelRef} type="button" className="action-sheet-btn action-sheet-cancel glass" onClick={() => requestClose(true)}>{cancelLabel}</button>
        </div>
      </div>
    </dialog>
  )
}

/**
 * Confirm an irreversible action: "Block Lee Jun Hao?" with one sentence of consequence,
 * [Block Lee Jun Hao] (destructive, never default focus) and [Keep chatting] (focused first).
 */
export function ConfirmSheet({ open, onClose, title, message, confirmLabel, cancelLabel = 'Cancel', onConfirm, destructive = true }) {
  return (
    <ActionSheet
      open={open}
      onClose={onClose}
      title={title}
      message={message}
      actions={[{ label: confirmLabel, destructive, onSelect: onConfirm }]}
      cancelLabel={cancelLabel}
    />
  )
}
