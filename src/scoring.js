// ---------------------------------------------------------------------------
// Fermithon scoring.
//
//   score = ( 10 + Σ_good ⌊max/min⌋ ) · 2^( base − #good )
//
// A "good interval" is a question where the team's interval contains the actual
// answer. Per the chosen ruleset, only each team's LAST submission per question
// counts toward the score (earlier attempts are shown as icons but ignored
// here). LOWER scores are better.
// ---------------------------------------------------------------------------

export function toNum(v) {
  if (v === '' || v == null) return NaN
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

// Is `actual` inside the interval described by min/max? We normalize so the
// smaller bound is treated as the low end regardless of input order.
export function isWithin(actual, min, max) {
  const a = toNum(actual)
  const lo = toNum(min)
  const hi = toNum(max)
  if (Number.isNaN(a) || Number.isNaN(lo) || Number.isNaN(hi)) return false
  return a >= Math.min(lo, hi) && a <= Math.max(lo, hi)
}

// ⌊max / min⌋ for a good interval. Fermi quantities are positive, so we guard
// against a non-positive low bound (which would make the ratio meaningless).
export function ratioFloor(min, max) {
  const lo = Math.min(toNum(min), toNum(max))
  const hi = Math.max(toNum(min), toNum(max))
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return 0
  if (lo <= 0) return 0
  return Math.floor(hi / lo)
}

// A submission is "graded" only once its question has an actual answer AND both
// bounds are filled in.
export function gradeSubmission(actual, sub) {
  if (actual === '' || actual == null) return 'pending'
  if (!sub || sub.min === '' || sub.max === '' || sub.min == null || sub.max == null) {
    return 'incomplete'
  }
  return isWithin(actual, sub.min, sub.max) ? 'within' : 'outside'
}

// Compute a single team's score plus a breakdown for the console.
export function scoreTeam(state, teamIndex) {
  // The exponent base is the total number of questions (not a separate knob).
  const { numQuestions } = state.settings
  let sum = 0
  let good = 0
  const perQuestion = []

  for (let q = 0; q < numQuestions; q++) {
    const actual = state.actuals[q]
    const subs = state.submissions.filter((s) => s.q === q && s.t === teamIndex)
    const last = subs.length ? subs[subs.length - 1] : null

    let ratio = 0
    let isGood = false
    if (last && actual !== '' && actual != null) {
      if (isWithin(actual, last.min, last.max)) {
        isGood = true
        good += 1
        ratio = ratioFloor(last.min, last.max)
        sum += ratio
      }
    }
    perQuestion.push({ q, attempts: subs.length, isGood, ratio })
  }

  const exponent = numQuestions - good
  const score = (10 + sum) * Math.pow(2, exponent)
  return { teamIndex, score, good, sum, exponent, perQuestion }
}

// All teams, ranked ascending (lower score wins). Teams that share a score
// share a rank.
export function leaderboard(state) {
  const rows = state.teams.map((name, i) => ({
    name,
    ...scoreTeam(state, i),
  }))
  rows.sort((a, b) => a.score - b.score)
  let rank = 0
  let prev = null
  rows.forEach((row, idx) => {
    if (prev === null || row.score !== prev) rank = idx + 1
    row.rank = rank
    prev = row.score
  })
  return rows
}

// Human-friendly score formatting (handles the very large / very small values
// the exponential term can produce).
export function formatScore(score) {
  if (!Number.isFinite(score)) return '—'
  if (score !== 0 && (Math.abs(score) >= 1e9 || Math.abs(score) < 1e-3)) {
    return score.toExponential(2)
  }
  return score.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
