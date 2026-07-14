<script setup>
import { ref, computed, onMounted } from 'vue'
import { state, cellSubmissions, addSubmission } from '../store/useStore.js'
import { toNum } from '../scoring.js'
import NumberInput from './NumberInput.vue'

// Minimal quick-entry: ask only for low + high, then Save. The submission limit
// is an AGGREGATE budget per team (total across all questions), so teams choose
// which questions to spend their re-submissions on.
const props = defineProps({
  q: { type: Number, required: true },
  t: { type: Number, required: true },
})
const emit = defineEmits(['close'])

const low = ref('')
const high = ref('')
const lowInput = ref(null)

const teamName = computed(() => state.teams[props.t] || `Team ${props.t + 1}`)
const budget = computed(() => state.settings.numSubmissions)
const teamUsed = computed(() => state.submissions.filter((s) => s.t === props.t).length)
const cellUsed = computed(() => cellSubmissions(props.q, props.t).length)
const atMax = computed(() => teamUsed.value >= budget.value)
const remaining = computed(() => Math.max(0, budget.value - teamUsed.value))

// A valid interval needs both bounds as numbers with low strictly below high.
const lowNum = computed(() => toNum(low.value))
const highNum = computed(() => toNum(high.value))
const valid = computed(
  () =>
    Number.isFinite(lowNum.value) &&
    Number.isFinite(highNum.value) &&
    lowNum.value < highNum.value
)
const touched = computed(() => low.value !== '' || high.value !== '')
const errorMsg = computed(() => {
  if (low.value === '' || high.value === '') return 'Enter both Low and High.'
  if (!Number.isFinite(lowNum.value) || !Number.isFinite(highNum.value)) {
    return 'Low and High must be numbers.'
  }
  return 'Low must be less than High.'
})

onMounted(() => lowInput.value?.focus())

function save() {
  // Empty form acts as cancel.
  if (low.value === '' && high.value === '') {
    emit('close')
    return
  }
  if (atMax.value || !valid.value) return
  addSubmission(props.q, props.t, low.value, high.value)
  emit('close')
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div
      class="dialog panel"
      role="dialog"
      aria-modal="true"
      @keydown.enter="save"
      @keydown.esc="emit('close')"
    >
      <header>
        <div>
          <div class="title">{{ teamName }}</div>
          <div class="sub muted">
            Question {{ q + 1 }}
            <span v-if="cellUsed"> · {{ cellUsed }} here already</span>
          </div>
        </div>
        <button class="ghost icon-btn" @click="emit('close')" aria-label="Close">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </header>

      <div class="budget" :class="{ warn: atMax }">
        <font-awesome-icon :icon="['fas', atMax ? 'lock' : 'clock-rotate-left']" />
        <span v-if="atMax">
          {{ teamName }} has used all {{ budget }} submissions. Remove one in
          <strong>Submission history</strong> to free up budget.
        </span>
        <span v-else>
          {{ teamName }}: {{ teamUsed }} / {{ budget }} submissions used ·
          <strong>{{ remaining }} left</strong> to spend across all questions
        </span>
      </div>

      <div v-if="!atMax" class="fields">
        <label class="field">
          <span>Low (min)</span>
          <NumberInput
            ref="lowInput"
            v-model="low"
            placeholder="e.g. 1,000"
            :class="{ invalid: touched && !valid }"
          />
        </label>
        <label class="field">
          <span>High (max)</span>
          <NumberInput
            v-model="high"
            placeholder="e.g. 5,000"
            :class="{ invalid: touched && !valid }"
          />
        </label>
      </div>

      <div v-if="!atMax && touched && !valid" class="field-error">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
        {{ errorMsg }}
      </div>

      <footer>
        <button class="ghost" @click="emit('close')">Cancel</button>
        <button class="primary" @click="save" :disabled="atMax || !valid">Save</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 12, 0.68);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.dialog {
  width: min(460px, 100%);
  padding: 20px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}
.title {
  font-size: 20px;
  font-weight: 700;
}
.sub {
  font-size: 13px;
  margin-top: 2px;
}
.icon-btn {
  padding: 6px 9px;
}
.budget {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-dim);
  background: var(--bg-cell);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
}
.budget strong {
  color: var(--text);
}
.budget.warn {
  border-color: rgba(255, 107, 122, 0.4);
  color: #ffb3bc;
}
.budget.warn strong {
  color: #fff;
}
.fields {
  display: flex;
  gap: 12px;
}
.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--text-dim);
}
.field input.invalid {
  border-color: var(--skull);
}
.field-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--skull);
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
</style>
