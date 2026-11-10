// Handbook: the school's real Student Handbook. Search finds any words in it; without a search, the official PDF,
// then the chapters as Settings rows with coloured tiles. A result opens its chapter at that clause.
import { useState } from 'react'
import { Screen, assetPath } from '../../app'
import { SearchField, Group, Row, Icon, EmptyState } from '../../ui'
import { chapters, handbook, searchHandbook } from './handbookIndex.js'
import './more.css'
import './help.css'

export function ChapterTile({ chapter, size = 18 }) {
  return <span className="tile" style={{ '--tile-bg': chapter.tone }}><Icon name={chapter.icon} filled size={size} /></span>
}

export default function Handbook() {
  const [q, setQ] = useState('')
  const needle = q.trim()
  const hits = needle ? searchHandbook(needle) : []
  return (
    <Screen title="Handbook">
      <div className="stack">
        <SearchField label="Search the handbook" placeholder="Search the handbook" onSearch={setQ} />
        {!needle ? (
          <>
            <Group label="Official handbook">
              <Row
                onClick={() => window.open(assetPath(handbook.pdf), '_blank', 'noopener')}
                leadKind="icon"
                lead={<span className="tile tile--book"><Icon name="doc" size={18} /></span>}
                title="Student Handbook"
                meta={`${handbook.version}, PDF, 5.9 MB`}
                trailing={<Icon name="arrow-up-right" size={20} className="guide-out" />}
              />
            </Group>
            <Group title="Contents">
              {chapters.map((c) => (
                <Row
                  key={c.id}
                  to={`/handbook/${c.id}`}
                  zoom
                  leadKind="icon"
                  lead={<ChapterTile chapter={c} />}
                  title={c.title}
                  meta={c.sections.length >= 3 ? `${c.sections.length} parts` : null}
                  chevron
                />
              ))}
            </Group>
          </>
        ) : hits.length ? (
          <Group title={hits.length >= 40 ? 'First 40 matches' : `${hits.length} ${hits.length === 1 ? 'match' : 'matches'}`}>
            {hits.map((h, i) => (
              <Row
                key={`${h.chapter.id}-${h.id || i}-${i}`}
                to={`/handbook/${h.chapter.id}${h.id ? `?at=${h.id}` : ''}`}
                leadKind="icon"
                lead={<ChapterTile chapter={h.chapter} />}
                title={h.heading || h.chapter.title}
                meta={<span className="clamp-2">{h.snippet}</span>}
                chevron
              />
            ))}
          </Group>
        ) : (
          <EmptyState title={`Nothing in the handbook matches ‘${needle}’.`}>Try another word, or ask your class teacher.</EmptyState>
        )}
      </div>
    </Screen>
  )
}
