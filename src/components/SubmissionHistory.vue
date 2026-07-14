<script setup>
import { computed } from 'vue'
import { state, updateSubmission, removeSubmission } from '../store/useStore.js'
import { gradeSubmission } from '../scoring.js'

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
</script>

<template>
  <div class="history">
    <div v-if="!rows.length" class="empty muted">
      No submissions yet. Click a cell in the grid above to add one.
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
          <tr v-for="r in rows" :key="r.id">
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
              <input type="text" inputmode="decimal" :value="r.min" @input="updateSubmission(r.id, { min: $event.target.value })" />
            </td>
            <td>
              <input type="text" inputmode="decimal" :value="r.max" @input="updateSubmission(r.id, { max: $event.target.value })" />
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
