import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // A duplicated three.js instance is a classic R3F failure mode.
    dedupe: ['three'],
  },

  build: {
    target: 'es2022',
    // Fonts are bundled as separate files, not inlined as base64.
    assetsInlineLimit: 4096,

    /*
      The 3D chunk is ~884 kB raw / ~235 kB gzip. That is expected and accepted:
      it is lazy-loaded (nothing imports it until <ExperienceCanvas> mounts), so
      it never blocks first paint, and the presentation runs offline from a
      local build where download size is irrelevant.
    */
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        /*
          Keep the heavy libraries out of the entry chunk so first paint isn't
          blocked by them.

          three and @react-three are one chunk on purpose. Splitting them was
          tried: manualChunks does return a separate 'three-core', but Rolldown
          merges it back because R3F statically depends on three, so the two are
          always fetched together — a separate chunk would only add a request.
        */
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (
            /node_modules[/\\]three[/\\]/.test(id) ||
            id.includes('@react-three')
          ) {
            return 'three'
          }
          if (/node_modules[/\\]motion/.test(id)) return 'motion'
        },
      },
    },
  },
})
