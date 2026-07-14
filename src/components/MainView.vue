<script setup>
import TimerBar from './TimerBar.vue'
import LeaderSheet from './LeaderSheet.vue'

// The public "to-stream" board. Purely read-only: all setup and data entry
// live in the Game Master tab and flow here automatically via shared state.
function openGmTab() {
  const url = window.location.pathname + window.location.search + '#/scores'
  window.open(url, '_blank')
}
</script>

<template>
  <div class="app-wrap">
    <div class="topbar">
      <header class="brand-row">
        <span class="dot"></span>
        <h1>Fermithon</h1>
        <span class="tag muted">Leaderboard</span>
      </header>
      <TimerBar :display-only="true" />
    </div>

    <LeaderSheet :editable="false" />

    <div class="legend">
      <span><font-awesome-icon :icon="['fas', 'star']" class="star" /> answer within the interval</span>
      <span><font-awesome-icon :icon="['fas', 'skull']" class="skull" /> answer outside (one per wrong attempt)</span>
    </div>

    <footer class="cast-footer">
      <span class="cast-hint muted">
        This is the <strong>to-stream</strong> board — screen-share this tab only. Enter everything
        in the Game Master tab; this board updates itself. Scores are never shown here.
      </span>
      <button class="primary" @click="openGmTab">
        <font-awesome-icon :icon="['fas', 'up-right-from-square']" /> Open Game Master tab
      </button>
    </footer>
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
/* timer flows at the left edge instead of self-centering */
.topbar :deep(.timer-card) {
  margin: 0;
}
.brand-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding-bottom: 6px;
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
  background: var(--accent);
  box-shadow: 0 0 14px var(--accent);
  align-self: center;
}
.tag {
  font-size: 18px;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-dim);
  align-items: center;
}
.legend .star {
  color: var(--star);
}
.legend .skull {
  color: var(--skull);
}
.cast-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
.cast-hint {
  font-size: 13px;
  max-width: 720px;
}
.cast-footer .primary {
  flex: none;
}
</style>
