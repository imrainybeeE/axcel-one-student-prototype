// The icon drawings: the ones the first screen can show. The rest (icons-more.jsx) are added with any other screen's code.
const CUT = 'var(--icon-cut, var(--paper))'

export const paths = {
  // Today: the logo's three squares, monochrome like every tab icon (tinted by the tab's colour)
  today: (
    <g transform="translate(0 0.8) rotate(45 12 14)" strokeWidth="1.8">
      <rect x="5.4" y="7.4" width="5.2" height="5.2" rx="1" />
      <rect x="13.4" y="7.4" width="5.2" height="5.2" rx="1" />
      <rect x="5.4" y="15.4" width="5.2" height="5.2" rx="1" />
    </g>
  ),
  'today-fill': (
    <g transform="translate(0 0.8) rotate(45 12 14)" stroke="none" fill="currentColor">
      <rect x="4.5" y="6.5" width="7" height="7" rx="1.4" />
      <rect x="12.5" y="6.5" width="7" height="7" rx="1.4" />
      <rect x="4.5" y="14.5" width="7" height="7" rx="1.4" />
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
  award: <><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" /></>,
  info: <><circle cx="12" cy="12" r="9.5" /><path d="M12 11v6M12 7.5v.01" /></>,
  alert: <><circle cx="12" cy="12" r="9.5" /><path d="M12 7v6M12 16.5v.01" /></>,
  warning: <><path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4.5M12 17v.01" /></>,
  'check-circle': <><circle cx="12" cy="12" r="9.5" /><path d="m8 12 3 3 5-6" /></>,
  // Filled forms for icon tiles (More, Settings), as SF Symbols' .fill variants; cut-outs take the tile's colour
  'award-fill': <><circle cx="12" cy="9" r="6.5" fill="currentColor" /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8Z" fill="currentColor" /></>,
  'check-circle-fill': <><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path d="m7.6 12.2 3 3 5.8-6.4" stroke={CUT} strokeWidth="2.2" /></>,
  'book-fill': <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5Z" fill="currentColor" /><path d="M8.5 7.5h7M8.5 11h5" stroke={CUT} strokeWidth="1.8" /><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20" /></>,
  'flag-fill': <><path d="M5 21.5V4" /><path d="M5 4.5s1.5-1.5 5-1.5 4.5 2 8 2 2-.5 2-.5v10s-.5.5-2 .5-4.5-2-8-2-5 1.5-5 1.5Z" fill="currentColor" /></>,
  'pen-fill': <><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" fill="currentColor" /><path d="m14.5 5.5 4 4" stroke={CUT} /></>,
  'gear-fill': <><path d="M10.14 4.53 L10.44 2.12 L13.56 2.12 L13.86 4.53 L15.97 5.40 L17.88 3.91 L20.09 6.12 L18.60 8.03 L19.47 10.14 L21.88 10.44 L21.88 13.56 L19.47 13.86 L18.60 15.97 L20.09 17.88 L17.88 20.09 L15.97 18.60 L13.86 19.47 L13.56 21.88 L10.44 21.88 L10.14 19.47 L8.03 18.60 L6.12 20.09 L3.91 17.88 L5.40 15.97 L4.53 13.86 L2.12 13.56 L2.12 10.44 L4.53 10.14 L5.40 8.03 L3.91 6.12 L6.12 3.91 L8.03 5.40Z" fill="currentColor" stroke="currentColor" strokeWidth="1" /><circle cx="12" cy="12" r="3.2" fill={CUT} stroke="none" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  book: <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5ZM4 19.5A1.5 1.5 0 0 0 5.5 21H20" />,
  gear: <><path d="M9.96 4.89L10.17 2.58L13.83 2.58L14.04 4.89A7.4 7.4 0 0 1 15.59 5.53L15.59 5.53L17.37 4.04L19.96 6.63L18.47 8.41A7.4 7.4 0 0 1 19.11 9.96L19.11 9.96L21.42 10.17L21.42 13.83L19.11 14.04A7.4 7.4 0 0 1 18.47 15.59L18.47 15.59L19.96 17.37L17.37 19.96L15.59 18.47A7.4 7.4 0 0 1 14.04 19.11L14.04 19.11L13.83 21.42L10.17 21.42L9.96 19.11A7.4 7.4 0 0 1 8.41 18.47L8.41 18.47L6.63 19.96L4.04 17.37L5.53 15.59A7.4 7.4 0 0 1 4.89 14.04L4.89 14.04L2.58 13.83L2.58 10.17L4.89 9.96A7.4 7.4 0 0 1 5.53 8.41L5.53 8.41L4.04 6.63L6.63 4.04L8.41 5.53A7.4 7.4 0 0 1 9.96 4.89Z" /><circle cx="12" cy="12" r="3" /></>, // broad teeth, so it reads as a gear (never a sun) even at 1x
  close: <path d="M6 6l12 12M18 6 6 18" />,
  filter: <path d="M3.5 5h17M7 12h10M10.5 19h3" />,
  flag: <path d="M5 21.5V4M5 4.5s1.5-1.5 5-1.5 4.5 2 8 2 2-.5 2-.5v10s-.5.5-2 .5-4.5-2-8-2-5 1.5-5 1.5" />,
  block: <><circle cx="12" cy="12" r="9.5" /><path d="m5.3 5.3 13.4 13.4" /></>,
  'sign-out': <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M9.5 8 5.5 12l4 4M5.5 12H15" />,
  'wifi-off': <path d="M3 3l18 18M8.5 16.3a5 5 0 0 1 7 0M5 12.6a10 10 0 0 1 4.6-2.4M14.2 10.2A10 10 0 0 1 19 12.6M2 9a15 15 0 0 1 4.4-2.8M11 5.6a15 15 0 0 1 11 3.4M12 20v.01" />,
  refresh: <path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.6 4.5M20 20v-4.5h-4.5" />,
  swap: <path d="M7 4 3.5 7.5 7 11M3.5 7.5h13M17 13l3.5 3.5L17 20M20.5 16.5h-13" />,
}
