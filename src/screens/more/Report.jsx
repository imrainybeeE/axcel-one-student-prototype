// Report, as Mail compose. This prototype keeps a draft for the current session.
import { useId, useRef, useState } from 'react'
import { Screen } from '../../app'
import { Button, Icon } from '../../ui'
import './more.css'

const draftKey = 'axcel-report-draft'
function readDraft() {
  try { return sessionStorage.getItem(draftKey) || '' } catch { return '' }
}
function saveDraft(value) {
  try {
    if (value) sessionStorage.setItem(draftKey, value)
    else sessionStorage.removeItem(draftKey)
  } catch { /* Storage may be unavailable. */ }
}

export default function Report() {
  const fieldId = useId()
  const field = useRef(null)
  const [text, setText] = useState(readDraft)
  const [done, setDone] = useState(false)
  const empty = !text.trim()
  const discard = () => { saveDraft(''); setText(''); setDone(false) }
  if (done) {
    return (
      <Screen title="Report">
        <div className="report-done" role="status">
          <span className="report-done-mark"><Icon name="check" size={30} /></span>
          <h2 className="report-done-title">Demo complete</h2>
          <p className="report-done-text">Your report was not sent.</p>
          <div className="report-actions">
            <Button onClick={() => setDone(false)}>Edit draft</Button>
            <Button variant="secondary" onClick={discard}>Discard draft</Button>
          </div>
        </div>
      </Screen>
    )
  }
  return (
    <Screen title="Report" action={
      <Button variant="plain" size="compact" className="report-send" aria-disabled={empty || undefined} onClick={() => { if (empty) field.current?.focus(); else setDone(true) }}>
        Try demo
      </Button>
    }>
      <div className="report-form">
        <label className="vh" htmlFor={fieldId}>What went wrong?</label>
        <div className="report-card card">
          <textarea ref={field} id={fieldId} className="report-field" rows={7}
            placeholder="What went wrong? For example, the Join button did nothing."
            value={text} aria-describedby={`${fieldId}-note`}
            onChange={(e) => { setText(e.target.value); saveDraft(e.target.value) }} />
        </div>
        <p id={`${fieldId}-note`} className="settings-note t-soft">Demo only, your report will not be sent.</p>
        {text && <Button variant="plain" onClick={discard}>Discard draft</Button>}
      </div>
    </Screen>
  )
}
