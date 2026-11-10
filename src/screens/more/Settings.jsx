// Settings: preferences save when changed.
import { useState } from 'react'
import { Screen, useTheme, usePref, announce, useDemo } from '../../app'
import { Group, Switch, Row, Icon, Notice, Num } from '../../ui'
import { useBlocked, setBlockedPerson } from '../messages/blockedStore.js'
import { useMuted } from '../messages/mutedStore.js'
import './more.css'

const NOTIFY = { messages: true, timetable: true, notices: true, quiet: true, quietFrom: '21:00', quietTo: '07:00', unread: true, preview: false }

/** '21:00' -> '9 pm' ('9.00 pm' with full), '06:30' -> '6.30 am' */
function clock(hhmm, full = false) {
  const [h, m] = String(hhmm || '00:00').split(':').map(Number)
  return `${h % 12 || 12}${m || full ? `.${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`
}

/** A From or To row (Focus schedule): the label, then the time in a grey chip that opens the system time picker. */
function TimeRow({ label, value, onChange }) {
  return (
    <li className="choice-row time-row">
      <label className="choice-hit">
        <span className="choice-text"><span className="choice-label">{label}</span></span>
        <span className="time-chip">
          <span aria-hidden="true">{clock(value, true)}</span>
          <input
            type="time"
            value={value}
            required
            onClick={(e) => { try { e.currentTarget.showPicker?.() } catch { /* the field still takes typing */ } }}
            onChange={(e) => { if (e.target.value) onChange(e.target.value) }}
          />
        </span>
      </label>
    </li>
  )
}

export default function Settings() {
  const blockedPeople = useBlocked()
  const { pref, resolved, setPref } = useTheme()
  const choose = (v) => { setPref(v); announce(`Appearance: ${v === 'auto' ? 'Automatic' : v === 'dark' ? 'Dark' : 'Light'}`) }
  const { offline } = useDemo()
  const [stored, setNotify] = usePref('notify', NOTIFY)
  const notify = { ...NOTIFY, ...stored }
  const muted = useMuted()
  const [keep, setKeep] = usePref('keepToasts', false)
  const [saved, setSaved] = useState(null)
  const standalone = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches
  const set = (k, group = 'notify') => (v) => { setNotify({ ...notify, [k]: v }); setSaved(group); announce('Saved') }
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
          <ul className="list" role="list">
          <Switch label="Messages" description="When someone messages you" checked={notify.messages} onChange={set('messages')} unavailable={need} />
          <Switch label="Timetable changes" description="Room changes, cancelled lessons, online links" checked={notify.timetable} onChange={set('timetable')} unavailable={need} />
          <Switch label="School notices" description="Announcements from the school office" checked={notify.notices} onChange={set('notices')} unavailable={need} />
          <Switch label="PE kit reminder" description="At 8 pm the evening before a day with PE" checked={!!notify.peKit} onChange={set('peKit')} unavailable={need} />
          <Row to="/settings/calendar" title="Calendar reminders" chevron />
          <Switch label="Quiet hours" description={`Notifications wait from ${clock(notify.quietFrom)} to ${clock(notify.quietTo)}`} checked={notify.quiet} onChange={set('quiet')} unavailable={need} />
          {notify.quiet && !need && <>
            <TimeRow label="From" value={notify.quietFrom} onChange={set('quietFrom')} />
            <TimeRow label="To" value={notify.quietTo} onChange={set('quietTo')} />
          </>}
          </ul>
          <p className="t-faint settings-note">{saved === 'notify' ? 'Saved. ' : ''}Demo: notifications are not sent.</p>
        </section>
        <section className="group" aria-labelledby="messages-h">
          <div className="section-head"><h2 id="messages-h">Messages</h2></div>
          <ul className="list" role="list">
          <Switch label="Unread reminder" description="Once at about 1 pm and 6 pm, for chats unread 2 hours or more" checked={notify.unread} onChange={set('unread', 'messages')} unavailable={need} />
          <Switch label="Show message text on the lock screen" checked={notify.preview} onChange={set('preview', 'messages')} unavailable={need} />
          <Row to="/settings/muted" title="Muted chats" trailing={muted.length ? <Num>{muted.length}</Num> : 'None'} chevron />
          {blockedPeople.length === 0 ? <Row title="Blocked people" trailing="None" /> : blockedPeople.map((person) => (
            <Row key={person.id} title={person.name} meta="Blocked" trailingAction trailing={<button type="button" className="text-link" aria-label={`Unblock ${person.name}`} onClick={() => { setBlockedPerson(person, false); announce(`${person.name} unblocked`) }}>Unblock</button>} />
          ))}
          </ul>
          <p className="t-faint settings-note">{saved === 'messages' ? 'Saved. ' : ''}The school can read every message in Axcel One, and messages cannot be deleted. Demo blocks do not stop messages.</p>
        </section>
        {!standalone && (
          <Group title="Add to Home Screen">
            <Row lead={<Icon name="info" />} leadKind="icon" title="On iPhone" meta="Tap Share, then Add to Home Screen." />
            <Row lead={<Icon name="info" />} leadKind="icon" title="On Android" meta="Tap the menu, then Install app." />
          </Group>
        )}
        <Group title="Accessibility">
          <Switch label="Keep messages on screen until I close them" description="Undo and other notes stay until you close them" checked={keep} onChange={(v) => { setKeep(v); announce('Saved') }} />
          <Row lead={<Icon name="eye" />} leadKind="icon" title="Text size" meta="Axcel One follows the text size set on your phone." />
        </Group>
        {offline && <Notice>Connect to change notification settings.</Notice>}
      </div>
    </Screen>
  )
}
