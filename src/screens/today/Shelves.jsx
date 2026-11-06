// Today's shelves, as Apple Music's Home: a bold header with a chevron straight after it, then a row of cards.
// Later today (lessons as covers in their subject's colour), Messages, Coming up, and You (Record and Attendance).
import { ViewTransition } from 'react'
import { Link, useUnreadThreads } from '../../app'
import { zoomName, ZOOM_SHARE } from '../../app/zoom.js'
import { Time, Num } from '../../ui/Num.jsx'
import { Icon } from '../../ui/Icon.jsx'
import { Avatar } from '../../ui/Avatar.jsx'
import { Dia } from '../../ui/Dia.jsx'
import { laterItems, isJoinOpen } from '../../lib/schedule.js'
import { formatMessageTime, formatWeekdayShort, formatDuration, isoToMs, schoolInstant } from '../../lib/time.js'
import { threads } from '../../data/messages.js'
import { events } from '../../data/calendar.js'
import { summary } from '../../data/record.js'
import { attendanceSummary } from '../../data/attendance.js'

const record = summary()
const attendance = attendanceSummary()

const shortTitle = (it) => (it.short && it.title.length > 18 ? it.short : it.title)

/** A card that grows into the screen it opens (the zoom transition), as Row does. */
function ZoomLink({ to, className, children, ...rest }) {
  return (
    <ViewTransition name={zoomName(to)} share={ZOOM_SHARE} default="none">
      <Link to={to} zoom className={className} {...rest}>{children}</Link>
    </ViewTransition>
  )
}

/** Music's header: a bold title with the chevron straight after it, the whole thing one link (plain when it goes nowhere). */
function ShelfHead({ to, children, id }) {
  return (
    <h2 id={id} className="shelf-head">
      {to ? <Link to={to}>{children}<Icon name="chevron-right" size={19} className="shelf-chev" /></Link> : children}
    </h2>
  )
}

/**
 * After the block's Next line, the rest of today as cover art: each lesson a flat card in its subject's colour, its
 * start time large and how far away it is small. Breaks are left out; the strip above already shows them.
 */
export function LessonShelf({ model, nowMs, offline }) {
  const items = laterItems(model).filter((i) => i.kind !== 'break') // a double period is already one item
  if (!items.length) return null
  return (
    <section className="shelf shelf--later" aria-labelledby="shelf-later">
      <ShelfHead to="/timetable" id="shelf-later">Later today</ShelfHead>
      <ul className="shelf-row" role="list" data-scroll-x="">
        {items.map((it) => {
          const open = it.meet && !offline && isJoinOpen(it, nowMs)
          const who = it.kind !== 'lesson' ? (it.place === 'online' ? 'Online' : 'At school') : it.online ? it.teacherShort : [it.teacherShort, it.room].filter(Boolean).join('\u00a0· ')
          const away = Math.max(1, Math.ceil((it.startsAt - nowMs) / 60000))
          return (
            <li key={it.id} className="shelf-item">
              <Link
                to="/timetable"
                className="cover-link card-link"
                aria-label={`${it.title}, ${it.start} to ${it.end}${it.double ? ', double lesson' : ''}, ${who}${open ? ', Join is open' : ''}`}
              >
                {/* One card holds the lesson: its time, the subject beside its colour dot, then who and when */}
                <span className="cover" data-subject={it.subjectId || 'event'}>
                  <Time value={it.start} className="cover-time" />
                  {it.meet && !model.online && <Icon name="video" size={18} className="cover-icon" />}
                  <span className="cover-title">{shortTitle(it)}{it.double && <span className="cover-double">Double</span>}</span>
                  <span className="cover-meta">{who}</span>
                  <span className="cover-meta">{open ? 'Join open' : `in ${formatDuration(away)}`}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function lastOf(t) {
  const m = t.messages[t.messages.length - 1]
  return { text: m.text, at: schoolInstant(m.day, m.time) }
}
const kindOf = (t) => (t.kind === 'class' ? 'group' : t.kind === 'announcement' ? 'announcement' : 'person')

function MessagesShelf({ nowMs }) {
  const unread = useUnreadThreads()
  const list = threads.filter((t) => unread.has(t.id)).slice(0, 3)
  return (
    <section className="shelf" aria-labelledby="shelf-msgs">
      <ShelfHead to="/messages" id="shelf-msgs">Messages</ShelfHead>
      {list.length ? (
        <ul className={list.length > 1 ? 'shelf-row' : 'shelf-one'} role="list" data-scroll-x="">
          {list.map((t) => {
            const last = lastOf(t)
            return (
              <li key={t.id} className="shelf-item shelf-item--wide">
                <ZoomLink to={`/messages/${t.id}`} className="msg-card card-link" aria-label={`${t.title}, new message: ${last.text}`}>
                  <span className="msg-card-top">
                    <Avatar initials={t.initials} kind={kindOf(t)} size={32} />
                    <span className="msg-card-name">{t.title}</span>
                    <Num className="msg-card-time">{formatMessageTime(last.at, nowMs)}</Num>
                  </span>
                  <span className="msg-card-text">{last.text}</span>
                </ZoomLink>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="shelf-quiet"><Dia mood="happy" size={30} className="shelf-dia" /><p>You’re all caught up.</p></div>
      )}
    </section>
  )
}

function eventWhen(e) {
  if (e.category === 'public-holiday' || e.category === 'holiday') return 'No school'
  if (!e.time) return 'All day'
  return <><Time value={e.time} />{e.end ? <> to <Time value={e.end} /></> : null}</>
}

function EventsShelf({ todayIso }) {
  const upcoming = events
    .filter((e) => e.start > todayIso)
    .sort((a, b) => (a.start === b.start ? (a.time || '').localeCompare(b.time || '') : a.start.localeCompare(b.start)))
    .slice(0, 6)
  if (!upcoming.length) return null
  return (
    <section className="shelf" aria-labelledby="shelf-up">
      <ShelfHead to="/calendar" id="shelf-up">Coming up</ShelfHead>
      <ul className="shelf-row" role="list" data-scroll-x="">
        {upcoming.map((e) => (
          <li key={e.id} className="shelf-item">
            <Link to={`/calendar?event=${e.id}`} className="event-card card-link" data-cat={e.category}>
              <span className="event-card-date">
                <Num wide className="event-card-day">{Number(e.start.slice(8))}</Num>
                <span className="event-card-wd">{formatWeekdayShort(isoToMs(e.start))}</span>
              </span>
              <span className="event-card-title">{e.title.replace(/-/g, "\u2011") /* "Y7-Y10" never breaks at its hyphen */}</span>
              <span className="event-card-meta">{eventWhen(e)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function RecordTile() {
  const from = record.currentAward?.points || 0
  const toNext = record.nextAward ? Math.max(0, Math.min(1, (record.points - from) / (record.nextAward.points - from))) : 0
  return (
    <ZoomLink
      to="/record"
      className="stat-tile card-link"
      data-tone="record"
      aria-label={record.nextAward ? `Record, ${record.points} points, ${record.toNext} more for ${record.nextAward.name}` : `Record, ${record.points} points, ${record.currentAward.name} Award level`}
    >
      <span className="stat-title">Record<Icon name="chevron-right" size={16} className="stat-chev" /></span>
      <span className="stat-fig"><Num wide className="stat-n">{record.points}</Num><span className="stat-unit">points</span></span>
      {record.nextAward && <span className="stat-bar" style={{ '--p': toNext }} aria-hidden="true"><i /></span>}
      <span className="stat-sub">{record.nextAward ? <><Num>{record.toNext}</Num> more for {record.nextAward.name}</> : `${record.currentAward.name} Award level`}</span>
    </ZoomLink>
  )
}

function AttendanceTile() {
  return (
    <ZoomLink to="/attendance" className="stat-tile card-link" data-tone="good" aria-label={`Attendance, ${Math.round(attendance.percent)}% this term, ${attendance.present + attendance.late} of ${attendance.days} days`}>
      <span className="stat-title">Attendance<Icon name="chevron-right" size={16} className="stat-chev" /></span>
      <span className="stat-fig stat-fig--pc"><Num wide className="stat-n">{Math.round(attendance.percent)}</Num><span className="stat-unit">%</span></span>
      <span className="stat-sub"><Num>{attendance.present + attendance.late}</Num> of <Num>{attendance.days}</Num> days</span>
    </ZoomLink>
  )
}

/** Everything after the day: Messages, Coming up, and You. */
export function Shelves({ nowMs, todayIso }) {
  return (
    <>
      <MessagesShelf nowMs={nowMs} />
      <EventsShelf todayIso={todayIso} />
      <section className="shelf" aria-labelledby="shelf-you">
        <ShelfHead id="shelf-you">You</ShelfHead>
        <div className="stat-pair">
          <RecordTile />
          <AttendanceTile />
        </div>
      </section>
    </>
  )
}

/** The loading shape of a shelf: its header and two covers, shimmering. */
export function ShelfSkeleton() {
  return (
    <div className="shelf shelf--later" aria-hidden="true">
      <span className="skel" style={{ display: 'block', width: '8.5rem', height: 24, margin: '2px 0 12px', borderRadius: 7 }} />
      <div className="shelf-row shelf-row--skel">
        {[0, 1].map((i) => (
          <div key={i} className="shelf-item">
            <span className="skel cover-skel" />
            <span className="skel" style={{ display: 'block', width: '70%', height: 14, marginTop: 10, borderRadius: 5 }} />
            <span className="skel" style={{ display: 'block', width: '45%', height: 12, marginTop: 6, borderRadius: 5 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
