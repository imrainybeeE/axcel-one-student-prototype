// Year view, as iOS Calendar's: twelve small months under the year. Today is a filled circle, the month under way is
// named in blue, and school holidays and public holidays are a soft tint (no other marks: they would be too small).
// Tapping a month opens it in Month, growing out of where it sat.
import { IconButton } from '../../ui'
import { addDays, dayOfWeek } from '../../lib/time.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const OFF = new Set(['holiday', 'public-holiday'])

/** Every date in a year that a holiday or public holiday covers. */
function holidayDays(list, year) {
  const out = new Set()
  for (const e of list) {
    if (!OFF.has(e.category)) continue
    const end = e.end && e.end.includes('-') ? e.end : e.start
    for (let iso = e.start; iso <= end; iso = addDays(iso, 1)) if (iso.startsWith(String(year))) out.add(iso)
  }
  return out
}

function MiniMonth({ year, m, today, off, onOpen }) {
  const month = `${year}-${String(m).padStart(2, '0')}`
  const lead = (dayOfWeek(`${month}-01`) + 6) % 7
  const daysIn = new Date(Date.UTC(year, m, 0)).getUTCDate()
  const current = today.startsWith(month)
  const cells = Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)
  let holidays = 0
  for (let d = 1; d <= daysIn; d++) {
    const iso = `${month}-${String(d).padStart(2, '0')}`
    const dow = dayOfWeek(iso)
    const isOff = off.has(iso)
    if (isOff) holidays++
    cells.push(<span key={iso} className={`cal-mini-day${dow === 0 || dow === 6 ? ' is-weekend' : ''}${isOff ? ' is-holiday' : ''}${iso === today ? ' is-today' : ''}`}>{d}</span>)
  }
  return (
    <button
      type="button"
      className={`cal-mini${current ? ' is-current' : ''}`}
      aria-label={`${MONTHS[m - 1]} ${year}${current ? ', this month' : ''}${holidays ? `, ${holidays} holiday day${holidays > 1 ? 's' : ''}` : ''}`}
      onClick={(ev) => onOpen(month, ev.currentTarget)}
    >
      <span className="cal-mini-name">{MONTHS[m - 1].slice(0, 3)}</span>
      <span className="cal-mini-grid" aria-hidden="true">{cells}</span>
    </button>
  )
}

/** origin: where the year grows from on arrival (the month it was opened from), as a CSS transform-origin. */
export default function YearView({ year, list, today, onYear, onOpen, origin }) {
  const off = holidayDays(list, year)
  const open = (month, el) => {
    // The month grows out of the small month that was tapped
    const grid = el.closest('.cal-year-grid').getBoundingClientRect()
    const r = el.getBoundingClientRect()
    onOpen(month, `${Math.round(((r.left + r.width / 2 - grid.left) / grid.width) * 100)}% ${Math.round(r.top - grid.top + r.height / 2)}px`)
  }
  return (
    <div className={`cal-year${origin ? ' is-entering' : ''}`} style={origin ? { '--cal-origin': origin } : undefined}>
      <div className="cal-month-bar cal-year-bar">
        <h2 className="cal-month-title" aria-live="polite">{year}</h2>
        <IconButton icon="chevron-left" label="Previous year" size={18} onClick={() => onYear(year - 1)} />
        <IconButton icon="chevron-right" label="Next year" size={18} onClick={() => onYear(year + 1)} />
      </div>
      <div className="cal-year-grid" role="group" aria-label={`${year}, choose a month`}>
        {MONTHS.map((_, i) => <MiniMonth key={i} year={year} m={i + 1} today={today} off={off} onOpen={open} />)}
      </div>
      <p className="cal-year-key"><i aria-hidden="true" />School and public holidays</p>
    </div>
  )
}
