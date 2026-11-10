// Calendar reminder choices: one per kind of date a student sees, saved on this device as 'calendarReminders'.
import { usePref } from '../../app'
import { categories } from '../../data/calendar.js'

export const REMINDER_KINDS = ['term', 'holiday', 'public-holiday', 'exam', 'meeting', 'assembly', 'event', 'class']
export const REMINDER_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'day', label: 'On the day (8 am)' },
  { value: 'before', label: 'The day before (8 am)' },
]
/** The choice as the list shows it in grey. */
export const REMINDER_SHORT = { none: 'None', day: 'On the day', before: 'The day before' }
const DEFAULTS = Object.fromEntries(REMINDER_KINDS.map((k) => [k, k === 'term' ? 'none' : k === 'assembly' ? 'before' : 'day']))

export const kindLabel = (k) => categories[k]?.label

/** [choices, setChoice(kind, value)] with the old app's defaults filled in. */
export function useReminders() {
  const [saved, setSaved] = usePref('calendarReminders', DEFAULTS)
  const choices = { ...DEFAULTS, ...saved }
  return [choices, (kind, value) => setSaved({ ...choices, [kind]: value })]
}
