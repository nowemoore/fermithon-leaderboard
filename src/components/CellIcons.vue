<script setup>
import { computed } from 'vue'
import { gradeSubmission } from '../scoring.js'

// One icon per submission:
//   within  -> star   (the team's interval contained the answer)
//   outside -> skull   (answer fell outside; multiple skulls = wrong repeatedly)
// The answer key is always entered before any interval, so there is no
// "awaiting answer" state to display.
const props = defineProps({
  submissions: { type: Array, default: () => [] },
  actual: { type: [String, Number], default: '' },
  // Ring the final (scored) attempt. Off on the cast; on in the console.
  markFinal: { type: Boolean, default: false },
})

const graded = computed(() =>
  props.submissions.map((s, i) => ({
    grade: gradeSubmission(props.actual, s),
    isFinal: i === props.submissions.length - 1,
  }))
)
</script>

<template>
  <div class="icons" v-if="graded.length">
    <span
      v-for="(g, i) in graded"
      :key="i"
      class="icon"
      :class="[g.grade, { final: markFinal && g.isFinal }]"
      :title="g.grade === 'within' ? 'Within interval (star)' : 'Outside interval (skull)'"
    >
      <font-awesome-icon v-if="g.grade === 'within'" :icon="['fas', 'star']" />
      <font-awesome-icon v-else-if="g.grade === 'outside'" :icon="['fas', 'skull']" />
    </span>
  </div>
  <div class="icons empty" v-else>·</div>
</template>

<style scoped>
.icons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}
.icons.empty {
  color: var(--text-dim);
  opacity: 0.4;
}
.icon {
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
}
.icon.within {
  color: var(--star);
  filter: drop-shadow(0 0 6px rgba(218, 190, 249, 0.5));
}
.icon.outside {
  color: var(--skull);
}
.icon.final {
  border-radius: 50%;
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}
</style>
