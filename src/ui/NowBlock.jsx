// The now block: the one bold move. One component for every state of the school day.
// Feed it nowModel(now) from src/lib/schedule.js. It never shows seconds; minutes are rounded up.
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Button } from './Button.jsx'
import { Icon } from './Icon.jsx'
import { Num, Time } from './Num.jsx'
import { Tag } from './Tag.jsx'
import { Dia } from './Dia.jsx'
import { RollNum } from './Motion.jsx'
import { Link } from '../app/Link.jsx'
import { dayName } from '../lib/schedule.js'
import { nowName } from './nowText.js'

/** Long subject names ("English as a Second Language") use their short form on the block and its button. */
function shortTitle(item) {
  return item.short && item.title.length > 20 ? item.short : item.title
}

function meta(item) {
  if (!item) return ''
  if (item.kind === 'event') return item.place === 'online' ? 'Online' : 'At school'
  return `${item.teacher}, ${item.place}`
}

// Today's one first-paint moment, once per session: the lesson bar fills to the minute (the number is never faked)
let introPlayed = false
function useIntro() {
  const [on, setOn] = useState(() => !introPlayed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (!on) return
    introPlayed = true
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(false)))
    return () => cancelAnimationFrame(id)
  }, [on])
  return on
}

/**
 * Big countdown: "20" with "min left" stacked beside it (lessons), or "in 1 h 20 min" (before a lesson). The stack's
 * last line sits on the numeral's baseline, as a timer's unit does, so nothing hangs on a line of its own.
 */
function Countdown({ minutes, mode }) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const big = (n) => <Num wide className="now-count-n"><RollNum value={n} /></Num>
  const unit = (u) => <span className="now-count-unit">{u}</span>
  const last = (u) => (mode === 'left' ? <span className="now-count-stack"><span>{u}</span><span>left</span></span> : unit(u))
  return (
    <div className="now-count" role="timer">
      <p className="now-count-line">
        {mode === 'starts' && <span className="now-count-pre">in</span>}
        {h > 0 ? <>{big(h)}{m > 0 ? <>{unit('h')}{big(m)}{last('min')}</> : last('h')}</> : <>{big(m)}{last('min')}</>}
      </p>
    </div>
  )
}

/** Elapsed: a thin bar filled to the current minute, the start and end times small under its ends (as Music's scrubber). */
function Elapsed({ item, minutesLeft, progress }) {
  const total = item.endMin - item.startMin
  const used = Math.max(0, Math.min(total, total - minutesLeft))
  const p = Math.max(0, Math.min(1, progress))
  return (
    <div className="now-elapsed">
      <span
        className="now-bar"
        role="progressbar"
        aria-label="Lesson time used"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={used}
        aria-valuetext={`${used} of ${total} minutes`}
        style={{ '--p': p }}
      >
        <span className="now-bar-fill" />
      </span>
      <span className="now-elapsed-ends" aria-hidden="true"><Time value={item.start} /><Time value={item.end} /></span>
    </div>
  )
}

/** The block's foot: what comes after this, one quiet line. Join appears here once the next lesson opens. */
function NextLine({ model, offline, onJoin, joiningId }) {
  const next = model.next
  if (!next) return null
  const open = Boolean(model.nextJoin?.open) && !offline
  return (
    <p className="now-next">
      <span className="now-next-label">{model.state === 'lesson' || model.state === 'break' ? 'Next' : 'Then'}</span>
      <span className="now-next-title">{shortTitle(next)}{model.item?.subjectId === next.subjectId && model.item.endsAt === next.startsAt ? ' again' : ''}</span>
      {open ? (
        <Button variant="on-now" size="compact" loading={joiningId === next.id} loadingLabel="Joining" aria-label={`Join ${next.title}`} onClick={() => onJoin?.(next)} className="now-next-join">Join</Button>
      ) : model.state === 'lesson' && next.startsAt === model.item.endsAt ? null : (
        <Time value={next.start} className="now-next-time" />
      )}
    </p>
  )
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const springOf = (el, name) => getComputedStyle(el).getPropertyValue(name).trim() || 'ease-out'

/** When Join goes live (5 minutes before), the button pops in on the bouncy spring and the label blurs in. */
function useJoinReveal(open) {
  const wrap = useRef(null)
  const was = useRef(open)
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el || was.current === open) return
    was.current = open
    if (!open) return
    el.dataset.live = ''
    if (reduced()) return
    for (const a of el.getAnimations()) a.cancel()
    el.animate(
      [{ transform: 'scale(0.9)', opacity: 0.4 }, { transform: 'none', opacity: 1 }],
      { duration: 460, easing: springOf(el, '--spring-bouncy') },
    )
  }, [open])
  return wrap
}

function JoinButton({ item, join, offline, joining, onJoin, compact }) {
  const open = Boolean(join?.open) && !offline
  const wrap = useJoinReveal(open)
  if (!join) return null
  const reason = offline ? 'Join needs the internet' : !join.open ? `Join opens at ${join.opensAt}` : null
  return (
    <div ref={wrap} className="now-join-wrap">
    <Button
      variant="on-now"
      full={!compact}
      icon="video"
      unavailable={reason}
      loading={joining}
      loadingLabel="Joining"
      aria-label={`Join ${item.title}`}
      onClick={() => onJoin?.(item)}
      className="now-join"
    >
      Join {shortTitle(item)}
    </Button>
    </div>
  )
}

/**
 * Lesson changeover: only the words change. The new lesson's title, teacher and minutes resolve out of a blur while the
 * card keeps its bar and button, its colour tweens (spice.css), and a change of height glides instead of jumping.
 */
function useChangeover(key) {
  const ref = useRef(null)
  const last = useRef(key)
  const height = useRef(0)
  // Runs after every render, so the height it compares against is the one the student was just looking at
  useLayoutEffect(() => {
    const el = ref.current
    const card = el?.parentElement
    const from = height.current
    height.current = card ? card.offsetHeight : 0
    if (last.current === key) return
    last.current = key
    if (!el || reduced()) return
    for (const a of card.getAnimations()) if (a.id === 'now-height') a.cancel() // a fast clock never queues changeovers
    for (const t of el.querySelectorAll('.now-main, .now-count, .now-next')) {
      for (const a of t.getAnimations()) a.cancel()
      t.animate(
        [{ opacity: 0.3, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }],
        { duration: 360, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      )
    }
    if (from && from !== height.current) {
      card.animate([{ height: `${from}px` }, { height: `${height.current}px` }], { id: 'now-height', duration: 490, easing: springOf(card, '--spring-smooth') })
    }
  })
  return ref
}

/**
 * <NowBlock model={nowModel(now)} offline={false} onJoin={join} joiningId={id} />
 * variant: 'full' (Today) | 'rail' (Timetable's current row, rail width).
 * error: { savedAt: '8.40', lastItem, onRetry, retrying } renders the error state instead.
 * forcedEmpty: the model came from nowModel(now, { forceEmpty: true }).
 * showNext: end the block with the next lesson (a break always does).
 */
export function NowBlock({ model, offline = false, error = null, onJoin, joiningId = null, variant = 'full', headingLevel = 2, showNext = false, onDetails }) {
  const nameId = useId()
  const H = `h${headingLevel}`
  const content = useChangeover(error ? 'error' : `${model?.state}|${model?.item?.id ?? ''}`)
  const intro = useIntro()

  if (error) {
    const last = error.lastItem
    return (
      <section className="now now--error" aria-labelledby={nameId}>
        <div className="now-error-head">
          <Dia mood={error.retrying ? 'loading' : 'error'} size={72} />
          <H id={nameId} className="t-title-3">Your timetable did not load.</H>
          <p className="now-error-text">Check that you are online, then try again. Your saved day is below.</p>
        </div>
        {last && (
          <p className="now-error-last">
            <span className="now-error-saved">Saved <Time value={error.savedAt} /></span>
            <span>{last.title}, <Time value={last.start} /> to <Time value={last.end} /></span>
          </p>
        )}
        <Button variant="primary" size="regular" full onClick={error.onRetry} loading={error.retrying} loadingLabel="Trying again" icon="refresh">Try again</Button>
      </section>
    )
  }

  const { state, item } = model
  const name = nowName(model)
  const joining = item && joiningId === item.id

  if (variant === 'rail' && state === 'lesson') {
    return (
      <section className="now now--rail" aria-labelledby={nameId} data-subject={item.subjectId}>
        <span id={nameId} className="vh">{name}</span>
        <div className="now-rail-top">
          <Tag tone="inverse">Now</Tag>
          <Countdown minutes={model.minutes} mode="left" />
        </div>
        <p className="now-title t-title-m">{shortTitle(item)}</p>
        <p className="now-meta">{meta(item)}</p>
        <Elapsed key={item.id} item={item} minutesLeft={model.minutes} progress={model.progress} />
        <JoinButton item={item} join={model.join} offline={offline} joining={joining} onJoin={onJoin} />
        {onDetails && (
          <button type="button" className="now-next now-details" onClick={onDetails} aria-haspopup="dialog" aria-label={`Show ${item.title} details`}>
            <span className="now-next-title">Details</span><Icon name="chevron-right" size={18} />
          </button>
        )}
      </section>
    )
  }

  if (state === 'noschool' || state === 'after') {
    const nd = model.nextDay
    const skipped = state === 'noschool' && nd?.skipped?.length ? nd.skipped.filter((d) => d.iso !== model.iso) : []
    return (
      <section className="now now--quiet" aria-labelledby={nameId}>
        <span id={nameId} className="vh">{name}</span>
        <Dia mood="calm" size={64} className="now-dia" />
        <H className="now-title t-title-now">{state === 'after' ? 'School is finished.' : 'No school today'}</H>
        {state === 'noschool' && (
          <p className="now-reason">
            {model.reason ? `${model.reason}.` : model.weekend ? 'Enjoy the weekend.' : 'Nothing is on your timetable today.'}
          </p>
        )}
        {state === 'noschool' && model.todayEvents?.map((e) => (
          <p key={e.id} className="now-line"><Icon name="calendar" size={20} />
            <span>{e.title}, <Time value={e.time} />{e.end ? <> to <Time value={e.end} /></> : null}{e.place ? `, ${e.place}` : ''}.</span>
          </p>
        ))}
        {nd?.first && (
          <p className="now-next-day">
            <span className="now-next-day-when">{dayName(nd.iso, nd.daysAway) === 'tomorrow' ? 'Tomorrow' : `Back on ${dayName(nd.iso, nd.daysAway)}`}</span>
            <span><Time value={nd.first.start} wide className="t-time-l" /> <span className="now-next-day-subject">{nd.first.title}</span></span>
          </p>
        )}
        {skipped.map((d) => (
          <p key={d.iso} className="now-line"><Icon name="info" size={20} /><span>{d.reason} on {dayName(d.iso, 2)}.</span></p>
        ))}
        {state === 'noschool' && (
          <Link to="/calendar" className="now-link">See what&rsquo;s coming up</Link>
        )}
      </section>
    )
  }

  const isBreak = state === 'break'
  const starts = state === 'before' || state === 'between'
  const tag = state === 'lesson' ? 'Now' : state === 'before' ? 'First lesson' : state === 'between' ? 'Next' : null

  return (
    <section className={`now now--${state}`} aria-labelledby={nameId} data-subject={isBreak ? 'break' : item.subjectId}>
      <span id={nameId} className="vh">{name}</span>
      <div ref={content} className="now-content">
      <div className="now-grid">
        <div className="now-main">
          {tag && <Tag tone="inverse">{tag}{starts && <> at <Time value={item.start} /></>}</Tag>}
          <H className="now-title t-title-now" aria-label={item.title}>{shortTitle(item)}</H>
          {!(isBreak && model.next) && (
            <p className="now-meta">{isBreak ? <>until <Time value={item.end} /></> : meta(item)}</p>
          )}
        </div>
        <Countdown minutes={model.minutes} mode={starts ? 'starts' : 'left'} />
      </div>
      {state === 'lesson' && <Elapsed key={item.id} item={item} minutesLeft={model.minutes} progress={intro ? 0 : model.progress} />}
      {!isBreak && <JoinButton item={item} join={model.join} offline={offline} joining={joining} onJoin={onJoin} />}
      {(showNext || isBreak) && <NextLine model={model} offline={offline} onJoin={onJoin} joiningId={joiningId} />}
      </div>
    </section>
  )
}

/** The loading shape: the block's real parts (label, title, minutes, bar and its times, Join), shimmering on a card. */
export function NowBlockSkeleton() {
  return (
    <div className="now now--skeleton" aria-hidden="true">
      <div className="now-grid">
        <div className="now-main">
          <span className="skel" style={{ width: '3.5rem', height: 24, borderRadius: 7 }} />
          <span className="skel" style={{ width: '9rem', height: 30, marginTop: 12, borderRadius: 8 }} />
          <span className="skel" style={{ width: '12rem', height: 16, marginTop: 8, borderRadius: 6 }} />
        </div>
        <span className="skel" style={{ width: '4.5rem', height: 56, borderRadius: 10 }} />
      </div>
      <span className="skel" style={{ display: 'block', height: 5, margin: '20px 0 7px', borderRadius: 3 }} />
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="skel" style={{ width: '2.25rem', height: 12, borderRadius: 4 }} />
        <span className="skel" style={{ width: '2.25rem', height: 12, borderRadius: 4 }} />
      </span>
      <span className="skel" style={{ display: 'block', height: 50, marginTop: 16, borderRadius: 10 }} />
    </div>
  )
}
