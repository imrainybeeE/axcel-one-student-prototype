// Report, as Mail compose: the text in one card, then screenshots as attachments (chosen or pasted, up to 5).
// This prototype keeps the draft for the session: the text in sessionStorage, the screenshots in memory until it is
// discarded or the page reloads.
import { useEffect, useId, useRef, useState } from 'react'
import { Screen, announce } from '../../app'
import { Button, Group, Row, Icon, useToast } from '../../ui'
import './more.css'
import './help.css'

const MAX_SHOTS = 5
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

let shotId = 0
// The draft's screenshots outlive the screen, so leaving Report and coming back keeps them
let draftShots = []

export default function Report() {
  const fieldId = useId()
  const field = useRef(null)
  const picker = useRef(null)
  const toast = useToast()
  const [text, setText] = useState(readDraft)
  const [shots, setShots] = useState(() => draftShots) // { id, url }
  const [done, setDone] = useState(false)
  const empty = !text.trim()
  const full = shots.length >= MAX_SHOTS

  // The thumbnails are object URLs, kept with the draft; they are freed when removed or discarded
  const live = useRef(shots)
  useEffect(() => { live.current = shots; draftShots = shots }, [shots])

  const addFiles = (files) => {
    const images = [...files].filter((f) => f.type.startsWith('image/'))
    if (!images.length) return
    const room = MAX_SHOTS - live.current.length
    const taken = images.slice(0, Math.max(0, room)).map((f) => ({ id: ++shotId, url: URL.createObjectURL(f) }))
    if (taken.length) {
      setShots((old) => [...old, ...taken])
      announce(taken.length === 1 ? 'Screenshot added' : `${taken.length} screenshots added`)
    }
    if (images.length > taken.length) toast.show({ message: `You can add up to ${MAX_SHOTS} screenshots.` })
  }
  const remove = (shot) => {
    URL.revokeObjectURL(shot.url)
    setShots((old) => old.filter((s) => s.id !== shot.id))
    announce('Screenshot removed')
  }
  // Pasting a picture anywhere on the screen attaches it; pasted text still lands in the field
  const onPaste = (e) => {
    const files = [...(e.clipboardData?.items || [])].filter((i) => i.kind === 'file' && i.type.startsWith('image/')).map((i) => i.getAsFile()).filter(Boolean)
    if (!files.length) return
    e.preventDefault()
    addFiles(files)
  }
  const discard = () => {
    saveDraft(''); setText(''); setDone(false)
    shots.forEach((s) => URL.revokeObjectURL(s.url)); setShots([])
  }

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
      <div className="report-form" onPaste={onPaste}>
        <label className="vh" htmlFor={fieldId}>What went wrong?</label>
        <div className="report-card card">
          <textarea ref={field} id={fieldId} className="report-field" rows={7}
            placeholder="What went wrong? For example, the Join button did nothing."
            value={text} aria-describedby={`${fieldId}-note`}
            onChange={(e) => { setText(e.target.value); saveDraft(e.target.value) }} />
        </div>
        <p id={`${fieldId}-note`} className="settings-note t-soft">Demo only, your report will not be sent.</p>

        <Group title="Screenshots" className="report-shots-group">
          {shots.length > 0 && (
            <li className="report-shots">
              <ul className="report-shot-list" role="list" aria-label={`${shots.length} of ${MAX_SHOTS} screenshots`}>
                {shots.map((s, i) => (
                  <li key={s.id} className="report-shot">
                    <img src={s.url} alt={`Screenshot ${i + 1}`} width="64" height="64" />
                    <button type="button" className="report-shot-remove" aria-label={`Remove screenshot ${i + 1}`} onClick={() => remove(s)}>
                      <Icon name="close" size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          )}
          <Row
            className={full ? 'row--off' : undefined}
            onClick={full ? undefined : () => picker.current?.click()}
            leadKind="icon"
            lead={<Icon name="photo" />}
            title="Add screenshot"
            meta={full ? `Up to ${MAX_SHOTS}` : null}
          />
        </Group>
        <input ref={picker} type="file" accept="image/*" multiple hidden tabIndex={-1}
          onChange={(e) => { addFiles(e.target.files || []); e.target.value = '' }} />
        <p className="settings-note t-faint">We also send the page you were on, your device and its screen size, so we can find the problem.</p>
        {(text || shots.length > 0) && <Button variant="plain" onClick={discard}>Discard draft</Button>}
      </div>
    </Screen>
  )
}
