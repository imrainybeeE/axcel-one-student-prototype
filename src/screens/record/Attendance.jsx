// Attendance for a term or a whole year: the percent, the day counts, and every school day on a calendar.
// The period picker opens a sheet listing each year's terms. URL: ?period=2026-2 (a term) or ?period=2026 (a year).
import { useState } from 'react'
import { Screen, useDemo, useRoute, updateQuery, SAVED_AT } from '../../app'
import { Group, Row, Num, Icon, Button, Sheet, Disclosure, SkeletonRows, LoadingState, ErrorState, OfflineNotice, MiniBar, MiniTile, useOutOfView } from '../../ui'
import { years, terms, termDays, summarise, period, currentTermId } from '../../data/attendance.js'
import { dayOfWeek, formatLongDate, isoToMs } from '../../lib/time.js'
import './record.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const STATUS = { present: 'Present', late: 'Late', absent: 'Absent', off: 'No school', later: 'Still to come' }

/** One month as a small calendar: Monday-first weeks, each school day a square in its status colour. */
function MonthGrid({ month, days }) {
  const [y, m] = month.split('-').map(Number)
  const lead = (dayOfWeek(`${month}-01`) + 6) % 7
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const byIso = new Map(days.map((d) => [d.iso, d]))
  const cells = [...Array(lead).fill(null)]
  for (let n = 1; n <= daysIn; n++) cells.push(`${month}-${String(n).padStart(2, '0')}`)
  const s = summarise(days)
  const said = [s.present && `${s.present} present`, s.late && `${s.late} late`, s.absent && `${s.absent} absent`].filter(Boolean).join(', ') || 'no school days yet'
  return (
    <figure className="att-month">
      <figcaption className="att-month-name">{MONTHS[m - 1]}</figcaption>
      <div className="att-month-grid" role="img" aria-label={`${MONTHS[m - 1]} ${y}: ${said}${s.absent ? `. Absent on ${days.filter((d) => d.status === 'absent').map((d) => Number(d.iso.slice(8))).join(', ')}` : ''}`}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="att-month-wd" aria-hidden="true">{d}</span>)}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`b${i}`} />
          const d = byIso.get(iso)
          const status = d ? d.status : 'outside'
          return <span key={iso} className={`att-cell is-${status}`} title={d && d.status !== 'weekend' ? `${Number(iso.slice(8))} ${MONTHS[m - 1]}: ${d.reason || STATUS[d.status]}` : undefined}>{Number(iso.slice(8))}</span>
        })}
      </div>
    </figure>
  )
}

export default function Attendance() {
  const { query } = useRoute()
  const { state, offline, retry, retrying, reconnect, reconnecting } = useDemo()
  const [picking, setPicking] = useState(false)
  const nowId = currentTermId()
  const ids = new Set([...terms.map((t) => t.id), ...years.map(String)])
  const p = period(ids.has(query.get('period')) ? query.get('period') : nowId)
  const days = p.terms.flatMap(termDays)
  const s = summarise(days)
  const isTerm = p.terms.length === 1
  const missed = days.filter((d) => d.status === 'absent' || d.status === 'late').reverse()
  // a term shows its own months; a year shows all twelve, the days outside its terms left plain
  const months = isTerm ? [...new Set(days.map((d) => d.iso.slice(0, 7)))] : Array.from({ length: 12 }, (_, i) => `${p.year}-${String(i + 1).padStart(2, '0')}`)
  const miniShown = useOutOfView(() => document.querySelector('.att-hero'), { enabled: state !== 'loading', key: p.id })
  const pick = (id) => { updateQuery({ period: id === nowId ? null : id }); setPicking(false) }

  if (state === 'loading') {
    return <Screen title="Attendance"><LoadingState label="Getting your attendance" onRetry={retry}><SkeletonRows count={5} lead="date" /></LoadingState></Screen>
  }

  return (
    <Screen title="Attendance">
      <div className="stack att-column">
        {offline && <OfflineNotice what="your attendance" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && <ErrorState onRetry={retry} retrying={retrying}>Your attendance did not load. Check that you are online, then try again. Your attendance from <Num>{SAVED_AT}</Num> is below.</ErrorState>}
        <section className="record-hero att-hero card" aria-labelledby="att-pc" data-tone="good">
          <h2 id="att-pc" className="vh">{p.label}</h2>
          <button type="button" className="att-pick" aria-haspopup="dialog" aria-label={`${p.label}. Choose a term or year`} onClick={() => setPicking(true)}>
            <span>{p.label}</span><Icon name="chevron-down" size={18} />
          </button>
          <p className="record-hero-fig att-fig"><Num wide className="record-hero-n">{s.days ? Math.round(s.percent) : '–'}</Num>{s.days > 0 && <span className="record-hero-unit">%</span>}</p>
          <p className="record-hero-note">
            {s.days ? <>In school <Num>{s.present + s.late}</Num> of <Num>{s.days}</Num> days{s.left ? <>, <Num>{s.left}</Num> to go</> : null}</> : 'No school days yet'}
          </p>
          {/* The period at a glance, as Health splits a total: present, late and absent in proportion */}
          <span className="att-split" aria-hidden="true">
            {[['present', s.present], ['late', s.late], ['absent', s.absent]].filter(([, n]) => n > 0).map(([k, n]) => <i key={k} className={`att-split-${k}`} style={{ '--len': n }} />)}
          </span>
        </section>
        <Group title={isTerm ? 'Days this term' : 'Days this year'}>
          <Row lead={<span className="tile tile--attendance"><Icon name="check" size={18} /></span>} leadKind="icon" title="Present" trailing={<span className="record-num"><Num>{s.present}</Num> days</span>} />
          <Row lead={<span className={`tile ${s.late ? 'tile--late' : 'tile--zero'}`}><Icon name="clock" size={18} /></span>} leadKind="icon" title="Late" trailing={<span className="record-num"><Num>{s.late}</Num> days</span>} />
          <Row lead={<span className={`tile ${s.absent ? 'tile--absent' : 'tile--zero'}`}><Icon name="close" size={18} /></span>} leadKind="icon" title="Absent" trailing={<span className="record-num"><Num>{s.absent}</Num> days</span>} />
        </Group>
        <div className="card att-how att-every">
          <Disclosure summary={isTerm ? 'Every day this term' : 'Every day this year'}>
            <div className="att-months">
              {months.map((mo) => <MonthGrid key={mo} month={mo} days={days.filter((d) => d.iso.startsWith(mo))} />)}
            </div>
            <p className="att-key" aria-hidden="true">
              <span><i className="att-cell is-present" />Present</span>
              <span><i className="att-cell is-late" />Late</span>
              <span><i className="att-cell is-absent" />Absent</span>
              <span><i className="att-cell is-off" />No school</span>
            </p>
          </Disclosure>
        </div>
        {/* Every absent or late day with its recorded reason, newest first, as the old My Attendance listed them */}
        <Group title="Absences and lates" className="att-abs">
          {missed.length ? missed.map((d) => (
            <Row
              key={d.iso}
              title={formatLongDate(isoToMs(d.iso))}
              meta={d.reason}
              trailing={<span className="att-abs-status"><i className={`att-cell is-${d.status}`} aria-hidden="true" />{STATUS[d.status]}</span>}
            />
          )) : <li className="att-abs-none">{isTerm ? 'No absences this term.' : 'No absences this year.'}</li>}
        </Group>
        <p className="t-faint settings-note att-abs-note">Medical certificates and planned absences still count as absent.</p>
        <div className="card att-how">
          <Disclosure summary="How absences are counted">
            <p>Every school day you are not in school counts as absent, whatever the reason. Lates count as present.</p>
          </Disclosure>
        </div>
        <p className="t-faint settings-note att-foot">Daily records in this demo are sample data.</p>
      </div>
      <Sheet open={picking} onClose={() => setPicking(false)} title="Show attendance for" trailing={<Button variant="plain" size="compact" onClick={() => setPicking(false)}>Done</Button>}>
        <div className="att-sheet">
          {years.map((y) => (
            <Group key={y} title={String(y)}>
              {[String(y), ...terms.filter((t) => t.year === y).map((t) => t.id).reverse()].map((id) => {
                const q = period(id)
                const qs = summarise(q.terms.flatMap(termDays))
                const on = id === p.id
                return (
                  <Row
                    key={id}
                    onClick={() => pick(id)}
                    aria-current={on || undefined}
                    title={q.terms.length === 1 ? q.name : 'Whole year'}
                    meta={qs.days ? `${Math.round(qs.percent)}% in school, ${qs.days} days` : 'Not started'}
                    trailing={on ? <Icon name="check" size={20} className="att-sheet-on" /> : null}
                  />
                )
              })}
            </Group>
          ))}
        </div>
      </Sheet>
      <MiniBar
        shown={miniShown}
        onOpen={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        label={`${p.label} attendance, ${Math.round(s.percent)}%, in school ${s.present + s.late} of ${s.days} days. Show the summary`}
        tile={<MiniTile tone="#2F9E45" value={<Num wide>{Math.round(s.percent)}</Num>} unit="%" />}
        title={`${p.label} attendance`}
        sub={<>In school <Num>{s.present + s.late}</Num> of <Num>{s.days}</Num> days</>}
      />
    </Screen>
  )
}
