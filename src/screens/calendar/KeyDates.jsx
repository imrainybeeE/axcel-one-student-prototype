// Key dates: the school's year as Settings-style groups (terms, school holidays, festive breaks, public holidays,
// assessments), under a year bar with arrows. Past dates step back; the term or break under way carries Now.
// Tapping a row shows that date in Month.
import { Group, Row, Tag, IconButton, Button, EmptyState } from '../../ui'
import { daysBetween, formatLongDate, isoToMs } from '../../lib/time.js'
import { keyDates } from '../../data/calendar.js'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const short = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7)) - 1]}`
const weeks = (k) => {
  const n = Math.max(1, Math.round((daysBetween(k.start, k.end) + 1) / 7))
  return `${n} week${n > 1 ? 's' : ''}`
}

const GROUPS = [
  { kind: 'term', title: 'Terms' },
  { kind: 'holiday', title: 'School holidays' },
  { kind: 'festive', title: 'Festive breaks' },
  { kind: 'public', title: 'Public holidays' },
]

function KeyRow({ k, today, onPick }) {
  const last = k.end || k.start
  const past = last < today
  const now = k.start <= today && today <= last
  let trailing
  let meta
  if (k.kind === 'public') {
    trailing = `${short(k.start)}, ${WD[new Date(`${k.start}T00:00:00Z`).getUTCDay()]}`
  } else if (!k.end) {
    trailing = `From ${short(k.start)}`
    meta = 'End date not published yet'
  } else {
    trailing = k.start.slice(0, 7) === k.end.slice(0, 7) ? `${Number(k.start.slice(8))} to ${short(k.end)}` : `${short(k.start)} to ${short(k.end)}`
    meta = k.kind === 'festive' ? `${k.length}, 1st day ${formatLongDate(isoToMs(k.first))}` : weeks(k)
  }
  const tag = now ? (k.kind === 'public' ? 'Today' : 'Now') : null
  return (
    <Row
      className={`cal-key${past ? ' is-past' : ''}`}
      onClick={() => onPick(k.start)}
      title={k.title.replace(/ (\d+)$/, '\u00a0$1')}
      titleExtra={tag ? <Tag className="cal-key-now">{tag}</Tag> : null}
      meta={meta}
      trailing={<span className="cal-key-when">{trailing}</span>}
      aria-label={[k.title, tag, trailing, meta, past ? 'past' : null].filter(Boolean).join(', ') + '. Show in month'}
    />
  )
}

/** The calendar category each kind of key date belongs to, so Show hides it with its kind of date. */
const CATEGORY = { term: 'term', holiday: 'holiday', festive: 'holiday', public: 'public-holiday' }

/** shown(category): whether Show lets that kind of date through (key dates are all whole-school). onShowAll resets Show. */
export default function KeyDates({ today, year, years, onYear, onPick, shown = () => true, onShowAll }) {
  const all = keyDates.filter((k) => k.start.startsWith(String(year)))
  const inYear = all.filter((k) => shown(CATEGORY[k.kind])).sort((a, b) => a.start.localeCompare(b.start))
  const i = years.indexOf(year)
  const partial = !all.some((k) => k.kind === 'holiday')
  const hiddenAll = all.length > 0 && !inYear.length
  return (
    <div className="cal-keys">
      <div className="cal-month-bar cal-year-bar">
        <h2 className="cal-month-title" aria-live="polite">{year}</h2>
        <IconButton icon="chevron-left" label="Previous year" size={18} onClick={() => onYear(years[i - 1])} disabled={i <= 0} />
        <IconButton icon="chevron-right" label="Next year" size={18} onClick={() => onYear(years[i + 1])} disabled={i >= years.length - 1} />
      </div>
      {hiddenAll && (
        <EmptyState title="No key dates shown." action={<Button variant="secondary" onClick={onShowAll}>Show everything</Button>}>Show is hiding terms and holidays.</EmptyState>
      )}
      {GROUPS.map((g) => {
        const rows = inYear.filter((k) => k.kind === g.kind)
        if (!rows.length) return null
        return (
          <Group key={g.kind} title={g.title} className="cal-key-group">
            {rows.map((k) => <KeyRow key={k.id} k={k} today={today} onPick={onPick} />)}
          </Group>
        )
      })}
      <Group title="Assessments" className="cal-key-group">
        <li className="cal-none">No assessment dates yet.</li>
      </Group>
      {partial && <p className="t-faint settings-note cal-key-note">The school has not published the rest of {year} yet.</p>}
    </div>
  )
}
