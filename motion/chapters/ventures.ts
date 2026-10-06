import { horizonY } from '@/lib/paths.ts'
import type { Controller } from '../runtime.ts'
import { ease, range } from '../tempo.ts'

// NETWORK — a line is time; a point is a person. The horizon contracts into the vermilion
// point, which rises to the person stratum; the lineage then cascades breadth-first
// (110ms per depth, 380ms per edge) — once — and the chart is still.
const ventures: Controller = (el, { gsap, ScrollTrigger, scene, onRefresh, fire, narrow }) => {
  const stage = el.querySelector<HTMLElement>('.stage')!
  const svg = stage.querySelector<SVGSVGElement>('.ventures__horizon')!
  const line = svg.querySelector<SVGPathElement>('.line')!
  const point = stage.querySelector<HTMLElement>('.ventures__point')!
  const edges = [...stage.querySelectorAll<SVGPathElement>('.lin__edge')]
  const nodes = [...stage.querySelectorAll<HTMLElement>('.lin__node')]
  const read = stage.querySelector<HTMLElement>('.lin__read')!
  const strata = [...stage.querySelectorAll<HTMLElement>('.lin__stratum')]
  const person = stage.querySelector<HTMLElement>('[data-node="person"]')!

  let W = 0
  let hz = 0
  let px = 0
  let py = 0
  let p = 0
  let cascaded = false

  const render = () => {
    if (cascaded) return
    const c = gsap.parseEase(ease.settle)(range(p, 0, 0.4))
    const x0 = px * c
    const x1 = W + (px - W) * c
    line.setAttribute('d', `M${x0} ${hz}L${x1} ${hz}`)
    gsap.set(point, { x: px, y: hz, opacity: c > 0.02 ? 1 : 0 })
  }

  onRefresh(() => {
    W = stage.clientWidth
    const H = stage.clientHeight
    hz = horizonY(H)
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const sr = stage.getBoundingClientRect()
    const r = person.getBoundingClientRect()
    px = r.left - sr.left
    py = r.top - sr.top
    render()
  })

  gsap.set(point, { xPercent: -50, yPercent: -50, top: 0 })
  gsap.set(edges, { strokeDasharray: 1, strokeDashoffset: 1 })
  gsap.set(nodes, { opacity: 0 })
  gsap.set([read, ...strata], { opacity: 0 })

  const cascade = (st?: ScrollTrigger) => {
    if (cascaded) return
    cascaded = true
    const tl = gsap.timeline({ paused: true })
    tl.to(point, { y: py, duration: 0.6, ease: ease.settle }, 0)
    tl.to(svg, { opacity: 0, duration: 0.3 }, 0)
    const start = 0.55
    for (const layer of [0, 1, 2, 3]) {
      const at = start + layer * 0.11 + (layer ? 0.3 : 0)
      tl.to(nodes.filter((n) => n.dataset.layer === String(layer)), { opacity: 1, duration: 0.4, ease: ease.write }, at)
    }
    for (const depth of [1, 2, 3]) {
      tl.to(
        edges.filter((e) => e.dataset.depth === String(depth)),
        { strokeDashoffset: 0, duration: 0.38, ease: 'power2.out' },
        start + (depth - 1) * 0.11,
      )
    }
    tl.to(strata, { opacity: 1, duration: 0.5, stagger: 0.11, ease: ease.write }, start)
    tl.to(point, { opacity: 0, duration: 0.2 }, start + 0.1)
    tl.to(read, { opacity: 1, duration: 0.7, ease: ease.write }, start + 0.6)
    fire(tl, st)
  }

  if (narrow) {
    // Small screens: no sticky collapse — the lineage cascades as it enters.
    gsap.set([svg, point], { display: 'none' })
    const items = [...stage.querySelectorAll<HTMLElement>('.lin__list > li')]
    gsap.set(items, { opacity: 0, x: -8 })
    ScrollTrigger.create({
      trigger: stage,
      start: 'top 70%',
      once: true,
      onEnter: (st) =>
        fire(gsap.timeline({ paused: true }).to(items, { opacity: 1, x: 0, duration: 0.5, stagger: 0.11, ease: ease.write }), st),
    })
  } else {
    scene(el, 0.8, (prog, st) => {
      p = prog
      render()
      if (p >= 0.45) cascade(st)
    })
  }
  return () => {}
}

export default ventures
