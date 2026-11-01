// Small motion helpers: a number that rolls when it changes, a label that blurs in when it changes,
// and a haptic tick on iOS 18+. All of it is CSS keyframes keyed on the value, so nothing queues:
// a new value re-mounts the digit and the old animation is simply dropped.
import { useState } from 'react'

/**
 * <RollNum value="20" /> renders each character; characters that changed since the last render roll in
 * (up when the number grew, down when it shrank) while the old glyph rolls out. Screen readers get the value once.
 * Use inside <Num>/<Time> styling, or pass className. still: change without rolling (while a count-up runs).
 */
export function RollNum({ value, className, still = false }) {
  const text = String(value)
  // Derived state from the previous render (React's documented pattern), so no refs are read while rendering
  const [shown, setShown] = useState({ text, from: text, gen: 0 })
  if (still) {
    if (shown.text !== text || shown.from !== text) setShown({ text, from: text, gen: shown.gen })
    return <span className={className ? `roll ${className}` : 'roll'}>{text}</span>
  }
  if (shown.text !== text) setShown({ text, from: shown.text, gen: shown.gen + 1 })
  const last = shown.text !== text ? shown.text : shown.from
  const gen = shown.text !== text ? shown.gen + 1 : shown.gen
  const changed = last !== text
  const dir = Number.parseFloat(text) < Number.parseFloat(last) ? 'down' : 'up'
  // Align from the right so "9" -> "10" rolls the units digit and adds the tens
  const pad = Math.max(0, last.length - text.length)
  const oldChars = last.padStart(text.length + pad, ' ').slice(pad)
  return (
    <span className={className ? `roll ${className}` : 'roll'}>
      <span className="vh">{text}</span>
      {[...text].map((ch, i) => {
        const old = oldChars[i]
        const moved = changed && old !== ch
        return (
          <span key={moved ? `${i}-${gen}` : i} className="roll-d" data-dir={moved ? dir : undefined} aria-hidden="true">
            <span className="roll-new">{ch}</span>
            {moved && old && old !== ' ' && <span className="roll-old">{old}</span>}
          </span>
        )
      })}
    </span>
  )
}

/** <TextSwap>{label}</TextSwap>: when the text changes, the new text blurs and fades in (150-250 ms). */
export function TextSwap({ children, className }) {
  const key = typeof children === 'string' ? children : undefined
  return <span key={key} className={className ? `swap ${className}` : 'swap'}>{children}</span>
}
