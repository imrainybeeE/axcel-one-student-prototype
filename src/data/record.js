// Bentley's 2026 RISE record from the Axcel One account, entry by entry (copied on 10 November 2026).
// Three entries worth 0 points are left out. Totals are worked out from the entries.
// The award ladder: each level is reached at its points.
export const awards = [
  { name: 'Silver', points: 300 },
  { name: 'Gold', points: 400 },
  { name: 'Star', points: 501 }, // the handbook: over 500 points
]

export const areas = {
  attitude: { label: 'Attitude', hint: 'Attitude merits' },
  skills: { label: 'Skills', hint: 'Skills merits' },
  knowledge: { label: 'Knowledge', hint: 'Knowledge merits' },
}

export const entries = [
  {"date": "2026-11-05", "title": "Joined external competition -UPM Environmental Challenge (silver award)", "type": "merit", "area": "knowledge", "points": 20, "teacher": "Shalini A/P Sivarajah"},
  {"date": "2026-10-30", "title": "Answers questions accurately and comprehensively", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Nur Hazlilla Binti Zulyadi"},
  {"date": "2026-10-29", "title": "Biology simulator", "type": "merit", "area": "skills", "points": 5, "teacher": "Tan Wan Chein"},
  {"date": "2026-10-08", "title": "Good video (ICT Class)", "type": "merit", "area": "skills", "points": 5, "teacher": "Nur Rodiatul Raudah"},
  {"date": "2026-10-08", "title": "Biology Spelling test", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-10-08", "title": "Sept- Full attendance", "type": "merit", "area": "attitude", "points": 5, "teacher": "Shalini"},
  {"date": "2026-10-06", "title": "Help to keep the PE equipment", "type": "merit", "area": "attitude", "points": 10, "teacher": "Nurin"},
  {"date": "2026-10-01", "title": "Answered question in Biology class", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-09-29", "title": "Damaging math worksheet", "type": "demerit", "points": 2, "teacher": "Farah"},
  {"date": "2026-09-28", "title": "Helped his teacher to check the lab before leaving. Physics lab.", "type": "merit", "area": "attitude", "points": 3, "teacher": "Teo"},
  {"date": "2026-09-28", "title": "Perfect score (20/20) for Physics Topic 4.5 Reading Task.", "type": "merit", "area": "skills", "points": 5, "teacher": "Teo"},
  {"date": "2026-09-24", "title": "Top 5 Kahoot Math Probability", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-09-23", "title": "FI- Day 3 Winner", "type": "merit", "area": "skills", "points": 3, "teacher": "Shalini"},
  {"date": "2026-09-22", "title": "FI- Day 2 Winner", "type": "merit", "area": "skills", "points": 3, "teacher": "Shalini"},
  {"date": "2026-09-22", "title": "FI- Day 1 Winner", "type": "merit", "area": "skills", "points": 3, "teacher": "Shalini"},
  {"date": "2026-09-14", "title": "Math Number Patterns Kahoot (score >90%)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-09-10", "title": "Contributed in class deco", "type": "merit", "area": "attitude", "points": 5, "teacher": "Shalini"},
  {"date": "2026-09-10", "title": "Actively participated in class performance", "type": "merit", "area": "attitude", "points": 10, "teacher": "Shalini"},
  {"date": "2026-09-10", "title": "Top 3 Kahoot Biology Chapter 3.7", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-09-04", "title": "Blooket chm top accuracy", "type": "merit", "area": "knowledge", "points": 3, "teacher": "Haz"},
  {"date": "2026-08-21", "title": "Best bambloze chm team", "type": "merit", "area": "knowledge", "points": 3, "teacher": "Haz"},
  {"date": "2026-08-17", "title": "Top 5 Math Averages Mystery", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-08-17", "title": "FI- Active participation", "type": "merit", "area": "attitude", "points": 3, "teacher": "Shalini"},
  {"date": "2026-08-11", "title": "Active Participation in AED", "type": "merit", "area": "attitude", "points": 10, "teacher": "Shalini"},
  {"date": "2026-08-04", "title": "FLE Riddles", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Fifi"},
  {"date": "2026-07-31", "title": "High accuracy gimkit game chm", "type": "merit", "area": "knowledge", "points": 3, "teacher": "Haz"},
  {"date": "2026-07-29", "title": "PSS- Good presentation", "type": "merit", "area": "skills", "points": 5, "teacher": "Shalini"},
  {"date": "2026-07-23", "title": "Correct answer in lesson", "type": "merit", "area": "knowledge", "points": 2, "teacher": "Tan WC"},
  {"date": "2026-07-15", "title": "ESG Climate Action Awareness Video (1st Place)", "type": "merit", "area": "skills", "points": 5, "teacher": "Joyce"},
  {"date": "2026-07-15", "title": "ESG Climate Action Awareness Video (1st Place)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Joyce"},
  {"date": "2026-07-13", "title": "GP Activity- Murder Mystery Challenge Winners", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Shalini"},
  {"date": "2026-07-10", "title": "FI Presentation", "type": "merit", "area": "skills", "points": 5, "teacher": "Shalini"},
  {"date": "2026-07-10", "title": "Full mark for Math Treasure Hunt: Coordinate", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-07-09", "title": "Math Quiz - Chapter 8 (score 80% above)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-07-09", "title": "First to complete the word search with all correct answers", "type": "merit", "area": "knowledge", "points": 10, "teacher": "Fifi"},
  {"date": "2026-07-09", "title": "Top 3 accuracy in Kahoot (Biology)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-07-08", "title": "PTM helper", "type": "merit", "area": "attitude", "points": 10, "teacher": "Shalini"},
  {"date": "2026-07-07", "title": "Good debating skills", "type": "merit", "area": "skills", "points": 5, "teacher": "Shwaarna"},
  {"date": "2026-07-07", "title": "June- Full attendance", "type": "merit", "area": "attitude", "points": 5, "teacher": "Shalini"},
  {"date": "2026-07-02", "title": "Top 3 in Biology Kahoot (2.5, 2.6)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-07-02", "title": "Well prepared English superhero presentation", "type": "merit", "area": "skills", "points": 5, "teacher": "Fifi"},
  {"date": "2026-06-29", "title": "Solved Math Jigsaw Puzzle Challenge", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-06-19", "title": "highest accuracy chm blooket", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Haz"},
  {"date": "2026-06-12", "title": "Character First Fast Brain - Wise Brain role play", "type": "merit", "area": "skills", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-06-12", "title": "Good participation in ESL class (term 1)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Shwaarna"},
  {"date": "2026-06-10", "title": "Participated with enthusiasm in debate session", "type": "merit", "area": "skills", "points": 5, "teacher": "Fifi"},
  {"date": "2026-06-09", "title": "Score >80% in Blooket for Fractions", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-06-08", "title": "GP- Collab Activity 1 Winner", "type": "merit", "area": "skills", "points": 5, "teacher": "Shalini"},
  {"date": "2026-05-19", "title": "Uphold class responsibility", "type": "merit", "area": "attitude", "points": 2, "teacher": "Shalini"},
  {"date": "2026-05-18", "title": "Well prepared presentation & product idea", "type": "merit", "area": "skills", "points": 2, "teacher": "Fifi"},
  {"date": "2026-05-12", "title": "Uphold class responsibility", "type": "merit", "area": "attitude", "points": 3, "teacher": "Shalini"},
  {"date": "2026-04-23", "title": "Biology Kahoot: Top 3 (Chapter 2.3)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-04-15", "title": "GP Quiz- Highest score", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Shalini"},
  {"date": "2026-04-15", "title": "GP Wordsearch- Active Participation", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Shalini"},
  {"date": "2026-04-14", "title": "Destroyed classroom property- broom and dustpen", "type": "demerit", "points": 2, "teacher": "Shalini"},
  {"date": "2026-04-14", "title": "Top 13 Math Chapter 5 Gimmkit Quiz", "type": "merit", "area": "knowledge", "points": 10, "teacher": "Farah"},
  {"date": "2026-04-13", "title": "Physics activity", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Chong"},
  {"date": "2026-04-13", "title": "Lack of class responsibility", "type": "demerit", "points": 2, "teacher": "Shalini"},
  {"date": "2026-04-09", "title": "Kahoot winner (Biology Chapter 1.6)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-04-09", "title": "Used inappropriate words in the class", "type": "demerit", "points": 2, "teacher": "Shalini"},
  {"date": "2026-04-03", "title": "Flash Card competition", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-03-12", "title": "Math Quiz 3 (score 80% above)", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-03-06", "title": "ICT Google Sheets", "type": "merit", "area": "skills", "points": 3, "teacher": "Alex"},
  {"date": "2026-03-05", "title": "PSS- Best Presentation", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Shalini"},
  {"date": "2026-03-02", "title": "Top 2 Math Build a Polygon", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-03-02", "title": "Full attendance (Feb)", "type": "merit", "area": "attitude", "points": 5, "teacher": "Shalini"},
  {"date": "2026-02-27", "title": "CNY Tanghulu Workshop- Active participation", "type": "merit", "area": "attitude", "points": 10, "teacher": "Shalini"},
  {"date": "2026-02-25", "title": "Contributed in CNY Fashion Show", "type": "merit", "area": "attitude", "points": 10, "teacher": "Shalini"},
  {"date": "2026-02-25", "title": "Best group presentation", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Fifi"},
  {"date": "2026-02-23", "title": "GP Recap Quiz Winner", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Shalini"},
  {"date": "2026-02-11", "title": "Complete student journal", "type": "merit", "area": "attitude", "points": 5, "teacher": "Shalini"},
  {"date": "2026-02-09", "title": "Volunteer to answer for math question", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Farah"},
  {"date": "2026-02-05", "title": "Kahoot winner Biology Chapter 1.1 - 1.2", "type": "merit", "area": "knowledge", "points": 5, "teacher": "Tan WC"},
  {"date": "2026-01-29", "title": "Top 2 for individual presentation", "type": "merit", "area": "skills", "points": 5, "teacher": "Fifi"},
  {"date": "2026-01-27", "title": "GP-Actively participates in class discussion and activities", "type": "merit", "area": "attitude", "points": 5, "teacher": "Shalini"},
]

export function summary() {
  const sum = (f) => entries.filter(f).reduce((n, e) => n + e.points, 0)
  const attitude = sum((e) => e.area === 'attitude')
  const skills = sum((e) => e.area === 'skills')
  const knowledge = sum((e) => e.area === 'knowledge')
  const merits = attitude + skills + knowledge
  const demerits = sum((e) => e.type === 'demerit')
  const points = merits - demerits
  const currentAward = [...awards].reverse().find((a) => points >= a.points) || null
  const nextAward = awards.find((a) => points < a.points) || null
  return { attitude, skills, knowledge, merits, demerits, points, nextAward, toNext: nextAward ? nextAward.points - points : 0, currentAward }
}
