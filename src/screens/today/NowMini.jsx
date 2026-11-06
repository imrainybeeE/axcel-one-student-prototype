// The mini "now" capsule, as Music's MiniPlayer: when the now block scrolls away, a glass capsule keeps the lesson in
// reach. It floats above the tab bar, and slides in beside it when the bar minimises. Tap it to go back to the block.
import { useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useScrolledDown } from '../../app'
import { UnderlayContext } from '../../app/underlay.js'
import { Time, Num, Icon, RollNum } from '../../ui'

const shortTitle = (it) => (it.short && it.title.length > 18 ? it.short : it.title)

export function NowMini({ model, offline, joiningId, onJoin }) {
  const [shown, setShown] = useState(false)
  const minimised = useScrolledDown()
  const active = model && ['lesson', 'break', 'before', 'between'].includes(model.state)
  const raf = useRef(0)
  const under = useContext(UnderlayContext) // under an edge swipe its portal would float over the dragged screen
  // Shown once the block's Join (or its bar) has gone under the nav bar, so the two never show at once
  useEffect(() => {
    if (!active) return undefined
    const check = () => {
      raf.current = 0
      const hero = document.querySelector('.screen--today .now')
      const mark = hero?.querySelector('.now-join-wrap') || hero?.querySelector('.now-elapsed') || hero
      setShown(Boolean(mark) && mark.getBoundingClientRect().bottom < 100)
    }
    const on = () => { if (!raf.current) raf.current = requestAnimationFrame(check) }
    check()
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf.current) }
  }, [active])
  if (!active || under) return null
  const { state, item } = model
  const isBreak = state === 'break'
  const joinable = !isBreak && item.meet && model.join?.open && !offline
  const sub = state === 'lesson' ? <>Ends at <Time value={item.end} /></>
    : isBreak ? (model.next ? <>Then {shortTitle(model.next)}</> : <>Ends at <Time value={item.end} /></>)
      : <>Starts at <Time value={item.start} /></>
  return createPortal(
    <div
      className="now-mini glass"
      data-liquid=""
      data-liquid-bezel="12"
      data-liquid-strength="12"
      data-liquid-frost="3"
      data-shown={shown || undefined}
      data-min={minimised || undefined}
      inert={!shown}
      aria-hidden={!shown || undefined}
    >
      <div className="now-mini-in">
        <button
          type="button"
          className="now-mini-main"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={`${isBreak ? 'Break' : item.title}, ${model.minutes} minutes. Show the lesson`}
        >
          <span className="now-mini-tile" data-subject={isBreak ? 'break' : item.subjectId}><Num wide><RollNum value={model.minutes} /></Num><span className="now-mini-unit">min</span></span>
          <span className="now-mini-text">
            <span className="now-mini-title">{isBreak ? 'Break' : shortTitle(item)}</span>
            <span className="now-mini-sub">{sub}</span>
          </span>
        </button>
        {joinable && (
          <button
            type="button"
            className="now-mini-join"
            data-subject={item.subjectId}
            onClick={() => onJoin(item)}
            aria-label={`Join ${item.title}`}
            disabled={joiningId === item.id}
          >
            <Icon name="video" size={20} />
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
