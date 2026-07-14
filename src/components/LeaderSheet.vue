<script setup>
import { ref, computed } from 'vue'
import { state, cellSubmissions } from '../store/useStore.js'
import CellIcons from './CellIcons.vue'
import CellEditor from './CellEditor.vue'

// editable=false makes this a pure read-only display (the to-stream board).
// editable=true (Game Master tab) lets clicking a cell open the interval editor.
// locked=true temporarily blocks entry (e.g. until the answer key is complete).
const props = defineProps({
  editable: { type: Boolean, default: true },
  locked: { type: Boolean, default: false },
})

const editing = ref(null) // { q, t } or null

const questions = computed(() =>
  Array.from({ length: state.settings.numQuestions }, (_, i) => i)
)
const teams = computed(() => state.teams)

function openCell(q, t) {
  if (!props.editable || props.locked) return
  editing.value = { q, t }
}
</script>

<template>
  <div class="sheet-wrap panel">
    <div class="scroll">
      <table class="sheet">
        <thead>
          <tr>
            <th class="corner">
              Question
            </th>
            <th v-for="(name, t) in teams" :key="t" class="team-head">
              <span class="team-name">{{ name || `Team ${t + 1}` }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in questions" :key="q">
            <th class="q-head">
              <span class="q-num">Q{{ q + 1 }}</span>
            </th>
            <td
              v-for="(name, t) in teams"
              :key="t"
              class="cell"
              :class="{ readonly: !editable, locked: editable && locked }"
              @click="openCell(q, t)"
            >
              <CellIcons :submissions="cellSubmissions(q, t)" :actual="state.actuals[q]" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CellEditor v-if="editing" :q="editing.q" :t="editing.t" @close="editing = null" />
  </div>
</template>

<style scoped>
.sheet-wrap {
  margin-top: 14px;
  padding: 6px;
  overflow: hidden;
}
.scroll {
  overflow-x: auto;
}
.sheet {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: 520px;
}
th,
td {
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
}
thead th {
  position: sticky;
  top: 0;
  background: var(--bg-panel-2);
  z-index: 5;
  padding: 12px 10px;
  font-size: 14px;
}
.corner {
  position: sticky;
  left: 0;
  z-index: 6;
  text-align: left;
  color: var(--text-dim);
  border-top-left-radius: 8px;
}
.team-head {
  text-align: center;
}
.team-name {
  font-weight: 700;
  white-space: nowrap;
}
.q-head {
  position: sticky;
  left: 0;
  z-index: 4;
  padding: 10px 12px;
  text-align: left;
  white-space: nowrap;
  display: table-cell;
}
.q-num {
  font-weight: 700;
}
.cell {
  padding: 8px 6px;
  text-align: center;
  cursor: pointer;
  transition: background 0.1s ease;
  min-width: 84px;
}
/* zebra rows: light / dark / light down the sheet (first column included) */
tbody tr:nth-child(odd) .cell,
tbody tr:nth-child(odd) .q-head {
  background: #2a2b31;
}
tbody tr:nth-child(even) .cell,
tbody tr:nth-child(even) .q-head {
  background: #1f2024;
}
.cell:not(.readonly):not(.locked):hover {
  background: #34353c;
}
.cell.readonly {
  cursor: default;
}
.cell.locked {
  cursor: not-allowed;
  opacity: 0.55;
}
tbody tr:last-child th,
tbody tr:last-child td {
  border-bottom: none;
}
th:last-child,
td:last-child {
  border-right: none;
}
</style>
