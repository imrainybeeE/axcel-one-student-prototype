// 2026 RISE totals from Bentley's Axcel One account. Individual entries are omitted from this public prototype.
// The award ladder: each level is reached at its points.
export const awards = [
  { name: 'Silver', points: 300 },
  { name: 'Gold', points: 400 },
]

export const areas = {
  attitude: { label: 'Attitude', hint: 'Attitude merits' },
  skills: { label: 'Skills', hint: 'Skills merits' },
  knowledge: { label: 'Knowledge', hint: 'Knowledge merits' },
}

export const entries = []

export function summary() {
  const points = 353
  const currentAward = [...awards].reverse().find((a) => points >= a.points) || null
  const nextAward = awards.find((a) => points < a.points) || null
  return {
    attitude: 101,
    skills: 74,
    knowledge: 186,
    merits: 361,
    demerits: 8,
    points,
    nextAward,
    toNext: nextAward ? nextAward.points - points : 0,
    currentAward,
  }
}
