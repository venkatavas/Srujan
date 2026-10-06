import type { Controller } from '../runtime.ts'
import { ease } from '../tempo.ts'

// The line answers the pointer (≤ 8px). On scroll, the name becomes the wordmark.
const hero: Controller = (el, { gsap, touch, scene, onRefresh }) => {
  const stage = el.querySelector<HTMLElement>('.stage')!
  const svg = stage.querySelector<SVGSVGElement>('svg.art')!
  const line = stage.querySelector<SVGPathElement>('.hero__line')!
  const name = stage.querySelector<HTMLElement>('.name')!
  const pos = stage.querySelector<HTMLElement>('.positioning')!
  const mark = document.querySelector<HTMLElement>('.nav__mark')!

  let W = 0
  let hz = 0
  const bend = { x: 0, y: 0 }
  const draw = () => line.setAttribute('d', `M0 ${hz}Q${bend.x} ${hz + bend.y} ${W} ${hz}`)

  let target = { x: 0, y: 0, s: 1 }
  onRefresh(() => {
    W = stage.clientWidth
    const H = stage.clientHeight
    hz = Math.round(H * 0.62)
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    bend.x = W / 2
    draw()
    const m = mark.getBoundingClientRect()
    const markSize = parseFloat(getComputedStyle(mark).fontSize)
    const nameSize = parseFloat(getComputedStyle(name).fontSize)
    target = {
      x: m.left - name.offsetLeft,
      y: m.top + markSize * 1.6 - (name.offsetTop + name.offsetHeight),
      s: markSize / nameSize,
    }
  })

  let onMove: ((e: PointerEvent) => void) | undefined
  const reset = () => qy?.(0)
  let qy: ((v: number) => void) | undefined
  if (!touch) {
    const qx = gsap.quickTo(bend, 'x', { duration: 0.9, ease: ease.settle, onUpdate: draw })
    qy = gsap.quickTo(bend, 'y', { duration: 0.9, ease: ease.settle, onUpdate: draw })
    onMove = (e) => {
      const r = stage.getBoundingClientRect()
      const dy = e.clientY - r.top - hz
      const near = Math.max(0, 1 - Math.abs(dy) / (r.height * 0.3))
      qx(e.clientX - r.left)
      qy!(Math.max(-16, Math.min(16, dy * 0.12)) * near) // quadratic peak = half the control offset
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', reset)
  }

  let marked = false
  scene(el, 0.4, (p) => {
    const k = gsap.parseEase('power2.inOut')(p)
    gsap.set(name, {
      x: target.x * k,
      y: target.y * k,
      scale: 1 + (target.s - 1) * k,
      opacity: p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1,
    })
    gsap.set(pos, { opacity: Math.max(0, 1 - p * 3), y: -12 * Math.min(1, p * 3) })
    const show = p > 0.96
    if (show !== marked) {
      marked = show
      window.dispatchEvent(new CustomEvent('tl:mark', { detail: show }))
    }
  })

  return () => {
    if (onMove) stage.removeEventListener('pointermove', onMove)
    stage.removeEventListener('pointerleave', reset)
  }
}

export default hero
