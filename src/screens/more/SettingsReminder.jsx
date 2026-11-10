// One kind of date's reminder, as Calendar's alert list: three choices, a check on the chosen one. Saves as you pick.
import { Screen, announce } from '../../app'
import { ChoiceList, EmptyState } from '../../ui'
import { REMINDER_OPTIONS, REMINDER_SHORT, kindLabel, useReminders } from './reminders.js'
import './more.css'

export default function SettingsReminder({ params }) {
  const [choices, setChoice] = useReminders()
  const label = kindLabel(params.kind)
  if (!label) return <Screen title="Reminders"><EmptyState>That kind of date is not in the calendar.</EmptyState></Screen>
  return (
    <Screen title={label} width="narrow">
      <div className="stack">
        <div className="group">
          <ChoiceList
            legend={`Remind me about ${label.toLowerCase()}`}
            showLegend={false}
            options={REMINDER_OPTIONS}
            value={choices[params.kind]}
            onChange={(v) => { setChoice(params.kind, v); announce(`${label}: ${REMINDER_SHORT[v]}`) }}
          />
        </div>
      </div>
    </Screen>
  )
}
