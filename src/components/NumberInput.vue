<script setup>
import { ref, watch, nextTick } from 'vue'
import { sanitizeNumber as sanitize, formatNumber as format } from '../format.js'

// A numeric text input that shows thousands separators as you type
// (1,234,567) but emits the RAW unformatted string. Everything downstream
// (scoring's Number() parsing, the CSV export) keeps seeing clean numbers —
// the commas never reach the store.
//
// Scientific notation (1e9) is passed through unformatted, since grouping it
// would be meaningless.
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const el = ref(null)
const display = ref(format(props.modelValue))

// Re-sync when the value changes from outside (but not while the user types,
// which would fight the caret).
watch(
  () => props.modelValue,
  (v) => {
    if (sanitize(v) !== sanitize(display.value)) display.value = format(v)
  }
)

function onInput(e) {
  const input = e.target
  const caret = input.selectionStart ?? input.value.length
  // Re-anchor the caret to the same number of digits, not the same index —
  // otherwise inserting a comma shunts the cursor.
  const digitsLeft = (input.value.slice(0, caret).match(/\d/g) || []).length

  const raw = sanitize(input.value)
  const formatted = format(raw)
  display.value = formatted
  emit('update:modelValue', raw)

  nextTick(() => {
    if (!el.value) return
    let seen = 0
    let pos = formatted.length
    if (digitsLeft === 0) {
      pos = formatted.length ? Math.min(1, formatted.length) : 0
    } else {
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) seen++
        if (seen === digitsLeft) {
          pos = i + 1
          break
        }
      }
    }
    el.value.setSelectionRange(pos, pos)
  })
}

function focus() {
  el.value?.focus()
}
defineExpose({ focus })
</script>

<template>
  <input
    ref="el"
    type="text"
    inputmode="decimal"
    :value="display"
    :placeholder="placeholder"
    @input="onInput"
  />
</template>
