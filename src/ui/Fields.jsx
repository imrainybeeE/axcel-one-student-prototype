import { useEffect, useId, useRef, useState } from 'react'
import { Icon } from './Icon.jsx'
import './fields.css'

function describedBy(...ids) {
  const s = ids.filter(Boolean).join(' ')
  return s || undefined
}

/** Error line under a field: a sentence with an icon. */
export function FieldError({ id, children }) {
  if (!children) return null
  return <p id={id} className="field-error"><Icon name="alert" size={20} /><span>{children}</span></p>
}

/**
 * Text field: visible label, optional hint, 48 px input, error sentence under it.
 * Pass any input props (type, autoComplete, value, onChange...). Values are never cleared on error.
 * errorRole="alert" when the error appears after a submit.
 */
export function TextField({ label, hint, error, errorRole, id, className, trailing, ...input }) {
  const auto = useId()
  const fid = id || auto
  const hintId = hint ? `${fid}-hint` : null
  const errId = error ? `${fid}-err` : null
  return (
    <div className={`field${error ? ' field--error' : ''}${className ? ` ${className}` : ''}`}>
      <label htmlFor={fid} className="field-label">{label}</label>
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      <div className="field-control">
        <input id={fid} className="input" aria-invalid={error ? true : undefined} aria-describedby={describedBy(hintId, errId)} {...input} />
        {trailing}
      </div>
      <div role={errorRole}>{error && <FieldError id={errId}>{error}</FieldError>}</div>
    </div>
  )
}

/** Multi-line text with the same label, hint and error pattern. */
export function TextArea({ label, hint, error, id, className, rows = 4, ...input }) {
  const auto = useId()
  const fid = id || auto
  const hintId = hint ? `${fid}-hint` : null
  const errId = error ? `${fid}-err` : null
  return (
    <div className={`field${error ? ' field--error' : ''}${className ? ` ${className}` : ''}`}>
      <label htmlFor={fid} className="field-label">{label}</label>
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      <textarea id={fid} rows={rows} className="input input--area" aria-invalid={error ? true : undefined} aria-describedby={describedBy(hintId, errId)} {...input} />
      <FieldError id={errId}>{error}</FieldError>
    </div>
  )
}

/**
 * Search: <form role="search">, 48 px, magnifier, placeholder naming the scope ("Search messages").
 * onSearch fires as you type after 150 ms. A 44 px Clear button appears once there is text. Nothing is stored.
 */
export function SearchField({ label = 'Search', placeholder, defaultValue = '', onSearch, className }) {
  const [value, setValue] = useState(defaultValue)
  const timer = useRef()
  const input = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  const set = (v) => {
    setValue(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch?.(v), 150)
  }
  return (
    <form role="search" className={className ? `search ${className}` : 'search'} onSubmit={(e) => { e.preventDefault(); onSearch?.(value); input.current?.blur() }}>
      <Icon name="search" className="search-icon" />
      <input
        ref={input}
        type="search"
        className="input search-input"
        enterKeyHint="search"
        autoComplete="off"
        aria-label={label}
        placeholder={placeholder || label}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
      {value && (
        <button type="button" className="icon-btn search-clear" aria-label="Clear search" onClick={() => { set(''); onSearch?.(''); input.current?.focus() }}>
          <Icon name="close" size={20} />
        </button>
      )}
    </form>
  )
}

/**
 * Switch row: <input type="checkbox" role="switch">, the whole row is the label.
 * description is one sentence under the label. unavailable is a reason ("Needs the internet").
 */
export function Switch({ label, description, checked, onChange, unavailable }) {
  const id = useId()
  return (
    <li className={`choice-row switch-row${unavailable ? ' is-unavailable' : ''}`}>
      <label htmlFor={id} className="choice-hit">
        <span className="choice-text">
          <span className="choice-label">{label}</span>
          {description && <span className="choice-desc">{description}</span>}
          {unavailable && <span className="choice-desc choice-reason">{unavailable}</span>}
        </span>
        <span className="switch">
          <input
            id={id}
            type="checkbox"
            role="switch"
            checked={checked}
            aria-disabled={unavailable ? true : undefined}
            onChange={(e) => { if (unavailable) return; onChange(e.target.checked) }}
          />
          <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
        </span>
      </label>
    </li>
  )
}

/** Checkbox row (for filters such as Calendar's Show sheet). meta is a count or short line. */
export function CheckRow({ label, meta, checked, onChange }) {
  const id = useId()
  return (
    <li className="choice-row">
      <label htmlFor={id} className="choice-hit">
        <span className="check">
          <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          <span className="check-box" aria-hidden="true"><Icon name="check" size={18} /></span>
        </span>
        <span className="choice-text"><span className="choice-label">{label}</span></span>
        {meta != null && <span className="choice-meta">{meta}</span>}
      </label>
    </li>
  )
}

/**
 * A list of options with a check on the chosen one (Settings, Appearance). Radios underneath.
 * options: [{ value, label, description? }]
 */
export function ChoiceList({ legend, options, value, onChange, showLegend = true }) {
  const name = useId()
  return (
    <fieldset className="choice-list">
      <legend className={showLegend ? 'section-head t-title-s' : 'vh'}>{legend}</legend>
      <ul className="list" role="list">
        {options.map((o) => (
          <li key={o.value} className="choice-row">
            <label className="choice-hit">
              <input className="choice-radio" type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} />
              <span className="choice-text">
                <span className="choice-label">{o.label}</span>
                {o.description && <span className="choice-desc">{o.description}</span>}
              </span>
              <Icon name="check" className="choice-check" />
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
