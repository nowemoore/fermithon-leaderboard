<script setup>
import { state, resetAll } from '../store/useStore.js'

function onCount(field, e) {
  const v = Math.max(1, Math.min(200, Number(e.target.value) || 1))
  state.settings[field] = v
}
function confirmReset() {
  if (confirm('Reset everything — settings, team names, submissions and answers?')) {
    resetAll()
  }
}
</script>

<template>
  <div class="settings panel">
    <div class="grid">
      <div class="field">
        <label># of questions</label>
        <input type="number" min="1" :value="state.settings.numQuestions" @change="onCount('numQuestions', $event)" />
      </div>
      <div class="field">
        <label># of teams</label>
        <input type="number" min="1" :value="state.settings.numTeams" @change="onCount('numTeams', $event)" />
      </div>
      <div class="field">
        <label>
          Submissions per team (total)
          <span class="hint" title="Aggregate budget across ALL questions. Teams decide which questions to spend re-submissions on.">ⓘ</span>
        </label>
        <input type="number" min="1" :value="state.settings.numSubmissions" @change="onCount('numSubmissions', $event)" />
      </div>
    </div>

    <div class="teams">
      <label class="teams-label">Team names</label>
      <div class="team-inputs">
        <input
          v-for="(name, i) in state.teams"
          :key="i"
          type="text"
          v-model="state.teams[i]"
          :placeholder="`Team ${i + 1}`"
        />
      </div>
    </div>

    <div class="footer-row">
      <button class="danger ghost" @click="confirmReset">
        <font-awesome-icon :icon="['fas', 'rotate-left']" /> Reset all data
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings {
  padding: 18px;
  margin-top: 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hint {
  cursor: help;
  color: var(--text-dim);
}
.teams {
  margin-top: 18px;
}
.teams-label {
  display: block;
  margin-bottom: 8px;
}
.team-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.footer-row {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}
</style>
