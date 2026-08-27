import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

/**
 * The supporting pages, in `npm run dev`.
 *
 * They are written by scripts/prerender.mjs at build time, so on the dev server
 * every one of their addresses fell through to the SPA fallback and answered
 * 200 with the home page. Clicking "תנאי שימוש" in the colophon reloaded the
 * home page, which reads exactly like a broken link, and was reported as one on
 * 27.08.2026.
 *
 * This renders them from the same module the build uses, so a page cannot look
 * right in dev and different in dist. Serve only: the build has its own writer.
 */
function supportingPagesInDev(): Plugin {
  return {
    name: 'inplace:supporting-pages-in-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0]
        const match = /^\/(en\/)?([a-z][a-z-]*)\/$/.exec(url)
        if (!match) return next()
        const locale = match[1] ? 'en' : 'he'
        try {
          const { pageHtml } = await server.ssrLoadModule('/src/lib/page-html.ts')
          const mod = await server.ssrLoadModule(
            locale === 'he' ? '/src/content/pages.ts' : '/src/content/pages.en.ts'
          )
          const site = mod.default
          const page = site.pages.find((p: { slug: string }) => p.slug === match[2])
          if (!page) return next()
          const html = await server.transformIndexHtml(
            url,
            pageHtml(page, site.pages, '/src/styles.css?direct', site.cta, locale)
          )
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
        } catch (error) {
          server.ssrFixStacktrace(error as Error)
          next(error)
        }
      })
    },
  }
}

export default defineConfig({
  // Absolute, because the page references /assets/... from CSS and from copy.
  base: '/',
  plugins: [react(), tailwindcss(), supportingPagesInDev()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // The film is 10MB and lives in public/; nothing here should be inlined.
    assetsInlineLimit: 0,
    target: 'es2022',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        en: fileURLToPath(new URL('./en/index.html', import.meta.url)),
      },
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
