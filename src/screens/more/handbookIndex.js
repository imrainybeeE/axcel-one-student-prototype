// The real handbook's chapters with their tiles, and search over every heading, paragraph, clause, caption and table.
import { handbook } from '../../data/handbook.js'

const TILES = {
  contact: ['clock', '#0062C4'], 'welcoming-address': ['messages', '#2F9E45'], foreword: ['book', '#5856D6'],
  'ask-vision-and-mission': ['award', '#E8920C'], 'the-axcel-curricula': ['book', '#00756E'], 'a-school-of-character': ['shield', '#00756E'],
  'rules-and-regulations': ['flag', '#E5483D'], 'merit-and-demerit-system': ['award', '#E8920C'], 'hand-phone-policy': ['bell-off', '#8E8E93'],
  'school-locker-rules': ['door', '#8E8E93'], 'health-room': ['plus-circle', '#E5483D'], 'school-fees': ['pen', '#0062C4'],
  'student-identification-card': ['person-cover', '#5856D6'], visitors: ['user', '#8E8E93'],
}

export const chapters = handbook.chapters.map((c) => {
  const [icon, tone] = TILES[c.id] || ['book', '#5856D6']
  // Every table gets an anchor, and each of its rows one under it, so search and links can land on a row
  const blocks = c.blocks.map((b, n) => (b.t === 'table' && !b.id ? { ...b, id: `${c.id}-table-${n}` } : b))
  return { ...c, blocks, icon, tone, sections: blocks.filter((b) => b.t === 'h3') }
})
export const rowId = (table, i) => `${table.id}-r${i + 1}`

/** The text of a block, for search and snippets. */
export function blockText(b) {
  if (b.t === 'figure') return b.caption || ''
  if (b.t === 'table') return [...(b.head || []), ...(b.rows || [])].flat().join(', ')
  return [b.num, b.text].filter(Boolean).join(' ')
}

/** Every block that holds the words, as { chapter, block, heading, snippet }; at most `limit`. */
export function searchHandbook(q, limit = 40) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const out = []
  for (const c of chapters) {
    let heading = null
    let anchor = null
    for (const b of c.blocks) {
      if (b.t === 'h3' || b.t === 'h4') { heading = b.text; anchor = b.id }
      // A table is searched row by row, and a hit lands on its row
      const parts = b.t === 'table' ? b.rows.map((r, i) => ({ text: r.join(', '), id: rowId(b, i) })) : [{ text: blockText(b), id: b.id || anchor }]
      for (const part of parts) {
        const text = part.text
        const low = text.toLowerCase()
        if (!words.every((w) => low.includes(w) || c.title.toLowerCase().includes(w))) continue
        if (!words.some((w) => low.includes(w))) continue
        const at = Math.max(0, low.indexOf(words[0]) - 40)
        const snippet = (at > 0 ? '…' : '') + text.slice(at, at + 140).replace(/\s+/g, ' ') + (text.length > at + 140 ? '…' : '')
        out.push({ chapter: c, block: b, heading, id: part.id, snippet })
        if (out.length >= limit) return out
      }
    }
  }
  return out
}

export { handbook }
