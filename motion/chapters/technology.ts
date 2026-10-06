import { gridX, systemTrace } from '@/lib/paths.ts'
import type { Controller } from '../runtime.ts'
import { ease } from '../tempo.ts'

// SYSTEM — the trace routes in quantised space: it advances one grid cell at a time,
// and every snap leaves a one-frame registration mark. Scrub is `true`: digital, no lag.
const technology: Controller = (el, { gsap, scene, onRefresh, fire }) => {
  const stage = el.querySelector<HTMLElement>('.stage')!
  const svg = stage.querySelector<SVGSVGElement>('svg.art')!
  const grid = [...svg.querySelectorAll<SVGPathElement>('.grid path')]
  const trace = svg.querySelector<SVGPathElement>('.tech__trace')!
  const reg = svg.querySelector<SVGPathElement>('.tech__reg')!
  const modules = [...stage.querySelectorAll<HTMLElement>('.tech__module')]
  const glyphs = [...stage.querySelectorAll<HTMLElement>('.tech__word span')]

  let L = 0
  let cell = 1
  let closes: number[] = []
  let lastCell = -1
  let p = 0
  let flash: ReturnType<typeof setTimeout> | undefined

  gsap.set(glyphs, { opacity: 0 })
  gsap.set(modules, { opacity: 0 })

  const render = () => {
    const drawn = Math.min(L, Math.floor((p * L) / cell) * cell)
    trace.style.strokeDashoffset = `${L - drawn}`
    const c = Math.round(drawn / cell)
    if (c !== lastCell && drawn > 0 && drawn < L) {
      lastCell = c
      const pt = trace.getPointAtLength(drawn)
      reg.setAttribute('transform', `translate(${pt.x} ${pt.y})`)
      reg.style.opacity = '1'
      clearTimeout(flash)
      flash = setTimeout(() => (reg.style.opacity = '0'), 34)
    }
    return drawn / L
  }

  onRefresh(() => {
    const W = stage.clientWidth
    const H = stage.clientHeight
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    grid.forEach((g, i) => g.setAttribute('d', `M${gridX(W, i)} 0L${gridX(W, i)} ${H}`))
    const t = systemTrace(W, H)
    trace.setAttribute('d', t.d)
    L = trace.getTotalLength()
    cell = t.cell / 2
    closes = t.closes
    trace.style.strokeDasharray = `${L} ${L}`
    render()
  })

  const shown = new Set<number>()
  let worded = false
  scene(el, true, (prog, st) => {
    p = prog
    const f = render()
    if (!worded && p > 0) {
      worded = true
      fire(gsap.timeline({ paused: true }).to(glyphs, { opacity: 1, duration: 0.5, ease: ease.write }), st)
    }
    closes.forEach((c, i) => {
      if (f >= c && !shown.has(i)) {
        shown.add(i)
        fire(gsap.timeline({ paused: true }).to(modules[i], { opacity: 1, duration: 0.4, ease: ease.write }), st)
      }
    })
  })

  return () => clearTimeout(flash)
}

export default technology
