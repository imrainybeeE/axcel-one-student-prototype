// Handbook, as Settings and Tips: search, then one list of topics with coloured tiles; each topic opens its own page.
// A search shows the topics that match, with the sentence that matched as the grey line.
import { useState } from 'react'
import { Screen } from '../../app'
import { SearchField, Group, Row, Icon, EmptyState } from '../../ui'
import { TOPICS } from './handbook.js'
import './more.css'

/** The first sentence that holds the search, for the grey line under a topic. */
function matchLine(t, q) {
  const needle = q.toLowerCase()
  return t.body.flatMap((p) => p.split(/(?<=\.)\s+/)).find((line) => line.toLowerCase().includes(needle)) || null
}

function TopicTile({ topic, size = 18 }) {
  return <span className="tile" style={{ '--tile-bg': topic.tone }}><Icon name={topic.icon} filled size={size} /></span>
}

export default function Handbook() {
  const [q, setQ] = useState('')
  const hits = TOPICS.filter((t) => !q || (t.title + ' ' + t.body.join(' ')).toLowerCase().includes(q.toLowerCase()))
  return (
    <Screen title="Handbook">
      <div className="stack">
        <SearchField label="Search the handbook" placeholder="Search the handbook" onSearch={setQ} />
        {hits.length ? (
          <Group label="Topics">
            {hits.map((t) => (
              <Row
                key={t.id}
                to={`/handbook/${t.id}`}
                zoom
                leadKind="icon"
                lead={<TopicTile topic={t} />}
                title={t.title}
                meta={q ? matchLine(t, q) : null}
                chevron
              />
            ))}
          </Group>
        ) : (
          <EmptyState title={`Nothing in the handbook matches ‘${q}’.`}>Try another word, or ask your class teacher.</EmptyState>
        )}
        <p className="more-foot">Secondary handbook, 2026</p>
      </div>
    </Screen>
  )
}
