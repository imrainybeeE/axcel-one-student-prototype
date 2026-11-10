// The lesson capsule: the lesson on now (or the break, or the next lesson) with its countdown and Join.
// Today shows it when the now block scrolls away; Timetable when the lesson's row is out of view or another day is showing.
import { MiniBar, MiniTile, MiniAction } from './MiniBar.jsx'
import { Time, Num } from './Num.jsx'
import { RollNum } from './Motion.jsx'
import { lessonMiniActive } from './miniBarHooks.js'

const shortTitle = (it) => (it.short && it.title.length > 18 ? it.short : it.title)


/** shown, onOpen, openLabel ("Show the lesson"): see MiniBar. lead: words before the time line ("Today"). */
export function LessonMini({ model, offline, joiningId, onJoin, shown, onOpen, openLabel = 'Show the lesson', lead }) {
  if (!lessonMiniActive(model)) return null
  const { state, item } = model
  const isBreak = state === 'break'
  const joinable = !isBreak && item.meet && model.join?.open && !offline
  const when = state === 'lesson' ? <>Ends at <Time value={item.end} /></>
    : isBreak ? (model.next ? <>Then {shortTitle(model.next)}</> : <>Ends at <Time value={item.end} /></>)
      : <>Starts at <Time value={item.start} /></>
  return (
    <MiniBar
      shown={shown}
      onOpen={onOpen}
      label={`${isBreak ? 'Break' : item.title}, ${model.minutes} minutes. ${openLabel}`}
      tile={<MiniTile subject={isBreak ? 'break' : item.subjectId} value={<Num wide><RollNum value={model.minutes} /></Num>} unit="min" />}
      title={isBreak ? 'Break' : shortTitle(item)}
      sub={lead ? <>{lead}, {when}</> : when}
      action={joinable && (
        <MiniAction icon="video" subject={item.subjectId} label={`Join ${item.title}`} onClick={() => onJoin(item)} disabled={joiningId === item.id} />
      )}
    />
  )
}
