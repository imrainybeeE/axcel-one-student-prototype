// One chapter of the real Student Handbook, as a reading page: its tile and title, a jump list when it has several
// parts, then the text: headings, paragraphs, numbered and bulleted clauses, the school's pictures and tables.
// ?at=<id> opens it at that heading or clause (from search, or from elsewhere in the app) and pulses it once.
// Share in the bar copies a link to the chapter; each part's heading has its own link button, as the old handbook.
import { useEffect, useRef, useState } from 'react'
import { Screen, Link, useRoute, updateQuery, assetPath } from '../../app'
import { Group, Row, IconButton, useToast } from '../../ui'
import { chapters, rowId } from './handbookIndex.js'
import { ChapterTile } from './Handbook.jsx'
import './more.css'
import './help.css'

/** Copy text to the clipboard: the Clipboard API, else the old copy command. Resolves true when it worked. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.append(field)
    field.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    field.remove()
    return ok
  }
}

/** A table whose last column is marks (numbers only), set as a narrow right-aligned figure column. */
const numericLast = (b) => b.rows.length > 0 && b.rows.every((r) => r.length > 1 && /^[\d\s+−-]*$/.test(r[r.length - 1]))

const linkTo = (chapter, id) => `${window.location.origin}${window.location.pathname.replace(/\/handbook\/.*$/, '')}/handbook/${chapter}${id ? `?at=${id}` : ''}`

function Block({ b, chapter, onCopy, lift }) {
  const id = b.id ? `hb-${b.id}` : undefined
  if (b.t === 'h3') {
    return (
      <h3 id={id} className="hbk-h3">
        <span>{b.text}</span>
        <IconButton icon="share" size={16} label={`Copy link to ${b.text}`} className="hbk-link" onClick={() => onCopy(linkTo(chapter, b.id))} />
      </h3>
    )
  }
  // A chapter with no parts of its own goes straight to small headings: they stand one level under the title
  if (b.t === 'h4') {
    const H = lift ? 'h3' : 'h4'
    return (
      <H id={id} className="hbk-h4">
        <span>{b.text}</span>
        {b.id && <IconButton icon="share" size={16} label={`Copy link to ${b.text}`} className="hbk-link" onClick={() => onCopy(linkTo(chapter, b.id))} />}
      </H>
    )
  }
  if (b.t === 'clause') {
    return (
      <div id={id} className={`hbk-clause${b.num ? '' : ' is-bullet'}`} style={{ '--d': b.d || 1 }}>
        {/* As the old handbook: every clause has its own link. The number (or bullet) copies it */}
        {b.id ? (
          <button type="button" className="hbk-num" title="Copy link" aria-label={`Copy link to ${b.num ? `clause ${b.num.replace(/\.$/, '')}` : 'this point'}`} onClick={() => onCopy(linkTo(chapter, b.id))}>{b.num || '•'}</button>
        ) : <span className="hbk-num" aria-hidden={!b.num || undefined}>{b.num || '•'}</span>}
        <span className="hbk-ctext">{b.text}</span>
      </div>
    )
  }
  if (b.t === 'figure') {
    return (
      <figure id={id} className="hbk-fig">
        <img src={assetPath(`handbook/image-${String(b.img).padStart(2, '0')}.webp`)} alt={b.caption} loading="lazy" decoding="async" />
        <figcaption>{b.caption}</figcaption>
      </figure>
    )
  }
  if (b.t === 'table') {
    return (
      <div id={id} className={`hbk-table${numericLast(b) ? ' is-marks' : ''}`} data-scroll-x="" tabIndex={0} role="region" aria-label="Table">
        <table>
          {b.head?.length > 0 && <thead>{b.head.map((r, i) => <tr key={i}>{r.map((c, j) => <th key={j} scope="col">{c}</th>)}</tr>)}</thead>}
          <tbody>{b.rows.map((r, i) => <tr key={i} id={`hb-${rowId(b, i)}`}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    )
  }
  return <p id={id} className="hbk-p">{b.text}</p>
}

export default function HandbookTopic({ params }) {
  const heading = useRef(null)
  const toast = useToast()
  const { query } = useRoute()
  const [flash, setFlash] = useState(null)
  const i = chapters.findIndex((c) => c.id === params.id)
  const chapter = chapters[i]
  const at = query.get('at')

  // Opened at a part: scroll it under the bar, pulse it once, then drop ?at so Back and reloads do not repeat it
  useEffect(() => {
    if (!at || !chapter) return
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        const el = document.getElementById(`hb-${at}`)
        if (el) {
          const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
          el.scrollIntoView({ block: 'center', behavior: reduce ? 'instant' : 'smooth' })
          setFlash(at)
        }
        updateQuery({ at: null })
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [at, chapter])
  useEffect(() => {
    if (!flash) return
    const el = document.getElementById(`hb-${flash}`)
    el?.classList.add('is-flash')
    const t = setTimeout(() => { el?.classList.remove('is-flash'); setFlash(null) }, 1200)
    return () => clearTimeout(t)
  }, [flash])

  if (!chapter) {
    return (
      <Screen title="Handbook">
        <p className="hbk-p">This part is not in the handbook. <Link to="/handbook">See the contents</Link></p>
      </Screen>
    )
  }
  const copy = async (url) => toast.show({ message: (await copyText(url)) ? 'Link copied.' : 'Couldn’t copy the link.' })
  const next = chapters[i + 1]
  return (
    <Screen title={chapter.title.length > 15 ? 'Handbook' : chapter.title} heading={heading} action={
      <IconButton icon="share" label="Copy link to this part of the handbook" data-liquid="" data-liquid-bezel="12" data-liquid-strength="10" onClick={() => copy(linkTo(chapter.id))} />
    }>
      <article className="hbk" aria-labelledby="hb-title">
        <span className="hb-tile"><ChapterTile chapter={chapter} size={30} /></span>
        <h2 ref={heading} id="hb-title" className="hb-title">{chapter.title}</h2>
        {chapter.sections.length >= 3 && (
          <Group title="In this part" className="hbk-toc">
            {chapter.sections.map((s) => (
              <Row key={s.id} title={s.text} chevron onClick={() => updateQuery({ at: s.id })} />
            ))}
          </Group>
        )}
        <div className="hbk-body">
          {chapter.blocks.map((b, n) => <Block key={b.id || `b${n}`} b={b} chapter={chapter.id} onCopy={copy} lift={!chapter.sections.length} />)}
        </div>
      </article>
      {next && (
        <Group title="Next" className="hb-next">
          <Row to={`/handbook/${next.id}`} leadKind="icon" lead={<ChapterTile chapter={next} />} title={next.title} chevron />
        </Group>
      )}
    </Screen>
  )
}
