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
  },
  server: { port: 4501 },
  preview: { port: 4500 },
})
