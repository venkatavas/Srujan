import type { Controller } from '../runtime.ts'

// Technology's scene: the brief is read into R1–R4 as you scroll. The section is a tall track
// with a CSS-sticky stage (app/styles/technology.css); one scrubbed value p (0..1) drives every
// element through render(p), so scrubbing back is exact and ?seek=technology:p deterministic.
//   0–12%    settle
//   12–30%   a vermilion hairline scans the sentence (bus.scanX), marking each phrase it passes
//   30–85%   each phrase detaches and travels into its slot: actor R1, need R2, constraint R3,
//            measure R4 (lifted from inside the need); the counter counts what has landed and
//            the words left over fade to a ghost
//   85–100%  hold; the closing line arrives
// Phrases travel as clones, measured on every ScrollTrigger refresh (resize, fonts). Reduced
// motion and no-JS never load this: the markup at rest is the final state.

const SCAN: [number, number] = [0.12, 0.3]
const TRAVEL: [number, number] = [0.3, 0.85]
const LEG = 0.16 // each phrase's share of p; legs overlap slightly
const LANDED = 0.8 // local t at which a requirement counts
const REST: [number, number] = [0.32, 0.46]
const CLOSE: [number, number] = [0.86, 0.95]
const GHOST = 0.2

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const span = (p: number, [a, b]: [number, number]) => clamp((p - a) / (b - a))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const ink = (a: number) => `rgba(255, 255, 255, ${a.toFixed(3)})`
const px = (n: number) => n.toFixed(1)

type Item = {
  ph: HTMLElement
  text: HTMLElement
  slot: HTMLElement
  clone: HTMLElement
  start: number
  /** Phrase extent along the sentence (scan marks). */
  l: number
  w: number
  /** Flight: offset to the slot value and the serif → mono scale. */
  dx: number
  dy: number
  s: number
  landed?: boolean
}

const sceneTechnology: Controller = (el, { gsap, ScrollTrigger, seek, bus }) => {
  const one = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)
  const stage = one('.tech__stage')
  const sentence = one('.tech__sentence')
  const scan = one('.tech__scan')
  const fly = one('.tech__fly')
  const count = one('[data-tech-count]')
  const close = one('.tech__caption')
  if (!stage || !sentence || !scan || !fly || document.documentElement.dataset.motion !== 'full') return () => {}
  const rests = [...el.querySelectorAll<HTMLElement>('.tech__rest')]
  const lines = [...el.querySelectorAll<HTMLElement>('.tech__line')]

  const slots = [...el.querySelectorAll<HTMLElement>('[data-slot]')]
  const step = slots.length > 1 ? (TRAVEL[1] - TRAVEL[0] - LEG) / (slots.length - 1) : 0
  const items: Item[] = []
  slots.forEach((slot, i) => {
    const ph = sentence.querySelector<HTMLElement>(`[data-ph="${slot.dataset.slot}"]`)
    const text = slot.querySelector<HTMLElement>('.slot__text')
    if (!ph || !text) return
    const clone = document.createElement('span')
    clone.className = 'tech__clone'
    clone.textContent = ph.textContent
    fly.append(clone)
    items.push({ ph, text, slot, clone, start: TRAVEL[0] + i * step, l: 0, w: 1, dx: 0, dy: 0, s: 1 })
  })

  const sweep = gsap.parseEase('power1.inOut')
  const flight = gsap.parseEase('power3.inOut')

  // Geometry, in stage coordinates (the stage moves as one, stuck or not).
  let over = 0
  let scanL = 0
  let scanW = 0
  let lift = 0
  const measure = () => {
    over = Math.max(0, Math.round(stage.offsetHeight - innerHeight))
    el.style.setProperty('--tech-stage-h', `${stage.offsetHeight}px`)
    el.style.setProperty('--tech-stick', `${-over}px`)
    // runtime.ts [scene-seek]: the scene starts this far below the section's top.
    el.dataset.sceneOffset = String(over)

    const o = stage.getBoundingClientRect()
    const r = sentence.getBoundingClientRect()
    scanL = r.left
    scanW = Math.max(0, ...lines.map((n) => n.getBoundingClientRect().width))
    const size = parseFloat(getComputedStyle(sentence).fontSize)
    lift = size * 0.35
    for (const it of items) {
      it.text.style.transform = ''
      const a = it.ph.getBoundingClientRect()
      const b = it.text.getBoundingClientRect()
      const h = it.clone.offsetHeight
      const top = a.top - o.top + a.height / 2 - h / 2
      it.clone.style.left = `${px(a.left - o.left)}px`
      it.clone.style.top = `${px(top)}px`
      it.s = parseFloat(getComputedStyle(it.text).fontSize) / size
      it.dx = b.left - a.left
      it.dy = b.top - o.top + b.height / 2 - top - (h * it.s) / 2
      it.l = a.left - r.left
      it.w = Math.max(1, a.width)
    }
  }

  let st: ScrollTrigger | undefined
  let shown = -1
  const render = (p: number) => {
    const s = span(p, SCAN)
    const x = mix(-16, scanW + 16, sweep(s))
    const scanning = s > 0 && s < 1
    scan.style.transform = `translate3d(${px(x)}px, 0, 0)`
    scan.style.opacity = scanning ? String(Math.min(1, s * 14, (1 - s) * 14)) : '0'

    let n = 0
    for (const it of items) {
      const t = clamp((p - it.start) / LEG)
      it.ph.style.setProperty('--m', (p >= SCAN[1] ? 1 : clamp((x - it.l) / it.w)).toFixed(3))
      // The phrase leaves a ghost; the measure stays lit inside the need until its own turn.
      it.ph.style.color = ink(mix(1, GHOST, clamp(t / 0.35)))

      const m = flight(clamp((t - 0.06) / 0.84))
      const y = it.dy * m - lift * Math.sin(Math.PI * m)
      it.clone.style.opacity = t <= 0 || t >= 1 ? '0' : String(1 - clamp((t - 0.7) / 0.25))
      it.clone.style.transform = `translate3d(${px(it.dx * m)}px, ${px(y)}px, 0) scale(${mix(1, it.s, m).toFixed(4)})`

      const v = clamp((t - 0.62) / 0.38)
      it.text.style.opacity = String(v)
      it.text.style.transform = v >= 1 ? '' : `translate3d(0, ${px((1 - v) * 6)}px, 0)`

      const landed = t >= LANDED
      if (landed !== it.landed) {
        it.landed = landed
        it.slot.dataset.state = landed ? 'filled' : 'empty'
      }
      if (landed) n++
    }
    if (count && n !== shown) count.textContent = String((shown = n))

    const g = ink(mix(1, GHOST, span(p, REST)))
    rests.forEach((r) => (r.style.color = g))
    if (close) {
      const c = span(p, CLOSE)
      close.style.opacity = String(c)
      close.style.transform = c >= 1 ? '' : `translate3d(0, ${px((1 - c) * 8)}px, 0)`
    }

    if (st?.isActive) {
      bus.scene = p
      bus.scanX = scanning ? scanL + x : -1
    }
  }

  measure()
  const state = { p: 0 }
  const tween = gsap.fromTo(
    state,
    { p: 0 },
    {
      p: 1,
      ease: 'none',
      onUpdate: () => render(state.p),
      scrollTrigger: {
        trigger: el,
        start: () => (over ? `top top-=${over}` : 'top top'),
        end: 'bottom bottom',
        // Seek captures land exactly on p; readers get a short catch-up.
        scrub: seek ? true : 0.6,
        onToggle: (self) => {
          if (self.isActive) return
          bus.scene = -1
          bus.scanX = -1
        },
      },
    },
  )
  st = tween.scrollTrigger
  render(state.p)

  const onInit = () => measure()
  const onRefresh = () => render(state.p)
  ScrollTrigger.addEventListener('refreshInit', onInit)
  ScrollTrigger.addEventListener('refresh', onRefresh)

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', onInit)
    ScrollTrigger.removeEventListener('refresh', onRefresh)
    st?.kill()
    tween.kill()
    for (const it of items) {
      it.clone.remove()
      it.ph.style.removeProperty('--m')
      it.ph.style.color = ''
      it.text.style.opacity = ''
      it.text.style.transform = ''
      delete it.slot.dataset.state
    }
    rests.forEach((r) => (r.style.color = ''))
    scan.style.opacity = ''
    scan.style.transform = ''
    if (close) {
      close.style.opacity = ''
      close.style.transform = ''
    }
    if (count) count.textContent = String(slots.length)
    el.style.removeProperty('--tech-stage-h')
    el.style.removeProperty('--tech-stick')
    delete el.dataset.sceneOffset
    bus.scene = -1
    bus.scanX = -1
  }
}

export default sceneTechnology
