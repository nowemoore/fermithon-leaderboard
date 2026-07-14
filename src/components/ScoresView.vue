<script setup>
import { computed, ref } from 'vue'
import { state } from '../store/useStore.js'
import { leaderboard, formatScore, scoreTeam } from '../scoring.js'
import TimerBar from './TimerBar.vue'
import LeaderSheet from './LeaderSheet.vue'
import SettingsBar from './SettingsBar.vue'
import SubmissionHistory from './SubmissionHistory.vue'
import GmSection from './GmSection.vue'

// The private Game Master tab. Everything the GM needs — timer, setup, interval
// entry, the answer key, the editable submission history and live scores —
// lives here. It is never cast; the public board mirrors the icons.
const board = computed(() => leaderboard(state))
const questions = computed(() =>
  Array.from({ length: state.settings.numQuestions }, (_, i) => i)
)

const expanded = ref(null)
function toggle(teamIndex) {
  expanded.value = expanded.value === teamIndex ? null : teamIndex
}
function breakdown(teamIndex) {
  return scoreTeam(state, teamIndex)
}

const answeredCount = computed(
  () => state.actuals.filter((a) => a !== '' && a != null).length
)
// The round is locked until every answer is filled in.
const keyComplete = computed(() => {
  const n = state.settings.numQuestions
  if (!n) return false
  return state.actuals.slice(0, n).every((a) => a !== '' && a != null)
})

const formulaText = computed(
  () => `(10 + Σ⌊max/min⌋) · 2^(${state.settings.numQuestions} − #good)`
)
const answerSubtitle = computed(() => {
  const base = `${answeredCount.value} / ${state.settings.numQuestions} entered`
  return keyComplete.value ? base : `${base} — fill all to unlock the round`
})
const intervalsSubtitle = computed(
  () => `Click a cell to add a low / high · each team has ${state.settings.numSubmissions} submissions total`
)
</script>

<template>
  <div class="console">
    <header class="brand-row">
      <span class="dot"></span>
      <h1>Fermithon</h1>
      <span class="tag muted">Game Master</span>
    </header>

    <div class="warn">
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
      Private. Do <strong>not</strong> screen-share this tab. Share only the leaderboard tab.
    </div>

    <GmSection title="Timer" icon="clock" :open="true">
      <TimerBar :locked="!keyComplete" />
    </GmSection>

    <GmSection title="Setup" icon="gear" :open="true">
      <SettingsBar />
    </GmSection>

    <GmSection title="Answer key" icon="key" :subtitle="answerSubtitle" :open="true">
      <div class="answers">
        <div v-for="q in questions" :key="q" class="answer-field">
          <label>Q{{ q + 1 }}</label>
          <input type="text" inputmode="decimal" v-model="state.actuals[q]" placeholder="actual value" />
        </div>
      </div>
    </GmSection>

    <GmSection title="Enter intervals" icon="table-cells" :subtitle="intervalsSubtitle" :open="true">
      <div v-if="!keyComplete" class="lock-hint">
        <font-awesome-icon :icon="['fas', 'lock']" />
        Enter all {{ state.settings.numQuestions }} answers in the Answer key to unlock interval entry.
      </div>
      <LeaderSheet :editable="true" :locked="!keyComplete" />
    </GmSection>

    <GmSection
      title="Submission history"
      icon="clock-rotate-left"
      subtitle="Fix any mistake (team, question, low/high) — attempts and scores re-count automatically"
      :open="false"
    >
      <SubmissionHistory />
    </GmSection>

    <GmSection title="Ranking" icon="trophy" :subtitle="formulaText" :open="true">
      <table class="rank">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th class="num">Good</th>
            <th class="num">Σ⌊max/min⌋</th>
            <th class="num">Score</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in board" :key="row.teamIndex">
            <tr class="rank-row" :class="{ leader: row.rank === 1 }" @click="toggle(row.teamIndex)">
              <td class="rank-num">{{ row.rank }}</td>
              <td class="team">{{ row.name || `Team ${row.teamIndex + 1}` }}</td>
              <td class="num">{{ row.good }}</td>
              <td class="num">{{ row.sum }}</td>
              <td class="num score">{{ formatScore(row.score) }}</td>
              <td class="chev">{{ expanded === row.teamIndex ? '▾' : '▸' }}</td>
            </tr>
            <tr v-if="expanded === row.teamIndex" class="detail">
              <td colspan="6">
                <div class="detail-inner">
                  <span class="muted">Per question (final submission):</span>
                  <span
                    v-for="pq in breakdown(row.teamIndex).perQuestion"
                    :key="pq.q"
                    class="pill"
                    :class="{ good: pq.isGood, none: !pq.attempts }"
                  >
                    Q{{ pq.q + 1 }}:
                    <template v-if="!pq.attempts">—</template>
                    <template v-else-if="pq.isGood">★ +{{ pq.ratio }}</template>
                    <template v-else>💀</template>
                  </span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </GmSection>
  </div>
</template>

<style scoped>
.console {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px 18px 60px;
}
.brand-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 12px;
}
.brand-row h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: -0.5px;
}
.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--accent-2);
  box-shadow: 0 0 14px var(--accent-2);
  align-self: center;
}
.tag {
  font-size: 18px;
}
.warn {
  background: rgba(255, 107, 122, 0.12);
  border: 1px solid rgba(255, 107, 122, 0.4);
  color: #ffb3bc;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.lock-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-dim);
  background: var(--bg-cell);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}
.answers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.answer-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rank {
  width: 100%;
  border-collapse: collapse;
}
.rank th,
.rank td {
  padding: 10px 8px;
  text-align: left;
}
.rank th {
  font-size: 12px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.rank-row {
  cursor: pointer;
  border-bottom: 1px solid var(--border);
}
.rank-row:hover {
  background: var(--bg-panel-2);
}
.rank-num {
  font-weight: 700;
  color: var(--text-dim);
}
.leader .rank-num,
.leader .team {
  color: var(--accent-2);
}
.leader .rank-num {
  text-shadow: 0 0 12px rgba(218, 190, 249, 0.5);
}
.team {
  font-weight: 600;
}
.score {
  font-weight: 700;
}
.chev {
  color: var(--text-dim);
  width: 20px;
}
.detail td {
  padding: 4px 8px 12px;
}
.detail-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.pill {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg-cell);
  border: 1px solid var(--border);
  color: var(--text-dim);
}
.pill.good {
  color: var(--good);
  border-color: var(--good);
}
.pill.none {
  opacity: 0.5;
}
</style>
