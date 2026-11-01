// Component gallery at /kit: every kit component in every state, on real seed data.
import { useRef, useState } from 'react'
import { Screen, Link, SAVED_AT } from '../../app'
import {
  Icon, Num, Time, Button, IconButton, TextLink, Group, Row, SectionHeader, TimeLead, DateLead,
  NowBlock, NowBlockSkeleton, Rail, RailItem, Segmented, TextField, TextArea, SearchField, Switch, CheckRow, ChoiceList,
  Tag, Badge, Notice, OfflineNotice, useToast, Sheet, ActionSheet, ConfirmSheet, Skeleton, SkeletonRows, LoadingState,
  EmptyState, ErrorState, Avatar, MeritLabel, ProgressBar, Disclosure,
} from '../../ui'
import { nowModel, getDay } from '../../lib/schedule.js'
import { schoolInstant } from '../../lib/time.js'
import '../today/today.css'
import '../messages/messages.css'
import './kit.css'

const at = (iso, t) => schoolInstant(iso, t)
const MODELS = [
  ['Before school (7.40)', nowModel(at('2026-10-21', '7.40'))],
  ['In lesson (10.40)', nowModel(at('2026-10-21', '10.40'))],
  ['Last minute (10.59)', nowModel(at('2026-10-21', '10.59'))],
  ['Break (10.10)', nowModel(at('2026-10-21', '10.10'))],
  ['Lunch (12.00)', nowModel(at('2026-10-21', 12 * 60))],
  ['After school (2.30)', nowModel(at('2026-10-21', 14 * 60 + 30))],
  ['Campus day (Thursday 10.20)', nowModel(at('2026-10-22', '10.20'))],
  ['Weekend (Saturday 10.00)', nowModel(at('2026-10-24', '10.00'))],
  ['Holiday (Monday 26 October)', nowModel(at('2026-10-26', '9.00'))],
]
// Between lessons never happens in the seed timetable (lessons run back to back), so build it from 10.40.
const base = nowModel(at('2026-10-21', '10.40'))
const BETWEEN = { ...base, state: 'between', item: base.next, minutes: 5, join: { open: true, opensAt: '10.55' } }

function Section({ title, children }) {
  const id = `kit-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`
  return (
    <section className="kit-section" aria-labelledby={id}>
      <h2 id={id} className="kit-h2 t-title-m">{title}</h2>
      {children}
    </section>
  )
}

function Specimen({ label, children, tone }) {
  return (
    <div className={`kit-specimen${tone ? ` kit-specimen--${tone}` : ''}`}>
      <p className="kit-label">{label}</p>
      {children}
    </div>
  )
}

export default function Kit() {
  const toast = useToast()
  const [seg, setSeg] = useState('all')
  const [day, setDay] = useState('wed')
  const [email, setEmail] = useState('24bp1042@student.axcel.example')
  const [sw, setSw] = useState({ messages: true, timetable: true, notices: false })
  const [checks, setChecks] = useState({ school: true, cls: true, mine: false })
  const [theme, setTheme] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [sheet, setSheet] = useState(null)
  const [note, setNote] = useState('')
  const [joining, setJoining] = useState(null)
  const firstField = useRef(null)
  const online = getDay('2026-10-21')

  const fakeJoin = (item) => { setJoining(item.id); setTimeout(() => setJoining(null), 1200) }

  return (
    <Screen title="Components" width="narrow">
      <p className="kit-intro">Every part of the Axcel One kit, in every state, using the made-up seed data. Not in the navigation.</p>

      <Section title="Type and numerals">
        <p className="t-countdown"><Num wide>20</Num></p>
        <p className="t-title-l">Large title 32</p>
        <p className="t-title-now">Now block subject 28</p>
        <p className="t-title-m">19 points to Silver</p>
        <p className="t-time-l"><Num wide>281</Num> points</p>
        <p className="t-title-s">Section and row title 18</p>
        <p>Body 16. Lessons run online today. <Time value="10.30" /> to <Time value="11.00" />, <Num>96%</Num> this term.</p>
      </Section>

      <Section title="Buttons">
        <div className="kit-row">
          <Button variant="primary">Send message</Button>
          <Button>Show all</Button>
        </div>
        <div className="kit-row">
          <Button variant="destructive">Block Lee Jun Hao</Button>
          <Button variant="plain">Cancel</Button>
        </div>
        <div className="kit-row">
          <Button size="compact" aria-label="Join Bahasa Melayu">Join</Button>
          <Button size="compact" unavailable="Opens at 10.55" aria-label="Join Bahasa Melayu">Join</Button>
        </div>
        <div className="kit-row">
          <Button variant="primary" loading={loading} loadingLabel="Sending" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500) }}>Send message</Button>
          <Button unavailable="Needs the internet" reasonBeside>Send report</Button>
        </div>
        <div className="kit-row">
          <IconButton icon="chevron-left" label="Back to More" />
          <IconButton icon="ellipsis" label="More options" />
          <IconButton icon="shield" label="The school can read this chat. Find out more" />
          <TextLink to="/messages" aria-label="See all messages">See all</TextLink>
        </div>
        <Specimen label="On the now block" tone="now">
          <Button variant="on-now" full icon="video">Join Physics</Button>
          <Button variant="on-now" full unavailable="Needs the internet" aria-label="Join Physics" className="kit-gap">Join Physics</Button>
        </Specimen>
      </Section>

      <Section title="Tags and badges">
        <div className="kit-row">
          <Tag>Next</Tag><Tag>New</Tag><Tag>3 new</Tag>
          <Tag tone="neutral" icon="swap">Room changed: Lab 3</Tag>
          <Tag tone="warn" icon="person-cover">Cover: Mr Tan</Tag>
          <Tag tone="good" icon="check-circle">Present</Tag>
          <Tag tone="danger" icon="x-circle">Absent</Tag>
        </div>
        <div className="kit-row"><Badge count={3} /><Badge count={12} /></div>
      </Section>

      <Section title="Notices">
        <div className="kit-stack">
          <Notice>Final exams start on Monday 9 November. Your exam timetable is in Calendar.</Notice>
          <Notice tone="warn">Your reading log is due before Friday.</Notice>
          <ErrorState onRetry={() => {}}>Your messages did not load. Check that you are online, then try again.</ErrorState>
          <OfflineNotice what="messages" savedAt="10.12" />
        </div>
      </Section>

      <Section title="Rows and groups">
        <Group title="Coming up" action={<TextLink to="/calendar" aria-label="Open Calendar">Calendar</TextLink>}>
          <Row to="/calendar?event=e4" leadKind="date" lead={<DateLead day={24} label="Sat" />} title="Fun Run" meta="Whole school, 7.30 to 11.00" />
          <Row to="/calendar?event=e5" leadKind="date" lead={<DateLead day={26} label="Mon" />} title="Deepavali replacement holiday" meta="Public holiday, no school" />
        </Group>
        <ul className="list kit-gap" role="list" aria-label="Next lesson">
          <Row lead={<TimeLead time="11.00" tag="Next" />} title="Bahasa Melayu" meta="Puan Nurul Huda, online"
            trailing={<Button size="compact" unavailable="Opens at 10.55" aria-label="Join Bahasa Melayu">Join</Button>} trailingAction />
        </ul>
        <Group title="Messages">
          <Row to="/messages/kavitha" className="msg-row is-unread" leadKind="avatar" lead={<Avatar initials="KN" />} title="Ms Kavitha Nair" titleExtra={<span className="vh">, new message</span>} meta="Please upload your reading log before Friday." clamp />
          <Row to="/messages/orion" leadKind="avatar" lead={<Avatar kind="group" />} title="8 Orion" meta="Mr Daniel Tan: Quiz moved to Thursday, same time." clamp />
          <Row to="/messages/office" leadKind="avatar" lead={<Avatar kind="announcement" />} title="Secondary Office" meta="Fun Run this Saturday, wear your house shirt." clamp />
        </Group>
        <Group title="You">
          <Row to="/record" leadKind="icon" lead={<span className="tile tile--award"><Icon name="award" filled size={18} /></span>} title="Record" trailing={<span><Num>19</Num> to Silver</span>} chevron />
          <Row to="/attendance" leadKind="icon" lead={<span className="tile tile--attendance"><Icon name="check-circle" filled size={18} /></span>} title="Attendance" trailing={<Num>96%</Num>} chevron />
        </Group>
      </Section>

      <Section title="Shelves, tiles and bubbles">
        <h3 className="shelf-head"><Link to="/timetable">Later today<Icon name="chevron-right" size={19} className="shelf-chev" /></Link></h3>
        <ul className="shelf-row" role="list" data-scroll-x="">
          {[['gp', '1.00', 'in 2 h 10 min', 'GP', 'Mr Arjun'], ['ict', '1.30', 'in 2 h 40 min', 'ICT', 'Ms Chloe']].map(([subj, t, sub, title, who]) => (
            <li key={subj} className="shelf-item">
              <Link to="/timetable" className="cover-link card-link">
                <span className="cover" data-subject={subj}><Time value={t} className="cover-time" /><span className="cover-sub">{sub}</span></span>
                <span className="cover-title">{title}</span>
                <span className="cover-meta">{who}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="stat-pair kit-gap">
          <Link to="/record" className="stat-tile card-link" data-tone="award">
            <span className="stat-title">Record<Icon name="chevron-right" size={16} className="stat-chev" /></span>
            <span className="stat-fig"><Num wide className="stat-n">281</Num><span className="stat-unit">points</span></span>
            <span className="stat-bar" style={{ '--p': 0.94 }} aria-hidden="true"><i /></span>
            <span className="stat-sub"><Num>19</Num> more for Silver</span>
          </Link>
          <Link to="/attendance" className="stat-tile card-link" data-tone="good">
            <span className="stat-title">Attendance<Icon name="chevron-right" size={16} className="stat-chev" /></span>
            <span className="stat-fig"><Num wide className="stat-n">96</Num><span className="stat-unit">%</span></span>
            <span className="stat-sub">This term</span>
          </Link>
        </div>
        <div className="thread-log kit-gap" aria-label="Bubbles">
          <p className="thread-sep"><strong>Today</strong> <Num>9.05</Num></p>
          <div className="msg is-first is-last"><div className="msg-col"><span className="msg-bubble">Quiz moved to Thursday, same time.</span></div></div>
          <div className="msg msg--mine is-first is-last"><div className="msg-col"><span className="msg-bubble">Okay, thank you!</span></div></div>
        </div>
      </Section>

      <Section title="The now block">
        <div className="kit-stack">
          {MODELS.map(([label, m]) => (
            <Specimen key={label} label={label}>
              <NowBlock model={m} headingLevel={3} onJoin={fakeJoin} joiningId={joining} />
            </Specimen>
          ))}
          <Specimen label="Between lessons (built from the 10.40 model)">
            <NowBlock model={BETWEEN} headingLevel={3} onJoin={fakeJoin} joiningId={joining} />
          </Specimen>
          <Specimen label="Offline (10.40): the countdown runs on the device, Join needs the internet">
            <NowBlock model={base} offline headingLevel={3} />
          </Specimen>
          <Specimen label="Error">
            <NowBlock model={base} error={{ savedAt: SAVED_AT, lastItem: base.item, onRetry: () => {} }} headingLevel={3} />
          </Specimen>
          <Specimen label="Loading">
            <NowBlockSkeleton />
          </Specimen>
          <Specimen label="At rail width (Timetable)">
            <NowBlock model={base} variant="rail" headingLevel={3} onJoin={fakeJoin} joiningId={joining} />
          </Specimen>
        </div>
      </Section>

      <Section title="Rail">
        <Rail label="Wednesday 21 October">
          {online.items.map((it, i) => {
            const status = it.endMin <= 630 ? 'done' : it.startMin === 630 ? 'now' : 'later'
            return (
              <RailItem
                key={it.id}
                kind={it.kind === 'break' ? 'gap' : 'lesson'}
                status={status}
                start={it.start}
                end={it.end}
                title={it.title}
                titleTag={it.startMin === 660 ? 'Next' : null}
                meta={it.kind === 'break' ? true : `${it.teacher}, online`}
                tags={it.subjectId === 'gp' ? [{ label: 'Cover: Mr Tan', icon: 'person-cover', tone: 'warn' }] : []}
                first={i === 0}
                last={i === online.items.length - 1}
              >
                {status === 'now' ? <NowBlock model={base} variant="rail" headingLevel={3} /> : null}
              </RailItem>
            )
          })}
        </Rail>
      </Section>

      <Section title="Segmented control">
        <div className="kit-stack">
          <Segmented legend="Show messages" value={seg} onChange={setSeg} options={[
            { value: 'all', label: 'All' }, { value: 'unread', label: 'Unread', count: 1 }, { value: 'groups', label: 'Groups' }, { value: 'school', label: 'School' },
          ]} />
          <Segmented legend="Day" size="tall" value={day} onChange={setDay} options={[
            { value: 'mon', label: 'Mon', sub: '19', ariaLabel: 'Monday 19 October' },
            { value: 'tue', label: 'Tue', sub: '20', ariaLabel: 'Tuesday 20 October' },
            { value: 'wed', label: 'Today', sub: '21', ariaLabel: 'Wednesday 21 October, today' },
            { value: 'thu', label: 'Thu', sub: '22', ariaLabel: 'Thursday 22 October' },
            { value: 'fri', label: 'Fri', sub: '23', ariaLabel: 'Friday 23 October' },
          ]} />
        </div>
      </Section>

      <Section title="Fields">
        <div className="kit-stack">
          <TextField label="School email" type="email" autoComplete="username" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" hint="The password you use for your school account." type="password" autoComplete="current-password" defaultValue="" error="That password is not right. Check it and try again." />
          <TextArea label="What happened? (optional)" hint="Only the safeguarding team reads this." value={note} onChange={(e) => setNote(e.target.value)} />
          <SearchField label="Search messages" />
        </div>
        <ul className="list kit-gap" role="list">
          <Switch label="Messages" description="Tell me when someone messages me." checked={sw.messages} onChange={(v) => setSw({ ...sw, messages: v })} />
          <Switch label="Timetable changes" description="Room changes, cancelled lessons, online links." checked={sw.timetable} onChange={(v) => setSw({ ...sw, timetable: v })} />
          <Switch label="School notices" checked={sw.notices} onChange={(v) => setSw({ ...sw, notices: v })} unavailable="Needs the internet" />
        </ul>
        <ul className="list kit-gap" role="list">
          <CheckRow label="School" meta={<Num>12</Num>} checked={checks.school} onChange={(v) => setChecks({ ...checks, school: v })} />
          <CheckRow label="My class" meta={<Num>5</Num>} checked={checks.cls} onChange={(v) => setChecks({ ...checks, cls: v })} />
          <CheckRow label="Mine" meta={<Num>3</Num>} checked={checks.mine} onChange={(v) => setChecks({ ...checks, mine: v })} />
        </ul>
        <div className="kit-gap">
          <ChoiceList legend="Appearance" value={theme} onChange={setTheme} options={[
            { value: 'auto', label: 'Automatic', description: 'Follows your device.' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
          ]} />
        </div>
      </Section>

      <Section title="Toast, sheets and dialogs">
        <div className="kit-row">
          <Button onClick={() => toast.show({ message: 'Message removed.', actionLabel: 'Undo', onAction: () => {} })}>Show the undo toast</Button>
          <Button onClick={() => setSheet('medium')}>Open a sheet</Button>
          <Button onClick={() => setSheet('compose')}>Open a large sheet</Button>
          <Button onClick={() => setSheet('actions')}>Open an action sheet</Button>
          <Button variant="destructive" id="kit-open-confirm" onClick={() => setSheet('confirm')}>Block Lee Jun Hao</Button>
        </div>
      </Section>

      <Section title="Loading, empty and error">
        <div className="kit-stack">
          <LoadingState label="Getting your messages"><SkeletonRows count={3} lead="avatar" lines={2} /></LoadingState>
          <SkeletonRows count={2} lead="date" />
          <div className="kit-row"><Skeleton w="8rem" h="1.5rem" /><Skeleton w="44px" h="44px" radius="50%" /></div>
          <EmptyState action={<Button to="/messages">New message</Button>}>No messages yet. Messages from your teachers and classmates will show here.</EmptyState>
          <EmptyState action={<TextLink to="/timetable">See Tuesday</TextLink>}>No lessons on Saturday.</EmptyState>
        </div>
      </Section>

      <Section title="Avatars, merits, progress">
        <div className="kit-row">
          <Avatar initials="KN" /><Avatar initials="LJ" /><Avatar kind="group" /><Avatar kind="announcement" />
        </div>
        <div className="kit-row">
          <MeritLabel area="attitude" /><MeritLabel area="skills" /><MeritLabel area="knowledge" />
        </div>
        <div className="kit-gap">
          <p className="t-title-m">19 points to Silver</p>
          <ProgressBar value={281} max={300} label="Points towards Silver" valueText="281 of 300 points" />
        </div>
        <div className="kit-gap">
          <Disclosure summary="How absences are counted">
            <p>A day counts as present when you are marked in at registration. A medical certificate or an approved family reason is still counted as an absence, but it is never held against you.</p>
          </Disclosure>
        </div>
      </Section>

      <Section title="Icons">
        <ul className="kit-icons" role="list">
          {Icon.names.filter((n) => !n.endsWith('-fill')).map((n) => (
            <li key={n}><Icon name={n} /><span>{n}</span></li>
          ))}
        </ul>
        <SectionHeader title="Filled, active tab only" level={3} />
        <ul className="kit-icons kit-icons--active" role="list">
          {['timetable', 'messages', 'calendar', 'more'].map((n) => <li key={n}><Icon name={n} filled /><span>{n}</span></li>)}
        </ul>
      </Section>

      <Sheet open={sheet === 'medium'} onClose={() => setSheet(null)} title="Fun Run" detents={['medium', 'large']}>
        <p className="t-title-m">Fun Run</p>
        <p className="kit-gap"><Time value="7.30" wide className="t-time-l" /> to <Time value="11.00" wide className="t-time-l" /></p>
        <p>Saturday 24 October, Main field. Whole school.</p>
        <p className="kit-gap">Wear your house shirt. Gates open at 7.15.</p>
        <div className="kit-gap"><Button full>Remind me</Button></div>
      </Sheet>
      <Sheet
        open={sheet === 'compose'}
        onClose={() => { setSheet(null); setNote('') }}
        title="Report"
        detents={['large']}
        closeLabel="Cancel"
        dirty={note.trim().length > 0}
        discardLabel="Discard report"
        initialFocus={firstField}
        trailing={<Button variant="plain" size="compact" onClick={() => { setSheet(null); setNote('') }}>Send</Button>}
      >
        <TextArea id="kit-report" label="What went wrong?" hint="The page and your device details are added for you." value={note} onChange={(e) => setNote(e.target.value)} ref={firstField} />
      </Sheet>
      <ActionSheet
        open={sheet === 'actions'}
        onClose={() => setSheet(null)}
        title="Ms Kavitha Nair"
        actions={[
          { label: 'Mute for 1 hour', onSelect: () => setSheet(null) },
          { label: 'Mark as unread', onSelect: () => setSheet(null) },
        ]}
      />
      <ConfirmSheet
        open={sheet === 'confirm'}
        onClose={() => setSheet(null)}
        title="Block Lee Jun Hao?"
        message="You will not get messages from Lee Jun Hao. Your teachers can still see the chat."
        confirmLabel="Block Lee Jun Hao"
        cancelLabel="Keep chatting"
        onConfirm={() => setSheet(null)}
      />
    </Screen>
  )
}
