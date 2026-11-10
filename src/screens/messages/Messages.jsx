// Messages inbox, as Apple Messages: search, one filter row, then one list newest first.
// Unread is a leading blue dot and a darker preview. New message opens the compose sheet.
import { useState } from 'react'
import { Screen, useDemo, useUnreadThreads, navigate, SAVED_AT, useLaptop, useRoute } from '../../app'
import {
  IconButton,
  Segmented, SearchField, Row, Group, Avatar, Num, Button, Sheet, Icon,
  SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice,
  MiniBar, MiniTile, MiniAction, Badge, useOutOfView,
} from '../../ui'
import { threads, contacts } from '../../data/messages.js'
import { student } from '../../data/student.js'
import '../../data/messageHistory.js' // the threads' earlier messages
import { kindWord, lastOf, whenLabel } from './messageTime.js'
import Thread from './Thread.jsx'
import Starred from './Starred.jsx'
import { sentIn, sentThreads, useSent } from './sentStore.js'
import { threadFor } from './messageParts.js'
import './messages.css'

function ComposeSheet({ open, onClose }) {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const match = (c) => c.name.toLowerCase().includes(needle) || (c.studentId || '').toLowerCase().includes(needle)
  const teachers = contacts.teachers.filter(match)
  const staff = contacts.staff.filter(match)
  // Before a search, only your class; a search finds any student in the school by name or student ID
  const students = contacts.students.filter((c) => (needle ? match(c) : c.detail === student.className))
  const pick = (c) => { onClose(); navigate(`/messages/${c.id}`) }
  const nobody = !contacts.teachers.length && !contacts.students.length
  const person = (c, meta = c.detail) => <Row key={c.id} onClick={() => pick(c)} lead={<Avatar initials={c.initials} />} leadKind="avatar" title={c.name} meta={meta} />
  return (
    <Sheet open={open} onClose={onClose} title="New message" detents={['large']} closeLabel="Cancel">
      <div className="compose">
        {nobody ? (
          <EmptyState title="No contacts available." />
        ) : (
          <>
            <SearchField label="Search people" placeholder="Search names or student IDs" onSearch={setQ} />
            {!needle && contacts.teachers.length > 0 && (
              <Group title="Your teachers">{person(contacts.teachers[0])}</Group>
            )}
            {teachers.length > 0 && <Group title="Teachers">{teachers.map((c) => person(c))}</Group>}
            {staff.length > 0 && <Group title="School staff">{staff.map((c) => person(c))}</Group>}
            {students.length > 0 && (
              <Group title={needle ? 'Students' : 'Your class'}>{students.map((c) => person(c, needle ? `${c.detail}, ${c.studentId}` : c.detail))}</Group>
            )}
            {needle && !teachers.length && !staff.length && !students.length && (
              <EmptyState title={`Nobody matches ‘${q.trim()}’.`}>Check the spelling, or search a student ID such as 00BP105.</EmptyState>
            )}
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
  const wide = useLaptop()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [compose, setCompose] = useState(false)
  const canCompose = contacts.teachers.length + contacts.students.length > 0
  const { route } = useRoute()
  const starredOpen = route.path === '/messages/starred'
  const selected = params.id

  // Every chat with what you sent this session on the end, and chats you started from New message
  useSent()
  const chats = [...threads, ...sentThreads().filter((id) => !threads.some((t) => t.id === id)).map(threadFor).filter(Boolean)]
    .map((t) => (sentIn(t.id).length ? { ...t, messages: [...t.messages, ...sentIn(t.id)] } : t))
  const preview = (m) => (m.file ? `Document: ${m.file.name}` : m.text)
  const list = chats
    .filter((t) => filter === 'all' || (filter === 'unread' ? unread.has(t.id) : filter === 'groups' ? t.kind === 'class' : t.kind === 'announcement'))
    .filter((t) => !q || (t.title + ' ' + t.messages.map(preview).join(' ')).toLowerCase().includes(q.toLowerCase()))
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
      <EmptyState mood={filter === 'unread' ? 'happy' : 'calm'} title={{ all: 'No messages yet.', unread: 'No unread messages.', groups: 'No group messages.', school: 'No school messages.' }[filter]}>{filter === 'unread' ? 'You are all caught up.' : null}</EmptyState>
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
              zoom={!wide && !selected} /* phone only: on a laptop the list stays beside the thread; under an open thread the list is hidden, so its rows must not pair */
              className={`msg-row${isNew ? ' is-unread' : ''}${selected === t.id ? ' is-selected' : ''}`}
              aria-current={selected === t.id ? 'page' : undefined}
              lead={<Avatar initials={t.initials} kind={t.kind === 'class' ? 'group' : t.kind === 'announcement' ? 'announcement' : 'person'} />}
              leadKind="avatar"
              aria-label={`${t.title}, ${kindWord(t)}${isNew ? ', new message' : ''}, ${whenLabel(last.at, now)}: ${preview(last)}`}
              title={
                <span className="msg-row-top">
                  <span className="msg-row-name">{t.title}</span>
                  <span className="msg-row-time num">{whenLabel(last.at, now)}</span>
                </span>
              }
              meta={<span className="clamp-2">{sender}{last.status === 'queued' ? 'Waiting to send: ' : ''}{preview(last)}</span>}
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
  // The capsule, once the search and filters have scrolled away: the newest unread conversation, or New message
  const ready = state !== 'loading' && state !== 'empty' && !selected && !starredOpen
  const miniShown = useOutOfView(() => document.querySelector('.messages-inbox-screen .seg'), { enabled: ready })
  const newest = threads.filter((t) => unread.has(t.id)).sort((a, b) => lastOf(b).at - lastOf(a).at)[0]
  let mini = null
  if (ready && newest) {
    const last = lastOf(newest)
    const from = newest.kind === 'class' && last.from !== 'me' ? `${last.from.split(' ')[0]}: ` : ''
    mini = (
      <MiniBar
        shown={miniShown}
        onOpen={() => navigate(`/messages/${newest.id}`)}
        label={`${newest.title}, new message: ${last.text}${unread.size > 1 ? `. ${unread.size} unread conversations` : ''}. Open`}
        tile={(
          <MiniTile kind="bare">
            <Avatar initials={newest.initials} kind={newest.kind === 'class' ? 'group' : newest.kind === 'announcement' ? 'announcement' : 'person'} size={38} />
            <Badge count={unread.size > 1 ? unread.size : 0} />
          </MiniTile>
        )}
        title={newest.title}
        sub={<>{from}{last.text}</>}
        action={canCompose && <MiniAction icon="pen" label="New message" onClick={() => setCompose(true)} haspopup="dialog" />}
      />
    )
  } else if (ready && canCompose) {
    mini = (
      <MiniBar
        shown={miniShown}
        onOpen={() => setCompose(true)}
        haspopup="dialog"
        label="New message"
        tile={<MiniTile kind="icon" icon="pen" tone="var(--brand-solid)" />}
        title="New message"
        sub="You're all caught up"
      />
    )
  }
  // Compose is its glass icon in the bar, as Messages draws it (the name stays for screen readers); Starred sits before it
  const composeAction = (
    <>
      <IconButton icon="star" label="Starred messages" onClick={() => navigate('/messages/starred')} data-liquid="" data-liquid-bezel="12" data-liquid-strength="10" />
      {canCompose && <IconButton icon="pen" label="New message" onClick={() => setCompose(true)} aria-haspopup="dialog" data-liquid="" data-liquid-bezel="12" data-liquid-strength="10" />}
    </>
  )
  // Starred is a pushed screen: on a phone it is the whole page; on a laptop it takes the list column, as a thread takes the other
  if (starredOpen && !wide) return <Starred />
  return (
    <div className={`messages-split${selected ? ' has-thread' : ''}`}>
    <div className="messages-list-pane">
      {starredOpen ? <Starred /> : selected ? (
        <div className="screen messages-inbox-screen">
          <div className="messages-inbox-heading"><h2 className="t-title-l">Messages</h2><span className="messages-inbox-actions">{composeAction}</span></div>
          <div className="screen-body">{inbox}</div>
        </div>
      ) : <Screen title="Messages" width="narrow" className="messages-inbox-screen" action={composeAction}>{inbox}{mini}</Screen>}
    </div>
    <div className="messages-detail-pane">
      {selected ? <Thread key={selected} params={params} /> : <div className="messages-detail-empty">{starredOpen ? 'Choose a starred message to see it in its chat' : 'Select a conversation'}</div>}
    </div>
    </div>
  )
}
