// Handbook, as Settings and Tips: search, then one list of topics with coloured tiles; each topic opens its own page.
// A search shows the topics that match, with the sentence that matched as the grey line.
import { useState } from 'react'
import { Screen } from '../../app'
import { SearchField, Group, Row, Icon, EmptyState, useToast } from '../../ui'
import { TOPICS } from './handbook.js'
import './more.css'
import './help.css'

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
  const toast = useToast()
  const hits = TOPICS.filter((t) => !q || (t.title + ' ' + t.body.join(' ')).toLowerCase().includes(q.toLowerCase()))
  return (
    <Screen title="Handbook">
      <div className="stack">
        {/* The school's own PDF lives in its app; the outward arrow says it leaves this one */}
        <Group label="Official handbook">
          <Row
            onClick={() => toast.show({ message: 'Opens the school’s PDF. Not in this demo.' })}
            leadKind="icon"
            lead={<span className="tile tile--book"><Icon name="doc" size={18} /></span>}
            title="Official handbook"
            meta="Secondary 2026, PDF"
            trailing={<Icon name="arrow-up-right" size={20} className="guide-out" />}
          />
        </Group>
        <SearchField label="Search the handbook" placeholder="Search the handbook" onSearch={setQ} />
        {hits.length ? (
          <div>
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
            <p className="settings-note t-faint">Example guidance. Check the official handbook or ask a teacher.</p>
          </div>
        ) : (
          <EmptyState title={`Nothing in the handbook matches ‘${q}’.`}>Try another word, or ask your class teacher.</EmptyState>
        )}
      </div>
    </Screen>
  )
}
