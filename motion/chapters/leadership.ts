import { floorTransversals, horizonY, roomRays } from '@/lib/paths.ts'
import type { Controller } from '../runtime.ts'
import { ease, range } from '../tempo.ts'

// HORIZON — daylight opens from the horizon (no text on screen during the exposure),
// Technology's grid returns and tilts into a one-point perspective floor, the viewer dollies in.
// Projected 2D only: no CSS 3D, text stays at scale(1).
const leadership: Controller = (el, { gsap, scene, onRefresh, fire }) => {
  const stage = el.querySelector<HTMLElement>('.stage')!
  const svgs = [...stage.querySelectorAll<SVGSVGElement>('svg.art')]
  const lines = [...stage.querySelectorAll<SVGPathElement>('.line')]
  const day = stage.querySelector<HTMLElement>('.lead__day')!
  const rays = stage.querySelector<SVGPathElement>('.lead__rays:not(.lead__cross)')!
  const cross = stage.querySelector<SVGPathElement>('.lead__cross')!
  const room = stage.querySelector<SVGGElement>('.lead__room')!
  const words = [...stage.querySelectorAll<HTMLElement>('.lead__statement span, .lead__pending')]

  let W = 0
  let H = 0
  let p = 0
  const VP = 0.38
  el.dataset.envNow = 'night'

  const render = () => {
    const e = range(p, 0, 0.28)
    day.style.clipPath = `inset(${62 * (1 - e)}% 0 ${38 * (1 - e)}% 0)`
    const env = e > 0.5 ? 'day' : 'night'
    if (el.dataset.envNow !== env) {
      el.dataset.envNow = env
      window.dispatchEvent(new CustomEvent('tl:env', { detail: env }))
    }
    const t = gsap.parseEase(ease.space)(range(p, 0.3, 0.75))
    rays.setAttribute('d', roomRays(W, H, t, VP))
    rays.style.opacity = `${range(p, 0.22, 0.32)}`
    cross.style.opacity = `${range(p, 0.55, 0.75)}`
    const s = 1 + 0.25 * gsap.parseEase('power1.inOut')(range(p, 0.6, 1))
    const vx = W * VP
    const vy = horizonY(H)
    room.setAttribute('transform', `translate(${vx} ${vy}) scale(${s}) translate(${-vx} ${-vy})`)
  }

  onRefresh(() => {
    W = stage.clientWidth
    H = stage.clientHeight
    const hz = horizonY(H)
    svgs.forEach((s) => s.setAttribute('viewBox', `0 0 ${W} ${H}`))
    lines.forEach((l) => l.setAttribute('d', `M0 ${hz}L${W} ${hz}`))
    cross.setAttribute('d', floorTransversals(W, H))
    render()
  })

  gsap.set(words, { opacity: 0, y: 24 })
  let placed = false
  scene(el, 1.2, (prog, st) => {
    p = prog
    render()
    if (!placed && p >= 0.7) {
      placed = true
      fire(gsap.timeline({ paused: true }).to(words, { opacity: 1, y: 0, duration: 1.6, stagger: 0.2, ease: ease.space }), st)
    }
  })
  return () => {}
}

export default leadership
