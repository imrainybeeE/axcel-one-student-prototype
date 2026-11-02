// Settings: preferences save when changed.
import { useState } from 'react'
import { Screen, useTheme, usePref, announce, useDemo } from '../../app'
import { Group, Switch, Row, Icon, Notice } from '../../ui'
import { useBlocked, setBlockedPerson } from '../messages/blockedStore.js'
import './more.css'

export default function Settings() {
  const blockedPeople = useBlocked()
  const { pref, resolved, setPref } = useTheme()
  const choose = (v) => { setPref(v); announce(`Appearance: ${v === 'auto' ? 'Automatic' : v === 'dark' ? 'Dark' : 'Light'}`) }
  const { offline } = useDemo()
  const [notify, setNotify] = usePref('notify', { messages: true, timetable: true, notices: true, quiet: true, preview: false })
  const [keep, setKeep] = usePref('keepToasts', false)
  const [saved, setSaved] = useState(null)
  const standalone = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches
  const set = (k) => (v) => { setNotify({ ...notify, [k]: v }); setSaved('Saved.'); announce('Saved') }
  const need = offline ? 'Needs the internet' : null
  return (
    <Screen title="Settings">
      <div className="stack">
        <section className="appear-group" aria-labelledby="appear-h">
          <div className="section-head"><h2 id="appear-h">Appearance</h2></div>
          <div className="appear-card card">
          <div className="appear">
            <div className="appear-pick" role="radiogroup" aria-label="Appearance">
              {['light', 'dark'].map((look) => {
                const on = resolved === look
                return (
                  <button
                    key={look}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className="appear-opt"
                    onClick={() => choose(look)}
                  >
                    <span className="appear-phone" data-look={look} aria-hidden="true"><i /><i /><i /><i /></span>
                    <span className="appear-name">{look === 'light' ? 'Light' : 'Dark'}</span>
                    <span className="appear-check" aria-hidden="true">{on && <Icon name="check" size={14} />}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <ul className="list" role="list">
            <Switch label="Automatic" description="Follows your phone" checked={pref === 'auto'} onChange={(v) => choose(v ? 'auto' : resolved)} />
          </ul>
          </div>
        </section>
        <section className="group" aria-labelledby="notifications-h">
          <div className="section-head"><h2 id="notifications-h">Notifications</h2></div>
          <p className="t-faint settings-note" style={{ marginBottom: 'var(--space-2)' }}>Demo: notifications are not sent.</p>
          <ul className="list" role="list">
          <Switch label="Messages" description="When someone messages you" checked={notify.messages} onChange={set('messages')} unavailable={need} />
          <Switch label="Timetable changes" description="Room changes, cancelled lessons, online links" checked={notify.timetable} onChange={set('timetable')} unavailable={need} />
          <Switch label="School notices" description="Announcements from the school office" checked={notify.notices} onChange={set('notices')} unavailable={need} />
          <Switch label="Quiet hours, 9 pm to 7 am" description="Notifications wait until morning" checked={notify.quiet} onChange={set('quiet')} unavailable={need} />
          <Switch label="Show message text on the lock screen" checked={notify.preview} onChange={set('preview')} unavailable={need} />
          </ul>
        </section>
        {saved && <p className="t-faint settings-note" role="status">{saved}</p>}
        {!standalone && (
          <Group title="Add to Home Screen">
            <Row lead={<Icon name="info" />} leadKind="icon" title="On iPhone" meta="Tap Share, then Add to Home Screen." />
            <Row lead={<Icon name="info" />} leadKind="icon" title="On Android" meta="Tap the menu, then Install app." />
          </Group>
        )}
        <section className="group" aria-labelledby="messages-h">
          <div className="section-head"><h2 id="messages-h">Messages</h2></div>
          <p className="t-faint settings-note" style={{ marginBottom: 'var(--space-2)' }}>Demo blocks do not stop messages.</p>
          <ul className="list" role="list">
          <Row lead={<Icon name="shield" />} leadKind="icon" title="How messages are monitored" meta="The school can read every message in Axcel One. Messages cannot be deleted." />
          {blockedPeople.length === 0 ? <Row lead={<Icon name="block" />} leadKind="icon" title="Blocked people" meta="Nobody blocked" /> : blockedPeople.map((person) => (
            <Row key={person.id} lead={<Icon name="block" />} leadKind="icon" title={person.name} trailingAction trailing={<button type="button" className="text-link" onClick={() => { setBlockedPerson(person, false); announce(`${person.name} unblocked`) }}>Unblock</button>} />
          ))}
          </ul>
        </section>
        <Group title="Accessibility">
          <Switch label="Keep messages on screen until I close them" description="Undo and other notes stay until you close them" checked={keep} onChange={(v) => { setKeep(v); announce('Saved') }} />
          <Row lead={<Icon name="eye" />} leadKind="icon" title="Text size" meta="Axcel One follows the text size set on your phone." />
        </Group>
        {offline && <Notice>Connect to change notification settings.</Notice>}
      </div>
    </Screen>
  )
}
