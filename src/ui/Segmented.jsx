import { useId } from 'react'

/**
 * Segmented control: a fieldset of radios (arrow keys move the choice natively).
 * Segments are equal width and at least 44 px tall in a 50 px track. Five at most, nouns only.
 * options: [{ value, label, count?, ariaLabel?, sub? }]. count renders "Unread (2)". sub adds a second line (weekday strip).
 * legend is the group's name; it is visually hidden unless showLegend.
 */
export function Segmented({ legend, options, value, onChange, showLegend = false, name, className, size }) {
  const auto = useId()
  const group = name || auto
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <fieldset className={`seg${size === 'tall' ? ' seg--tall' : ''}${className ? ` ${className}` : ''}`}>
      <legend className={showLegend ? 'seg-legend' : 'vh'}>{legend}</legend>
      <div className="seg-track" style={{ '--n': options.length, '--i': index }}>
        {/* The thumb slides (transition on --i); its fill re-mounts per choice so the squish replays */}
        <span className="seg-thumb" aria-hidden="true"><span key={index} className="seg-thumb-fill" /></span>
        {options.map((o) => (
          <label key={o.value} className="seg-item">
            <input
              type="radio"
              name={group}
              value={o.value}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
              aria-label={o.ariaLabel}
            />
            <span className="seg-label">
              {o.label}{o.count != null ? <> (<span className="num">{o.count}</span>)</> : null}
            </span>
            {o.sub != null && <span className="seg-sub">{o.sub}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
