// Demo controls for critics: ?t=HH.MM and ?d=YYYY-MM-DD set the school clock (same meaning as
// src/data/clock.js), ?speed=60 runs that clock 60 times faster (watch a lesson change over live),
// ?state=loading|empty|error|offline forces a state on the current screen,
// ?theme=light|dark overrides appearance without storing it (see theme.js).
import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRoute, updateQuery } from './router.js'
import { schoolInstant, schoolParts } from '../lib/time.js'

const DEFAULT_DATE = '2026-10-21'
const DEFAULT_TIME = '10.40'
export const STATES = ['loading', 'empty', 'error', 'offline']

// The clock starts at the demo time and then runs in real time, so countdowns tick on the minute.
let clock = { key: null, base: 0, startedAt: 0, speed: 1 }
function clockFor(search) {
  const q = new URLSearchParams(search)
  const d = /^\d{4}-\d{2}-\d{2}$/.test(q.get('d') || '') ? q.get('d') : DEFAULT_DATE
  const t = /^\d{1,2}[.:]\d{2}$/.test(q.get('t') || '') ? q.get('t') : DEFAULT_TIME
  const speed = Math.min(600, Math.max(1, Number(q.get('speed')) || 1))
  const key = `${d}|${t}|${speed}`
  if (clock.key !== key) {
    const [h, m] = t.split(/[.:]/).map(Number)
    // ?t is a 24-hour wall time ("14.30"), as in clock.js
    clock = { key, base: schoolInstant(d, h * 60 + m), startedAt: Date.now(), speed }
  }
  return clock
}

/** The school clock now, in epoch ms. */
export function schoolNow(search = window.location.search) {
  const c = clockFor(search)
  return c.base + (Date.now() - c.startedAt) * c.speed
}

/** Re-renders on every school-clock minute, on returning to the page and on focus. Returns epoch ms. */
export function useSchoolNow() {
  const { loc } = useRoute()
  const [now, setNow] = useState(() => schoolNow(loc.search))
  useEffect(() => {
    let id
    const update = () => setNow(schoolNow(loc.search))
    const schedule = () => {
      const n = schoolNow(loc.search)
      const speed = clockFor(loc.search).speed
      id = setTimeout(() => { update(); schedule() }, (60000 - (n % 60000)) / speed + 15)
    }
    update()
    schedule()
    const onVisible = () => { if (!document.hidden) { clearTimeout(id); update(); schedule() } }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      clearTimeout(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [loc.search])
  return now
}

/* Network: real offline events plus ?state=offline */
const onlineStore = {
  subscribe(fn) {
    window.addEventListener('online', fn)
    window.addEventListener('offline', fn)
    return () => { window.removeEventListener('online', fn); window.removeEventListener('offline', fn) }
  },
  get: () => navigator.onLine,
}

/**
 * Everything a screen needs from the demo params, in one hook.
 * { state: 'loading'|'empty'|'error'|'offline'|null, offline, now, today (ISO), retry, retrying, reconnect, reconnecting }
 * reconnect(then): the offline notice's Try again. It ends ?state=offline (a real lost connection stays offline), then calls then.
 */
export function useDemo() {
  const { query } = useRoute()
  const online = useSyncExternalStore(onlineStore.subscribe, onlineStore.get, () => true)
  const now = useSchoolNow()
  const raw = query.get('state')
  const state = STATES.includes(raw) ? raw : null
  const [retrying, setRetrying] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const retry = () => {
    setRetrying(true)
    setTimeout(() => {
      setRetrying(false)
      if (state && state !== 'offline') updateQuery({ state: null })
    }, 900)
  }
  const reconnect = (then) => {
    setReconnecting(true)
    setTimeout(() => {
      setReconnecting(false)
      // The notice goes away with its button, so focus moves to the screen's title rather than falling to the page
      if (document.activeElement?.closest('.notice')) document.querySelector('#main h1')?.focus({ preventScroll: true })
      if (state === 'offline') updateQuery({ state: null })
      if (online && typeof then === 'function') then()
    }, 900)
  }
  return {
    state: retrying ? 'loading' : state,
    forcedState: state,
    offline: state === 'offline' || !online,
    now,
    today: schoolParts(now).iso,
    retry,
    retrying,
    reconnect,
    reconnecting,
  }
}

/** The saved time shown in offline and error states ("Saved 8.40", "Updated 8.40"). */
export const SAVED_AT = '8.40'
