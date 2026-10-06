import { makeSignal } from '@/lib/paths.ts'
import type { Controller } from '../runtime.ts'
import { ease } from '../tempo.ts'

// SIGNAL — the page stays vertical; a fixed needle holds while the ruler slides beneath it.
// Noise resolves into a sine and 2021 rises out of the wave as the noise envelope closes. After lock-on, scroll
// velocity drives the amplitude, which settles back (damped, no overshoot).
const media: Controller = (el, { gsap, scene, onRefresh, fire }) => {
  const stage = el.querySelector<HTMLElement>('.stage')!
  const svg = stage.querySelector<SVGSVGElement>('svg.art')!
  const wave = svg.querySelector<SVGPathElement>('.media__wave')!
  const track = stage.querySelector<HTMLElement>('.ruler__track')!
  const year = stage.querySelector<HTMLElement>('.year')!
  const meta = [...stage.querySelectorAll<HTMLElement>('.media__meta > span')]
  const signal = makeSignal(2021)

  let W = 0
  let H = 0
  const s = { clarity: 0, amp: 1, phase: 0 }
  let locked = false

  const render = () => {
    const c = locked ? 1 : s.clarity
    wave.setAttribute('d', signal(W, H, c, s.amp, s.phase))
    track.style.transform = `translateX(${-(1 - c) * W * 0.55}px)`
    // The year is revealed from the line upward as the signal clears — nothing moves sideways.
    const edge = -14 + 128 * c
    year.style.maskImage = `linear-gradient(to top, #000 ${edge}%, transparent ${edge + 14}%)`
    year.style.opacity = `${0.35 + 0.65 * c}`
  }
  onRefresh(() => {
    W = stage.clientWidth
    H = stage.clientHeight
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    render()
  })

  gsap.set(meta, { opacity: 0, y: 10 })
  const ampTo = gsap.quickTo(s, 'amp', { duration: 0.8, ease: ease.settle, onUpdate: render })
  let settle: ReturnType<typeof setTimeout> | undefined

  scene(el, 0.6, (p, st) => {
    s.clarity = Math.min(1, p / 0.92)
    s.phase = p * Math.PI * 3
    if (!locked && p >= 0.92) {
      locked = true
      fire(gsap.timeline({ paused: true }).to(meta, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: ease.write }), st)
    }
    if (locked) {
      ampTo(1 + Math.min(1.6, Math.abs(st.getVelocity()) / 2500))
      clearTimeout(settle)
      settle = setTimeout(() => ampTo(1), 140)
    }
    render()
  })

  return () => clearTimeout(settle)
}

export default media
