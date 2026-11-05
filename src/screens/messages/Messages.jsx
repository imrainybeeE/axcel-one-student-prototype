// Messages inbox, as Apple Messages: search, one filter row, then one list newest first.
// Unread is a leading blue dot and a darker preview. New message opens the compose sheet.
import { useState } from 'react'
import { Screen, useDemo, useUnreadThreads, navigate, SAVED_AT } from '../../app'
import {
  IconButton,
  Segmented, SearchField, Row, Group, Avatar, Num, Button, Sheet, Icon,
  SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice,
} from '../../ui'
import { threads, contacts } from '../../data/messages.js'
import { kindWord, lastOf, whenLabel } from './messageTime.js'
import Thread from './Thread.jsx'
import './messages.css'

function ComposeSheet({ open, onClose }) {
  const [q, setQ] = useState('')
  const match = (c) => c.name.toLowerCase().includes(q.toLowerCase())
  const teachers = contacts.teachers.filter(match)
  const students = contacts.students.filter(match)
  const pick = (c) => { onClose(); navigate(`/messages/${c.id}`) }
  const nobody = !contacts.teachers.length && !contacts.students.length
  return (
    <Sheet open={open} onClose={onClose} title="New message" detents={['large']} closeLabel="Cancel">
      <div className="compose">
        {nobody ? (
          <EmptyState title="No contacts available." />
        ) : (
          <>
            <SearchField label="Search people" placeholder="Search teachers and classmates" onSearch={setQ} />
            {q === '' && contacts.teachers.length > 0 && (
              <Group title="Your teachers">
                <Row onClick={() => pick(contacts.teachers[0])} lead={<Avatar initials={contacts.teachers[0].initials} />} leadKind="avatar" title={contacts.teachers[0].name} meta={contacts.teachers[0].detail} />
              </Group>
            )}
            {teachers.length > 0 && (
              <Group title="Teachers">
                {teachers.map((c) => <Row key={c.id} onClick={() => pick(c)} lead={<Avatar initials={c.initials} />} leadKind="avatar" title={c.name} meta={c.detail} />)}
              </Group>
            )}
            {students.length > 0 && (
              <Group title="Classmates">
                {students.map((c) => <Row key={c.id} onClick={() => pick(c)} lead={<Avatar initials={c.initials} />} leadKind="avatar" title={c.name} meta={c.detail} />)}
              </Group>
            )}
            {!teachers.length && !students.length && <p className="t-faint">Nobody matches &lsquo;{q}&rsquo;. Check the spelling.</p>}
          </>
        )}
        <p className="compose-note"><Icon name="shield" size={20} />The school can read every message in Axcel One. Messages cannot be deleted.</p>
      </div>
    </Sheet>
  )
}

export default function Messages({ params = {} }) {
  const { state, offline, now, retry, retrying, reconnect, reconnecting } = useDemo()
  const unread = useUnreadThreads()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [compose, setCompose] = useState(false)
  const canCompose = contacts.teachers.length + contacts.students.length > 0
  const selected = params.id

  const list = threads
    .filter((t) => filter === 'all' || (filter === 'unread' ? unread.has(t.id) : filter === 'groups' ? t.kind === 'class' : t.kind === 'announcement'))
    .filter((t) => !q || (t.title + ' ' + t.messages.map((m) => m.text).join(' ')).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => lastOf(b).at - lastOf(a).at)

  let body
  if (state === 'loading') {
    body = <LoadingState label="Getting your messages" onRetry={retry}><SkeletonRows count={5} lead="avatar" /></LoadingState>
  } else if (state === 'empty') {
    body = (
      <EmptyState title="No messages yet." action={canCompose ? <Button variant="primary" icon="pen" onClick={() => setCompose(true)}>New message</Button> : null}>
        Messages from your teachers and classmates will show here.
      </EmptyState>
    )
  } else if (!list.length) {
    body = q ? (
      <EmptyState title={`No messages match ‘${q}’.`}>Try another word, or check the spelling.</EmptyState>
    ) : (
      <EmptyState title={{ all: 'No messages yet.', unread: 'No unread messages.', groups: 'No group messages.', school: 'No school messages.' }[filter]}>{filter === 'unread' ? 'You are all caught up.' : null}</EmptyState>
    )
  } else {
    body = (
      <ul className="list msg-list" role="list" aria-label="Conversations">
        {list.map((t) => {
          const last = lastOf(t)
          const isNew = unread.has(t.id)
          const sender = t.kind === 'class' && last.from !== 'me' ? `${last.from.split(' ')[0]}: ` : last.from === 'me' ? 'You: ' : ''
          return (
            <Row
              key={t.id}
              to={`/messages/${t.id}`}
              zoom={selected !== t.id} /* the open thread's screen holds that zoom name; two mounted at once would clash */
              className={`msg-row${isNew ? ' is-unread' : ''}${selected === t.id ? ' is-selected' : ''}`}
              aria-current={selected === t.id ? 'page' : undefined}
              lead={<Avatar initials={t.initials} kind={t.kind === 'class' ? 'group' : t.kind === 'announcement' ? 'announcement' : 'person'} />}
              leadKind="avatar"
              aria-label={`${t.title}, ${kindWord(t)}${isNew ? ', new message' : ''}, ${whenLabel(last.at, now)}: ${last.text}`}
              title={
                <span className="msg-row-top">
                  <span className="msg-row-name">{t.title}</span>
                  <span className="msg-row-time num">{whenLabel(last.at, now)}</span>
                  <Icon name="chevron-right" size={16} className="msg-row-chev" />
                </span>
              }
              meta={<span className="clamp-2">{sender}{last.text}</span>}
            />
          )
        })}
      </ul>
    )
  }

  const inbox = (
    <>
      <div className="stack">
        {state !== 'empty' && <SearchField label="Search messages" placeholder="Search messages" onSearch={setQ} />}
        {state !== 'empty' && state !== 'loading' && (
          <Segmented
            legend="Show"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'groups', label: 'Groups' },
              { value: 'school', label: 'School' },
            ]}
          />
        )}
        {offline && <OfflineNotice what="messages" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && <ErrorState onRetry={retry} retrying={retrying}>New messages did not load. Check that you are online, then try again. Messages saved at <Num>{SAVED_AT}</Num> are below.</ErrorState>}
        {body}
      </div>
      <ComposeSheet open={compose} onClose={() => setCompose(false)} />
    </>
  )
  // Compose is its glass icon in the bar, as Messages draws it (the name stays for screen readers)
  const composeAction = canCompose ? <IconButton icon="pen" label="New message" onClick={() => setCompose(true)} aria-haspopup="dialog" /> : null
  return (
    <div className={`messages-split${selected ? ' has-thread' : ''}`}>
    <div className="messages-list-pane">
      {selected ? (
        <div className="screen messages-inbox-screen">
          <div className="messages-inbox-heading"><h2 className="t-title-l">Messages</h2>{composeAction}</div>
          <div className="screen-body">{inbox}</div>
        </div>
      ) : <Screen title="Messages" width="narrow" action={composeAction}>{inbox}</Screen>}
    </div>
    <div className="messages-detail-pane">
      {selected ? <Thread key={selected} params={params} /> : <div className="messages-detail-empty">Select a conversation</div>}
    </div>
    </div>
  )
}
