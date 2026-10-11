import type { Controller } from '../runtime.ts'
import { ease } from '../tempo.ts'

// One draw-in for every section. Elements carry `data-step`; when the section enters,
// steps play in ascending order: nodes fade in, wires draw (pathLength = 1), `data-mark`
// elements switch on (the brief's highlight boxes), and a `[data-count]` counter advances
// as each `[data-count-item]` lands. Fires once; skimmers and jumps get the final state.
//
// Wires are `non-scaling-stroke`, so Chrome measures their dashes in screen pixels while
// pathLength scales them from the unscaled path: on a diagram drawn larger than its viewBox a
// dash of 1 falls short of the path. The dash is therefore sized to the on-screen scale, and
// cleared once drawn so a later resize can never cut a wire.

const STEP_GAP = 0.22

const draw: Controller = (el, { gsap, ScrollTrigger, fire, registry }) => {
  const stepped = [...el.querySelectorAll<HTMLElement | SVGElement>('[data-step]')]
  const marks = [...el.querySelectorAll<HTMLElement>('[data-mark]')]
  if (!stepped.length && !marks.length) return () => {}

  const isWire = (n: Element) => n instanceof SVGPathElement
  const groups = new Map<number, Element[]>()
  for (const s of stepped) {
    const n = Number(s.getAttribute('data-step'))
    if (!groups.has(n)) groups.set(n, [])
    groups.get(n)!.push(s)
  }
  const order = [...groups.keys()].sort((a, b) => a - b)
  const wires = stepped.filter(isWire)
  const nodes = stepped.filter((n) => !isWire(n))

  const counter = el.querySelector<HTMLElement>('[data-count]')
  const total = Number(counter?.dataset.countTotal ?? 0)
  let count = 0
  const bump = (g: Element[]) => {
    const k = g.filter((n) => n.querySelector('[data-count-item]')).length
    if (counter && k) counter.textContent = String((count = Math.min(total, count + k)))
  }

  const span = (w: Element) => Math.max(1, ((w as SVGPathElement).ownerSVGElement?.getScreenCTM()?.a ?? 1) * 1.02)
  const reset = () => {
    gsap.set(wires, { strokeDasharray: (_: number, w: Element) => span(w), strokeDashoffset: (_: number, w: Element) => span(w) })
    gsap.set(nodes, { opacity: 0 })
    marks.forEach((m) => m.classList.add('is-off'))
    if (counter) counter.textContent = '0'
    count = 0
  }
  reset()

  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      if (counter) counter.textContent = String(total)
      gsap.set(wires, { clearProps: 'strokeDasharray,strokeDashoffset' })
    },
  })
  order.forEach((n, i) => {
    const g = groups.get(n)!
    const at = i * STEP_GAP
    const w = g.filter(isWire)
    const nd = g.filter((x) => !isWire(x))
    if (nd.length) tl.to(nd, { opacity: 1, duration: 0.5, ease: ease.write }, at)
    if (w.length) tl.to(w, { strokeDashoffset: 0, duration: 0.7, ease: ease.space }, at)
    tl.call(() => bump(g), [], at + 0.25)
    const m = marks.filter((x) => Number(x.dataset.mark) === n)
    if (m.length) tl.call(() => m.forEach((x) => x.classList.remove('is-off')), [], at)
  })

  // The nav curtain replays the target's draw-in after a jump.
  if (el.id) registry.set(el.id, { ...registry.get(el.id), draw: () => (reset(), tl.invalidate().restart()) })

  const start = () =>
    ScrollTrigger.create({ trigger: el, start: 'top 72%', once: true, onEnter: (self) => fire(tl, self) })

  // The hero waits for the boot sequence to hand over.
  const html = document.documentElement
  if (el.id === 'top' && html.dataset.boot === 'play') {
    const mo = new MutationObserver(() => {
      if (html.dataset.boot !== 'play') {
        mo.disconnect()
        start()
      }
    })
    mo.observe(html, { attributes: true, attributeFilter: ['data-boot'] })
    return () => mo.disconnect()
  }
  const st = start()
  return () => st.kill()
}

export default draw
