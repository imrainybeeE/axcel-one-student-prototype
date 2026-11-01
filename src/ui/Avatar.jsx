import { Icon } from './Icon.jsx'
import { Num } from './Num.jsx'

/**
 * 44 px circle with initials on the fill. No photos, no colours.
 * kind: 'person' (initials) | 'group' (people icon) | 'announcement' (megaphone).
 * Decorative: the row text carries the name.
 */
export function Avatar({ initials, kind = 'person', size = 44 }) {
  return (
    <span className={`avatar avatar--${kind}`} style={{ width: size, height: size }} aria-hidden="true">
      {kind === 'group' ? <Icon name="group" size={22} /> : kind === 'announcement' ? <Icon name="megaphone" size={22} /> : initials}
    </span>
  )
}

const AREAS = { attitude: 'Attitude', skills: 'Skills', knowledge: 'Knowledge' }

/** 12 px merit diamond in the logo colour. Always directly beside its word; use MeritLabel. */
export function MeritDiamond({ area }) {
  return <span className={`diamond diamond--${area}`} aria-hidden="true" />
}

/** Diamond plus the word: Attitude, Skills or Knowledge. */
export function MeritLabel({ area, children }) {
  return (
    <span className="merit-label">
      <MeritDiamond area={area} />
      <span>{children || AREAS[area]}</span>
    </span>
  )
}

/** Determinate bar: 8 px, radius 4, --brand-line on --subtle. valueText is spoken ("281 of 300 points"). */
export function ProgressBar({ value, max, label, valueText, showNumbers = true }) {
  const p = Math.max(0, Math.min(1, value / max))
  return (
    <div className="progress">
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText}>
        <span className="progress-fill" style={{ '--p': p }} />
      </div>
      {showNumbers && <p className="progress-numbers"><Num>{value}</Num> of <Num>{max}</Num></p>}
    </div>
  )
}

/** <details> with a 44 px summary and a chevron that turns. */
export function Disclosure({ summary, children, defaultOpen = false }) {
  return (
    <details className="disclosure" open={defaultOpen || undefined}>
      <summary><span>{summary}</span><Icon name="chevron-down" size={20} className="disclosure-chevron" /></summary>
      <div className="disclosure-body">{children}</div>
    </details>
  )
}
