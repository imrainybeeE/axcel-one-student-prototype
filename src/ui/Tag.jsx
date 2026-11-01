import { Icon } from './Icon.jsx'
import { Num } from './Num.jsx'

/**
 * Tag: 26 px, radius 6, 16 px at 600, sentence case. Status tags carry an icon and a word.
 * tone: 'brand' (default, blue tint) | 'inverse' (inside the now block) | 'neutral' | 'good' | 'warn' | 'danger'
 */
export function Tag({ children, tone = 'brand', icon, className }) {
  return (
    <span className={`tag tag--${tone}${className ? ` ${className}` : ''}`}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </span>
  )
}

/** Count badge (22 px, radius 6, filled blue). Caps at "9+". Decorative: put the count in the parent's name. */
export function Badge({ count, max = 9, className }) {
  if (!count) return null
  return <span className={className ? `badge ${className}` : 'badge'} aria-hidden="true"><Num>{count > max ? `${max}+` : count}</Num></span>
}
