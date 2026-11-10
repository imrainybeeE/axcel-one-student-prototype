// Calendar reminders, as Calendar's Default Alert Times: one row per kind of date, its choice in grey, each pushing a short list.
import { Screen } from '../../app'
import { Group, Row } from '../../ui'
import { REMINDER_KINDS, REMINDER_SHORT, kindLabel, useReminders } from './reminders.js'
import './more.css'

export default function SettingsCalendar() {
  const [choices] = useReminders()
  return (
    <Screen title="Reminders" width="narrow">
      <div className="stack">
        <div className="group">
          <Group label="Calendar reminders">
            {REMINDER_KINDS.map((k) => (
              <Row key={k} to={`/settings/calendar/${k}`} title={kindLabel(k)} trailing={REMINDER_SHORT[choices[k]]} chevron />
            ))}
          </Group>
          <p className="t-faint settings-note">Reminders come at 8 am. One due on a weekend comes on the Friday before.</p>
        </div>
      </div>
    </Screen>
  )
}
