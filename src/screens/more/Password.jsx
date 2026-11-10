// Change password, as Sign-In and Security: three secure fields, Change in the bar, errors under the field they belong to.
// Nothing is prefilled, stored or sent.
import { useRef, useState } from 'react'
import { Screen, useBack } from '../../app'
import { Button, Icon, TextField, useToast } from '../../ui'
import { student } from '../../data/student.js'
import './more.css'

function Secret({ label, hint, value, onChange, error, autoComplete, inputRef }) {
  const [show, setShow] = useState(false)
  return (
    <TextField
      label={label}
      hint={hint}
      error={error}
      errorRole="alert"
      className="pw-field"
      ref={inputRef}
      type={show ? 'text' : 'password'}
      autoComplete={autoComplete}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      trailing={
        <button type="button" className="pw-eye" aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={show} onClick={() => setShow((v) => !v)}>
          <Icon name={show ? 'eye-off' : 'eye'} size={22} />
        </button>
      }
    />
  )
}

export default function Password() {
  const toast = useToast()
  const back = useBack()
  const [v, setV] = useState({ old: '', next: '', confirm: '' })
  const [err, setErr] = useState({})
  const oldRef = useRef(null)
  const newRef = useRef(null)
  const confirmRef = useRef(null)
  const refOf = (k) => (k === 'old' ? oldRef : k === 'next' ? newRef : confirmRef)
  const filled = v.old && v.next && v.confirm
  const field = (k) => (value) => { setV((o) => ({ ...o, [k]: value })); if (err[k]) setErr((o) => ({ ...o, [k]: undefined })) }

  const submit = (e) => {
    e?.preventDefault()
    if (!filled) { refOf(['old', 'next', 'confirm'].find((k) => !v[k])).current?.focus(); return }
    const next = {}
    if (v.next.length < 8) next.next = 'Use at least 8 characters.'
    else if (v.next === v.old) next.next = "Choose a password you haven't used here."
    else if (v.next !== v.confirm) next.confirm = "The new passwords don't match."
    setErr(next)
    const first = ['next', 'confirm'].find((k) => next[k])
    if (first) { refOf(first).current?.focus(); return }
    setV({ old: '', next: '', confirm: '' })
    toast.show({ message: 'Demo: your password was not changed.' })
    back?.go()
  }

  return (
    <Screen title="Password" width="narrow" action={
      <Button variant="plain" size="compact" className="pw-change" aria-disabled={!filled || undefined} onClick={submit}>Change</Button>
    }>
      <form className="pw-form" onSubmit={submit} noValidate>
        <div className="card pw-card">
          <Secret label="Current password" value={v.old} onChange={field('old')} error={err.old} autoComplete="current-password" inputRef={oldRef} />
          <Secret label="New password" hint="At least 8 characters." value={v.next} onChange={field('next')} error={err.next} autoComplete="new-password" inputRef={newRef} />
          <Secret label="Confirm new password" value={v.confirm} onChange={field('confirm')} error={err.confirm} autoComplete="new-password" inputRef={confirmRef} />
        </div>
        {/* Enter in the last field submits, as the bar's Change does */}
        <button type="submit" className="vh" tabIndex={-1} aria-hidden="true">Change</button>
        <Button variant="plain" className="pw-forgot" onClick={() => toast.show({ message: `Demo: no reset email was sent. In the real app we email a link to ${student.email}.` })}>
          Forgot your current password?
        </Button>
      </form>
    </Screen>
  )
}
