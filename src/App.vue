<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import MainView from './components/MainView.vue'
import ScoresView from './components/ScoresView.vue'

// Tiny hash router so window.open('#/scores') opens the private console in a
// separate window without needing vue-router or server config.
function currentView() {
  return window.location.hash.replace(/^#\/?/, '') === 'scores' ? 'scores' : 'main'
}
const view = ref(currentView())
function onHash() {
  view.value = currentView()
}
onMounted(() => window.addEventListener('hashchange', onHash))
onUnmounted(() => window.removeEventListener('hashchange', onHash))
</script>

<template>
  <ScoresView v-if="view === 'scores'" />
  <MainView v-else />
</template>
