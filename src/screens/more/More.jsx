// More, as iOS Settings: a profile card, then grouped rows with coloured icon tiles, and Sign out on its own in red.
// The laptop sidebar lists the same rows in the same order.
import { Screen } from '../../app'
import { Group, Row, Icon, Num } from '../../ui'
import { summary } from '../../data/record.js'
import { attendanceSummary } from '../../data/attendance.js'
import { student } from '../../data/student.js'
import './more.css'

export default function More() {
  const r = summary()
  const a = attendanceSummary()
  return (
    <Screen title="More" className="screen-more">
      <div className="stack">
        <section className="more-me card" aria-label="Signed in">
          <span className="more-me-avatar" aria-hidden="true">{student.initials}</span>
          <span className="more-me-text">
            <span className="more-me-name">{student.fullName}</span>
            <span className="more-me-sub">{student.className}, {student.house} House, {student.studentId}</span>
          </span>
        </section>
        <Group title="Your school year">
          <Row to="/record" zoom lead={<span className="tile tile--award"><Icon name="award" filled size={18} /></span>} leadKind="icon" title="Record" trailing={r.nextAward ? <span><Num>{r.toNext}</Num> to {r.nextAward.name}</span> : null} chevron />
          <Row to="/attendance" zoom lead={<span className="tile tile--attendance"><Icon name="check-circle" filled size={18} /></span>} leadKind="icon" title="Attendance" trailing={<Num>{`${Math.round(a.percent)}%`}</Num>} chevron />
        </Group>
        <Group title="Help">
          <Row to="/handbook" lead={<span className="tile tile--book"><Icon name="book" filled size={18} /></span>} leadKind="icon" title="Handbook" chevron />
          <Row to="/report" lead={<span className="tile tile--flag"><Icon name="flag" filled size={18} /></span>} leadKind="icon" title="Report a problem" chevron />
        </Group>
        <Group label="App">
          <Row to="/settings" lead={<span className="tile tile--gear"><Icon name="gear" filled size={18} /></span>} leadKind="icon" title="Settings" chevron />
        </Group>
        {/* Destructive, so on its own and in red, as Settings sets Sign Out */}
        <Group label="Sign out">
          <Row to="/sign-in" className="row--destructive" title="Sign out" />
        </Group>
        <p className="more-foot">Axcel One, version 2.0</p>
      </div>
    </Screen>
  )
}
