<script setup>
import { computed } from 'vue'

// Self-contained seven-segment display. Each digit is an SVG of 7 beveled
// polygon segments (a–g); lit segments use currentColor (so they inherit the
// timer's running / time's-up color), unlit ones stay faint like a real LED.
const props = defineProps({ value: { type: String, default: '' } })

//   aaa
//  f   b
//  f   b
//   ggg
//  e   c
//  e   c
//   ddd
const SEG_POINTS = {
  a: '6,6 10,3 38,3 42,6 38,9 10,9',
  b: '42,6 45,10 45,38 42,42 39,38 39,10',
  c: '42,42 45,46 45,74 42,78 39,74 39,46',
  d: '6,78 10,75 38,75 42,78 38,81 10,81',
  e: '6,42 9,46 9,74 6,78 3,74 3,46',
  f: '6,6 9,10 9,38 6,42 3,38 3,10',
  g: '6,42 10,39 38,39 42,42 38,45 10,45',
}
const SEG_ORDER = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
const DIGITS = {
  0: 'abcdef',
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
}

const chars = computed(() => props.value.split(''))
function litFor(ch) {
  return DIGITS[ch] || ''
}
</script>

<template>
  <div class="seg-clock">
    <template v-for="(ch, i) in chars" :key="i">
      <svg v-if="ch !== ':'" class="seg-digit" viewBox="0 0 48 84" aria-hidden="true">
        <polygon
          v-for="seg in SEG_ORDER"
          :key="seg"
          :points="SEG_POINTS[seg]"
          :class="litFor(ch).includes(seg) ? 'on' : 'off'"
        />
      </svg>
      <span v-else class="seg-colon" aria-hidden="true"><i></i><i></i></span>
    </template>
    <span class="sr-only">{{ value }}</span>
  </div>
</template>

<style scoped>
.seg-clock {
  display: inline-flex;
  align-items: center;
  gap: 0.14em;
  color: inherit;
  line-height: 1;
}
.seg-digit {
  height: 1em;
  width: 0.58em;
  display: block;
}
.seg-digit .on {
  fill: currentColor;
  filter: drop-shadow(0 0 0.05em currentColor);
}
.seg-digit .off {
  fill: currentColor;
  opacity: 0.05;
}
.seg-colon {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.32em;
  height: 1em;
  padding: 0 0.02em;
}
.seg-colon i {
  width: 0.15em;
  height: 0.15em;
  border-radius: 50%;
  background: currentColor;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
