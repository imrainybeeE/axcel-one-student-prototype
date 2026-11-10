// Helpers shared by the thread and the Starred list: finding a chat, naming a sender, describing a document.
import { threads, contacts } from '../../data/messages.js'
import { student } from '../../data/student.js'

/** A chat by id: a thread, or a new chat with a contact. */
export function threadFor(id) {
  const t = threads.find((x) => x.id === id)
  if (t) return t
  const c = [...contacts.teachers, ...contacts.staff, ...contacts.students].find((x) => x.id === id)
  return c ? { id: c.id, kind: 'direct', title: c.name, subtitle: c.detail, initials: c.initials, messages: [] } : null
}

export const avatarKind = (t) => (t.kind === 'class' ? 'group' : t.kind === 'announcement' ? 'announcement' : 'person')

/** Initials from a name, without a title: "Mr Daniel Tan" is DT. */
export const initialsOf = (name) => name.replace(/^(Mr|Mrs|Ms|Miss|Dr|Puan|Encik|Cikgu)\.? /, '').split(' ').map((w) => w[0]).join('').slice(0, 2)

/** Who sent a message in a chat: You, the other person, or the group member's name; with their initials. */
export function senderOf(m, thread) {
  if (m.from === 'me') return { name: 'You', initials: student.initials, kind: 'person' }
  if (m.from === 'them') return { name: thread.title, initials: thread.initials, kind: avatarKind(thread) }
  return { name: m.from, initials: initialsOf(m.from), kind: 'person' }
}

/* Documents: students can send documents only, never photos, up to 10 MB (the school's rule). */
export const MAX_FILE = 10 * 1024 * 1024
export const FILE_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt'
const KINDS = { pdf: 'PDF', doc: 'Word document', docx: 'Word document', ppt: 'PowerPoint', pptx: 'PowerPoint', xls: 'Excel sheet', xlsx: 'Excel sheet', txt: 'Text file' }
export const extOf = (name) => (/\.([a-z0-9]+)$/i.exec(name)?.[1] || '').toLowerCase()
export const isDocument = (name) => Boolean(KINDS[extOf(name)])

/** "1.2 MB", "340 KB" */
export function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** "PDF, 1.2 MB" */
export const fileMeta = (file) => `${KINDS[extOf(file.name)] || 'Document'}, ${formatSize(file.size)}`

/** A long name keeps its start and its ending: "Science fair report fin….pdf" style, cut in the middle. */
export function middleEllipsis(name, max = 28) {
  if (name.length <= max) return name
  const ext = extOf(name)
  const tail = Math.max(ext.length + 5, Math.floor(max / 3))
  return `${name.slice(0, max - tail - 1).trimEnd()}…${name.slice(-tail)}`
}

/** What a message says, in one line: its text, or the document's name. */
export const messageText = (m) => (m.file ? m.file.name : m.text)
