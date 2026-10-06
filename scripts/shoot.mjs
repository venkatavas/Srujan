// Deterministic screenshots of chapter states via ?seek=chapter:p.
// Usage: node scripts/shoot.mjs [baseUrl] [outDir]
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:3211'
const out = process.argv[3] ?? '.playwright-mcp/shots'
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const shots = [
  ['top', 0], ['technology', 0.5], ['technology', 1], ['business', 0.35], ['business', 1],
  ['media', 0.45], ['media', 1], ['leadership', 0.14], ['leadership', 0.5], ['leadership', 1],
  ['ventures', 0.25], ['ventures', 1], ['contact', 1],
]
const viewports = { desk: { width: 1440, height: 900 }, mob: { width: 390, height: 844 } }

const browser = await chromium.launch({ executablePath: chrome })
for (const [vpName, viewport] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'no-preference' })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  for (const [id, p] of shots) {
    await page.goto(`${base}/?seek=${id}:${p}`)
    await page.waitForTimeout(2600)
    await page.screenshot({ path: `${out}/${vpName}-${id}-${p}.png` })
  }
  if (errors.length) console.log(vpName, 'page errors:', errors)
  await ctx.close()
}
// Reduced motion: posters in flow.
const ctx = await browser.newContext({ viewport: viewports.desk, reducedMotion: 'reduce' })
const page = await ctx.newPage()
await page.goto(base)
await page.waitForTimeout(1200)
await page.screenshot({ path: `${out}/reduced-full.png`, fullPage: true })
await browser.close()
console.log('done')
