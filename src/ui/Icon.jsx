// One icon family: 24 px grid, 2 px stroke, round caps and joins. Filled variants exist only
// for the tab bar's active item. Decorative by default (aria-hidden).
import { paths } from './iconPaths.jsx'

/** <Icon name="search" size={24} /> . Pass filled for the active tab (uses the "-fill" variant when one exists). */
export function Icon({ name, size = 24, filled = false, label, className, style }) {
  const key = filled && paths[`${name}-fill`] ? `${name}-fill` : name
  if (import.meta.env.DEV && !paths[key]) console.error(`Icon "${key}" is not loaded: add it to Icon.jsx or icons-more.jsx`)
  const body = paths[key] || paths.info
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      style={style}
    >
      {body}
    </svg>
  )
}

/** Every icon name loaded so far, for the gallery: Icon.names */
Object.defineProperty(Icon, 'names', { get: () => Object.keys(paths) })
