// Deterministic screenshots: each section settled (?seek=id), opening frames,
// the floating nav (tooltip, hidden on scroll down, back on scroll up), the nav curtain, the
// mobile dock, the CSS-fallback field and reduced motion.
// Headless Chrome only gets WebGL through SwiftShader, so pages are loaded with gl=force.
// Usage: node scripts/shoot.mjs [baseUrl] [outDir]
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:3211'
// Screenshots stay outside the project: the repository ships no images.
const out = process.argv[3] ?? join(tmpdir(), 'srujan-shots')
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const sections = ['top', 'technology', 'business', 'leadership', 'ventures', 'experience', 'education', 'contact']
const viewports = { desk: { width: 1440, height: 900 }, mob: { width: 390, height: 844 } }

const browser = await chromium.launch({
  executablePath: chrome,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const errors = []
const watch = (page, label) => {
  page.on('pageerror', (e) => errors.push(`${label}: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${label}: ${m.text()}`))
}

for (const [vp, viewport] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  watch(page, vp)
  for (const id of sections) {
    await page.goto(`${base}/?seek=${id}&gl=force`)
    await page.waitForTimeout(2600)
    await page.screenshot({ path: `${out}/${vp}-${id}.png` })
  }
  // Technology's scene: the brief interpreted into R1–R4, at four points of the scrub.
  for (const p of [0.1, 0.3, 0.6, 1]) {
    await page.goto(`${base}/?seek=technology:${p}&gl=force`)
    await page.waitForTimeout(2600)
    await page.screenshot({ path: `${out}/${vp}-technology-${p}.png` })
  }
  await ctx.close()

  // The opening, frozen at t seconds (?opening=t); a fresh context is a first-ever visit.
  for (const t of [0.3, 0.9, 1.5, 2.2, 3.0]) {
    const fresh = await browser.newContext({ viewport })
    const pre = await fresh.newPage()
    watch(pre, `${vp}-opening`)
    await pre.goto(`${base}/?gl=force&opening=${t}`)
    await pre.waitForFunction(() => ['frozen', 'done'].includes(document.documentElement.dataset.opening ?? ''), null, { timeout: 15000 })
    await pre.waitForTimeout(300)
    await pre.screenshot({ path: `${out}/${vp}-opening-${t}.png` })
    await fresh.close()
  }
}

// Nav curtain: a far jump from the hero to Leadership.
{
  const ctx = await browser.newContext({ viewport: viewports.desk })
  const page = await ctx.newPage()
  watch(page, 'curtain')
  await page.goto(`${base}/?seek=top&gl=force`)
  await page.waitForTimeout(2600)
  await page.hover('.navf__links a[href="#business"]')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/desk-nav-tooltip.png`, clip: { x: 0, y: 0, width: 1440, height: 160 } })
  await page.click('.navf__links a[href="#leadership"]')
  await page.waitForTimeout(380)
  await page.screenshot({ path: `${out}/desk-curtain-cover.png` })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${out}/desk-curtain-reveal.png` })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/desk-curtain-done.png` })
  // Floating nav, live (no seek): hidden while scrolling down, back on scroll up.
  await page.goto(`${base}/?gl=off`)
  await page.waitForFunction(() => document.documentElement.dataset.opening === 'done', null, { timeout: 15000 })
  await page.waitForTimeout(800)
  await page.mouse.move(700, 500)
  for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 160), await page.waitForTimeout(60)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${out}/desk-nav-hidden.png`, clip: { x: 0, y: 0, width: 1440, height: 160 } })
  for (let i = 0; i < 3; i++) await page.mouse.wheel(0, -160), await page.waitForTimeout(60)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${out}/desk-nav-shown.png` })
  // CSS fallback field, for registration against the GL field.
  await page.goto(`${base}/?seek=technology&gl=off`)
  await page.waitForTimeout(2600)
  await page.screenshot({ path: `${out}/desk-technology-gl-off.png` })
  await ctx.close()
}

// Reduced motion: no preloader, no canvas, no sticky; every diagram drawn, in flow.
{
  const ctx = await browser.newContext({ viewport: viewports.desk, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  watch(page, 'reduced')
  await page.goto(base)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${out}/reduced-full.png`, fullPage: true })
  await ctx.close()
}

await browser.close()
console.log(errors.length ? `errors:\n${errors.join('\n')}` : 'no page or console errors')
console.log(`done → ${out}`)
