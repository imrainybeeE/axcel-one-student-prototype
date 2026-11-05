import { useEffect, useRef, useState } from 'react'
import { Screen, useDemo, markThreadRead, navigate, SAVED_AT } from '../../app'
import {
  Avatar, Button, IconButton, Icon, Sheet, ActionSheet, ConfirmSheet, Num, Notice,
  LoadingState, ErrorState, useToast,
} from '../../ui'
import { threads, contacts } from '../../data/messages.js'
import { messageAt, separatorLabel, isStudent } from './messageTime.js'
import { formatTime } from '../../lib/time.js'
import { useBlocked, setBlockedPerson } from './blockedStore.js'
import './messages.css'

const REACTIONS = [
  { e: '👍', name: 'Thumbs up' }, { e: '❤️', name: 'Heart' }, { e: '😂', name: 'Laughing' },
  { e: '😮', name: 'Surprised' }, { e: '❓', name: 'Question' }, { e: '✅', name: 'Done' },
]
const MONITOR = 'The school can read every message in Axcel One. Messages cannot be deleted.'

function threadFor(id) {
  const t = threads.find((x) => x.id === id)
  if (t) return t
  const c = [...contacts.teachers, ...contacts.students].find((x) => x.id === id)
  return c ? { id: c.id, kind: 'direct', title: c.name, subtitle: c.detail, initials: c.initials, messages: [] } : null
}

/**
 * Bubbles grouped by sender within 5 minutes. As Messages, time is never under each bubble: a centred separator gives
 * the day and time when the day changes or an hour has passed, and the unread divider marks where you left off.
 */
function layout(thread, extra, now, unreadFrom) {
  const all = [...thread.messages.map((m) => ({ ...m, at: messageAt(m) })), ...extra]
  const out = []
  let prev = null
  // The message before a break in the run (a separator, the divider or another sender) ends its group: it gets the tail
  const endGroup = () => { const last = [...out].reverse().find((x) => x.type === 'msg'); if (last) last.last = true }
  all.forEach((m, i) => {
    const sep = separatorLabel(m.at, now)
    const newBlock = !prev || separatorLabel(prev.at, now) !== sep || m.at - prev.at >= 60 * 60000
    const sameGroup = !newBlock && prev.from === m.from && m.at - prev.at < 5 * 60000 && unreadFrom !== m.id
    if (!sameGroup) endGroup()
    if (newBlock) out.push({ type: 'sep', label: sep, time: m.at, key: `sep-${i}` })
    // The divider only when unread starts inside a block; right under a separator, the separator already marks it
    if (unreadFrom === m.id && !newBlock) out.push({ type: 'new', key: 'new' })
    out.push({ type: 'msg', m, first: !sameGroup, unreadStart: unreadFrom === m.id, key: m.id })
    prev = m
  })
  endGroup()
  return out
}

function Bubble({ item, thread, onOpen, onRetry, reactions }) {
  const { m, first, last } = item
  const mine = m.from === 'me'
  const showName = thread.kind === 'class' && !mine && first
  const status = m.status
  const chips = reactions[m.id] ?? m.reactions ?? []
  return (
    <div className={`msg${mine ? ' msg--mine' : ''}${first ? ' is-first' : ''}${last ? ' is-last' : ''}${status === 'failed' ? ' is-failed' : ''}${chips.length ? ' has-react' : ''}`}>
      {!mine && thread.kind === 'class' && <span className="msg-avatar">{last && <Avatar initials={m.from.replace(/^(Mr|Mrs|Ms|Miss|Dr|Puan|Encik|Cikgu)\.? /, '').split(' ').map((w) => w[0]).join('').slice(0, 2)} size={32} />}</span>}
      <div className="msg-col">
        {showName && <span className="msg-name">{m.from}{m.role === 'teacher' && <span className="msg-role"> Teacher</span>}</span>}
        <button type="button" className="msg-bubble" aria-haspopup="dialog" onClick={() => onOpen(m)}>
          <span className="vh">{mine ? 'You said' : `${m.from === 'them' ? thread.title : m.from} said`}</span>
          {m.replyTo && <span className="msg-quote"><strong>{m.replyTo.who}</strong> {m.replyTo.text}</span>}
          {m.text}
        </button>
        {chips.length > 0 && (
          <span className="msg-reactions">
            {chips.map((r) => <span key={r.emoji} className="msg-chip">{r.emoji}{r.count > 1 && <Num>{r.count}</Num>}</span>)}
          </span>
        )}
        {status === 'failed' && (
          <button type="button" className="msg-retry" onClick={() => onRetry(m)}><Icon name="alert" size={20} />Not sent. Tap to try again.</button>
        )}
        {status === 'queued' && <span className="msg-meta"><Icon name="clock" size={18} />Waiting to send</span>}
        {status === 'sending' && <span className="msg-meta">Sending</span>}
        {last && mine && !status && (m.seen || m.justSent) && (
          <span className="msg-meta">{m.seen ? <>Seen <Num>{m.seen}</Num></> : 'Sent'}</span>
        )}
      </div>
    </div>
  )
}

function ReportSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Report" detents={['large']}>
      <div className="report-note">
        <p className="t-title-s">Tell a trusted teacher in person.</p>
        <p className="t-soft t-footnote">Demo only: this report is not sent.</p>
        <Button variant="primary" full onClick={onClose}>Done</Button>
      </div>
    </Sheet>
  )
}

export default function Thread({ params }) {
  const { state, offline, now, retry, retrying, reconnect, reconnecting } = useDemo()
  const toast = useToast()
  const thread = threadFor(params.id)
  const [extra, setExtra] = useState([])
  const [reactions, setReactions] = useState({})
  const [draft, setDraft] = useState('')
  const [reply, setReply] = useState(null)
  const [actionMsg, setActionMsg] = useState(null)
  const [menu, setMenu] = useState(false)
  const [shield, setShield] = useState(false)
  const [report, setReport] = useState(false)
  const [blockAsk, setBlockAsk] = useState(false)
  const blockedPeople = useBlocked()
  const blocked = blockedPeople.some((person) => person.id === params.id)
  const [mutedUntil, setMutedUntil] = useState(null)
  const endRef = useRef(null)
  const [unreadFrom] = useState(() => (thread?.unread ? thread.messages[thread.messages.length - thread.unread]?.id : null))

  useEffect(() => { if (thread) markThreadRead(thread.id) }, [thread])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [extra.length])

  if (!thread) {
    return <Screen title="Message"><p>This chat could not be found. <button type="button" className="text-link" onClick={() => navigate('/messages')}>Back to Messages</button></p></Screen>
  }

  const student = isStudent(thread)
  const readOnly = thread.kind === 'announcement'
  const items = layout(thread, extra, now, unreadFrom)

  const send = (text, id = `x${Date.now()}`) => {
    const m = { id, from: 'me', text, at: now, replyTo: reply }
    setExtra((x) => [...x.filter((y) => y.id !== id), m])
    setDraft('')
    setReply(null)
  }

  const react = (m, emoji) => {
    setReactions((r) => {
      const cur = r[m.id] ?? m.reactions ?? []
      const mine = cur.find((c) => c.by === 'me')
      const rest = cur.filter((c) => c.by !== 'me')
      return { ...r, [m.id]: mine && mine.emoji === emoji ? rest : [...rest, { emoji, by: 'me' }] }
    })
    setActionMsg(null)
  }

  const block = () => { setBlockedPerson({ id: thread.id, name: thread.title }, true); setBlockAsk(false); toast.show({ message: `${thread.title} is blocked in this demo.` }) }
  const unblock = () => { setBlockedPerson({ id: thread.id, name: thread.title }, false); toast.show({ message: `${thread.title} is unblocked.` }) }

  // The bar has room for one short line: the role for a teacher, the size for a group
  const sub = student ? 'Classmate' : thread.kind === 'class' ? thread.subtitle.split(', ').slice(1).join(', ').replace(/ and \d+ teachers$/, '') : thread.subtitle.split(', ')[0]
  const header = (
    <span className="thread-head">
      <Avatar initials={thread.initials} kind={thread.kind === 'class' ? 'group' : thread.kind === 'announcement' ? 'announcement' : 'person'} size={36} />
      <span className="thread-head-text">
        <span className="thread-name">{thread.title}{mutedUntil && <Icon name="bell-off" size={15} className="thread-muted" label={`Muted until ${formatTime(mutedUntil)}`} />}</span>
        <span className="thread-sub">{sub}</span>
      </span>
    </span>
  )

  let body
  if (state === 'loading') {
    body = <LoadingState label="Getting messages" onRetry={retry}><div className="msg-skeletons" aria-hidden="true"><span /><span /><span /><span /></div></LoadingState>
  } else if (state === 'error') {
    body = <ErrorState onRetry={retry} retrying={retrying}>This chat did not load. Check that you are online, then try again.</ErrorState>
  } else {
    body = (
      <div className="thread-log" role="log" aria-label={`Messages with ${thread.title}`}>
        <button type="button" className="thread-caption" aria-haspopup="dialog" onClick={() => setShield(true)}>
          <span><Icon name="shield" size={14} />{MONITOR}</span>
        </button>
        {items.length === 0 && <p className="thread-empty">Say hello to {thread.title.split(' ').slice(0, 2).join(' ')}.</p>}
        {items.map((it) => {
          if (it.type === 'sep') return <p key={it.key} className="thread-sep"><strong>{it.label}</strong> <Num>{formatTime(it.time)}</Num></p>
          if (it.type === 'new') return <p key="new" className="thread-new"><span>New messages</span></p>
          return <Bubble key={it.key} item={it} thread={thread} reactions={reactions} onOpen={setActionMsg} onRetry={(m) => send(m.text, m.id)} />
        })}
        <div ref={endRef} />
      </div>
    )
  }

  return (
    <Screen
      title={thread.title}
      titleContent={header}
      tall
      className="thread-screen"
      action={
        <>
          <IconButton icon="ellipsis" label="More for this chat" onClick={() => setMenu(true)} />
        </>
      }
    >
      {offline && (
        <Notice tone="offline" action={<Button size="compact" onClick={() => reconnect()} loading={reconnecting} loadingLabel="Trying again">Try again</Button>}>
          You are offline. Saved <Num>{SAVED_AT}</Num>.
        </Notice>
      )}
      {body}
      <div className="composer-wrap">
        {readOnly ? (
          <p className="composer-readonly">From {thread.title}. You cannot reply here.</p>
        ) : blocked ? (
          <p className="composer-readonly">You blocked {thread.title}. <button type="button" className="text-link" onClick={unblock}>Unblock</button></p>
        ) : (
          <form className="composer" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) send(draft.trim()) }}>
            <p className="composer-readonly">Demo only: messages are not sent.</p>
            {reply && (
              <p className="composer-reply">
                <span>Replying to <strong>{reply.who}</strong>: {reply.text}</span>
                <IconButton icon="close" label="Cancel reply" onClick={() => setReply(null)} />
              </p>
            )}
            <div className="composer-row glass" data-liquid="" data-liquid-bezel="12" data-liquid-strength="10" data-liquid-frost="4">
              <label className="vh" htmlFor="composer-field">Message {thread.title}</label>
              <textarea
                id="composer-field"
                className="composer-field"
                rows={1}
                placeholder="Message"
                enterKeyHint="send"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && matchMedia('(pointer: fine)').matches) { e.preventDefault(); if (draft.trim()) send(draft.trim()) }
                }}
              />
              <button type="submit" className="composer-send" aria-label="Send message" aria-disabled={!draft.trim() || undefined}>
                <Icon name="arrow-up" size={20} />
              </button>
            </div>
          </form>
        )}
      </div>

      <Sheet open={Boolean(actionMsg)} onClose={() => setActionMsg(null)} title="Message">
        {actionMsg && (
          <div className="msg-actions">
            {/* As Messages: the reactions in one capsule above the message (the chosen one circled), the message as it
                looks in the chat with the sender's name over it, then what you can do with it */}
            <div className="msg-actions-react" role="group" aria-label="React">
              {REACTIONS.map((r) => {
                const chosen = (reactions[actionMsg.id] ?? actionMsg.reactions ?? []).some((c) => c.by === 'me' && c.emoji === r.e)
                return <button key={r.e} type="button" className="msg-react" aria-label={r.name} aria-pressed={chosen} onClick={() => react(actionMsg, r.e)}>{r.e}</button>
              })}
            </div>
            <div className={`msg-actions-msg${actionMsg.from === 'me' ? ' is-mine' : ''}`}>
              {actionMsg.from === 'me'
                ? <span className="vh">You said</span>
                : <span className="msg-actions-who">{actionMsg.from === 'them' ? thread.title : actionMsg.from}</span>}
              <p className="msg-actions-bubble">{actionMsg.text}</p>
            </div>
            <ul className="list" role="list">
              {!readOnly && !blocked && (
                <li className="row"><button type="button" className="row-hit" onClick={() => { setReply({ who: actionMsg.from === 'me' ? 'You' : actionMsg.from === 'them' ? thread.title : actionMsg.from, text: actionMsg.text }); setActionMsg(null) }}><span className="row-lead"><Icon name="reply" /></span><span className="row-body"><span className="row-title">Reply</span></span></button></li>
              )}
              <li className="row"><button type="button" className="row-hit" onClick={() => { navigator.clipboard?.writeText(actionMsg.text).catch(() => {}); setActionMsg(null); toast.show({ message: 'Copied.' }) }}><span className="row-lead"><Icon name="copy" /></span><span className="row-body"><span className="row-title">Copy</span></span></button></li>
              {actionMsg.from !== 'me' && (
                <li className="row"><button type="button" className="row-hit" onClick={() => { setActionMsg(null); setReport(true) }}><span className="row-lead"><Icon name="flag" /></span><span className="row-body"><span className="row-title">Report this message</span></span></button></li>
              )}
            </ul>
          </div>
        )}
      </Sheet>

      <ActionSheet
        open={menu}
        onClose={() => setMenu(false)}
        title={thread.title}
        actions={[
          ...(student && !blocked ? [{ label: `Block ${thread.title}`, destructive: true, onSelect: () => { setMenu(false); setBlockAsk(true) } }] : []),
          mutedUntil
            ? { label: 'Unmute', onSelect: () => { setMenu(false); setMutedUntil(null); toast.show({ message: `${thread.title} is unmuted.` }) } }
            : {
              label: 'Mute for 1 hour',
              onSelect: () => {
                setMenu(false)
                setMutedUntil(now + 3600000)
                toast.show({ message: `${thread.title} is muted until ${formatTime(now + 3600000)}.`, actionLabel: 'Undo', onAction: () => setMutedUntil(null) })
              },
            },
          { label: 'Report a problem with this chat', onSelect: () => { setMenu(false); setReport(true) } },
        ]}
      />

      <ConfirmSheet
        open={blockAsk}
        onClose={() => setBlockAsk(false)}
        title={`Block ${thread.title}?`}
        message="This demo does not block messages on a server. You can unblock them in Settings."
        confirmLabel={`Block ${thread.title}`}
        cancelLabel="Keep chatting"
        onConfirm={block}
      />

      <Sheet open={shield} onClose={() => setShield(false)} title="Who can see this chat">
        <div className="record-sheet">
          <p className="t-title-s">{MONITOR}</p>
          <p className="t-soft">{thread.kind === 'class' ? 'Everyone in your class and your class teachers can see this group.' : `Only you and ${thread.title} are in this chat.`}</p>
          <p className="t-title-s">If a message worries you, tell a trusted teacher in person.</p>
        </div>
      </Sheet>

      <ReportSheet open={report} onClose={() => setReport(false)} />
    </Screen>
  )
}
