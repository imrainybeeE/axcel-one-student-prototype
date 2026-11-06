// Timetable: the day as a rail (the lesson on now uses the now block), a Mon-Fri strip, and Week.
// Phone: one day at a time, Week stacks the days. Laptop: Week is five columns.
// URL: ?view=week, ?day=YYYY-MM-DD (plus the demo params ?t ?d ?state ?theme).
import { useRef, useState } from 'react'
import { Screen, useDemo, useRoute, updateQuery, useLaptop, useJoin, useTabRetap, SAVED_AT } from '../../app'
import {
  Rail, RailItem, NowBlock, Tag, Time, Num, Icon, Button, Sheet, Row,
  SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice,
  LessonMini, lessonMiniActive, useOutOfView,
} from '../../ui'
import { getDay, nowModel, isJoinOpen, joinOpensAt, nextSchoolDay } from '../../lib/schedule.js'
import { addDays, dayOfWeek, formatLongDate, formatWeekday, isoToMs } from '../../lib/time.js'
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

function JoinSmall({ item, nowMs, offline, joiningId, onJoin }) {
  if (!item.meet || joinWait(item, nowMs, offline)) return null
  return (
    <Button size="compact" loading={joiningId === item.id} loadingLabel="Joining" aria-label={`Join ${item.title}`} onClick={() => onJoin(item)}>
      Join
    </Button>
  )
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

/** One day as a rail. */
function DayRail({ day, today, nowMs, model, offline, joinProps, onOpen }) {
  const items = day.items
  const nextId = day.iso === today ? items.find((it) => it.kind !== 'break' && statusOf(it, day.iso, today, nowMs) === 'later')?.id : null
  return (
    <Rail label={`Lessons on ${formatLongDate(isoToMs(day.iso))}`} className="tt-rail">
      {items.map((it, i) => {
        const status = statusOf(it, day.iso, today, nowMs)
        const first = i === 0
        const last = i === items.length - 1
        if (it.kind === 'break') {
          return <RailItem key={it.id} kind="gap" status={status === 'done' ? 'done' : 'later'} start={it.start} end={it.end} title={it.title} first={first} last={last} />
        }
        if (it.kind === 'lesson' && status === 'now' && model?.state === 'lesson' && model.item?.id === it.id) {
          return (
            <RailItem key={it.id} status="now" start={it.start} end={it.end} subject={it.subjectId} first={first} last={last}>
              <div className="tt-now">
                <NowBlock model={model} variant="rail" offline={offline} onJoin={joinProps.onJoin} joiningId={joinProps.joiningId} headingLevel={3} onDetails={() => onOpen(it)} />
              </div>
            </RailItem>
          )
        }
        if (it.kind === 'event') {
          return <RailItem key={it.id} status={status === 'now' ? 'later' : status} start={it.start} end={it.end} title={it.title} meta="School activity" first={first} last={last} />
        }
        const isNext = it.id === nextId
        const wait = joinWait(it, nowMs, offline)
        return (
          <RailItem
            key={it.id}
            status={status}
            start={it.start}
            end={it.end}
            subject={it.subjectId}
            first={first}
            last={last}
          >
            <button type="button" className="rail-text tt-open" aria-haspopup="dialog" onClick={() => onOpen(it)}>
              <span className="rail-title">{it.title}{isNext && <> <span className="tt-next">Next</span></>}</span>
              <span className="rail-meta">{place(it)}</span>
              {status !== 'done' && wait && <span className="rail-meta join-wait"><Icon name="clock" size={20} />{wait}</span>}
            </button>
            {status === 'done' ? <span className="vh">, done</span> : <JoinSmall item={it} nowMs={nowMs} offline={offline} {...joinProps} />}
          </RailItem>
        )
      })}
    </Rail>
  )
}

/** The week: stacked days on a phone, five columns on a laptop. */
function Week({ days, today, nowMs, onOpen, laptop }) {
  const starts = [...new Set(days.flatMap((day) => day.lessons.map((item) => item.startMin)))].sort((a, b) => a - b)
  return (
    <div className={laptop ? 'tt-week-scroll' : undefined} data-scroll-x={laptop || undefined}>
    <div className={laptop ? 'tt-week tt-week--grid' : 'tt-week'}>
      {days.map((day, column) => (
        <section key={day.iso} className="tt-week-day" aria-labelledby={`tt-w-${day.iso}`}>
          <h2 id={`tt-w-${day.iso}`} className="tt-week-head t-title-s" style={laptop ? { gridColumn: column + 1, gridRow: 1 } : undefined}>
            {formatWeekday(isoToMs(day.iso))} <Num>{Number(day.iso.slice(8))}</Num>
            {day.iso === today && <Tag>Today</Tag>}
          </h2>
          {day.kind !== 'school' ? (
            <p className="tt-week-off" style={laptop ? { gridColumn: column + 1, gridRow: 2 } : undefined}>{day.reason ? `No school: ${day.reason}` : 'No lessons'}</p>
          ) : (
            <ul className="list" role="list">
              {day.lessons.map((it) => (
                <Row
                  key={it.id}
                  data-subject={it.subjectId}
                  className={`tt-week-row${statusOf(it, day.iso, today, nowMs) === 'done' ? ' is-done' : ''}`}
                  style={laptop ? { gridColumn: column + 1, gridRow: starts.indexOf(it.startMin) + 2 } : undefined}
                  onClick={it.kind === 'event' ? undefined : () => onOpen(it)}
                  lead={<span className="tt-week-time"><Time value={it.start} /></span>}
                  title={it.kind === 'event' ? it.title : laptop ? it.short : it.title}
                  meta={it.kind === 'event' ? 'School activity' : laptop ? it.teacherShort : place(it)}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
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
  const laptop = useLaptop()
  const { joiningId, join } = useJoin()
  const [openItem, setOpenItem] = useState(null)
  const view = query.get('view') === 'week' ? 'week' : 'day'

  const isWeekday = dayOfWeek(today) >= 1 && dayOfWeek(today) <= 5
  const selected = query.get('day') || (isWeekday ? today : weekStart(today))
  const monday = weekStart(selected)
  const weekDays = [0, 1, 2, 3, 4].map((n) => getDay(addDays(monday, n)))
  const day = getDay(selected)
  const model = selected === today ? nowModel(now) : null
  const joinProps = { joiningId, onJoin: join }

  // Back to now: today's rail, scrolled to the lesson on now (or the next one)
  const nowRow = () => document.querySelector('.tt-rail .rail-item.is-now') || document.querySelector('.tt-rail .tt-next')?.closest('.rail-item')
  const backToNow = () => {
    updateQuery({ day: null, view: null })
    requestAnimationFrame(() => nowRow()?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
  }
  useTabRetap('timetable', backToNow)

  // The capsule carries today's lesson whenever its row is not on screen: scrolled past, not reached yet, or on another day
  const todayModel = state === 'loading' || state === 'empty' ? null : (model || nowModel(now))
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
    body = <Week days={weekDays} today={today} nowMs={now} onOpen={setOpenItem} laptop={laptop} />
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
        <DayRail day={day} today={today} nowMs={now} model={model} offline={offline} joinProps={joinProps} onOpen={setOpenItem} />
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
