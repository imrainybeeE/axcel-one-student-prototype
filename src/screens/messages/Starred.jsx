// Starred messages (WhatsApp's Starred, in Messages' list style): every message you starred, newest first. Tapping one
// opens its chat on that message. Starring is private and saved on this device; you unstar from the message itself.
import { Screen, useDemo, SAVED_AT } from '../../app'
import { Row, Avatar, Icon, Num, SkeletonRows, LoadingState, EmptyState, ErrorState, OfflineNotice } from '../../ui'
import '../../data/messageHistory.js' // the threads' earlier messages
import { whenLabel } from './messageTime.js'
import { useStarred } from './starredStore.js'
import { sentIn } from './sentStore.js'
import { threadFor, senderOf, messageText } from './messageParts.js'
import './messages.css'

// A message you sent this session is only here until a reload; a starred copy of one that is gone is not listed
const stillHere = (s, thread) => (s.sent ? sentIn(s.thread).some((m) => m.id === s.id) : thread.messages.some((m) => m.id === s.id))

export default function Starred() {
  const { state, offline, now, retry, retrying, reconnect, reconnecting } = useDemo()
  const starred = useStarred()
  const list = state === 'empty' ? [] : starred
    .map((s) => ({ s, thread: threadFor(s.thread) }))
    .filter(({ s, thread }) => thread && stillHere(s, thread))
    .sort((a, b) => b.s.at - a.s.at)

  let body
  if (state === 'loading') {
    body = <LoadingState label="Getting starred messages" onRetry={retry}><SkeletonRows count={3} lead="avatar" /></LoadingState>
  } else if (!list.length) {
    body = (
      <EmptyState title="No starred messages.">
        Press and hold a message, then choose Star to keep it here. Only you see what you star.
      </EmptyState>
    )
  } else {
    body = (
      <ul className="list msg-list starred-list" role="list" aria-label="Starred messages">
        {list.map(({ s, thread }) => {
          const who = senderOf(s, thread)
          const where = who.name === thread.title ? '' : `${thread.title}, `
          const when = whenLabel(s.at, now)
          return (
            <Row
              key={`${s.thread}-${s.id}`}
              to={`/messages/${s.thread}?m=${encodeURIComponent(s.id)}`}
              className="msg-row starred-row"
              lead={<Avatar initials={who.initials} kind={who.kind} />}
              leadKind="avatar"
              aria-label={`${who.name}${where ? ` in ${thread.title}` : ''}, ${when}: ${s.file ? `document ${s.file.name}` : s.text}. Show in chat`}
              title={
                <span className="msg-row-top">
                  <span className="msg-row-name">{who.name}</span>
                  <span className="msg-row-time starred-where num">{where}{when}</span>
                </span>
              }
              meta={<span className="clamp-2">{s.file && <Icon name="doc" size={16} className="starred-doc" />}{messageText(s)}</span>}
            />
          )
        })}
      </ul>
    )
  }

  return (
    <Screen title="Starred" width="narrow" className="starred-screen">
      <div className="stack">
        {offline && <OfflineNotice what="messages" savedAt={SAVED_AT} onRetry={reconnect} retrying={reconnecting} />}
        {state === 'error' && <ErrorState onRetry={retry} retrying={retrying}>New messages did not load. Check that you are online, then try again. Messages saved at <Num>{SAVED_AT}</Num> are below.</ErrorState>}
        {body}
      </div>
    </Screen>
  )
}
