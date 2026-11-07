// Calendar: Upcoming (default) groups the next 60 days by week. Month is whole weeks: on a phone each event is a dot or,
// for a run of days, a line under the dates, with the chosen day listed below; on a laptop, titled bars as Calendar's month.
// One Show control replaces the old stack of filters. Category is a word on each row, never a colour.
// URL: ?view=month, ?day=YYYY-MM-DD (selected day in Month), ?event=<id> (event sheet).
import { useState } from 'react'
import { Screen, useDemo, useRoute, updateQuery, useLaptop, usePref, SAVED_AT } from '../../app'
import {
  Segmented, Group, Row, Num, Icon, IconButton, Button, Sheet, CheckRow,
  SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice,
  MiniBar, MiniTile, useOutOfView,
} from '../../ui'
import { events, categories } from '../../data/calendar.js'
import { addDays, dayOfWeek, daysBetween, formatLongDate, isoToMs } from '../../lib/time.js'
import { student } from '../../data/student.js'
import './calendar.css'

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Which Show group an event belongs to. */
function scopeOf(e) {
  if (e.audience === student.className || e.audience === `Year ${student.year}`) return 'class'
  return 'school'
}
const NO_SCHOOL = new Set(['holiday', 'public-holiday'])

function when(e) {
  if (e.allDay) {
    if (e.end && e.end !== e.start) return `Until ${formatLongDate(isoToMs(e.end))}`
    return NO_SCHOOL.has(e.category) ? 'No school' : 'All day'
  }
  return e.end && !e.end.includes('-') ? `${e.time} to ${e.end}` : e.time
}

/** The grey line, time first as Calendar: "10.50 to 11.35 · 8 Orion", or "Public holiday · No school".
    Each part is its own piece with the dot before it; a dot that would start a line is clipped away (see .meta-parts),
    so a wrap never leaves a dot dangling at either end. */
function metaParts(e) {
  if (NO_SCHOOL.has(e.category)) return [e.end && e.end !== e.start ? when(e) : categories[e.category]?.label, 'No school']
  return [when(e), ['class', 'event'].includes(e.category) ? null : categories[e.category]?.label, e.audience].filter(Boolean)
}
function meta(e) {
  const parts = metaParts(e)
  return <span className="meta-parts" aria-label={parts.join(', ')}><span>{parts.map((p) => <span key={p}>{p}</span>)}</span></span>
}

/** The capsule's line: "Tomorrow, Sat 14 Nov", "In 8 days, Fri 14 Nov", or for one under way, "Now, until Tue 10 Nov". */
function soon(e, today) {
  const date = (iso) => `${WD[dayOfWeek(iso)]} ${Number(iso.slice(8))} ${MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)}`
  if (e.start <= today) {
    const end = e.end && e.end.includes('-') ? e.end : null
    return end && end > today ? `Now, until ${date(end)}` : `Today, ${when(e).replace(/^[A-Z](?=[a-z])/, (c) => c.toLowerCase())}`
  }
  const n = daysBetween(today, e.start)
  return `${n === 1 ? 'Tomorrow' : `In ${n} days`}, ${date(e.start)}`
}

function weekLabel(iso, today) {
  const mon = (d) => addDays(d, 1 - (dayOfWeek(d) || 7))
  const diff = Math.round((isoToMs(mon(iso)) - isoToMs(mon(today))) / (7 * 86400000))
  if (diff === 0) return 'This week'
  if (diff === 1) return 'Next week'
  const m = mon(iso)
  return `Week of ${Number(m.slice(8))} ${MONTHS[Number(m.slice(5, 7)) - 1]}`
}

/** noDate: under the month grid, where the heading already names the day. */
function EventRow({ e, onOpen, today, noDate = false }) {
  const d = isoToMs(e.start)
  return (
    <Row
      onClick={() => onOpen(e)}
      className={`cal-row${e.start === today ? ' is-today' : ''}`}
      data-cat={e.category}
      lead={noDate ? null : <span className="lead-date"><Num wide className="t-time-l">{Number(e.start.slice(8))}</Num><span className="lead-date-label">{WD[new Date(d + 8 * 3600000).getUTCDay()]}</span></span>}
      leadKind={noDate ? 'none' : 'date'}
      title={e.title}
      meta={meta(e)}
    />
  )
}

function Upcoming({ list, today, onOpen }) {
  const groups = []
  for (const e of list) {
    const g = weekLabel(e.start < today ? today : e.start, today)
    const last = groups[groups.length - 1]
    if (last && last.g === g) last.items.push(e)
    else groups.push({ g, items: [e] })
  }
  return groups.map((g) => (
    <Group key={g.g} title={g.g} className="cal-week">
      {g.items.map((e) => <EventRow key={e.id} e={e} onOpen={onOpen} today={today} />)}
    </Group>
  ))
}

/** The last day an event covers. */
const lastDay = (e) => (e.end && e.end.includes('-') ? e.end : e.start)

/** One week's events as bars: each takes the first free lane, longer events first, so a holiday keeps one line across the week. */
function weekBars(list, days) {
  const w0 = days[0], w6 = days[6]
  const bars = list
    .filter((e) => e.start <= w6 && lastDay(e) >= w0)
    .map((e) => {
      const s = e.start < w0 ? w0 : e.start, t = lastDay(e) > w6 ? w6 : lastDay(e)
      return { e, col: days.indexOf(s), span: days.indexOf(t) - days.indexOf(s) + 1, head: e.start >= w0, tail: lastDay(e) <= w6 }
    })
    .sort((a, b) => a.col - b.col || b.span - a.span)
  const lanes = []
  for (const bar of bars) {
    let l = lanes.findIndex((end) => end < bar.col)
    if (l < 0) { l = lanes.length; lanes.push(-1) }
    lanes[l] = bar.col + bar.span - 1
    bar.lane = l
  }
  return bars
}

function Month({ list, today, selected, month, laptop, onSelect, onMonth, onOpen }) {
  const [y, m] = month.split('-').map(Number)
  const first = `${month}-01`
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate()
  // whole weeks, Monday to Sunday: the days either side of the month fill the first and last rows, quietly
  const start = addDays(first, -((dayOfWeek(first) + 6) % 7))
  const last = `${month}-${String(daysIn).padStart(2, '0')}`
  const weeks = []
  for (let d = start; d <= last; d = addDays(d, 7)) weeks.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)))
  const on = (iso) => list.filter((e) => e.start <= iso && iso <= lastDay(e))
  const selEvents = on(selected)
  const move = (delta) => {
    const dt = new Date(Date.UTC(y, m - 1 + delta, 1))
    const targetMonth = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`
    const lastOf = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate()
    onMonth(`${targetMonth}-${String(Math.min(Number(selected.slice(8)), lastOf)).padStart(2, '0')}`)
  }
  const key = (e, iso) => {
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (!steps) return
    e.preventDefault()
    const next = addDays(iso, steps)
    onSelect(next)
    requestAnimationFrame(() => document.querySelector(`[data-iso="${next}"]`)?.focus())
  }
  const title = <h2 className={laptop ? 't-title-m cal-title' : 't-title-s'} aria-live="polite">{MONTHS[m - 1]} <Num className="cal-year">{y}</Num></h2>
  return (
    <div className="cal-month">
      {laptop ? (
        <div className="cal-month-bar">
          {title}
          <div className="cal-nav">
            <IconButton icon="chevron-left" label="Previous month" onClick={() => move(-1)} />
            <Button variant="secondary" size="compact" onClick={() => onMonth(today)}>Today</Button>
            <IconButton icon="chevron-right" label="Next month" onClick={() => move(1)} />
          </div>
        </div>
      ) : (
        <div className="cal-month-bar">
          <IconButton icon="chevron-left" label="Previous month" onClick={() => move(-1)} />
          {title}
          <IconButton icon="chevron-right" label="Next month" onClick={() => move(1)} />
        </div>
      )}
      <div className="cal-grid" role="grid" aria-label={`${MONTHS[m - 1]} ${y}`}>
        <div role="row" className="cal-grid-head">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d} role="columnheader">{d}</span>)}
        </div>
        {weeks.map((days) => {
          const bars = weekBars(list, days)
          return (
            <div role="row" key={days[0]} className="cal-grid-row" style={{ '--lanes': Math.max(1, ...bars.map((b) => b.lane + 1)) }}>
              {days.map((iso, i) => {
                const evs = on(iso)
                const out = iso.slice(0, 7) !== month
                const off = evs.some((e) => NO_SCHOOL.has(e.category)) || [0, 6].includes(dayOfWeek(iso))
                const isToday = iso === today
                const isSel = iso === selected
                const n = Number(iso.slice(8))
                return (
                  <span key={iso} role="gridcell" aria-selected={isSel} className="cal-slot" style={{ gridColumn: i + 1 }}>
                    <button
                      type="button"
                      data-iso={iso}
                      tabIndex={isSel ? 0 : -1}
                      className={`cal-cell${isToday ? ' is-today' : ''}${isSel ? ' is-selected' : ''}${off ? ' is-off' : ''}${out ? ' is-out' : ''}${[0, 6].includes(dayOfWeek(iso)) ? ' is-weekend' : ''}`}
                      aria-label={`${formatLongDate(isoToMs(iso))}${isToday ? ', today' : ''}, ${evs.length ? `${evs.length} event${evs.length > 1 ? 's' : ''}` : 'no events'}`}
                      onClick={() => onSelect(iso)}
                      onKeyDown={(e) => key(e, iso)}
                    >
                      <Num>{laptop && n === 1 ? `${n} ${MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)}` : n}</Num>
                    </button>
                  </span>
                )
              })}
              {bars.map((b) => {
                const cls = `cal-bar cal-row${b.head ? ' is-head' : ''}${b.tail ? ' is-tail' : ''}${b.span === 1 && b.head && b.tail ? ' is-one' : ''}`
                const style = { gridColumn: `${b.col + 1} / span ${b.span}`, gridRow: b.lane + 2 }
                return laptop ? (
                  <button key={b.e.id} type="button" className={cls} data-cat={b.e.category} style={style} onClick={() => onOpen(b.e)} aria-label={`${b.e.title}, ${when(b.e)}`}>
                    <span>{b.e.title}</span>
                  </button>
                ) : <i key={b.e.id} className={cls} data-cat={b.e.category} style={style} aria-hidden="true" />
              })}
            </div>
          )
        })}
      </div>
      {!laptop && (
        <Group title={formatLongDate(isoToMs(selected))} className="cal-day">
          {selEvents.length ? selEvents.map((e) => <EventRow key={e.id} e={e} onOpen={onOpen} noDate />) : <li className="cal-none">Nothing on this day.</li>}
        </Group>
      )}
    </div>
  )
}

function EventSheet({ e, onClose, today }) {
  const [reminded, setReminded] = useState({})
  if (!e) return <Sheet open={false} onClose={onClose} title="Event" />
  const on = reminded[e.id]
  return (
    <Sheet open onClose={onClose} title={categories[e.category]?.label || 'Event'}>
      <div className="cal-sheet">
        <h3 className="t-title-m">{e.title}</h3>
        <ul className="list" role="list">
          <Row lead={<Icon name="calendar" />} leadKind="icon" title={formatLongDate(isoToMs(e.start))} meta={when(e)} />
          {e.place && <Row lead={<Icon name="pin" />} leadKind="icon" title={e.place} meta="Where" />}
          <Row lead={<Icon name="group" />} leadKind="icon" title={`For ${e.audience.charAt(0).toLowerCase()}${e.audience.slice(1)}`} />
        </ul>
        {e.note && <p className="t-soft">{e.note}</p>}
        {!NO_SCHOOL.has(e.category) && e.start > today && (
          <>
            <Button
              variant={on ? 'secondary' : 'primary'}
              full
              icon={on ? 'check' : 'bell'}
              onClick={() => setReminded((r) => ({ ...r, [e.id]: !on }))}
            >
              {on ? 'Reminder on' : 'Remind me'}
            </Button>
            <p className="t-soft t-footnote">Demo only: no notification will be sent.</p>
          </>
        )}
      </div>
    </Sheet>
  )
}

export default function Calendar() {
  const { query } = useRoute()
  const { state, offline, today, retry, retrying, reconnect, reconnecting } = useDemo()
  const laptop = useLaptop()
  const [show, setShow] = usePref('calendarShow', { school: true, class: true })
  const [showOpen, setShowOpen] = useState(false)
  const view = query.get('view') === 'month' ? 'month' : 'upcoming'
  const selected = query.get('day') || today
  const [month, setMonth] = useState(selected.slice(0, 7))
  const openId = query.get('event')
  const open = events.find((e) => e.id === openId) || null
  const setOpen = (e) => updateQuery({ event: e ? e.id : null })

  const visible = events.filter((e) => show[scopeOf(e)]).sort((a, b) => a.start.localeCompare(b.start) || (a.time || '').localeCompare(b.time || ''))
  const upcoming = visible.filter((e) => (e.end && e.end.includes('-') ? e.end : e.start) >= today && e.start <= addDays(today, 60))
  const hidden = Object.values(show).filter((v) => !v).length

  let body
  if (state === 'loading') {
    body = <LoadingState label="Getting events" onRetry={retry}><SkeletonRows count={5} lead="date" /></LoadingState>
  } else if (view === 'upcoming' && (state === 'empty' || !upcoming.length)) {
    body = (
      <EmptyState
        title="Nothing coming up in the next 60 days."
        action={hidden
          ? <Button variant="secondary" onClick={() => setShow({ school: true, class: true })}>Show everything</Button>
          : <Button variant="secondary" onClick={() => updateQuery({ view: 'month' })}>See the month</Button>}
      >
        {hidden ? 'Some events are hidden by Show.' : 'School events and holidays will show here. The month view shows every day.'}
      </EmptyState>
    )
  } else if (view === 'month') {
    body = (
      <Month
        list={state === 'empty' ? [] : visible}
        today={today}
        selected={selected}
        month={month}
        laptop={laptop}
        onMonth={(iso) => { updateQuery({ day: iso === today ? null : iso }); setMonth(iso.slice(0, 7)) }}
        onSelect={(iso) => { updateQuery({ day: iso === today ? null : iso }); setMonth(iso.slice(0, 7)) }}
        onOpen={setOpen}
      />
    )
  } else {
    body = <Upcoming list={upcoming} today={today} onOpen={setOpen} />
  }

  // The capsule: the next event, once the first one (or the month grid) has scrolled away
  const next = state === 'loading' || state === 'empty' ? null : upcoming[0]
  const miniShown = useOutOfView(
    () => document.querySelector(view === 'month' ? '.screen--cal .cal-grid' : '.screen--cal .cal-week .cal-row'),
    { enabled: Boolean(next), key: view },
  )

  return (
    <Screen
      title="Calendar"
      className="screen--cal"
      action={
        <Button variant="plain" size="compact" icon="filter" onClick={() => setShowOpen(true)} aria-haspopup="dialog" aria-label={hidden ? 'Show, some events hidden' : 'Show'}>
          Show{hidden ? <span className="cal-hidden-dot" aria-hidden="true" /> : null}
        </Button>
      }
    >
      <div className={`stack cal-stack${laptop && view === 'month' ? ' cal-laptop' : ''}`}>
        <Segmented
          legend="View"
          value={view}
          onChange={(v) => updateQuery({ view: v === 'month' ? 'month' : null })}
          options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'month', label: 'Month' }]}
        />
        {offline && <OfflineNotice what="events" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && <ErrorState onRetry={retry} retrying={retrying}>New events did not load. Check that you are online, then try again. Events saved at <Num>{SAVED_AT}</Num> are below.</ErrorState>}
        {body}
      </div>
      {next && (
        <MiniBar
          shown={miniShown}
          onOpen={() => setOpen(next)}
          haspopup="dialog"
          label={`Next: ${next.title}, ${soon(next, today)}`}
          tile={<MiniTile kind="date" weekday={WD[dayOfWeek(next.start > today ? next.start : today)]} value={Number((next.start > today ? next.start : today).slice(8))} />}
          title={next.title}
          sub={soon(next, today)}
        />
      )}
      <EventSheet e={open} onClose={() => setOpen(null)} today={today} />
      <Sheet open={showOpen} onClose={() => setShowOpen(false)} title="Show" trailing={<Button variant="plain" size="compact" onClick={() => setShowOpen(false)}>Done</Button>}>
        <div className="cal-sheet">
          <ul className="list" role="list">
            <CheckRow label="School events and holidays" meta={`${events.filter((e) => scopeOf(e) === 'school').length} events`} checked={show.school} onChange={(v) => setShow({ ...show, school: v })} />
            <CheckRow label={`${student.className} and Year ${student.year}`} meta={`${events.filter((e) => scopeOf(e) === 'class').length} events`} checked={show.class} onChange={(v) => setShow({ ...show, class: v })} />
          </ul>
          <p className="t-soft">Saved on this phone.</p>
        </div>
      </Sheet>
    </Screen>
  )
}
