// Timetable: a Mon-Fri strip over the day as a time grid (Google Calendar's day), and Week as five columns of it.
// URL: ?view=week, ?day=YYYY-MM-DD (plus the demo params ?t ?d ?state ?theme).
import { useRef, useState } from 'react'
import { Screen, useDemo, useRoute, updateQuery, useJoin, useTabRetap, SAVED_AT } from '../../app'
import {
  Tag, Time, Num, Icon, Button, Sheet, Row,
  SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice,
  LessonMini, lessonMiniActive, useOutOfView,
} from '../../ui'
import { getDay, nowModel, isJoinOpen, joinOpensAt, nextSchoolDay } from '../../lib/schedule.js'
import { addDays, dayOfWeek, formatLongDate, formatWeekday, isoToMs, schoolParts } from '../../lib/time.js'
import './timetable.css'

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Monday of the school week to show: this week on weekdays, next week at the weekend. */
function weekStart(iso) {
  const dow = dayOfWeek(iso)
  if (dow === 0) return addDays(iso, 1)
  if (dow === 6) return addDays(iso, 2)
  return addDays(iso, 1 - dow)
}

function joinWait(item, nowMs, offline) {
  if (!item.meet) return null
  if (offline) return 'Join needs the internet'
  return isJoinOpen(item, nowMs) ? null : `Join opens at ${joinOpensAt(item)}`
}

function place(item) {
  if (item.kind === 'event') return 'School activity'
  return item.online ? `${item.teacher}\u00a0· Online` : [item.teacher, item.room].filter(Boolean).join('\u00a0· ')
}

function statusOf(item, iso, today, nowMs) {
  if (iso < today) return 'done'
  if (iso > today) return 'later'
  if (nowMs >= item.endsAt) return 'done'
  if (nowMs >= item.startsAt) return 'now'
  return 'later'
}

/**
 * The week row, as Calendar: the weekday small, the date under it, and one circle that springs to the day you pick
 * (blue on today, ink on any other day). Arrow keys move along the row.
 */
function WeekStrip({ days, selected, today, onPick }) {
  const i = Math.max(0, days.findIndex((d) => d.iso === selected))
  const refs = useRef([])
  const onKey = (e) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const n = Math.max(0, Math.min(days.length - 1, i + step))
    onPick(days[n].iso)
    refs.current[n]?.focus()
  }
  return (
    <div className="wk" role="radiogroup" aria-label="Day" style={{ '--i': i }} onKeyDown={onKey}>
      {/* The circle carries its own white copy of the dates, cut to its shape, so a date is never blank mid-spring */}
      <span className="wk-dot" data-today={selected === today || undefined} aria-hidden="true">
        <span className="wk-dot-nums">{days.map((d) => <span key={d.iso}>{Number(d.iso.slice(8))}</span>)}</span>
      </span>
      {days.map((d, n) => {
        const isToday = d.iso === today
        const on = d.iso === selected
        return (
          <button
            key={d.iso}
            ref={(el) => { refs.current[n] = el }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className="wk-day"
            data-today={isToday || undefined}
            data-off={d.kind !== 'school' || undefined}
            aria-label={`${formatLongDate(isoToMs(d.iso))}${isToday ? ', today' : ''}${d.kind === 'holiday' ? `, no school, ${d.reason}` : ''}`}
            onClick={() => onPick(d.iso)}
          >
            <span className="wk-name">{SHORT[dayOfWeek(d.iso)]}</span>
            <span className="wk-num">{Number(d.iso.slice(8))}</span>
          </button>
        )
      })}
    </div>
  )
}

/** "9.00" for an hour mark, in the school's 12-hour style. */
const hourLabel = (min) => `${(min / 60) % 12 || 12}.00`

/**
 * The day (or the week) as Google Calendar draws it: hours down the side with a line across each, every lesson a
 * block in its subject's colour at its time and as tall as it is long, breaks left open with their name, and a red
 * line at the time now. One column for a day, five for the week.
 */
function TimeGrid({ days, today, nowMs, onOpen, head = false }) {
  const all = days.flatMap((d) => d.items)
  const from = Math.floor(Math.min(8 * 60, ...all.map((i) => i.startMin)) / 60) * 60
  const to = Math.ceil(Math.max(16 * 60, ...all.map((i) => i.endMin)) / 30) * 30
  const hours = []
  for (let h = from; h <= to; h += 60) hours.push(h)
  const now = schoolParts(nowMs)
  return (
    <div className={`tg${head ? ' tg--week' : ''}`} style={{ '--cols': days.length, '--span': to - from }}>
      {head && (
        <div className="tg-head" aria-hidden="true">
          {days.map((d) => (
            <span key={d.iso} className="tg-head-day" data-today={d.iso === today || undefined}>
              <span className="tg-head-name">{SHORT[dayOfWeek(d.iso)]}</span>
              <span className="tg-head-num">{Number(d.iso.slice(8))}</span>
            </span>
          ))}
        </div>
      )}
      <div className="tg-body">
        <div className="tg-hours" aria-hidden="true">
          {hours.map((h) => <span key={h} style={{ '--at': h - from }}><Num>{hourLabel(h)}</Num></span>)}
        </div>
        {days.map((day) => {
          const nextId = day.iso === today ? day.lessons.find((it) => statusOf(it, day.iso, today, nowMs) === 'later')?.id : null
          const showNow = day.iso === today && now.minutes >= from && now.minutes <= to
          return (
            <div key={day.iso} className="tg-col" role="group" aria-label={`${formatLongDate(isoToMs(day.iso))}${day.iso === today ? ', today' : ''}`}>
              {day.kind !== 'school' ? (
                <p className="tg-off"><span>{day.reason ? 'No school' : 'No lessons'}</span>{day.reason && <span className="tg-off-why">{day.reason}</span>}</p>
              ) : day.items.map((it, n) => {
                // room: the minutes free below this block's start, so a short lesson can grow to a full tap target
                const room = (day.items[n + 1]?.startMin ?? to + 30) - it.startMin
                const pos = { '--top': it.startMin - from, '--len': it.endMin - it.startMin, '--room': room }
                if (it.kind === 'break') return <span key={it.id} className="tg-gap" style={pos}>{it.title}</span>
                const status = statusOf(it, day.iso, today, nowMs)
                const short = it.endMin - it.startMin < 40
                const isNext = it.id === nextId
                const label = `${it.title}, ${it.start} to ${it.end}${it.kind === 'event' ? '' : `, ${place(it)}`}${it.double ? ', double period' : ''}${status === 'now' ? ', now' : status === 'done' ? ', done' : isNext ? ', next' : ''}`
                const Tagname = it.kind === 'event' ? 'div' : 'button'
                return (
                  <Tagname
                    key={it.id}
                    type={it.kind === 'event' ? undefined : 'button'}
                    className={`tg-ev is-${status}${short ? ' is-short' : ''}${isNext ? ' is-next' : ''}`}
                    data-subject={it.kind === 'event' ? 'event' : it.subjectId}
                    style={pos}
                    aria-haspopup={it.kind === 'event' ? undefined : 'dialog'}
                    aria-label={label}
                    onClick={it.kind === 'event' ? undefined : () => onOpen(it)}
                  >
                    <span className="tg-ev-title" aria-hidden="true">
                      <span className="tg-ev-name tg-ev-long">{it.title}</span><span className="tg-ev-name tg-ev-abbr">{it.short || it.title}</span>
                      {it.double && <span className="tg-chip">Double</span>}
                      {isNext && <span className="tg-chip">Next</span>}
                      {short && <span className="tg-ev-time"><Time value={it.start} /></span>}
                    </span>
                    {!short && (
                      <span className="tg-ev-meta" aria-hidden="true">
                        <span className="tg-ev-when"><Time value={it.start} /><span className="tg-ev-end"> to <Time value={it.end} /></span></span>
                        <span className="tg-ev-place">{it.kind === 'event' ? 'School activity' : place(it)}</span>
                      </span>
                    )}
                    {it.periods?.slice(1).map((pd) => (
                      <span key={pd.start} className="tg-bell" style={{ '--at': pd.startMin - it.startMin }} aria-hidden="true"><Time value={pd.start} /></span>
                    ))}
                  </Tagname>
                )
              })}
              {showNow && <i className="tg-now" style={{ '--at': now.minutes - from }} aria-hidden="true" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LessonSheet({ item, onClose, nowMs, offline, joinProps }) {
  const open = Boolean(item)
  const wait = item ? joinWait(item, nowMs, offline) : null
  return (
    <Sheet open={open} onClose={onClose} title={item?.title || 'Lesson'} detents={['content']}>
      {item && (
        <div className="tt-sheet" data-subject={item.subjectId}>
          <p className="tt-sheet-when">
            <Num wide className="t-time-l">{item.start}</Num> to <Num wide className="t-time-l">{item.end}</Num>
          </p>
          <p className="tt-sheet-day">{formatLongDate(item.startsAt)}</p>
          <ul className="list" role="list">
            {item.double && (
              <Row lead={<Icon name="clock" />} leadKind="icon" title={item.periods.length === 2 ? 'Double period' : `${item.periods.length} periods`}
                meta={item.periods.map((pd) => `${pd.start} to ${pd.end}`).join(', then ')} />
            )}
            <Row lead={<Icon name="user" />} leadKind="icon" title={item.teacher} meta="Teacher" />
            <Row lead={<Icon name={item.online ? 'video' : 'pin'} />} leadKind="icon" title={item.online ? 'Online, Google Meet' : (item.room || 'On campus')} meta={item.online ? 'Join from here' : (item.room ? 'Room' : 'Location')} />
          </ul>
          {item.meet && (
            <Button
              variant="primary"
              full
              icon="video"
              unavailable={wait ? wait.replace('Join ', '').replace(/^./, (c) => c.toUpperCase()) : null}
              loading={joinProps.joiningId === item.id}
              loadingLabel="Joining"
              onClick={() => joinProps.onJoin(item)}
            >
              Join {item.short && item.title.length > 20 ? item.short : item.title}
            </Button>
          )}
        </div>
      )}
    </Sheet>
  )
}

export default function Timetable() {
  const { query } = useRoute()
  const { state, offline, now, today, retry, retrying, reconnect, reconnecting } = useDemo()
  const { joiningId, join } = useJoin()
  const [openItem, setOpenItem] = useState(null)
  const view = query.get('view') === 'week' ? 'week' : 'day'

  const isWeekday = dayOfWeek(today) >= 1 && dayOfWeek(today) <= 5
  const selected = query.get('day') || (isWeekday ? today : weekStart(today))
  const monday = weekStart(selected)
  const weekDays = [0, 1, 2, 3, 4].map((n) => getDay(addDays(monday, n)))
  const day = getDay(selected)
  const joinProps = { joiningId, onJoin: join }

  // Back to now: today's rail, scrolled to the lesson on now (or the next one)
  const nowRow = () => document.querySelector('.tg:not(.tg--week) .tg-ev.is-now') || document.querySelector('.tg:not(.tg--week) .tg-ev.is-next')
  const backToNow = () => {
    updateQuery({ day: null, view: null })
    requestAnimationFrame(() => nowRow()?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
  }
  useTabRetap('timetable', backToNow)

  // The capsule carries today's lesson whenever its row is not on screen: scrolled past, not reached yet, or on another day
  const todayModel = state === 'loading' || state === 'empty' ? null : nowModel(now)
  const onToday = view === 'day' && selected === today
  const rowAway = useOutOfView(nowRow, { both: true, enabled: onToday && lessonMiniActive(todayModel), key: `${view}${selected}${todayModel?.item?.id}` })
  const miniShown = lessonMiniActive(todayModel) && (!onToday || rowAway)

  const strip = <WeekStrip days={weekDays} selected={selected} today={today} onPick={(iso) => updateQuery({ day: iso === today ? null : iso })} />

  let body
  if (state === 'loading') {
    body = (
      <LoadingState label="Getting your timetable" onRetry={retry}>
        <SkeletonRows count={6} lead="time" />
      </LoadingState>
    )
  } else if (view === 'week') {
    body = <TimeGrid days={weekDays} today={today} nowMs={now} onOpen={setOpenItem} head />
  } else if (day.kind !== 'school' || state === 'empty') {
    const next = nextSchoolDay(selected)
    body = (
      <EmptyState
        mood={day.kind !== 'school' ? 'happy' : 'calm'}
        title={day.kind === 'holiday' ? `No school: ${day.reason}.` : `No lessons on ${formatWeekday(isoToMs(selected))}.`}
        action={next?.iso ? <Button variant="secondary" onClick={() => updateQuery({ day: next.iso })}>Show {formatWeekday(isoToMs(next.iso))}</Button> : null}
      >
        {next?.first ? <>Next lesson: {next.first.title} at <Time value={next.first.start} />.</> : null}
      </EmptyState>
    )
  } else {
    body = (
      <section aria-labelledby="tt-day-head">
        <div className="section-head tt-day-head">
          <h2 id="tt-day-head" className="t-title-s">{formatLongDate(isoToMs(selected))}</h2>
          {day.online && <Tag icon="laptop">Online</Tag>}
        </div>
        <TimeGrid days={[day]} today={today} nowMs={now} onOpen={setOpenItem} />
      </section>
    )
  }

  return (
    <Screen
      title="Timetable"
      className="screen--tt"
      width={view === 'week' ? 'wide' : 'narrow'}
      action={
        <Button variant="plain" size="compact" onClick={() => updateQuery({ view: view === 'week' ? null : 'week' })} aria-label={view === 'week' ? 'Show one day' : 'Show the week'}>
          {view === 'week' ? 'Day' : 'Week'}
        </Button>
      }
    >
      <div className="stack">
        {view === 'day' && strip}
        {offline && <OfflineNotice what="your timetable" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && (
          <ErrorState onRetry={retry} retrying={retrying}>
            Your timetable did not load. Try again.{(view === 'week' ? weekDays.some((d) => d.lessons.length > 0) : day.kind === 'school') && <> Saved timetable from <Num>{SAVED_AT}</Num> is below.</>}
          </ErrorState>
        )}
        {body}
      </div>
      <LessonMini
        model={todayModel}
        offline={offline}
        joiningId={joiningId}
        onJoin={join}
        shown={miniShown}
        onOpen={backToNow}
        openLabel="Show it in today's timetable"
        lead={onToday ? null : 'Today'}
      />
      <LessonSheet item={openItem} onClose={() => setOpenItem(null)} nowMs={now} offline={offline} joinProps={joinProps} />
    </Screen>
  )
}
