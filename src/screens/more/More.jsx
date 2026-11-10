// More, as iOS Settings: a profile card, then grouped rows with coloured icon tiles, and Sign out on its own in red.
// The laptop sidebar lists the same rows in the same order.
import { Screen, Link } from '../../app'
import { Group, Row, Icon, Num } from '../../ui'
import { useProfilePhoto } from './profilePhoto.js'
import { summary } from '../../data/record.js'
import { attendanceSummary } from '../../data/attendance.js'
import { student } from '../../data/student.js'
import './more.css'
import './help.css'

export default function More() {
  const r = summary()
  const a = attendanceSummary()
  const photo = useProfilePhoto()
  return (
    <Screen title="More" className="screen-more">
      <div className="stack">
        {/* The profile card opens Account, as the Apple Account card tops Settings */}
        <Link to="/account" className="more-me card card-link" aria-label={`${student.fullName}, ${student.className}, ${student.house} House, ${student.studentId}. Account`}>
          {photo
            ? <img className="more-me-avatar more-me-photo" src={photo} alt="" width="60" height="60" />
            : <span className="more-me-avatar" aria-hidden="true">{student.initials}</span>}
          <span className="more-me-text">
            <span className="more-me-name">{student.fullName}</span>
            <span className="more-me-sub">{student.className}, {student.house} House, {student.studentId}</span>
          </span>
          <Icon name="chevron-right" size={20} className="row-chevron more-me-chevron" />
        </Link>
        <Group title="Your school year">
          <Row to="/record" zoom lead={<span className="tile tile--record"><Icon name="award" filled size={18} /></span>} leadKind="icon" title="Record" trailing={r.nextAward ? <span><Num>{r.toNext}</Num> to {r.nextAward.name}</span> : null} chevron />
          <Row to="/attendance" zoom lead={<span className="tile tile--attendance"><Icon name="check" size={18} /></span>} leadKind="icon" title="Attendance" trailing={<Num>{`${Math.round(a.percent)}%`}</Num>} chevron />
          <Row to="/pe" lead={<span className="tile tile--pe"><Icon name="figure-run" filled size={18} /></span>} leadKind="icon" title="PE results" chevron />
        </Group>
        <Group title="Help">
          <Row to="/handbook" lead={<span className="tile tile--book"><Icon name="book" filled size={18} /></span>} leadKind="icon" title="Handbook" chevron />
          <Row to="/guides" lead={<span className="tile tile--guides"><Icon name="lightbulb" filled size={18} /></span>} leadKind="icon" title="User guides" chevron />
          <Row to="/report" lead={<span className="tile tile--report"><Icon name="flag" filled size={18} /></span>} leadKind="icon" title="Report a problem" chevron />
        </Group>
        <Group label="App" className="more-settings">
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
