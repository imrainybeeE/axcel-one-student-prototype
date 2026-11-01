// Attendance: the percentage and what it means first, the term at a glance, then absences with reasons.
// Codes never appear; statuses are words with icons, and the term grid marks absences with a cross, not colour alone.
import { Screen, useDemo, SAVED_AT } from '../../app'
import { Group, Row, Num, Icon, Disclosure, SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice } from '../../ui'
import { schoolDays, attendanceSummary, term } from '../../data/attendance.js'
import { formatLongDate, isoToMs, dayOfWeek, addDays } from '../../lib/time.js'
import './record.css'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** The term as a compact grid: one column per school week, Monday to Friday top to bottom. */
function TermGrid({ days }) {
  const byDate = new Map(days.map((d) => [d.date, d]))
  const first = days[0].date
  const last = days[days.length - 1].date
  const monday = addDays(first, 1 - dayOfWeek(first))
  const weeks = []
  for (let w = monday; w <= last; w = addDays(w, 7)) {
    weeks.push([0, 1, 2, 3, 4].map((n) => {
      const iso = addDays(w, n)
      const d = byDate.get(iso)
      return { iso, status: d ? d.status : iso > last || iso < first ? 'none' : 'off', today: iso === last }
    }))
  }
  const absent = days.filter((d) => d.status === 'absent')
  return (
    <section aria-labelledby="att-term">
      <h2 id="att-term" className="att-term-head">{term.name} at a glance</h2>
      <div className="att-term" style={{ '--weeks': weeks.length }} role="img"
        aria-label={`${days.length} school days so far. Absent on ${absent.map((d) => formatLongDate(isoToMs(d.date))).join(', ')}.`}>
        {['M', 'T', 'W', 'T', 'F'].map((l, i) => <span key={i} className="att-row-label" aria-hidden="true">{l}</span>)}
        {weeks.flat().map((c) => (
          <span key={c.iso} className={`att-day is-${c.status}${c.today ? ' is-today' : ''}`}>{c.status === 'absent' && <Icon name="close" size={12} />}</span>
        ))}
      </div>
      <p className="att-key" aria-hidden="true">
        <span><i className="att-day is-present" />In school</span>
        <span><i className="att-day is-absent" />Absent</span>
        <span><i className="att-day is-off" />No school</span>
      </p>
    </section>
  )
}

/** Mon to Fri of the week that holds iso, each marked present, late, absent or still to come. */
function weekOf(days, iso) {
  const byDate = new Map(days.map((d) => [d.date, d.status]))
  const monday = addDays(iso, 1 - dayOfWeek(iso))
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name, n) => {
    const day = addDays(monday, n)
    return { name, iso: day, status: byDate.get(day) || (day >= iso ? 'later' : 'none') }
  })
}

export default function Attendance() {
  const { state, offline, retry, retrying, reconnect, reconnecting, today } = useDemo()
  const days = schoolDays()
  const s = attendanceSummary(days)
  const missed = days.filter((d) => d.status !== 'present')

  if (state === 'loading') {
    return <Screen title="Attendance"><LoadingState label="Getting your attendance" onRetry={retry}><SkeletonRows count={5} lead="date" /></LoadingState></Screen>
  }

  return (
    <Screen title="Attendance">
      <div className="stack">
        {offline && <OfflineNotice what="your attendance" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && <ErrorState onRetry={retry} retrying={retrying}>Your attendance did not load. Check that you are online, then try again. Your attendance from <Num>{SAVED_AT}</Num> is below.</ErrorState>}
        <section className="record-hero att-hero card" aria-labelledby="att-pc" data-tone="good">
          <h2 id="att-pc" className="record-hero-status">In school <Num>{s.present + s.late}</Num> of <Num>{s.days}</Num> days this term</h2>
          <p className="record-hero-fig"><Num wide className="record-hero-n">{Math.round(s.percent)}</Num><span className="record-hero-unit">%</span></p>
          <span className="att-week" role="img" aria-label={`This week: ${weekOf(days, today).filter((d) => d.status === 'present').length} days in school so far`}>
            {weekOf(days, today).map((d) => (
              <span key={d.iso} className="att-week-day" data-status={d.status} data-today={d.iso === today || undefined}><i />{d.name}</span>
            ))}
          </span>
        </section>
        <Group title="Days this term">
          <Row lead={<Icon name="check" />} leadKind="icon" title="Present" trailing={<span className="record-num"><Num>{s.present}</Num> days</span>} />
          <Row lead={<Icon name="clock" />} leadKind="icon" title="Late" trailing={<span className="record-num"><Num>{s.late}</Num> days</span>} />
          <Row lead={<Icon name="close" />} leadKind="icon" title="Absent" trailing={<span className="record-num"><Num>{s.absent}</Num> days</span>} />
        </Group>
        <TermGrid days={days} />
        <Disclosure summary="How absences are counted">
          <p>Every day you are not in school counts as absent, including days with a medical certificate or a planned absence. Lates count as present.</p>
        </Disclosure>
        {state === 'empty' || !missed.length ? (
          <EmptyState title="No absences or lates this term.">Days you miss will show here with the reason.</EmptyState>
        ) : (
          <Group title="Days missed">
            {missed.map((d) => (
              <Row
                key={d.date}
                lead={<span className="lead-date"><Num wide className="t-time-l">{Number(d.date.slice(8))}</Num><span className="lead-date-label">{MONTH_SHORT[Number(d.date.slice(5, 7)) - 1]}</span></span>}
                leadKind="date"
                title={<span className="att-status"><Icon name={d.status === 'late' ? 'clock' : 'close'} size={20} />{d.status === 'late' ? 'Late' : 'Absent'}</span>}
                meta={d.reason}
              />
            ))}
          </Group>
        )}
        <p className="att-help">Think a mark is wrong? Ask your class teacher.</p>
      </div>
    </Screen>
  )
}
