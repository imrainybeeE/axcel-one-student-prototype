import { useCallback, useEffect, useRef, useState } from 'react'
import { Screen, useDemo, useRoute, updateQuery, markThreadRead, navigate, SAVED_AT } from '../../app'
import {
  Avatar, Button, IconButton, Icon, Sheet, ActionSheet, ConfirmSheet, Num, Notice,
  LoadingState, ErrorState, useToast, haptic,
} from '../../ui'
import '../../data/messageHistory.js' // the threads' earlier messages
import { messageAt, separatorLabel, isStudent } from './messageTime.js'
import { formatTime } from '../../lib/time.js'
import { useBlocked, setBlockedPerson } from './blockedStore.js'
import { useMuted, setMuted } from './mutedStore.js'
import { useStarred, setStarred } from './starredStore.js'
import { usePinned, setPins, MAX_PINS } from './pinnedStore.js'
import { sentIn, keepSent } from './sentStore.js'
import {
  threadFor, avatarKind, initialsOf, messageText, middleEllipsis, fileMeta, isDocument, MAX_FILE, FILE_ACCEPT,
} from './messageParts.js'
import './messages.css'

const REACTIONS = [
  { e: '👍', name: 'Thumbs up' }, { e: '❤️', name: 'Heart' }, { e: '😂', name: 'Laughing' },
  { e: '😮', name: 'Surprised' }, { e: '❓', name: 'Question' }, { e: '✅', name: 'Done' },
]
const MONITOR = 'The school can read every message in Axcel One. Messages cannot be deleted.'
const DEMO_NOTE = 'In this demo, messages are not sent.'

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

/** A document you sent: its glyph on a tile, the name cut in the middle if long, then its kind and size. */
function FileCard({ file }) {
  return (
    <span className="msg-file">
      <span className="msg-file-tile"><Icon name="doc" size={22} /></span>
      <span className="msg-file-text">
        <span className="msg-file-name">{middleEllipsis(file.name)}</span>
        <span className="msg-file-meta">{fileMeta(file)}</span>
      </span>
    </span>
  )
}

function Bubble({ item, thread, onOpen, onFile, onRetry, reactions, starred, flash }) {
  const { m, first, last } = item
  const mine = m.from === 'me'
  const showName = thread.kind === 'class' && !mine && first
  const status = m.status
  const chips = reactions[m.id] ?? m.reactions ?? []
  // A document opens on a tap (in the school's app), so its actions are on a long press or a right click
  const hold = useRef(null)
  const held = useRef(false)
  const stopHold = () => clearTimeout(hold.current)
  const fileProps = m.file ? {
    onPointerDown: () => { held.current = false; stopHold(); hold.current = setTimeout(() => { held.current = true; haptic(); onOpen(m) }, 450) },
    onPointerUp: stopHold, onPointerLeave: stopHold, onPointerCancel: stopHold,
    onContextMenu: (e) => { e.preventDefault(); stopHold(); if (!held.current) onOpen(m) },
  } : {}
  useEffect(() => stopHold, [])
  return (
    <div data-msg={m.id} className={`msg${mine ? ' msg--mine' : ''}${first ? ' is-first' : ''}${last ? ' is-last' : ''}${status === 'failed' ? ' is-failed' : ''}${chips.length ? ' has-react' : ''}${flash ? ' is-flash' : ''}`}>
      {!mine && thread.kind === 'class' && <span className="msg-avatar">{last && <Avatar initials={initialsOf(m.from)} size={32} />}</span>}
      <div className="msg-col">
        {showName && <span className="msg-name">{m.from}{m.role === 'teacher' && <span className="msg-role"> Teacher</span>}</span>}
        <span className="msg-line">
          <button
            type="button"
            className={`msg-bubble${m.file ? ' msg-bubble--file' : ''}`}
            aria-haspopup={m.file ? undefined : 'dialog'}
            onClick={() => { if (m.file) { if (held.current) { held.current = false; return } onFile(m) } else onOpen(m) }}
            {...fileProps}
          >
            <span className="vh">{mine ? 'You' : m.from === 'them' ? thread.title : m.from} {m.file ? 'sent a document,' : 'said'}</span>
            {m.replyTo && <span className="msg-quote"><strong>{m.replyTo.who}</strong> {m.replyTo.text}</span>}
            {m.file ? <FileCard file={m.file} /> : m.text}
            {starred && <span className="vh">, starred</span>}
          </button>
          {starred && <Icon name="star-fill" size={13} className="msg-star" />}
        </span>
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

/**
 * Pinned messages (WhatsApp, Messages): one slim line under the bar showing one pin at a time, the newest first.
 * Tapping it shows that message in the chat and moves the bar on to the next pin; marks on the left say which it is.
 */
function PinnedBar({ pins, onGo }) {
  const n = pins.length
  const ids = pins.map((m) => m.id).join(' ')
  const [state, setState] = useState({ ids, at: n - 1 })
  if (state.ids !== ids) setState({ ids, at: n - 1 }) // a new pin (or an unpin) shows the newest again
  const at = Math.min(state.ids === ids ? state.at : n - 1, n - 1)
  const m = pins[at]
  return (
    <button
      type="button"
      className="pinned-bar"
      aria-label={`Pinned message${n > 1 ? ` ${at + 1} of ${n}` : ''}: ${messageText(m)}. Show in chat`}
      onClick={() => { onGo(m.id); setState({ ids, at: (at - 1 + n) % n }) }}
    >
      {n > 1 && (
        <span className="pinned-marks" aria-hidden="true">
          {pins.map((p, i) => <span key={p.id} className={i === at ? 'is-on' : undefined} />)}
        </span>
      )}
      <Icon name="pushpin-fill" size={18} className="pinned-glyph" />
      <span className="pinned-text">{m.file && <Icon name="doc" size={16} className="pinned-doc" />}{messageText(m)}</span>
    </button>
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
  const { query } = useRoute()
  const thread = threadFor(params.id)
  // What you sent here this session stays when you come back (nothing is really sent)
  const [extra, setExtra] = useState(() => sentIn(params.id))
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
  const mutedChats = useMuted()
  const mute = mutedChats.find((c) => c.id === params.id)
  const mutedUntil = mute && (mute.until == null || mute.until > now) ? mute.until ?? Infinity : null
  const starredAll = useStarred()
  const pinnedAll = usePinned()
  const [replaceAsk, setReplaceAsk] = useState(null)
  const [flash, setFlash] = useState(null)
  const fileRef = useRef(null)
  const logRef = useRef(null)
  const endRef = useRef(null)
  const [unreadFrom] = useState(() => (thread?.unread ? thread.messages[thread.messages.length - thread.unread]?.id : null))

  useEffect(() => { if (thread) markThreadRead(thread.id) }, [thread])
  useEffect(() => { keepSent(params.id, extra) }, [params.id, extra])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [extra.length])

  // Show one message in the chat: scroll it to the middle and pulse its bubble once (no pulse with reduced motion)
  const showMessage = useCallback((id, smooth = true) => {
    const el = logRef.current?.querySelector(`[data-msg="${CSS.escape(id)}"]`)
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'center', behavior: smooth && !reduce ? 'smooth' : 'instant' })
    setFlash(null)
    requestAnimationFrame(() => setFlash(id))
  }, [])
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 1000)
    return () => clearTimeout(t)
  }, [flash])
  // Opened from Starred (?m=id): land on that message, then drop the parameter so Back and reloads do not repeat it
  const focusId = query.get('m')
  const ready = state !== 'loading' && state !== 'error'
  useEffect(() => {
    if (!focusId || !ready) return
    let raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => { showMessage(focusId, false); updateQuery({ m: null }) }) })
    return () => cancelAnimationFrame(raf)
  }, [focusId, ready, showMessage])

  if (!thread) {
    return <Screen title="Message"><p>This chat could not be found. <button type="button" className="text-link" onClick={() => navigate('/messages')}>Back to Messages</button></p></Screen>
  }

  const student = isStudent(thread)
  const readOnly = thread.kind === 'announcement'
  const items = layout(thread, extra, now, unreadFrom)
  const byId = new Map(items.filter((it) => it.type === 'msg').map((it) => [it.m.id, it.m]))
  const starredIds = new Set(starredAll.filter((x) => x.thread === thread.id).map((x) => x.id))
  // Pins whose message is still here (one you sent last session is gone after a reload)
  const pins = (pinnedAll[thread.id] || []).map((id) => byId.get(id)).filter(Boolean)

  const send = (text, id = `x${Date.now()}`, file) => {
    const m = { id, from: 'me', text, at: now, replyTo: reply, ...(file ? { file } : {}) }
    setExtra((x) => [...x.filter((y) => y.id !== id), m])
    if (!file) setDraft('')
    setReply(null)
  }

  // Documents only, 10 MB at most. Nothing is uploaded: the bubble is the demo.
  const attach = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!isDocument(f.name)) { toast.show({ message: 'Only documents can be sent: PDF, Word, PowerPoint, Excel or text.' }); return }
    if (f.size > MAX_FILE) { toast.show({ message: 'Files must be 10 MB or smaller.' }); return }
    send('', undefined, { name: f.name, size: f.size })
  }

  const star = (m) => {
    const on = !starredIds.has(m.id)
    const entry = { id: m.id, thread: thread.id, from: m.from, role: m.role, text: m.text, file: m.file, at: m.at, sent: Boolean(extra.find((x) => x.id === m.id)) }
    setStarred(entry, on)
    setActionMsg(null)
    toast.show({ message: on ? 'Starred.' : 'Unstarred.', actionLabel: 'Undo', onAction: () => setStarred(entry, !on) })
  }

  const pin = (m) => {
    const ids = pins.map((p) => p.id)
    setActionMsg(null)
    if (ids.includes(m.id)) { setPins(thread.id, ids.filter((x) => x !== m.id)); return }
    if (ids.length >= MAX_PINS) { setReplaceAsk(m); return }
    setPins(thread.id, [...ids, m.id])
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

  const chat = { id: thread.id, name: thread.title }
  const block = () => { setBlockedPerson({ id: thread.id, name: thread.title }, true); setBlockAsk(false); toast.show({ message: `${thread.title} is blocked in this demo.` }) }
  const unblock = () => { setBlockedPerson({ id: thread.id, name: thread.title }, false); toast.show({ message: `${thread.title} is unblocked.` }) }

  // The bar has room for one short line: the role for a teacher, the size for a group
  const sub = student ? 'Classmate' : thread.kind === 'class' ? thread.subtitle.split(', ').slice(1).join(', ').replace(/ and \d+ teachers$/, '') : thread.subtitle.split(', ')[0]
  const header = (
    <span className="thread-head">
      <Avatar initials={thread.initials} kind={avatarKind(thread)} size={36} />
      <span className="thread-head-text">
        <span className="thread-name">{thread.title}{mutedUntil && <Icon name="bell-off" size={15} className="thread-muted" label={mutedUntil === Infinity ? 'Muted' : `Muted until ${formatTime(mutedUntil)}`} />}</span>
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
      <div ref={logRef} className="thread-log" role="log" aria-label={`Messages with ${thread.title}`}>
        <button type="button" className="thread-caption" aria-haspopup="dialog" onClick={() => setShield(true)}>
          <Icon name="shield" size={14} />{MONITOR} {DEMO_NOTE}
        </button>
        {items.length === 0 && <p className="thread-empty">Say hello to {thread.title.split(' ').slice(0, 2).join(' ')}.</p>}
        {items.map((it) => {
          if (it.type === 'sep') return <p key={it.key} className="thread-sep"><strong>{it.label}</strong> <Num>{formatTime(it.time)}</Num></p>
          if (it.type === 'new') return <p key="new" className="thread-new"><span>New messages</span></p>
          return (
            <Bubble
              key={it.key} item={it} thread={thread} reactions={reactions} starred={starredIds.has(it.m.id)} flash={flash === it.m.id}
              onOpen={setActionMsg} onRetry={(m) => send(m.text, m.id, m.file)}
              onFile={() => toast.show({ message: "Files open in the school's app. Not in this demo." })}
            />
          )
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
          <IconButton icon="ellipsis" label="More for this chat" onClick={() => setMenu(true)} data-liquid="" data-liquid-bezel="12" data-liquid-strength="10" />
        </>
      }
    >
      {pins.length > 0 && ready && <PinnedBar pins={pins} onGo={(id) => showMessage(id)} />}
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
            {reply && (
              <p className="composer-reply">
                <span>Replying to <strong>{reply.who}</strong>: {reply.text}</span>
                <IconButton icon="close" label="Cancel reply" onClick={() => setReply(null)} />
              </p>
            )}
            <div className="composer-line">
            {/* As Messages: a round + before the field; here it attaches a document (students cannot send photos) */}
            <button type="button" className="composer-add glass" aria-label="Attach a document" onClick={() => fileRef.current?.click()} data-liquid="" data-liquid-bezel="12" data-liquid-strength="10" data-liquid-frost="4">
              <Icon name="plus" size={22} />
            </button>
            <input ref={fileRef} type="file" accept={FILE_ACCEPT} className="vh" tabIndex={-1} aria-hidden="true" onChange={attach} />
            <div className="composer-row glass" data-liquid="" data-liquid-bezel="12" data-liquid-strength="10" data-liquid-frost="4">
              <label className="vh" htmlFor="composer-field">Message {thread.title}. Demo only: messages are not sent.</label>
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
              <p className={`msg-actions-bubble${actionMsg.file ? ' is-file' : ''}`}>{actionMsg.file ? <FileCard file={actionMsg.file} /> : actionMsg.text}</p>
            </div>
            <ul className="list" role="list">
              {!readOnly && !blocked && (
                <li className="row"><button type="button" className="row-hit" onClick={() => { setReply({ who: actionMsg.from === 'me' ? 'You' : actionMsg.from === 'them' ? thread.title : actionMsg.from, text: messageText(actionMsg) }); setActionMsg(null) }}><span className="row-lead"><Icon name="reply" /></span><span className="row-body"><span className="row-title">Reply</span></span></button></li>
              )}
              {!actionMsg.file && (
                <li className="row"><button type="button" className="row-hit" onClick={() => { navigator.clipboard?.writeText(actionMsg.text).catch(() => {}); setActionMsg(null); toast.show({ message: 'Copied.' }) }}><span className="row-lead"><Icon name="copy" /></span><span className="row-body"><span className="row-title">Copy</span></span></button></li>
              )}
              <li className="row"><button type="button" className="row-hit" onClick={() => star(actionMsg)}><span className="row-lead"><Icon name={starredIds.has(actionMsg.id) ? 'star-slash' : 'star'} /></span><span className="row-body"><span className="row-title">{starredIds.has(actionMsg.id) ? 'Unstar' : 'Star'}</span></span></button></li>
              <li className="row"><button type="button" className="row-hit" onClick={() => pin(actionMsg)}><span className="row-lead"><Icon name={pins.some((p) => p.id === actionMsg.id) ? 'pushpin-slash' : 'pushpin'} /></span><span className="row-body"><span className="row-title">{pins.some((p) => p.id === actionMsg.id) ? 'Unpin' : 'Pin'}</span></span></button></li>
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
            ? { label: 'Unmute', onSelect: () => { setMenu(false); setMuted(chat, false); toast.show({ message: `${thread.title} is unmuted.` }) } }
            : {
              label: 'Mute for 1 hour',
              onSelect: () => {
                setMenu(false)
                setMuted(chat, true, now + 3600000)
                toast.show({ message: `${thread.title} is muted until ${formatTime(now + 3600000)}.`, actionLabel: 'Undo', onAction: () => setMuted(chat, false) })
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

      <ConfirmSheet
        open={Boolean(replaceAsk)}
        onClose={() => setReplaceAsk(null)}
        title="Replace the oldest pin?"
        message={`You can pin up to ${MAX_PINS} messages in a chat. The oldest one is unpinned.`}
        confirmLabel="Replace"
        destructive={false}
        onConfirm={() => { setPins(thread.id, [...pins.map((p) => p.id).slice(1), replaceAsk.id]); setReplaceAsk(null) }}
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
