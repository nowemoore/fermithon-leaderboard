import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Relative base so the build works from any path — GitHub Pages project sites
  // (/<repo>/), user sites (/), or opening dist/index.html straight off disk.
  // Routing is hash-based (#/scores), so no SPA fallback / 404.html is needed.
  base: './',
})
