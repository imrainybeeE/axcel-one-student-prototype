// One icon family: 24 px grid, 2 px stroke, round caps and joins. Filled variants exist only
// for the tab bar's active item. Decorative by default (aria-hidden).
const CUT = 'var(--icon-cut, var(--paper))'

const paths = {
  // Today: the logo's three squares, monochrome like every tab icon (tinted by the tab's colour)
  today: (
    <g transform="rotate(45 12 14)" strokeWidth="1.6">
      <rect x="5.9" y="7.9" width="5.4" height="5.4" rx="0.8" />
      <rect x="12.7" y="7.9" width="5.4" height="5.4" rx="0.8" />
      <rect x="5.9" y="14.7" width="5.4" height="5.4" rx="0.8" />
    </g>
  ),
  'today-fill': (
    <g transform="rotate(45 12 14)" stroke="none" fill="currentColor">
      <rect x="5.6" y="7.6" width="6" height="6" rx="0.8" />
      <rect x="12.4" y="7.6" width="6" height="6" rx="0.8" opacity="0.7" />
      <rect x="5.6" y="14.4" width="6" height="6" rx="0.8" opacity="0.45" />
    </g>
  ),
  timetable: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  'timetable-fill': <><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M12 7v5l3 2" stroke={CUT} /></>,
  messages: <path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5Z" />,
  'messages-fill': <path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5Z" fill="currentColor" />,
  calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M8 2.5v4M16 2.5v4M3 10h18" /></>,
  'calendar-fill': <><rect x="3" y="4.5" width="18" height="17" rx="2" fill="currentColor" /><path d="M3 10h18" stroke={CUT} /><path d="M8 2.5v4M16 2.5v4" /></>,
  more: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  'more-fill': <g fill="currentColor"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></g>,

  video: <><rect x="2.5" y="6" width="13" height="12" rx="2" /><path d="m15.5 10.5 6-3.5v10l-6-3.5" /></>,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  pen: <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  group: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.5A6.5 6.5 0 0 1 21.5 20" /></>,
  megaphone: <path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1ZM17 8.5a5 5 0 0 1 0 7" />,
  shield: <path d="M12 21.5s8-3.5 8-10V5l-8-2.5L4 5v6.5c0 6.5 8 10 8 10Z" />,
  laptop: <><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19.5h20" /></>,
  award: <><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" /></>,
  info: <><circle cx="12" cy="12" r="9.5" /><path d="M12 11v6M12 7.5v.01" /></>,
  alert: <><circle cx="12" cy="12" r="9.5" /><path d="M12 7v6M12 16.5v.01" /></>,
  warning: <><path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4.5M12 17v.01" /></>,
  'check-circle': <><circle cx="12" cy="12" r="9.5" /><path d="m8 12 3 3 5-6" /></>,
  // Filled forms for icon tiles (More, Settings), as SF Symbols' .fill variants; cut-outs take the tile's colour
  'award-fill': <><circle cx="12" cy="9" r="6.5" fill="currentColor" /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8Z" fill="currentColor" /></>,
  'check-circle-fill': <><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path d="m7.6 12.2 3 3 5.8-6.4" stroke={CUT} strokeWidth="2.2" /></>,
  'book-fill': <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5Z" fill="currentColor" /><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20" /></>,
  'flag-fill': <><path d="M5 21.5V4" /><path d="M5 4.5s1.5-1.5 5-1.5 4.5 2 8 2 2-.5 2-.5v10s-.5.5-2 .5-4.5-2-8-2-5 1.5-5 1.5Z" fill="currentColor" /></>,
  'clock-fill': <><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M12 7v5l3 2" stroke={CUT} /></>,
  'bell-off-fill': <><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9Z" fill="currentColor" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /><path d="M3 3l18 18" stroke={CUT} strokeWidth="4.6" /><path d="M3 3l18 18" /></>,
  'pen-fill': <><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" fill="currentColor" /><path d="m14.5 5.5 4 4" stroke={CUT} /></>,
  shirt: <path d="M8.5 3.5 4 5.5 2.5 10l3 1.2v9.3h13v-9.3l3-1.2L20 5.5l-4.5-2c-.6 1.6-1.9 2.5-3.5 2.5S9.1 5.1 8.5 3.5Z" />,
  'shirt-fill': <path d="M8.5 3.5 4 5.5 2.5 10l3 1.2v9.3h13v-9.3l3-1.2L20 5.5l-4.5-2c-.6 1.6-1.9 2.5-3.5 2.5S9.1 5.1 8.5 3.5Z" fill="currentColor" />,
  'gear-fill': <><path d="M10.14 4.53 L10.44 2.12 L13.56 2.12 L13.86 4.53 L15.97 5.40 L17.88 3.91 L20.09 6.12 L18.60 8.03 L19.47 10.14 L21.88 10.44 L21.88 13.56 L19.47 13.86 L18.60 15.97 L20.09 17.88 L17.88 20.09 L15.97 18.60 L13.86 19.47 L13.56 21.88 L10.44 21.88 L10.14 19.47 L8.03 18.60 L6.12 20.09 L3.91 17.88 L5.40 15.97 L4.53 13.86 L2.12 13.56 L2.12 10.44 L4.53 10.14 L5.40 8.03 L3.91 6.12 L6.12 3.91 L8.03 5.40Z" fill="currentColor" stroke="currentColor" strokeWidth="1" /><circle cx="12" cy="12" r="3.2" fill={CUT} stroke="none" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  'x-circle': <><circle cx="12" cy="12" r="9.5" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  'minus-circle': <><circle cx="12" cy="12" r="9.5" /><path d="M8 12h8" /></>,
  'plus-circle': <><circle cx="12" cy="12" r="9.5" /><path d="M12 8v8M8 12h8" /></>,
  book: <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5ZM4 19.5A1.5 1.5 0 0 0 5.5 21H20" />,
  gear: <><path d="M9.96 4.89L10.17 2.58L13.83 2.58L14.04 4.89A7.4 7.4 0 0 1 15.59 5.53L15.59 5.53L17.37 4.04L19.96 6.63L18.47 8.41A7.4 7.4 0 0 1 19.11 9.96L19.11 9.96L21.42 10.17L21.42 13.83L19.11 14.04A7.4 7.4 0 0 1 18.47 15.59L18.47 15.59L19.96 17.37L17.37 19.96L15.59 18.47A7.4 7.4 0 0 1 14.04 19.11L14.04 19.11L13.83 21.42L10.17 21.42L9.96 19.11A7.4 7.4 0 0 1 8.41 18.47L8.41 18.47L6.63 19.96L4.04 17.37L5.53 15.59A7.4 7.4 0 0 1 4.89 14.04L4.89 14.04L2.58 13.83L2.58 10.17L4.89 9.96A7.4 7.4 0 0 1 5.53 8.41L5.53 8.41L4.04 6.63L6.63 4.04L8.41 5.53A7.4 7.4 0 0 1 9.96 4.89Z" /><circle cx="12" cy="12" r="3" /></>, // broad teeth, so it reads as a gear (never a sun) even at 1x
  close: <path d="M6 6l12 12M18 6 6 18" />,
  filter: <path d="M3.5 5h17M7 12h10M10.5 19h3" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  ellipsis: <><circle cx="5.5" cy="12" r="1.25" fill="currentColor" /><circle cx="12" cy="12" r="1.25" fill="currentColor" /><circle cx="18.5" cy="12" r="1.25" fill="currentColor" /></>,
  paperclip: <path d="m20 11.5-8.1 8.1a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15 7" />,
  send: <path d="M21.5 2.5 10.5 13.5M21.5 2.5 14.5 21.5l-4-8-8-4Z" />,
  'arrow-up': <path d="M12 19.5v-15M5.5 11 12 4.5 18.5 11" />,
  flag: <path d="M5 21.5V4M5 4.5s1.5-1.5 5-1.5 4.5 2 8 2 2-.5 2-.5v10s-.5.5-2 .5-4.5-2-8-2-5 1.5-5 1.5" />,
  block: <><circle cx="12" cy="12" r="9.5" /><path d="m5.3 5.3 13.4 13.4" /></>,
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9ZM10 20.5a2.2 2.2 0 0 0 4 0" />,
  'bell-off': <path d="M8.5 4.1A6 6 0 0 1 18 9c0 2.4.4 4.2.9 5.4M17.5 17H3.5S6 15 6 9c0-.6.1-1.2.3-1.8M10 20.5a2.2 2.2 0 0 0 4 0M3 3l18 18" />,
  copy: <><rect x="8.5" y="8.5" width="12" height="12" rx="2" /><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" /></>,
  reply: <path d="M9.5 6.5 4 12l5.5 5.5M4 12h10a6 6 0 0 1 6 6v1.5" />,
  'sign-out': <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M9.5 8 5.5 12l4 4M5.5 12H15" />,
  'wifi-off': <path d="M3 3l18 18M8.5 16.3a5 5 0 0 1 7 0M5 12.6a10 10 0 0 1 4.6-2.4M14.2 10.2A10 10 0 0 1 19 12.6M2 9a15 15 0 0 1 4.4-2.8M11 5.6a15 15 0 0 1 11 3.4M12 20v.01" />,
  refresh: <path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.6 4.5M20 20v-4.5h-4.5" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  pin: <><path d="M12 21.5s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.6 3.5M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  swap: <path d="M7 4 3.5 7.5 7 11M3.5 7.5h13M17 13l3.5 3.5L17 20M20.5 16.5h-13" />,
  'person-cover': <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 11.3-4.4M15 15.5l2 2 4-4.5" /></>,
  door: <><path d="M5 21.5V3.5h11v18M3 21.5h16" /><path d="M12.5 12.5v.01" /></>,
}

/** <Icon name="search" size={24} /> . Pass filled for the active tab (uses the "-fill" variant when one exists). */
export function Icon({ name, size = 24, filled = false, label, className, style }) {
  const key = filled && paths[`${name}-fill`] ? `${name}-fill` : name
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

/** Every icon name, for the gallery: Icon.names */
Icon.names = Object.keys(paths)
