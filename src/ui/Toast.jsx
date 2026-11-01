// One toast at a time, above the tab bar, as a glass capsule. 10 s, paused on hover, focus and touch, with a close button.
// It lives in the top layer (popover) and is re-raised on every show. While a sheet is open the toast renders inside that
// sheet's <dialog>, because a modal dialog makes everything outside it inert: Undo must stay tappable over a sheet.
// Undo shows "Restored" for a moment before the toast leaves, so the student sees the take-back worked.
// Swipe down to dismiss. Settings can keep toasts on screen until closed (pref "keepToasts").
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon.jsx'
import { usePref } from '../app/store.js'
import { ToastContext } from './toastContext.js'
import { rubber, project } from './physics.js'

const DURATION = 10000
const LEAVE_MS = 280
const DONE_MS = 1200

const portal = (host, node) => (host ? createPortal(node, host) : node)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null) // { id, message, actionLabel, onAction, doneLabel, icon }
  const [leaving, setLeaving] = useState(false)
  const [done, setDone] = useState(false)
  const [host, setHost] = useState(null) // the open <dialog> the toast lives in, or null for the page
  const [keep] = usePref('keepToasts', false)
  const remaining = useRef(DURATION)
  const started = useRef(0)
  const timer = useRef()
  const leaveTimer = useRef()
  const paused = useRef(0)
  const el = useRef(null)
  const region = useRef(null)
  const drag = useRef(null)

  const remove = useCallback(() => {
    clearTimeout(timer.current)
    clearTimeout(leaveTimer.current)
    setLeaving(true)
    leaveTimer.current = setTimeout(() => { setToast(null); setLeaving(false); setDone(false) }, LEAVE_MS)
  }, [])
  const dismiss = remove

  const run = useCallback(() => {
    clearTimeout(timer.current)
    if (keep || paused.current > 0) return
    started.current = Date.now()
    timer.current = setTimeout(remove, remaining.current)
  }, [keep, remove])
  const setPaused = (on) => { if (el.current) { if (on) el.current.dataset.paused = ''; else delete el.current.dataset.paused } }
  const pause = useCallback(() => {
    paused.current += 1
    if (paused.current === 1) { clearTimeout(timer.current); remaining.current -= Date.now() - started.current; setPaused(true) }
  }, [])
  const resume = useCallback(() => {
    paused.current = Math.max(0, paused.current - 1)
    if (paused.current === 0) { setPaused(false); run() }
  }, [run])

  const show = useCallback((t) => {
    clearTimeout(leaveTimer.current)
    remaining.current = t.duration || DURATION
    paused.current = 0
    setLeaving(false)
    setDone(false)
    setHost([...document.querySelectorAll('dialog[open]')].pop() || null)
    setToast({ id: Date.now(), ...t })
  }, [])

  // When the sheet it lives in closes, the toast moves back to the page and keeps its time
  useEffect(() => {
    if (!host) return
    const back = () => setHost(null)
    host.addEventListener('close', back)
    return () => host.removeEventListener('close', back)
  }, [host])

  useEffect(() => { if (toast && !done) run(); return () => clearTimeout(timer.current) }, [toast, done, run])

  // Top layer: the (empty, click-through) region stays open as a popover so the live region always exists;
  // each new toast re-raises it above any dialog opened since, in the same task so nothing visibly blinks.
  useEffect(() => {
    const r = region.current
    if (!r || !r.showPopover) return
    try {
      if (r.matches(':popover-open')) r.hidePopover()
      r.showPopover()
    } catch { /* not supported: it stays a fixed element */ }
  }, [toast?.id, host])

  // Keep focus visible above the toast: publish its height as --overlay-h for scroll-padding.
  useEffect(() => {
    const root = document.documentElement
    if (!toast || !el.current) { root.style.setProperty('--overlay-h', '0px'); return }
    const ro = new ResizeObserver(([e]) => root.style.setProperty('--overlay-h', `${Math.ceil(e.contentRect.height) + 8}px`))
    ro.observe(el.current)
    return () => { ro.disconnect(); root.style.setProperty('--overlay-h', '0px') }
  }, [toast])

  const onAction = () => {
    toast.onAction?.()
    if (toast.doneLabel === null) { remove(); return }
    clearTimeout(timer.current)
    setDone(true)
    timer.current = setTimeout(remove, DONE_MS)
  }

  /* Swipe down to dismiss: follows the finger, leaves past 40 px or a quick flick */
  const onPointerDown = (e) => {
    if (e.target.closest('button')) return
    drag.current = { y: e.clientY, lastY: e.clientY, t: e.timeStamp, v: 0 }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.currentTarget.dataset.dragging = ''
    pause()
  }
  const onPointerMove = (e) => {
    const g = drag.current
    if (!g) return
    g.v = (e.clientY - g.lastY) / Math.max(1, e.timeStamp - g.t)
    g.lastY = e.clientY
    g.t = e.timeStamp
    const dy = e.clientY - g.y
    // Down follows the finger; up rubber-bands, as UIKit does at an edge
    e.currentTarget.style.transform = `translateY(${dy > 0 ? dy : -rubber(-dy, e.currentTarget.offsetHeight)}px)`
  }
  const onPointerUp = (e) => {
    const g = drag.current
    if (!g) return
    drag.current = null
    const node = e.currentTarget
    delete node.dataset.dragging
    const dy = e.clientY - g.y
    if (dy + project(g.v) > 60) {
      node.style.setProperty('--toast-dy', `${Math.max(0, dy)}px`)
      node.style.transform = ''
      remove()
      return
    }
    node.animate([{ transform: node.style.transform || 'none' }, { transform: 'none' }], { duration: 370, easing: getComputedStyle(node).getPropertyValue('--spring-snappy') || 'ease-out' })
    node.style.transform = ''
    resume()
  }

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portal(host,
      <div ref={region} className="toast-region" popover="manual" role="status" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            ref={el}
            className="toast glass"
            data-liquid=""
            data-liquid-frost="4"
            data-leaving={leaving || undefined}
            style={{ '--toast-ms': `${toast.duration || DURATION}ms` }}
            onMouseEnter={pause}
            onMouseLeave={resume}
            onFocus={pause}
            onBlur={resume}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {toast.icon && <Icon name={toast.icon} size={22} className="toast-icon" />}
            <p className="toast-message">{toast.message}</p>
            {done ? (
              <span className="toast-done swap"><Icon name="check" size={18} />{toast.doneLabel || 'Restored'}</span>
            ) : toast.actionLabel ? (
              <button type="button" className="toast-action" onClick={onAction}>
                {toast.actionLabel}
              </button>
            ) : null}
            <button type="button" className="icon-btn toast-close" aria-label="Close message" onClick={dismiss}>
              <Icon name="close" size={20} />
            </button>
            {!keep && !done && <span className="toast-timer" aria-hidden="true" />}
          </div>
        )}
      </div>)}
    </ToastContext.Provider>
  )
}
