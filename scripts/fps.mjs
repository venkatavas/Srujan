// Frame-time probe for the site's scroll reveals, drawn lines and hover motion. Runs headed Chrome
// (real GPU), scrolls the page in wheel steps while moving the pointer, and reports frame
// deltas and long tasks. Pass: p95 ≤ 18ms and no long task over 50ms.
// Usage: node scripts/fps.mjs [baseUrl]
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:3211'
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await chromium.launch({ executablePath: chrome, headless: false })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
// A real visit: the hero settles first, then the page is scrolled.
const page = await ctx.newPage()
await page.goto(base)
await page.waitForTimeout(2500)

await page.evaluate(() => {
  const w = window
  w.__frames = []
  w.__long = []
  let last = performance.now()
  const tick = (t) => {
    w.__frames.push(t - last)
    last = t
    if (w.__run) requestAnimationFrame(tick)
  }
  w.__run = true
  requestAnimationFrame(tick)
  new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__long.push(e.duration))).observe({ type: 'longtask' })
})

const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
for (let y = 0, i = 0; y < total; y += 120, i++) {
  await page.mouse.move(300 + ((i * 37) % 900), 200 + ((i * 53) % 500))
  await page.mouse.wheel(0, 120)
  await page.waitForTimeout(50)
}
await page.waitForTimeout(500)

const { frames, long } = await page.evaluate(() => {
  window.__run = false
  return { frames: window.__frames.slice(5), long: window.__long }
})
const sorted = [...frames].sort((a, b) => a - b)
const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
console.log(`frames: ${frames.length}`)
console.log(`median ${pct(0.5).toFixed(1)}ms · p95 ${pct(0.95).toFixed(1)}ms · max ${sorted.at(-1).toFixed(1)}ms`)
console.log(`long tasks: ${long.length}${long.length ? ` (max ${Math.max(...long).toFixed(0)}ms)` : ''}`)
console.log(pct(0.95) <= 18 && !long.some((d) => d > 50) ? 'PASS' : 'CHECK')
await browser.close()
