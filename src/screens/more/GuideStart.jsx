// Getting started, as Apple's welcome screens: a big title, then each part of the app as its tile beside a bold
// line, a sentence or two and a link there. The bar's title waits until the page's own heading has scrolled under it.
import { useRef } from 'react'
import { Screen, Link } from '../../app'
import { Group, Row, Icon } from '../../ui'
import { GUIDE_SECTIONS } from './guideStart.js'
import './more.css'
import './help.css'

export default function GuideStart() {
  const heading = useRef(null)
  return (
    <Screen title="Getting started" heading={heading}>
      <article className="gs" aria-labelledby="gs-title">
        <h2 ref={heading} id="gs-title" className="gs-title">Getting started with Axcel One</h2>
        {GUIDE_SECTIONS.map((s) => (
          <section key={s.id} className="gs-part" aria-labelledby={`gs-${s.id}`}>
            <span className="tile gs-tile" style={{ '--tile-bg': s.tone }} aria-hidden="true"><Icon name={s.icon} filled size={22} /></span>
            <div className="gs-body">
              <h3 id={`gs-${s.id}`} className="gs-head">{s.title}</h3>
              <p className="gs-text">{s.text}</p>
              <Link to={s.to} className="text-link gs-open">{s.open}</Link>
            </div>
          </section>
        ))}
      </article>
      <Group title="Still stuck?" className="gs-more">
        <Row to="/handbook" leadKind="icon" lead={<span className="tile tile--book"><Icon name="book" filled size={18} /></span>} title="Handbook" chevron />
        <Row to="/report" leadKind="icon" lead={<span className="tile tile--report"><Icon name="flag" filled size={18} /></span>} title="Report a problem" chevron />
      </Group>
    </Screen>
  )
}
