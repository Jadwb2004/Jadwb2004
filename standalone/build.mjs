// Builds one self-contained HTML file of the dashboard (built-in director, no server).
import { build } from 'esbuild'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const out = process.argv[2] ?? path.join(root, 'standalone', 'ai-game-director.html')

const js = await build({
  entryPoints: [path.join(here, 'main.tsx')],
  bundle: true,
  minify: true,
  write: false,
  format: 'iife',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  alias: { '@': root },
  tsconfig: path.join(root, 'tsconfig.json'),
  logLevel: 'warning',
})
const cssIn = path.join(here, 'styles.css')
const css = await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(readFileSync(cssIn, 'utf8'), { from: cssIn })

const html = `<title>AI Game Director</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Single dark studio look, chosen on purpose: the console a director works at. */
:root { --bg: #09090b; --fg: #f4f4f5; color-scheme: dark; }
html, body, #root { height: 100%; }
body { background: var(--bg); color: var(--fg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
#root > div { height: 100%; padding-left: env(safe-area-inset-left, 0px); padding-right: env(safe-area-inset-right, 0px); }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; scroll-behavior: auto !important; } }
${css.css}
</style>
<div id="root"></div>
<script>${js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')}</script>
`
writeFileSync(out, html)
console.log(`Wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`)
