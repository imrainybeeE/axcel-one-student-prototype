// One handbook topic, as a Tips page: its tile, the text in short paragraphs, then the next topic.
// The bar's title waits until the page's own heading has scrolled under it, as Settings does. Next is a plain push.
import { useRef } from 'react'
import { Screen, Link } from '../../app'
import { Group, Row, Icon } from '../../ui'
import { TOPICS } from './handbook.js'
import './more.css'

function TopicTile({ topic, size }) {
  return <span className="tile" style={{ '--tile-bg': topic.tone }}><Icon name={topic.icon} filled size={size} /></span>
}

export default function HandbookTopic({ params }) {
  const heading = useRef(null)
  const i = TOPICS.findIndex((t) => t.id === params.id)
  const topic = TOPICS[i]
  if (!topic) {
    return (
      <Screen title="Handbook">
        <p className="hb-text">This topic is not in the handbook. <Link to="/handbook">See all topics</Link></p>
      </Screen>
    )
  }
  const next = TOPICS[(i + 1) % TOPICS.length]
  return (
    <Screen title={topic.title} heading={heading}>
      <article className="hb-article" aria-labelledby="hb-title">
        <p className="t-soft hb-note">Example guidance. Check the official handbook or ask a teacher.</p>
        <span className="hb-tile"><TopicTile topic={topic} size={30} /></span>
        <h2 ref={heading} id="hb-title" className="hb-title">{topic.title}</h2>
        {topic.body.map((p) => <p key={p} className="hb-text">{p}</p>)}
      </article>
      <Group title="Next" className="hb-next">
        <Row to={`/handbook/${next.id}`} leadKind="icon" lead={<TopicTile topic={next} size={18} />} title={next.title} chevron />
      </Group>
    </Screen>
  )
}
