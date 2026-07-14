import { reactive, watch } from 'vue'

// ---------------------------------------------------------------------------
// Shared application state.
//
// The whole app runs off a single reactive object, persisted to localStorage
// and mirrored across browser tabs via the `storage` event. That's what keeps
// the private Game Master tab in sync with the public to-stream board.
//
// Submissions are stored as one FLAT LIST of records. The grid, the per-cell
// attempt counts and the scores are all *derived* from this list, so editing a
// record in the Submission history (even moving it to a different team or
// question) re-counts and re-scores everything automatically.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'fermithon-state-v2'

function makeDefault() {
  return {
    settings: {
      numQuestions: 12,
      numTeams: 6,
      numSubmissions: 3, // aggregate submission budget per team
    },
    teams: Array.from({ length: 6 }, (_, i) => `Team ${i + 1}`),
    actuals: Array.from({ length: 12 }, () => ''), // actual answer per question
    submissions: [], // [{ id, q, t, min, max }] in the order they were entered
    seq: 1, // monotonic id source for submissions
    timer: {
      durationSec: 15 * 60,
      running: false,
      endAt: null,
      remainingSec: 15 * 60,
    },
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const base = makeDefault()
      return {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...(parsed.settings || {}) },
        timer: { ...base.timer, ...(parsed.timer || {}) },
      }
    }
  } catch (e) {
    console.warn('Could not load saved state, starting fresh.', e)
  }
  return makeDefault()
}

export const state = reactive(load())

// Guard against cross-tab echo loops: if a serialized value is unchanged we skip
// writing it back.
let lastSerialized = localStorage.getItem(STORAGE_KEY) || ''

function persist() {
  const s = JSON.stringify(state)
  if (s === lastSerialized) return
  lastSerialized = s
  try {
    localStorage.setItem(STORAGE_KEY, s)
  } catch (e) {
    console.warn('Could not persist state.', e)
  }
}

watch(state, persist, { deep: true })

// Keep teams/actuals arrays matching the configured counts, preserving data.
export function normalizeShape() {
  const { numTeams, numQuestions } = state.settings
  const teams = state.teams.slice(0, numTeams)
  while (teams.length < numTeams) teams.push(`Team ${teams.length + 1}`)
  state.teams = teams

  const actuals = state.actuals.slice(0, numQuestions)
  while (actuals.length < numQuestions) actuals.push('')
  state.actuals = actuals
}

watch(
  () => [state.settings.numTeams, state.settings.numQuestions],
  normalizeShape
)
normalizeShape()

// Receive updates made in the other tab.
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || e.newValue == null) return
  if (e.newValue === lastSerialized) return
  lastSerialized = e.newValue
  try {
    Object.assign(state, JSON.parse(e.newValue))
  } catch {
    /* ignore malformed payloads */
  }
})

// ---- submission helpers ---------------------------------------------------

// All submissions for one cell, in the order they were entered. The last one
// is the "final" submission that counts toward the score.
export function cellSubmissions(q, t) {
  return state.submissions.filter((s) => s.q === q && s.t === t)
}

export function addSubmission(q, t, min, max) {
  state.submissions = [...state.submissions, { id: state.seq++, q, t, min, max }]
}

export function updateSubmission(id, patch) {
  state.submissions = state.submissions.map((s) =>
    s.id === id ? { ...s, ...patch } : s
  )
}

export function removeSubmission(id) {
  state.submissions = state.submissions.filter((s) => s.id !== id)
}

export function resetAll() {
  Object.assign(state, makeDefault())
  normalizeShape()
}
