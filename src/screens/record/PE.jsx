// PE results: the PE Checkpoint tests taken each term, as the old My PE results listed them. One group a term,
// newest first; each test's score is the row's figure, with how it moved since the term before.
import { Screen, useDemo } from '../../app'
import { Group, Row, Num, EmptyState, LoadingState, SkeletonRows } from '../../ui'
import { results } from '../../data/pe.js'
import './record.css'

/** "Up 2 from Term 1", "Down 1 from Term 1", "Same as Term 1", or nothing for the first time a test was taken. */
function change(test, before) {
  const was = before?.tests.find((t) => t.name === test.name)
  if (!was) return before ? `Not taken in ${before.term}` : 'First time taken'
  const d = Math.round((test.score - was.score) * 10) / 10
  if (!d) return `Same as ${before.term}`
  return `${d > 0 ? 'Up' : 'Down'} ${Math.abs(d)} from ${before.term}`
}

export default function PE() {
  const { state, retry } = useDemo()
  if (state === 'loading') {
    return <Screen title="PE results"><LoadingState label="Getting your PE results" onRetry={retry}><SkeletonRows count={4} /></LoadingState></Screen>
  }
  const list = state === 'empty' ? [] : results
  return (
    <Screen title="PE results">
      <div className="stack att-column">
        {list.length ? (
          <>
            <p className="pe-intro">Your PE Checkpoint results each term.</p>
            {list.map((r, i) => (
              <Group key={r.id} title={`${r.term}, ${r.year}`}>
                {r.tests.map((t) => (
                  <Row
                    key={t.name}
                    title={t.name}
                    meta={change(t, list[i + 1])}
                    trailing={<span className="record-num"><Num>{t.score}</Num> {t.unit}</span>}
                  />
                ))}
              </Group>
            ))}
          </>
        ) : (
          <EmptyState title="No PE results yet">Your PE Checkpoint results show here after each term's test.</EmptyState>
        )}
      </div>
    </Screen>
  )
}
