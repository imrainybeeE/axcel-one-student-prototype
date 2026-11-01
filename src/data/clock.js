// The prototype's clock. Defaults to Monday 2 November 2026, the next school day.
// Override with ?t=HH.MM (e.g. ?t=8.15, ?t=13.05) and ?d=YYYY-MM-DD to show other moments.
const DEFAULT_DATE = '2026-11-02'
const DEFAULT_TIME = '8.15'

export function getNow(search = typeof window !== 'undefined' ? window.location.search : '') {
  const params = new URLSearchParams(search)
  const [y, m, d] = (params.get('d') || DEFAULT_DATE).split('-').map(Number)
  const [hh, mm] = (params.get('t') || DEFAULT_TIME).split(/[.:]/).map(Number)
  return new Date(y, m - 1, d, hh, mm || 0, 0, 0)
}

// Minutes since midnight, for comparing against lesson times written as "10.30".
export function toMinutes(time) {
  const [h, m] = time.split(/[.:]/).map(Number)
  return h * 60 + (m || 0)
}

export function minutesOf(date) {
  return date.getHours() * 60 + date.getMinutes()
}

// School-style 12-hour time without am/pm: 9.00, 10.30, 1.30.
export function formatTime(date) {
  const h = date.getHours() % 12 || 12
  return `${h}.${String(date.getMinutes()).padStart(2, '0')}`
}

export function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "Wednesday 21 October"
export function longDate(date) {
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`
}
