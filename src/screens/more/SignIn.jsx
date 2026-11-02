// Sign-in, as the Apple Account sheet: email and password in one grouped card with their labels on the left,
// never prefilled, paste allowed, errors under the card with role=alert. Demo: any password works except "wrong".
import { useId, useRef, useState } from 'react'
import { assetPath, navigate, useDemo } from '../../app'
import { Button, Icon } from '../../ui'
import './more.css'

export default function SignIn() {
  const { offline } = useDemo()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState({})
  const emailField = useRef(null)
  const passwordField = useRef(null)
  const id = useId()
  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!email.trim()) next.email = 'Enter your school email.'
    else if (!validEmail(email)) next.email = 'Enter a valid email address.'
    if (!pw) next.pw = 'Enter your password.'
    setErr(next)
    if (Object.keys(next).length) { (next.email ? emailField : passwordField).current?.focus(); return }
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      if (pw === 'wrong') { setErr({ pw: 'That password is not right. Check it and try again.' }); passwordField.current?.focus() }
      else navigate('/')
    }, 900)
  }
  return (
    <div className="signin">
      <img src={assetPath('brand/logo-horizontal.png')} alt="Axcel One" width="192" height="40" className="signin-logo" />
      <h1 className="t-title-l signin-title">Sign in</h1>
      <p className="t-soft">Prototype only. Do not enter your Axcel One password.</p>
      <form onSubmit={submit} noValidate className="signin-form">
        <div className="signin-card card">
          <div className={`signin-row${err.email ? ' is-error' : ''}`}>
            <label htmlFor={`${id}-email`}>Email</label>
            <input
              ref={emailField} id={`${id}-email`} type="email" autoComplete="username" autoCapitalize="none" inputMode="email" spellCheck={false}
              placeholder="you@axcel.edu.my" value={email} onChange={(e) => { const value = e.target.value; setEmail(value); if (validEmail(value)) setErr((old) => ({ ...old, email: undefined })) }}
              aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? `${id}-email-error` : undefined}
            />
          </div>
          <div className={`signin-row${err.pw ? ' is-error' : ''}`}>
            <label htmlFor={`${id}-pw`}>Password</label>
            <input
              ref={passwordField} id={`${id}-pw`} type={show ? 'text' : 'password'} autoComplete="current-password"
              placeholder="Required" value={pw} onChange={(e) => { setPw(e.target.value); if (e.target.value) setErr((old) => ({ ...old, pw: undefined })) }}
              aria-invalid={err.pw ? true : undefined} aria-describedby={err.pw ? `${id}-pw-error` : undefined}
            />
            <button type="button" className="signin-show" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        {err.email && <p id={`${id}-email-error`} className="report-error signin-err" role="alert"><Icon name="alert" size={18} />{err.email}</p>}
        {err.pw && <p id={`${id}-pw-error`} className="report-error signin-err" role="alert"><Icon name="alert" size={18} />{err.pw}</p>}
        <Button variant="primary" full type="submit" loading={busy} loadingLabel="Signing in" unavailable={offline ? 'You are offline. Connect to sign in.' : null}>Sign in</Button>
        <Button variant="secondary" full type="button" onClick={() => navigate('/')}>Continue demo</Button>
      </form>
      <p className="t-soft signin-help">Forgot your password or need help? Ask your class teacher, or the Secondary Office.</p>
    </div>
  )
}
