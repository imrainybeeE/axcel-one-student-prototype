// Icons no first screen shows: loaded with every other screen's code (app/lazyRoute.js), before it renders.
import { paths } from './iconPaths.jsx'

const CUT = 'var(--icon-cut, var(--paper))'

Object.assign(paths, {
  shield: <path d="M12 21.5s8-3.5 8-10V5l-8-2.5L4 5v6.5c0 6.5 8 10 8 10Z" />,
  laptop: <><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19.5h20" /></>,
  'clock-fill': <><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M12 7v5l3 2" stroke={CUT} /></>,
  'bell-off-fill': <><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9Z" fill="currentColor" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /><path d="M3 3l18 18" stroke={CUT} strokeWidth="4.6" /><path d="M3 3l18 18" /></>,
  shirt: <path d="M8.5 3.5 4 5.5 2.5 10l3 1.2v9.3h13v-9.3l3-1.2L20 5.5l-4.5-2c-.6 1.6-1.9 2.5-3.5 2.5S9.1 5.1 8.5 3.5Z" />,
  'shirt-fill': <path d="M8.5 3.5 4 5.5 2.5 10l3 1.2v9.3h13v-9.3l3-1.2L20 5.5l-4.5-2c-.6 1.6-1.9 2.5-3.5 2.5S9.1 5.1 8.5 3.5Z" fill="currentColor" />,
  'x-circle': <><circle cx="12" cy="12" r="9.5" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  'minus-circle': <><circle cx="12" cy="12" r="9.5" /><path d="M8 12h8" /></>,
  'plus-circle': <><circle cx="12" cy="12" r="9.5" /><path d="M12 8v8M8 12h8" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  ellipsis: <><circle cx="5.5" cy="12" r="1.25" fill="currentColor" /><circle cx="12" cy="12" r="1.25" fill="currentColor" /><circle cx="18.5" cy="12" r="1.25" fill="currentColor" /></>,
  paperclip: <path d="m20 11.5-8.1 8.1a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15 7" />,
  send: <path d="M21.5 2.5 10.5 13.5M21.5 2.5 14.5 21.5l-4-8-8-4Z" />,
  'arrow-up': <path d="M12 19.5v-15M5.5 11 12 4.5 18.5 11" />,
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9ZM10 20.5a2.2 2.2 0 0 0 4 0" />,
  'bell-off': <path d="M8.5 4.1A6 6 0 0 1 18 9c0 2.4.4 4.2.9 5.4M17.5 17H3.5S6 15 6 9c0-.6.1-1.2.3-1.8M10 20.5a2.2 2.2 0 0 0 4 0M3 3l18 18" />,
  copy: <><rect x="8.5" y="8.5" width="12" height="12" rx="2" /><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" /></>,
  reply: <path d="M9.5 6.5 4 12l5.5 5.5M4 12h10a6 6 0 0 1 6 6v1.5" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  pin: <><path d="M12 21.5s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.6 3.5M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  'person-cover': <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 11.3-4.4M15 15.5l2 2 4-4.5" /></>,
  door: <><path d="M5 21.5V3.5h11v18M3 21.5h16" /><path d="M12.5 12.5v.01" /></>,
})
