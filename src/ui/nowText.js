// Words for the now block, shared by the block and any screen that needs its stable name.
import { dayName } from '../lib/schedule.js'
import { speakDuration } from '../lib/time.js'

export function backLine(nextDay) {
  if (!nextDay || !nextDay.first) return ''
  const when = dayName(nextDay.iso, nextDay.daysAway)
  const first = `${nextDay.first.start} ${nextDay.first.short === 'BM' ? 'Bahasa Melayu' : nextDay.first.short}`
  return when === 'tomorrow' ? `Tomorrow, ${first}.` : `Back on ${when}, ${first}.`
}

/** What a screen reader hears as the block's stable name. Updated quietly each minute, never announced. */
export function nowName(model) {
  const { state, item } = model
  if (state === 'lesson') return `${item.title}${item.double ? ', double lesson' : ''}, ${model.minutes} ${model.minutes === 1 ? 'minute' : 'minutes'} left, ends ${item.end}`
  if (state === 'break') return `${item.title}, ${model.minutes} minutes left, until ${item.end}.${model.following ? ` ${model.following.title} is next.` : ''}`
  if (state === 'before') return `First lesson, ${item.title} at ${item.start}, in ${speakDuration(model.minutes)}`
  if (state === 'between') return `Next, ${item.title} at ${item.start}, in ${speakDuration(model.minutes)}`
  if (state === 'after') return `School’s out for today. ${backLine(model.nextDay)}`
  return `No school today${model.reason ? `: ${model.reason}` : ''}. ${backLine(model.nextDay)}`
}
