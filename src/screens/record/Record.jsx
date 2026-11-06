// Record: personal account totals, category breakdown and current award level.
import { useState } from 'react'
import { Screen, useDemo, useLaptop, SAVED_AT, Link } from '../../app'
import {
  Segmented, Row, Group, Num, Icon, Sheet, Button, MeritDiamond,
  SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice,
} from '../../ui'
import { entries, summary, areas } from '../../data/record.js'
import { formatLongDate, isoToMs } from '../../lib/time.js'
import './record.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Fitness-style summary, with progress only when a threshold is known. */
function Lead({ s, onHow }) {
  const next = s.nextAward
  const prev = s.currentAward
  const points = s.points
  const from = prev ? prev.points : 0
  const p = next ? Math.max(0, Math.min(1, (points - from) / (next.points - from))) : 0
  return (
    <section className="record-hero card" aria-labelledby="record-lead-title" data-tone="award" data-award={prev?.name.toLowerCase()}>
      <h2 id="record-lead-title" className="record-hero-status">
        {next ? <><Num>{next.points - points}</Num> more for {next.name}</> : 'Total'}
      </h2>
      <p className="record-hero-fig"><Num wide className="record-hero-n">{points}</Num><span className="record-hero-unit">points</span></p>
      {next && <span className="record-hero-bar" style={{ '--p': p }} aria-hidden="true"><i /></span>}
      <p className="record-hero-note">
        <Num>{s.merits}</Num> from merits, minus <Num>{s.demerits}</Num> from demerits.
        {' '}<button type="button" className="text-link record-how" onClick={onHow} aria-haspopup="dialog">How points work</button>
      </p>
    </section>
  )
}

function Measures({ s }) {
  const total = s.attitude + s.skills + s.knowledge
  return (
    <Group title="Merit points by area">
      <li className="record-split" aria-hidden="true">
        {['attitude', 'skills', 'knowledge'].map((a) => <span key={a} className={`record-split-seg diamond--${a}`} style={{ '--len': s[a] / total }} />)}
      </li>
      {['attitude', 'skills', 'knowledge'].map((a) => (
        <Row
          key={a}
          lead={<MeritDiamond area={a} />}
          leadKind="diamond"
          title={areas[a].label}
          trailing={<span className="record-num"><Num>{s[a]}</Num> points</span>}
        />
      ))}
    </Group>
  )
}

function Ladder({ s }) {
  return (
    <Group title="Current award" className="record-current-award">
      <Row
        lead={<span className="tile tile--award" data-award={s.currentAward.name.toLowerCase()}><Icon name="award" filled size={18} /></span>}
        leadKind="icon"
        title={`${s.currentAward.name} Award`}
      />
    </Group>
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
        <p>Award thresholds are not shown in this demo.</p>
        <p>Points start again each school year.</p>
      </div>
    </Sheet>
  )
}

export default function Record() {
  const { state, offline, retry, retrying, reconnect, reconnecting } = useDemo()
  const laptop = useLaptop()
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const [how, setHow] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const s = summary()

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
      <Lead s={s} onHow={() => setHow(true)} />
      <Measures s={s} />
      <Ladder s={s} />
    </>
  )
  const entriesCol = (
    <section aria-labelledby="record-entries" className="record-entries">
      <h2 id="record-entries" className="t-title-s">Entries</h2>
      {entries.length > 0 && <Segmented
        legend="Show"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'merits', label: 'Merits' },
          { value: 'demerits', label: 'Demerits' },
        ]}
      />}
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
      {!entries.length ? (
        <p className="t-faint settings-note">Individual RISE entries are hidden in this demo.</p>
      ) : !shown.length && (
        <div className="record-empty">
          <p>No {filter} yet.</p>
          <Button variant="secondary" onClick={() => setFilter('all')}>Show all</Button>
        </div>
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
