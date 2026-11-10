// User guides, as the Tips app: one card on top for the in-app Getting started guide, then the school's own guides.
// The school's guides live in its own Axcel One: their rows open it in a new tab, where you are signed in, and carry an
// outward arrow instead of a chevron, so they never promise a page here.
import { Screen, Link } from '../../app'
import { Group, Row, Icon } from '../../ui'
import { GUIDE_SECTIONS } from './guideStart.js'
import './more.css'
import './help.css'

const FILES = [
  { id: 'calendar', title: 'School Calendar guide', meta: 'PDF, 2.0 MB', icon: 'doc', href: 'https://one.axcel.edu.my/resources' },
  { id: 'rise', title: 'RISE for students', meta: 'Slides, 638 KB', icon: 'slides', href: 'https://one.axcel.edu.my/resources' },
  { id: 'perfect7', title: 'PERFECT 7 Framework', meta: 'For Years 10 and 11', icon: 'doc', href: 'https://one.axcel.edu.my/resources/perfect7' },
  { id: 'perfect7-quick', title: 'PERFECT 7 Quick Guide', meta: 'For Years 10 and 11', icon: 'doc', href: 'https://one.axcel.edu.my/resources/perfect7-guide' },
]

export default function Guides() {
  // Each guide opens in the school's Axcel One, where you are signed in
  const open = (g) => window.open(g.href, '_blank', 'noopener,noreferrer')
  return (
    <Screen title="User guides">
      <div className="stack">
        <Link to="/guides/start" zoom className="guide-hero card card-link">
          {/* What the guide covers, as a row of the app's own tiles */}
          <span className="guide-hero-tiles" aria-hidden="true">
            {GUIDE_SECTIONS.map((s) => (
              <span key={s.id} className="tile" style={{ '--tile-bg': s.tone }}><Icon name={s.icon} filled size={18} /></span>
            ))}
          </span>
          <span className="guide-hero-text">
            <span className="guide-hero-title">Getting started with Axcel One</span>
            <span className="guide-hero-sub">{GUIDE_SECTIONS.length} short sections, about 3 minutes</span>
          </span>
          <Icon name="chevron-right" size={20} className="row-chevron guide-hero-chevron" />
        </Link>
        <Group title="Guides">
          {FILES.map((f) => (
            <Row
              key={f.id}
              onClick={() => open(f)}
              leadKind="icon"
              lead={<Icon name={f.icon} />}
              title={f.title}
              meta={f.meta}
              trailing={<Icon name="arrow-up-right" size={20} className="guide-out" />}
            />
          ))}
        </Group>
        <p className="settings-note t-faint">From the school. They open in Axcel One in a new tab.</p>
      </div>
    </Screen>
  )
}
