// Muted chats, as Notifications' per-app list: each muted chat, how long it stays muted, and Unmute.
import { Screen, announce } from '../../app'
import { Group, Row, EmptyState, useToast } from '../../ui'
import { useMuted, setMuted } from '../messages/mutedStore.js'
import { formatTime, formatShortDate, schoolParts } from '../../lib/time.js'
import './more.css'

/** "Until 3.40 pm", or "Until Thu 22 October, 8.00 am" when it ends on another day. */
function untilLabel(until) {
  if (until == null) return 'Until you unmute'
  const p = schoolParts(until)
  const time = `${formatTime(until)} ${p.hour < 12 ? 'am' : 'pm'}`
  return p.iso === schoolParts(Date.now()).iso ? `Until ${time}` : `Until ${formatShortDate(until)}, ${time}`
}

export default function SettingsMuted() {
  const toast = useToast()
  const muted = useMuted()
  const unmute = (chat) => { setMuted(chat, false); toast.show({ message: `${chat.name} is unmuted.` }); announce(`${chat.name} is unmuted`) }
  return (
    <Screen title="Muted chats" width="narrow">
      {muted.length === 0 ? (
        <EmptyState title="No muted chats">Mute a chat from its menu in Messages.</EmptyState>
      ) : (
        <div className="stack">
          <div className="group">
            <Group label="Muted chats">
              {muted.map((chat) => (
                <Row
                  key={chat.id}
                  title={chat.name}
                  meta={untilLabel(chat.until)}
                  trailingAction
                  trailing={<button type="button" className="text-link" aria-label={`Unmute ${chat.name}`} onClick={() => unmute(chat)}>Unmute</button>}
                />
              ))}
            </Group>
            <p className="t-faint settings-note">Muted chats still arrive, without a sound or a notification.</p>
          </div>
        </div>
      )}
    </Screen>
  )
}
