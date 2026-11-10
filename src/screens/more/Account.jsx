// Account, as Apple Account: the photo and name centred, read-only details, sign-in and security, then Delete account
// on its own in red. The photo stays on this device; nothing is sent or deleted.
import { useRef, useState } from 'react'
import { Screen, announce } from '../../app'
import { Group, Row, Icon, ActionSheet, ConfirmSheet, useToast } from '../../ui'
import { student } from '../../data/student.js'
import { useProfilePhotoState, photoFromFile } from './profilePhoto.js'
import './more.css'

const PRIVACY = 'https://one.axcel.edu.my/privacy.html'
const MAX_BYTES = 5 * 1024 * 1024

export default function Account() {
  const toast = useToast()
  const [photo, setPhoto] = useProfilePhotoState()
  const [edit, setEdit] = useState(false)
  const [ask, setAsk] = useState(false)
  const file = useRef(null)

  const pick = () => { setEdit(false); file.current?.click() }
  const chosen = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { toast.show({ message: 'Choose a JPEG, PNG or WebP photo.' }); return }
    if (f.size > MAX_BYTES) { toast.show({ message: 'Photos must be 5 MB or smaller.' }); return }
    try {
      setPhoto(await photoFromFile(f))
      announce('Photo updated')
    } catch {
      toast.show({ message: 'That photo could not be opened. Try another.' })
    }
  }
  const remove = () => { setEdit(false); setPhoto(null); announce('Photo removed') }
  const actions = photo ? [{ label: 'Choose photo', onSelect: pick }, { label: 'Remove photo', onSelect: remove }] : [{ label: 'Choose photo', onSelect: pick }]

  return (
    <Screen title="Account" width="narrow" className="screen-account">
      <div className="stack">
        <section className="acct-head" aria-label="Your profile">
          <span className="acct-avatar" aria-hidden="true">
            {photo ? <img src={photo} alt="" width="96" height="96" /> : student.initials}
          </span>
          <button type="button" className="text-link acct-edit" aria-haspopup="dialog" onClick={() => setEdit(true)}>Edit photo</button>
          <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="vh" tabIndex={-1} aria-hidden="true" onChange={chosen} />
          <h2 className="acct-name">{student.fullName}</h2>
          <p className="acct-email">{student.email}</p>
        </section>

        <div className="group acct-details">
          <Group title="Details">
            <Row title="Name" trailing={student.fullName} />
            <Row title="Class" trailing={student.className} />
            <Row title="House" trailing={student.house} />
            <Row title="Student ID" trailing={student.studentId} />
            <Row title="Email" trailing={student.email} />
          </Group>
          <p className="t-faint settings-note">To correct these, ask your homeroom teacher or the school office.</p>
        </div>

        <Group title="Sign-in and security">
          <Row to="/account/password" title="Change password" chevron />
        </Group>

        <Group label="Privacy">
          <Row
            title="Privacy Policy"
            onClick={() => window.open(PRIVACY, '_blank', 'noopener,noreferrer')}
            aria-label="Privacy Policy, opens in a new tab"
            trailing={<Icon name="arrow-up-right" size={18} className="acct-ext" />}
          />
        </Group>

        {/* Destructive, so on its own and in red, as Settings sets Sign Out */}
        <Group label="Delete account">
          <Row className="row--destructive" title="Delete account" onClick={() => setAsk(true)} />
        </Group>
      </div>

      <ActionSheet open={edit} onClose={() => setEdit(false)} title="Profile photo" actions={actions} />
      <ConfirmSheet
        open={ask}
        onClose={() => setAsk(false)}
        title="Delete your account?"
        message="Your messages, settings and photo would be removed. Your school record stays with the school. In this demo nothing is deleted."
        confirmLabel="Delete account"
        onConfirm={() => { setAsk(false); toast.show({ message: 'Demo: your account was not deleted.' }) }}
      />
    </Screen>
  )
}
