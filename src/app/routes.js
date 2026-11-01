// Every screen area exports its routes from src/screens/<area>/routes.js. This file only collects them.
// Order matters for matching: specific patterns before general ones; the catch-all is last.
import today from '../screens/today/routes.js'
import timetable from '../screens/timetable/routes.js'
import messages from '../screens/messages/routes.js'
import calendar from '../screens/calendar/routes.js'
import record from '../screens/record/routes.js'
import more from '../screens/more/routes.js'
import kit from '../screens/kit/routes.js'
import NotFound from './NotFound.jsx'

export const routes = [
  ...today,
  ...timetable,
  ...messages,
  ...calendar,
  ...record,
  ...more,
  ...kit,
  { path: '*', tab: 'inherit', defaultTab: 'today', title: 'Not found', component: NotFound },
]
