// Public prototype shows aggregate attendance only; daily dates and absence reasons stay private.
import { Screen, useDemo, SAVED_AT } from '../../app'
import { Group, Row, Num, Icon, Disclosure, SkeletonRows, LoadingState, ErrorState, OfflineNotice, MiniBar, MiniTile, useOutOfView } from '../../ui'
import { attendanceSummary, term } from '../../data/attendance.js'
import './record.css'

export default function Attendance() {
  const { state, offline, retry, retrying, reconnect, reconnecting } = useDemo()
  const s = attendanceSummary()
  const miniShown = useOutOfView(() => document.querySelector('.att-hero'), { enabled: state !== 'loading' })

  if (state === 'loading') {
    return <Screen title="Attendance"><LoadingState label="Getting your attendance" onRetry={retry}><SkeletonRows count={5} lead="date" /></LoadingState></Screen>
  }

  return (
    <Screen title="Attendance">
      <div className="stack att-column">
        {offline && <OfflineNotice what="your attendance" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && <ErrorState onRetry={retry} retrying={retrying}>Your attendance did not load. Check that you are online, then try again. Your attendance from <Num>{SAVED_AT}</Num> is below.</ErrorState>}
        <section className="record-hero att-hero card" aria-labelledby="att-pc" data-tone="good">
          <h2 id="att-pc" className="record-hero-status att-status-line">{term.name}</h2>
          <p className="record-hero-fig att-fig"><Num wide className="record-hero-n">{Math.round(s.percent)}</Num><span className="record-hero-unit">%</span></p>
          <p className="record-hero-note">In school <Num>{s.present + s.late}</Num> of <Num>{s.days}</Num> days</p>
          {/* The term at a glance, as Health splits a total: present, late and absent in proportion */}
          <span className="att-split" aria-hidden="true">
            {[['present', s.present], ['late', s.late], ['absent', s.absent]].filter(([, n]) => n > 0).map(([k, n]) => <i key={k} className={`att-split-${k}`} style={{ '--len': n }} />)}
          </span>
        </section>
        <Group title="Days this term">
          <Row lead={<span className="tile tile--attendance"><Icon name="check" size={18} /></span>} leadKind="icon" title="Present" trailing={<span className="record-num"><Num>{s.present}</Num> days</span>} />
          <Row lead={<span className={`tile ${s.late ? 'tile--late' : 'tile--zero'}`}><Icon name="clock" size={18} /></span>} leadKind="icon" title="Late" trailing={<span className="record-num"><Num>{s.late}</Num> days</span>} />
          <Row lead={<span className={`tile ${s.absent ? 'tile--absent' : 'tile--zero'}`}><Icon name="close" size={18} /></span>} leadKind="icon" title="Absent" trailing={<span className="record-num"><Num>{s.absent}</Num> days</span>} />
        </Group>
        <div className="card att-how">
          <Disclosure summary="How absences are counted">
            <p>Every day you are not in school counts as absent, including days with a medical certificate or a planned absence. Lates count as present.</p>
          </Disclosure>
        </div>
        <p className="t-faint settings-note att-foot">Daily attendance details are hidden in this demo.</p>
      </div>
      <MiniBar
        shown={miniShown}
        onOpen={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        label={`${term.name} attendance, ${Math.round(s.percent)}%, in school ${s.present + s.late} of ${s.days} days. Show the summary`}
        tile={<MiniTile tone="#2F9E45" value={<Num wide>{Math.round(s.percent)}</Num>} unit="%" />}
        title={`${term.name} attendance`}
        sub={<>In school <Num>{s.present + s.late}</Num> of <Num>{s.days}</Num> days</>}
      />
    </Screen>
  )
}
