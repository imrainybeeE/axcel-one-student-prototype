// Today: the day strip, the now block, then shelves as Apple Music's Home: Later today, Messages, Coming up, You.
// Phone: one column. Laptop: the strip across the top, the day on the left (the block, Later today), the shelves on the right.
import { useEffect, useState } from 'react'
import { Screen, Link, useDemo, useJoin, useTabRetap, announce, schoolNow, SAVED_AT } from '../../app'
import { NowBlock, NowBlockSkeleton } from '../../ui/NowBlock.jsx'
import { Time, Num } from '../../ui/Num.jsx'
import { Avatar } from '../../ui/Avatar.jsx'
import { RollNum } from '../../ui/Motion.jsx'
import { LoadingState } from '../../ui/States.jsx'
import { OfflineNotice } from '../../ui/Notice.jsx'
import { haptic } from '../../ui/haptic.js'
import { nowModel } from '../../lib/schedule.js'
import { formatLongDate, formatTime } from '../../lib/time.js'
import { student } from '../../data/student.js'
import { LessonShelf, Shelves, ShelfSkeleton } from './Shelves.jsx'
import { LessonMini } from '../../ui/LessonMini.jsx'
import { useOutOfView, lessonMiniActive } from '../../ui/miniBarHooks.js'
import './today.css'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
// The strip's sweep is a first-view flourish: once per session, not on every return to Today
const played = { strip: false }

function greeting(model, loading) {
  const hi = `Hi ${student.firstName}.`
  if (loading || !model) return hi
  const kind = model.day.kind
  if (model.state === 'noschool' && !model.reason && kind === 'school') return hi
  if (kind === 'holiday') return `${hi} Enjoy the holiday.`
  if (kind === 'weekend') return `${hi} Enjoy your weekend.`
  return model.online ? `${hi} Lessons are online today.` : `${hi} Lessons are on campus today.`
}

/**
 * The whole school day as one bar of subject colours: done lessons fade, a glowing dot marks now. Tap for Timetable.
 * On first view the finished lessons fade one after another, left to right, so the bar reads as "this much is done".
 */
function DayStrip({ model }) {
  const items = model.day.items
  const [swept, setSwept] = useState(() => played.strip || reducedMotion())
  useEffect(() => {
    if (swept) return
    const go = () => { played.strip = true; setSwept(true) }
    const id = 'requestIdleCallback' in window ? window.requestIdleCallback(go, { timeout: 600 }) : setTimeout(go, 300)
    return () => ('cancelIdleCallback' in window ? window.cancelIdleCallback(id) : clearTimeout(id))
  }, [swept])
  if (model.day.kind !== 'school' || !items.length) return null
  const first = items[0].startsAt
  const last = items[items.length - 1].endsAt
  const at = Math.max(0, Math.min(1, (model.nowMs - first) / (last - first)))
  const lessons = items.filter((i) => i.kind !== 'break')
  const done = lessons.filter((i) => i.endsAt <= model.nowMs).length
  const showNow = model.nowMs > first && model.nowMs < last
  const label = `Your day: ${lessons.length} lessons, ${done} done. Open Timetable`
  let order = 0
  return (
    <Link to="/timetable" className="day-strip" aria-label={label}>
      <span className="day-strip-bar" aria-hidden="true">
        {items.map((i) => {
          const isBreak = i.kind === 'break'
          const isDone = !isBreak && i.endsAt <= model.nowMs
          // The lesson under the dot: done up to the dot, its colour after it, so the bar reads like the block's
          const cut = !isBreak && swept && i.startsAt < model.nowMs && model.nowMs < i.endsAt ? (model.nowMs - i.startsAt) / (i.endsAt - i.startsAt) : null
          const delay = isDone ? order++ * 60 : 0
          return (
            <span
              key={i.id}
              data-subject={i.kind === 'break' ? undefined : i.subjectId}
              className={['day-strip-seg', isBreak && 'is-break', isDone && swept && 'is-done', cut != null && 'is-now'].filter(Boolean).join(' ')}
              style={{ '--len': i.endMin - i.startMin, '--cut': cut ?? undefined, transitionDelay: swept && !reducedMotion() ? `${delay}ms` : undefined }}
            />
          )
        })}
        {showNow && (
          <span
            className="day-strip-now"
            data-subject={model.item?.subjectId || 'break'}
            style={{ '--at': at, '--gi': Math.max(0, items.findIndex((i) => i.startsAt <= model.nowMs && model.nowMs < i.endsAt)), '--gn': items.length - 1 }}
          />
        )}
      </span>
      <span className="day-strip-ends" aria-hidden="true">
        <Time value={items[0].start} />
        <span><span className="day-strip-count"><RollNum value={done} /> of {lessons.length}</span> lessons done</span>
        <Time value={items[items.length - 1].end} />
      </span>
    </Link>
  )
}

/** The student's initials in a glass circle at the top right, as iOS apps carry the account. Opens More. */
function AccountButton() {
  return (
    <Link to="/more" className="icon-btn account-btn" aria-label={`More, ${student.fullName}`} data-liquid="" data-liquid-bezel="12" data-liquid-strength="10">
      <Avatar initials={student.initials} size={36} />
    </Link>
  )
}

export default function Today() {
  const { state, offline, now, today, retry, retrying, reconnect, reconnecting } = useDemo()
  const { joiningId, join } = useJoin()
  const [refreshedAt, setRefreshedAt] = useState(null)

  // Re-tap Today at the top: refresh, roll the time, and say when
  useTabRetap('today', () => {
    const t = schoolNow()
    setRefreshedAt(t)
    haptic()
    announce(`Updated ${formatTime(t)}`)
  })

  const loading = state === 'loading'
  const error = state === 'error'
  const model = loading ? null : nowModel(now, { forceEmpty: state === 'empty' })
  const updated = offline || error ? SAVED_AT : formatTime(Math.max(now, refreshedAt || 0))
  // The capsule shows once the block's Join (or its bar) has gone under the nav bar, so the two never show at once
  const miniShown = useOutOfView(() => {
    const hero = document.querySelector('.screen--today .now')
    return hero?.querySelector('.now-join-wrap') || hero?.querySelector('.now-elapsed') || hero
  }, { enabled: !loading && !error && lessonMiniActive(model) })

  let day
  if (loading) {
    day = (
      <LoadingState label="Getting today's lessons" onRetry={retry}>
        <NowBlockSkeleton />
        <ShelfSkeleton />
      </LoadingState>
    )
  } else if (error) {
    day = (
      <NowBlock
        model={model}
        error={{ savedAt: SAVED_AT, lastItem: model.item || model.day.lessons[0], onRetry: retry, retrying }}
      />
    )
  } else {
    day = (
      <>
        {offline && <OfflineNotice what="your timetable" savedAt={SAVED_AT} className="today-notice" onRetry={reconnect} retrying={reconnecting} />}
        <NowBlock model={model} offline={offline} onJoin={join} joiningId={joiningId} showNext />
        <LessonShelf model={model} nowMs={now} offline={offline} />
      </>
    )
  }

  return (
    <Screen title="Today" subtitle={formatLongDate(now)} className="screen--today" action={<AccountButton />}>
      <p className="today-greeting">{greeting(model, loading)}</p>
      <div className="today-cols">
        {/* The strip belongs to the day: on a laptop it sits over the day's column, and the side column starts level with the block */}
        {model && !error && model.state !== 'noschool' && <div className="today-strip"><DayStrip model={model} /></div>}
        <div className="today-day">{day}</div>
        {!loading && <div className="today-side"><Shelves nowMs={now} todayIso={today} /></div>}
      </div>
      <p className="today-updated">
        {offline || error ? <>Saved <Num>{updated}</Num></> : <>Updated <Num><RollNum value={updated} /></Num></>}
      </p>
      {!loading && !error && (
        <LessonMini model={model} offline={offline} joiningId={joiningId} onJoin={join} shown={miniShown} onOpen={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      )}
    </Screen>
  )
}
