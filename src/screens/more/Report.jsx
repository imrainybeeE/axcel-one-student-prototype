// Report a problem with the app, as Mail's compose: Send in the bar (dimmed until there is something to send),
// the text in one card, a quiet line under it. The page, screen size and theme go with it automatically.
import { useId, useRef, useState } from 'react'
import { Screen, useDemo } from '../../app'
import { Button, Icon } from '../../ui'
import './more.css'

export default function Report() {
  const { offline } = useDemo()
  const fieldId = useId()
  const field = useRef(null)
  const [text, setText] = useState('')
  const [state, setState] = useState('edit')
  const empty = !text.trim()
  const send = () => {
    if (empty) { field.current?.focus(); return }
    setState('sending')
    setTimeout(() => setState('sent'), 900)
  }
  if (state === 'sent') {
    return (
      <Screen title="Report">
        <div className="report-done" role="status">
          <span className="report-done-mark"><Icon name="check" size={30} /></span>
          <h2 className="report-done-title">Sent to the app team</h2>
          <p className="report-done-text">They usually reply within two school days, in Messages.</p>
        </div>
      </Screen>
    )
  }
  const reason = offline ? 'Sending needs the internet' : null
  return (
    <Screen
      title="Report"
      action={
        <Button variant="plain" size="compact" className="report-send" loading={state === 'sending'} loadingLabel="Sending" unavailable={reason} aria-disabled={(empty && !reason) || undefined} onClick={send}>
          Send
        </Button>
      }
    >
      <div className="report-form">
        <label className="vh" htmlFor={fieldId}>What went wrong?</label>
        <div className="report-card card">
          <textarea
            ref={field}
            id={fieldId}
            className="report-field"
            rows={7}
            placeholder="What went wrong? For example, the Join button did nothing."
            value={text}
            aria-describedby={`${fieldId}-note`}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <p id={`${fieldId}-note`} className="settings-note t-soft">{reason ? `${reason}. Your report waits here until you are back online.` : 'The page you were on is sent automatically.'}</p>
      </div>
    </Screen>
  )
}
