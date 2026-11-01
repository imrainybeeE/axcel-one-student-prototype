// 2026 RISE totals from Bentley's Axcel One account. Individual entries are omitted from this public prototype.
export const awards = []

export const areas = {
  attitude: { label: 'Attitude', hint: 'Attitude merits' },
  skills: { label: 'Skills', hint: 'Skills merits' },
  knowledge: { label: 'Knowledge', hint: 'Knowledge merits' },
}

export const entries = []

export function summary() {
  return {
    attitude: 101,
    skills: 74,
    knowledge: 186,
    merits: 361,
    demerits: 8,
    points: 353,
    nextAward: null,
    toNext: 0,
    currentAward: { name: 'Silver', points: 353 },
  }
}
