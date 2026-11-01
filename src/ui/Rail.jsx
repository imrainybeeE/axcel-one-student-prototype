// The rail: a time column, a track with diamond stops, then content. Used by Timetable,
// the laptop Today and the award ladder. The track is decorative; every fact is in text.
import { Num, Time } from './Num.jsx'
import { Tag } from './Tag.jsx'

/** <Rail label="Rest of today"> ...RailItem </Rail> renders an ordered list. */
export function Rail({ label, children, className }) {
  return <ol className={className ? `rail ${className}` : 'rail'} aria-label={label}>{children}</ol>
}

/**
 * One stop on the rail.
 * kind: 'lesson' | 'gap' (Break, Lunch: dashed track) | 'free' | 'marker' (ladder points: pass `points`).
 * status: 'done' (grey stop and the word "Done") | 'now' (filled stop with a ring) | 'later' (outlined).
 * start/end: school times ("10.30"). title, meta, tags ([{ label, icon }]), trailing (a Join button).
 * children replaces the content (for the now block at rail width). first/last trim the track.
 */
export function RailItem({
  kind = 'lesson', status = 'later', start, end, points, title, titleTag, meta, tags = [], trailing, children, first, last, className, subject,
}) {
  const cls = ['rail-item', `rail-item--${kind}`, `is-${status}`, first && 'is-first', last && 'is-last', className].filter(Boolean).join(' ')
  return (
    <li className={cls} data-subject={subject}>
      <span className="rail-time">
        {points != null ? (
          <Num wide className="t-time-l">{points}</Num>
        ) : (
          <>
            {kind !== 'gap' && start && <Time value={start} className="rail-start" />}
            {kind === 'gap' && start && <Time value={start} className="rail-end" />}
            {kind === 'gap' && end && !meta && <Time value={end} className="rail-end" />}
            {kind !== 'gap' && end && <Time value={end} className="rail-end" />}
          </>
        )}
      </span>
      <span className="rail-track" aria-hidden="true">{kind !== 'gap' && <span className="rail-stop" />}</span>
      <div className="rail-body">
        {children || (
          <>
            <div className="rail-text">
              <p className="rail-title">
                {title}
                {titleTag && <> <Tag>{titleTag}</Tag></>}
              </p>
              {meta && <p className="rail-meta">{kind === 'gap' && start && end ? <><Time value={start} /> to <Time value={end} /></> : meta}</p>}
              {tags.length > 0 && <p className="rail-tags">{tags.map((t) => <Tag key={t.label} icon={t.icon} tone={t.tone || 'neutral'}>{t.label}</Tag>)}</p>}
            </div>
            {status === 'done' && kind === 'lesson' && !trailing && <span className="vh">, done</span>}
            {trailing && <span className="rail-trailing">{trailing}</span>}
          </>
        )}
      </div>
    </li>
  )
}
