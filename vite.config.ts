import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // Absolute, because the page references /assets/... from CSS and from copy.
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // The film is 10MB and lives in public/; nothing here should be inlined.
    assetsInlineLimit: 0,
    target: 'es2022',
    rollupOptions: {
      output: {
        // One 442KB file meant the browser could not start on the page until it
        // had parsed all of it, and the SEO audit of 27.08.2026 measured the
        // cost as 834ms of blocked main thread. The shader now arrives on its
        // own chunk through a dynamic import; these two are the rest of the
        // weight, split so the motion library and the icon set are cached
        // separately from the page's own code, which is the part that changes.
        // Written as a function, not a map. The map form names packages, and
        // the static render in scripts/prerender.mjs builds the same config
        // with dependencies external, where naming a package that is not in
        // the graph is a hard error. A function simply never matches there.
        manualChunks(id: string) {
          if (/node_modules[\\/]motion/.test(id)) return 'motion'
          if (/node_modules[\\/]lucide-react/.test(id)) return 'icons'
          return undefined
        },
      },
    },
  },
  server: { port: 4501 },
  preview: { port: 4500 },
})
