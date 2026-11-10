// User guides, as the Tips app: one card on top for the in-app Getting started guide, then the school's own guides.
// The school's guides are files in its own app, not in this demo: their rows say so in a toast, and carry an
// outward arrow instead of a chevron, so they never promise a page here.
import { Screen, Link } from '../../app'
import { Group, Row, Icon, useToast } from '../../ui'
import { GUIDE_SECTIONS } from './guideStart.js'
import './more.css'
import './help.css'

const FILES = [
  { id: 'calendar', title: 'School Calendar guide', meta: 'PDF, 2.0 MB', icon: 'doc' },
  { id: 'rise', title: 'RISE for students', meta: 'Slides, 638 KB', icon: 'slides' },
  { id: 'perfect7', title: 'PERFECT 7 Framework', meta: 'For Years 10 and 11', icon: 'doc' },
  { id: 'perfect7-quick', title: 'PERFECT 7 Quick Guide', meta: 'For Years 10 and 11', icon: 'doc' },
]

export default function Guides() {
  const toast = useToast()
  const open = () => toast.show({ message: 'Opens in the school’s app. Not in this demo.' })
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
              onClick={open}
              leadKind="icon"
              lead={<Icon name={f.icon} />}
              title={f.title}
              meta={f.meta}
              trailing={<Icon name="arrow-up-right" size={20} className="guide-out" />}
            />
          ))}
        </Group>
        <p className="settings-note t-faint">From the school. They open in the school’s own app.</p>
      </div>
    </Screen>
  )
}
