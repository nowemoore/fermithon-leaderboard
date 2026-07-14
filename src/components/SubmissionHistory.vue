<script setup>
import { computed, ref } from 'vue'
import { state, updateSubmission, removeSubmission } from '../store/useStore.js'
import { gradeSubmission } from '../scoring.js'
import NumberInput from './NumberInput.vue'

// Every submission, with its attempt number within its cell derived on the fly.
// Because the grid, counts and scores all read from state.submissions, editing
// any field here (including moving a row to another team/question) re-counts and
// re-scores everything automatically.
const rows = computed(() => {
  const seen = {}
  const totals = {}
  state.submissions.forEach((s) => {
    const k = `${s.q}_${s.t}`
    totals[k] = (totals[k] || 0) + 1
  })
  return state.submissions.map((s) => {
    const k = `${s.q}_${s.t}`
    seen[k] = (seen[k] || 0) + 1
    return { ...s, attempt: seen[k], total: totals[k] }
  })
})

const questions = computed(() => state.settings.numQuestions)
const teams = computed(() => state.teams)

function result(r) {
  return gradeSubmission(state.actuals[r.q], r)
}
function setQ(id, val) {
  updateSubmission(id, { q: Math.max(0, Number(val) - 1) })
}
function setT(id, val) {
  updateSubmission(id, { t: Number(val) })
}

// ---- filters: by team and by question -------------------------------------
const fTeam = ref('all')
const fQ = ref('all')
const hasFilters = computed(() => fTeam.value !== 'all' || fQ.value !== 'all')
function clearFilters() {
  fTeam.value = 'all'
  fQ.value = 'all'
}

const filtered = computed(() =>
  rows.value.filter((r) => {
    if (fTeam.value !== 'all' && r.t !== Number(fTeam.value)) return false
    if (fQ.value !== 'all' && r.q !== Number(fQ.value)) return false
    return true
  })
)

// ---- CSV export (exports exactly what the filters are showing) -------------
function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function downloadCsv() {
  const header = ['Question', 'Team', 'Low', 'High', 'Attempt', 'Final', 'Actual', 'Result']
  const lines = [header.join(',')]
  filtered.value.forEach((r) => {
    const g = result(r)
    lines.push(
      [
        `Q${r.q + 1}`,
        teams.value[r.t] || `Team ${r.t + 1}`,
        r.min, // raw, unformatted — spreadsheet-friendly
        r.max,
        `${r.attempt}/${r.total}`,
        r.attempt === r.total ? 'yes' : 'no',
        state.actuals[r.q] ?? '',
        g === 'within' || g === 'outside' ? g : '',
      ]
        .map(csvCell)
        .join(',')
    )
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'fermithon-submissions.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="history">
    <div class="toolbar">
      <div class="filters">
        <select v-model="fTeam" aria-label="Filter by team">
          <option value="all">All teams</option>
          <option v-for="(name, i) in teams" :key="i" :value="i">
            {{ name || `Team ${i + 1}` }}
          </option>
        </select>
        <select v-model="fQ" aria-label="Filter by question">
          <option value="all">All questions</option>
          <option v-for="n in questions" :key="n" :value="n - 1">Q{{ n }}</option>
        </select>
        <button v-if="hasFilters" class="ghost" @click="clearFilters">
          <font-awesome-icon :icon="['fas', 'xmark']" /> Clear
        </button>
      </div>

      <div class="actions">
        <span class="muted count">{{ filtered.length }} of {{ rows.length }}</span>
        <button class="ghost" @click="downloadCsv" :disabled="!filtered.length">
          <font-awesome-icon :icon="['fas', 'download']" /> CSV
        </button>
      </div>
    </div>

    <div v-if="!rows.length" class="empty muted">
      No submissions yet. Click a cell in the grid above to add one.
    </div>
    <div v-else-if="!filtered.length" class="empty muted">
      No submissions match these filters.
    </div>

    <div v-else class="scroll">
      <table class="hist">
        <thead>
          <tr>
            <th>Question</th>
            <th>Team</th>
            <th>Low</th>
            <th>High</th>
            <th class="center">Attempt</th>
            <th class="center">Result</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id">
            <td>
              <select :value="r.q + 1" @change="setQ(r.id, $event.target.value)">
                <option v-for="n in questions" :key="n" :value="n">Q{{ n }}</option>
              </select>
            </td>
            <td>
              <select :value="r.t" @change="setT(r.id, $event.target.value)">
                <option v-for="(name, i) in teams" :key="i" :value="i">
                  {{ name || `Team ${i + 1}` }}
                </option>
              </select>
            </td>
            <td>
              <NumberInput
                :model-value="r.min"
                @update:model-value="updateSubmission(r.id, { min: $event })"
              />
            </td>
            <td>
              <NumberInput
                :model-value="r.max"
                @update:model-value="updateSubmission(r.id, { max: $event })"
              />
            </td>
            <td class="center attempt">
              {{ r.attempt }}/{{ r.total }}
              <span v-if="r.attempt === r.total" class="final-tag" title="Counts toward the score">final</span>
            </td>
            <td class="center result">
              <font-awesome-icon v-if="result(r) === 'within'" :icon="['fas', 'star']" class="within" />
              <font-awesome-icon v-else-if="result(r) === 'outside'" :icon="['fas', 'skull']" class="outside" />
              <span v-else class="muted">—</span>
            </td>
            <td>
              <button class="ghost icon-btn danger" @click="removeSubmission(r.id)" aria-label="Delete submission">
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.filters,
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.filters select {
  width: auto;
  min-width: 130px;
}
.count {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.empty {
  padding: 8px 2px;
}
.scroll {
  overflow-x: auto;
}
.hist {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}
.hist th,
.hist td {
  padding: 8px 8px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.hist th {
  font-size: 12px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.center {
  text-align: center;
}
.hist select,
.hist input {
  width: 100%;
  min-width: 84px;
}
.attempt {
  font-variant-numeric: tabular-nums;
  color: var(--text-dim);
  white-space: nowrap;
}
.final-tag {
  display: block;
  font-size: 10px;
  color: var(--accent-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.result {
  font-size: 18px;
}
.result .within {
  color: var(--star);
}
.result .outside {
  color: var(--skull);
}
.icon-btn {
  padding: 6px 9px;
}
</style>
