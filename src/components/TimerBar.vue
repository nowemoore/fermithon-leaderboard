<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { state } from '../store/useStore.js'
import SevenSegment from './SevenSegment.vue'

// `displayOnly` shows just the clock (no controls) — used on the to-stream
// board. `locked` disables the controls until the answer key is complete.
const props = defineProps({
  displayOnly: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
})

// A `now` tick drives the live countdown. The source of truth is state.timer
// (endAt while running, remainingSec while paused), so it survives refreshes
// and reads correctly in both tabs.
const now = ref(Date.now())
let handle = null
onMounted(() => {
  handle = setInterval(() => (now.value = Date.now()), 250)
})
onUnmounted(() => clearInterval(handle))

const remaining = computed(() => {
  const t = state.timer
  if (t.running && t.endAt) {
    return Math.max(0, Math.round((t.endAt - now.value) / 1000))
  }
  return Math.max(0, Math.round(t.remainingSec))
})

const isUp = computed(() => remaining.value <= 0)
const isRunning = computed(() => state.timer.running && !isUp.value)

const display = computed(() => {
  const total = remaining.value
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function start() {
  if (props.locked || isUp.value) return
  state.timer.endAt = Date.now() + remaining.value * 1000
  state.timer.running = true
}
function pause() {
  if (props.locked) return
  state.timer.remainingSec = remaining.value
  state.timer.running = false
  state.timer.endAt = null
}
function reset() {
  if (props.locked) return
  state.timer.running = false
  state.timer.endAt = null
  state.timer.remainingSec = state.timer.durationSec
}

const editMin = ref(Math.floor(state.timer.durationSec / 60))
const editSec = ref(state.timer.durationSec % 60)
function applyDuration() {
  if (props.locked) return
  const secs = Math.max(0, Number(editMin.value) * 60 + Number(editSec.value))
  state.timer.durationSec = secs
  if (!state.timer.running) state.timer.remainingSec = secs
}
</script>

<template>
  <div class="timer-card panel" :class="{ up: isUp, running: isRunning, display: displayOnly }">
    <div class="clock">
      <SevenSegment class="time" :value="display" />
      <span v-if="isUp" class="times-up">TIME'S UP</span>
    </div>

    <div class="controls" v-if="!displayOnly">
      <div v-if="locked" class="locked-note">
        <font-awesome-icon :icon="['fas', 'lock']" />
        Enter the full answer key to unlock the timer
      </div>
      <template v-else>
        <div class="set-duration">
          <input type="number" min="0" v-model="editMin" @change="applyDuration" aria-label="minutes" />
          <span class="colon">:</span>
          <input type="number" min="0" max="59" v-model="editSec" @change="applyDuration" aria-label="seconds" />
        </div>
        <button v-if="!isRunning" class="primary" @click="start">
          <font-awesome-icon :icon="['fas', 'play']" /> Start
        </button>
        <button v-else @click="pause">
          <font-awesome-icon :icon="['fas', 'pause']" /> Pause
        </button>
        <button class="ghost" @click="reset">
          <font-awesome-icon :icon="['fas', 'rotate-left']" /> Reset
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.timer-card {
  max-width: 460px;
  margin: 0 auto;
  padding: 16px 24px;
  text-align: center;
}
.timer-card.display {
  max-width: 340px;
}
.clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.time {
  font-size: clamp(44px, 7vw, 76px);
  line-height: 1;
  color: var(--text);
}
.running .time {
  color: var(--accent);
}
.up .time {
  color: var(--skull);
}
.times-up {
  color: var(--skull);
  font-weight: 700;
  letter-spacing: 3px;
  animation: blink 1s steps(2, start) infinite;
}
@keyframes blink {
  to {
    opacity: 0.25;
  }
}
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.locked-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-dim);
}
.set-duration {
  display: flex;
  align-items: center;
  gap: 4px;
}
.set-duration input {
  width: 58px;
  text-align: center;
}
.colon {
  color: var(--text-dim);
  font-weight: 700;
}
</style>
