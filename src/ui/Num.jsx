// Numerals: tabular figures, width set with font-stretch (112% or 125%), plain zero.
// Every time, date, count, percentage and point value goes through these.
import { formatTime } from '../lib/time.js'

/** <Num>281</Num> or <Num wide>96%</Num>. Unit words go outside: <Num>20</Num> min left. */
export function Num({ children, wide = false, as: Tag = 'span', className, ...rest }) {
  const cls = `${wide ? 'num-wide' : 'num'}${className ? ` ${className}` : ''}`
  return <Tag className={cls} {...rest}>{children}</Tag>
}

/**
 * <Time value="10.30" /> renders a school-style time in a <time> element.
 * value: "10.30" (as written in the seed) or epoch ms (formatted in Asia/Kuala_Lumpur).
 * dateTime is optional (for example "2026-10-21T10:30+08:00").
 */
export function Time({ value, wide = false, dateTime, className, ...rest }) {
  const text = typeof value === 'number' ? formatTime(value) : value
  const dt = dateTime || (typeof value === 'number' ? new Date(value).toISOString() : undefined)
  const cls = `${wide ? 'num-wide' : 'num'}${className ? ` ${className}` : ''}`
  return <time className={cls} dateTime={dt} {...rest}>{text}</time>
}
