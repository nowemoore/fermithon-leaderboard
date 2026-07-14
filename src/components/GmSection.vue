<script setup>
import { ref } from 'vue'

// A titled, collapsible Game Master section. Clicking the header rolls the body
// open/closed with a smooth height animation; the circle-chevron points down
// when collapsed and up when expanded.
const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: null },
  subtitle: { type: String, default: '' },
  open: { type: Boolean, default: true },
})
const visible = ref(props.open)
</script>

<template>
  <section class="gm-section">
    <button class="gm-head" @click="visible = !visible" :aria-expanded="visible">
      <div class="gm-title">
        <h2>
          <font-awesome-icon v-if="icon" :icon="['fas', icon]" class="head-ico" />
          {{ title }}
        </h2>
        <span v-if="subtitle" class="muted subtitle">{{ subtitle }}</span>
      </div>
      <font-awesome-icon
        :icon="['fas', 'circle-chevron-down']"
        class="chevron"
        :class="{ up: visible }"
      />
    </button>

    <!-- grid-rows 0fr<->1fr animates a smooth roll for any content height -->
    <div class="gm-collapse" :class="{ open: visible }">
      <div class="gm-body"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.gm-section {
  margin-top: 20px;
}
.gm-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 4px;
  cursor: pointer;
  color: var(--text);
  text-align: left;
}
.gm-head:hover {
  background: transparent;
}
.gm-head:active {
  transform: none;
}
.gm-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.gm-title h2 {
  margin: 0;
  font-size: 16px;
}
.head-ico {
  color: var(--accent);
  margin-right: 4px;
}
.subtitle {
  font-size: 12px;
}
.chevron {
  color: var(--text-dim);
  font-size: 20px;
  flex: none;
  transition: transform 0.28s ease, color 0.15s ease;
}
.chevron.up {
  transform: rotate(180deg);
}
.gm-head:hover .chevron {
  color: var(--text);
}
.gm-collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.28s ease;
}
.gm-collapse.open {
  grid-template-rows: 1fr;
}
.gm-body {
  overflow: hidden;
  min-height: 0;
  padding-top: 12px;
}
</style>
