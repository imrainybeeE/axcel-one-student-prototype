// The earlier messages of each thread in messages.js. Importing this module puts them back in front of each thread's
// latest message, once; the Messages screens import it, so their threads are always whole when they render.
import { threads } from './messages.js'

const history = {
  kavitha: [
    { id: 'k1', from: 'me', day: '2026-10-31', time: '4.12', text: 'Hi Ms Kavitha, is the reading log for chapters 1 to 5 or the whole book?' },
    { id: 'k2', from: 'them', day: '2026-10-31', time: '4.40', text: 'Chapters 1 to 5 for now. One short paragraph per chapter is enough.' },
    { id: 'k3', from: 'me', day: '2026-10-31', time: '4.41', text: 'Okay, thank you!', reactions: [{ emoji: '👍', by: 'them' }] },
  ],
  phoenix: [
    { id: 'o1', from: 'Lee Jun Hao', day: '2026-11-01', time: '8.55', text: 'Is the online class link the same as Monday?' },
    { id: 'o2', from: 'Priya Menon', day: '2026-11-01', time: '8.56', text: 'It is on the timetable, there is a Join button now' },
    { id: 'o3', from: 'Mr Daniel Tan', role: 'teacher', day: '2026-11-02', time: '9.05', text: 'Quiz moved to Thursday, same time.' },
  ],
  junhao: [
    { id: 'j1', from: 'them', day: '2026-11-01', time: '7.48', text: 'did you finish the physics worksheet?' },
    { id: 'j2', from: 'me', day: '2026-11-01', time: '8.02', text: 'Almost, question 6 is hard' },
  ],
  office: [
    { id: 'a1', from: 'them', day: '2026-10-24', time: '9.00', text: 'Final exams run from Monday 9 to Friday 13 November. Your exam timetable will be in Calendar this week.' },
  ],
  priya: [
    { id: 'p1', from: 'me', day: '2026-10-27', time: '6.20', text: 'Can you send me the GP group slides?' },
  ],
  tan: [
    { id: 't1', from: 'me', day: '2026-10-21', time: '3.30', text: 'Sorry sir, I left my homework at home. Can I hand it in tomorrow?' },
  ],
}

for (const t of threads) {
  if (t.historyLoaded) continue
  t.messages = [...(history[t.id] || []), ...t.messages]
  t.historyLoaded = true
}
