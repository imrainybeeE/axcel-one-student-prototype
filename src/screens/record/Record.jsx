// Record: progress to the next award first, then where points come from, the award ladder and every entry.
// Demerits are plain facts with a minus sign; no ranking, no streaks.
// Demo: ?award=silver shows the moment a student reaches Silver.
import { useState } from 'react'
import { Screen, useDemo, useRoute, useLaptop, SAVED_AT, Link } from '../../app'
import {
  Segmented, Rail, RailItem, Row, Group, Num, Icon, Sheet, Button, MeritDiamond,
  SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice,
} from '../../ui'
import { entries, summary, awards, areas } from '../../data/record.js'
import { formatLongDate, isoToMs } from '../../lib/time.js'
import { student } from '../../data/student.js'
import './record.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * The lead, as Fitness: one big figure with its unit, what it means in a coloured line, and a thin line filling towards
 * the next award with the two ends marked. Reaching an award turns the line silver and says so.
 */
function Lead({ s, celebrate, onHow }) {
  const next = s.nextAward
  const prev = s.currentAward
  const points = s.points
  const from = prev ? prev.points : 0
  const p = next ? Math.max(0, Math.min(1, (points - from) / (next.points - from))) : 1
  return (
    <section className={`record-hero card${celebrate ? ' is-won' : ''}`} aria-labelledby="record-lead-title" data-tone="award">
      <h2 id="record-lead-title" className="record-hero-status">
        {celebrate ? 'You reached Silver' : next ? <><Num>{next.points - points}</Num> more for {next.name}</> : 'Every award reached'}
      </h2>
      <p className="record-hero-fig"><Num wide className="record-hero-n">{points}</Num><span className="record-hero-unit">points</span></p>
      <span className="record-hero-bar" style={{ '--p': p }} aria-hidden="true"><i /></span>
      <span className="record-hero-ends" aria-hidden="true">
        <span>{prev && <>{prev.name} <Num>{from}</Num></>}</span>
        {next && <span>{next.name} <Num>{next.points}</Num></span>}
      </span>
      <p className="record-hero-note">
        {celebrate ? <>Well done, {student.firstName}. Gold is <Num>{next.points - points}</Num> points away.</>
          : <><Num>{s.merits}</Num> from merits, minus <Num>{s.demerits}</Num> from demerits.</>}
        {' '}<button type="button" className="text-link record-how" onClick={onHow} aria-haspopup="dialog">How points work</button>
      </p>
    </section>
  )
}

function Measures({ s }) {
  const total = s.attitude + s.skills + s.knowledge
  return (
    <Group title="Where your points come from">
      <li className="record-split" aria-hidden="true">
        {['attitude', 'skills', 'knowledge'].map((a) => <span key={a} className={`record-split-seg diamond--${a}`} style={{ '--len': s[a] / total }} />)}
      </li>
      {['attitude', 'skills', 'knowledge'].map((a) => (
        <Row
          key={a}
          lead={<MeritDiamond area={a} />}
          leadKind="diamond"
          title={areas[a].label}
          meta={areas[a].hint}
          trailing={<span className="record-num"><Num>{s[a]}</Num> points</span>}
        />
      ))}
    </Group>
  )
}

function Ladder({ s }) {
  const stops = [...awards.map((a) => ({ ...a, kind: 'award' })), { name: 'You', points: s.points, kind: 'you' }].sort((a, b) => a.points - b.points)
  return (
    <section aria-labelledby="record-awards" className="record-awards">
      <h2 id="record-awards" className="t-title-s">Awards</h2>
      <Rail label="Awards">
        {stops.map((st, i) => (
          <RailItem
            key={st.name}
            kind="marker"
            status={st.kind === 'you' ? 'now' : st.points <= s.points ? 'done' : 'later'}
            points={st.points}
            title={st.kind === 'you' ? 'You' : st.name}
            titleTag={st.kind === 'award' && st === s.nextAward ? 'Next award' : null}
            meta={st.kind === 'you' ? 'Your points this year' : st.points <= s.points ? 'Reached' : <><Num>{st.points - s.points}</Num> points to go</>}
            first={i === 0}
            last={i === stops.length - 1}
          />
        ))}
      </Rail>
    </section>
  )
}

function EntrySheet({ entry, onClose }) {
  return (
    <Sheet open={Boolean(entry)} onClose={onClose} title={entry?.type === 'demerit' ? 'Demerit' : 'Merit'}>
      {entry && (
        <div className="record-sheet">
          <p className="record-sheet-points">
            <Num wide className={entry.type === 'demerit' ? 'is-minus' : ''}>{entry.type === 'demerit' ? `−${entry.points}` : `+${entry.points}`}</Num>
            <span>{entry.type === 'demerit' ? 'demerit points' : 'merit points'}</span>
          </p>
          <h3 className="t-title-m">{entry.title}</h3>
          <ul className="list" role="list">
            <Row lead={<Icon name="user" />} leadKind="icon" title={entry.teacher} meta="Given by" />
            <Row lead={<Icon name="calendar" />} leadKind="icon" title={formatLongDate(isoToMs(entry.date))} meta="Date" />
            {entry.type === 'merit' && <Row lead={<MeritDiamond area={entry.area} />} leadKind="diamond" title={areas[entry.area].label} meta={areas[entry.area].hint} />}
          </ul>
          {entry.note && <p className="record-sheet-note">{entry.note}</p>}
          {entry.type === 'demerit' && (
            <p className="record-sheet-help">
              Think this is wrong? Talk to {entry.teacher} or your class teacher. <Link to="/handbook">Read the rules in the Handbook</Link>
            </p>
          )}
        </div>
      )}
    </Sheet>
  )
}

function HowSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="How points work">
      <div className="record-sheet">
        <p>Teachers give merits for good work and good behaviour. Each merit counts towards Attitude, Skills or Knowledge.</p>
        <p>Demerits take points away. Your points are your merits minus your demerits.</p>
        <ul className="list" role="list">
          {awards.map((a) => <Row key={a.name} lead={<Icon name="award" />} leadKind="icon" title={a.name} meta={<><Num>{a.points}</Num> points</>} />)}
        </ul>
        <p>Points start again each school year.</p>
      </div>
    </Sheet>
  )
}

export default function Record() {
  const { state, offline, retry, retrying, reconnect, reconnecting } = useDemo()
  const { query } = useRoute()
  const laptop = useLaptop()
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const [how, setHow] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const celebrate = query.get('award') === 'silver'
  // ?award=silver: the moment the student reaches Silver (302 points), the same figure everywhere on the screen
  const real = summary()
  const s = celebrate
    ? { ...real, points: 302, merits: real.merits + 21, toNext: 98, nextAward: awards.find((a) => a.name === 'Gold'), currentAward: awards.find((a) => a.name === 'Silver') }
    : real

  if (state === 'loading') {
    return (
      <Screen title="Record">
        <LoadingState label="Getting your record" onRetry={retry}><SkeletonRows count={6} lead="date" /></LoadingState>
      </Screen>
    )
  }
  if (state === 'empty') {
    return (
      <Screen title="Record">
        <EmptyState title="No points yet this year." action={<Button variant="secondary" onClick={() => setHow(true)}>How points work</Button>}>Merits from your teachers will show here.</EmptyState>
        <HowSheet open={how} onClose={() => setHow(false)} />
      </Screen>
    )
  }

  const shown = entries.filter((e) => filter === 'all' || (filter === 'merits' ? e.type === 'merit' : e.type === 'demerit'))
  const byMonth = []
  for (const e of shown) {
    const m = Number(e.date.slice(5, 7)) - 1
    const last = byMonth[byMonth.length - 1]
    if (last && last.m === m) last.items.push(e)
    else byMonth.push({ m, items: [e] })
  }

  const summaryCol = (
    <>
      <Lead s={s} celebrate={celebrate} onHow={() => setHow(true)} />
      <Measures s={s} />
      <Ladder s={s} />
    </>
  )
  const entriesCol = (
    <section aria-labelledby="record-entries" className="record-entries">
      <h2 id="record-entries" className="t-title-s">Entries</h2>
      <Segmented
        legend="Show"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'merits', label: 'Merits' },
          { value: 'demerits', label: 'Demerits' },
        ]}
      />
      {(showAll ? byMonth : byMonth.slice(0, 2)).map((g) => (
        <Group key={g.m} title={MONTHS[g.m]}>
          {g.items.map((e) => (
            <Row
              key={e.date + e.title}
              onClick={() => setOpen(e)}
              lead={<span className="lead-date"><Num wide className="t-time-l">{Number(e.date.slice(8))}</Num><span className="lead-date-label">{MONTH_SHORT[g.m]}</span></span>}
              leadKind="date"
              title={e.title}
              meta={e.type === 'merit' ? <span className="record-meta"><MeritDiamond area={e.area} />{areas[e.area].label}, {e.teacher}</span> : e.teacher}
              meta2={e.note || null}
              trailing={
                <span className={`record-delta${e.type === 'demerit' ? ' is-minus' : ''}`} aria-label={`${e.type === 'demerit' ? 'Demerit, minus' : 'Merit, plus'} ${e.points} points`}>
                  <Num wide>{e.type === 'demerit' ? `−${e.points}` : `+${e.points}`}</Num>
                </span>
              }
            />
          ))}
        </Group>
      ))}
      {!showAll && byMonth.length > 2 && (
        <Button variant="secondary" onClick={() => setShowAll(true)}>Show earlier entries</Button>
      )}
    </section>
  )

  return (
    <Screen title="Record">
      <div className="stack">
        {offline && <OfflineNotice what="your record" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && <ErrorState onRetry={retry} retrying={retrying}>Your record did not load. Check that you are online, then try again. Your record from <Num>{SAVED_AT}</Num> is below.</ErrorState>}
        {laptop ? (
          <div className="record-cols"><div>{summaryCol}</div><div>{entriesCol}</div></div>
        ) : (
          <>{summaryCol}{entriesCol}</>
        )}
      </div>
      <EntrySheet entry={open} onClose={() => setOpen(null)} />
      <HowSheet open={how} onClose={() => setHow(false)} />
    </Screen>
  )
}
