// Public prototype shows aggregate attendance only; daily dates and absence reasons stay private.
import { Screen, useDemo, SAVED_AT } from '../../app'
import { Group, Row, Num, Icon, Disclosure, SkeletonRows, LoadingState, ErrorState, OfflineNotice } from '../../ui'
import { attendanceSummary, term } from '../../data/attendance.js'
import './record.css'

export default function Attendance() {
  const { state, offline, retry, retrying, reconnect, reconnecting } = useDemo()
  const s = attendanceSummary()

  if (state === 'loading') {
    return <Screen title="Attendance"><LoadingState label="Getting your attendance" onRetry={retry}><SkeletonRows count={5} lead="date" /></LoadingState></Screen>
  }

  return (
    <Screen title="Attendance">
      <div className="stack att-column">
        {offline && <OfflineNotice what="your attendance" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && <ErrorState onRetry={retry} retrying={retrying}>Your attendance did not load. Check that you are online, then try again. Your attendance from <Num>{SAVED_AT}</Num> is below.</ErrorState>}
        <section className="record-hero att-hero card" aria-labelledby="att-pc" data-tone="good">
          <h2 id="att-pc" className="record-hero-status">In school <Num>{s.present + s.late}</Num> of <Num>{s.days}</Num> days in {term.name}</h2>
          <p className="record-hero-fig"><Num wide className="record-hero-n">{Math.round(s.percent)}</Num><span className="record-hero-unit">%</span></p>

        </section>
        <Group title="Days this term">
          <Row lead={<Icon name="check" />} leadKind="icon" title="Present" trailing={<span className="record-num"><Num>{s.present}</Num> days</span>} />
          <Row lead={<Icon name="clock" />} leadKind="icon" title="Late" trailing={<span className="record-num"><Num>{s.late}</Num> days</span>} />
          <Row lead={<Icon name="close" />} leadKind="icon" title="Absent" trailing={<span className="record-num"><Num>{s.absent}</Num> days</span>} />
        </Group>
        <Disclosure summary="How absences are counted">
          <p>Every day you are not in school counts as absent, including days with a medical certificate or a planned absence. Lates count as present.</p>
        </Disclosure>
        <p className="att-note card">Daily attendance details are hidden in this demo.</p>
      </div>
    </Screen>
  )
}
