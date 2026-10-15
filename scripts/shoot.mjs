// Screenshots of the site for review: every section at desktop and phone size once its entrance
// has settled, plus the first screen with reduced motion. Also reports horizontal overflow and
// console errors. Screenshots stay outside the project: the repository ships no images.
// Usage: node scripts/shoot.mjs [baseUrl] [outDir]
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:3211'
const out = process.argv[3] ?? join(tmpdir(), 'srujan-shots')
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
mkdirSync(out, { recursive: true })

const viewports = { desk: { width: 1440, height: 900 }, mob: { width: 390, height: 844 } }
const browser = await chromium.launch({ executablePath: chrome })
const errors = []

for (const [vp, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport })
  page.on('pageerror', (e) => errors.push(`${vp}: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${vp}: ${m.text()}`))
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  const ids = await page.$$eval('main > section[id]', (s) => s.map((x) => x.id))
  for (const id of ids) {
    await page.$eval(`#${id}`, (e) => window.scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: 'instant' }))
    await page.waitForTimeout(2600) // entrances, lines drawing
    await page.screenshot({ path: join(out, `${vp}-${id}.png`) })
  }
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  console.log(`${vp}: ${ids.length} sections, horizontal overflow ${over}px`)
  await page.close()
}

const ctx = await browser.newContext({ viewport: viewports.desk, reducedMotion: 'reduce' })
const page = await ctx.newPage()
await page.goto(base, { waitUntil: 'networkidle' })
await page.screenshot({ path: join(out, 'desk-reduced-motion.png') })
await ctx.close()

await browser.close()
console.log('errors:', errors.length ? errors : 'none')
console.log('saved to', out)
