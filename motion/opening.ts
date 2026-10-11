import { type Milestone, onLoaded } from '../lib/loading.ts'
import { fieldBus } from './field-bus.ts'
import type { Env } from './runtime.ts'
import { ease } from './tempo.ts'

// The opening, "Construction": the hero is built in front of the visitor, on the real markup and
// the real field. A vermilion point breathes at the instrument's crossing (CSS, before any script)
// until the type, the motion runtime and the field have really loaded; then a hairline shoots out
// of it, the grid unfolds from it, the rings draw outward from the axis and the axis draws up and
// down, the construction guides run across the name, the letters are outlined and filled at 1.1x
// and the name settles to 1x in place while the hero assembles around it. The point never moves:
// it is the instrument's own point at rest, and the caret simply appears at the end of the brief.
// Short mode (debug: ?opening=short:t) only sets the type and the drawing.
// Any input, a resize or the time cap jumps to the finished hero; nothing is ever left hidden.
// Debug: ?opening=1.5 (or ?opening=short:0.4) freezes the sequence at t seconds for captures:
// html[data-opening] is 'frozen' once it holds ('done' if t is past the end).
// Also home to the living type: on desktop, letters near the cursor gain weight.

/** Past this (ms since navigation) the opening never starts: the hero is shown finished. */
export const CAP_MS = 6000
const GATE: Milestone[] = ['type', 'motion', 'field']
const STAGE_SCALE = 1.1
const REST_W = 320
const MAX_W = 560
const RADIUS = 260

type Mode = 'full' | 'short'

/** ?opening=t or ?opening=short:t → a frozen frame; null when absent or malformed. */
export function freezeParam(search: string): { mode?: Mode; t: number } | null {
  const raw = new URLSearchParams(search).get('opening')
  if (raw === null) return null
  const [a, b] = raw.split(':')
  const mode = a === 'short' || a === 'full' ? a : undefined
  const v = (mode ? b : a)?.trim()
  const t = v ? Number(v) : NaN
  return Number.isFinite(t) && t >= 0 ? { mode, t } : null
}

/** Hand the page over: the field fully revealed, the hero released (play → done; a skip stays a skip). */
export function finishBoot() {
  const html = document.documentElement
  fieldBus.reveal = 1
  for (const p of ['--ss-reveal', '--ss-ox', '--ss-oy']) html.style.removeProperty(p)
  if (html.dataset.boot === 'play') html.dataset.boot = 'done'
}

const all = <T extends Element>(root: ParentNode, s: string) => [...root.querySelectorAll<T>(s)]

export function opening(env: Env): () => void {
  const { gsap } = env
  const html = document.documentElement
  const stops: (() => void)[] = []
  const living = () => stops.push(livingType(env))

  if (html.dataset.boot !== 'play') {
    fieldBus.reveal = 1
    living()
    return () => stops.forEach((s) => s())
  }

  const hero = document.getElementById('top')
  const nm = hero?.querySelector<HTMLElement>('.nm')
  const freeze = freezeParam(location.search)
  const mode: Mode = freeze?.mode ?? (html.dataset.pre === 'short' ? 'short' : 'full')
  const op = document.querySelector<HTMLElement>('.op')
  const pt = op?.querySelector<HTMLElement>('.op__pt') ?? null
  const hair = op?.querySelector<HTMLElement>('.op__hair') ?? null

  let state: 'wait' | 'run' | 'done' = 'wait'
  let tl: gsap.core.Timeline | null = null
  let touched: HTMLElement[] = []
  const timers: number[] = []
  html.dataset.opening = 'wait'

  // Back to the stylesheet's finished hero: every inline state the sequence wrote is removed.
  const clean = () => {
    gsap.killTweensOf(touched)
    gsap.set(touched, { clearProps: 'transform,opacity,transformOrigin,left,top,visibility,display,strokeDasharray,strokeDashoffset' })
    for (const el of touched) for (const p of ['--o', '--f', '--oa']) el.style.removeProperty(p)
    // GSAP pins an SVG element's transform-origin to 0 0; the dashed ring turns about its centre (CSS).
    for (const el of touched) if (el instanceof SVGElement) el.style.removeProperty('transform-origin')
    nm?.classList.remove('is-drawing')
    op?.classList.remove('is-live', 'is-run')
    touched = []
  }

  const settle = () => {
    if (state === 'done') return
    state = 'done'
    timers.forEach(clearTimeout)
    mo.disconnect()
    removeEventListener('resize', onResize)
    removeEventListener('scroll', onResize)
    tl?.kill()
    tl = null
    clean()
    finishBoot()
    html.dataset.opening = 'done'
    // The caret starts its blink as it lands.
    const caret = hero?.querySelector<HTMLElement>('.brief-text .caret')
    if (caret) {
      caret.style.animation = 'none'
      void caret.offsetWidth
      caret.style.removeProperty('animation')
    }
    living()
  }

  // Input skips; the time cap (Opening.tsx) hands over to 'done' while still waiting.
  const mo = new MutationObserver(() => {
    const boot = html.dataset.boot
    if (state === 'wait' && boot !== 'play') settle()
    else if (state === 'run' && boot === 'skip') tl?.progress(1, false)
  })
  mo.observe(html, { attributes: true, attributeFilter: ['data-boot'] })
  // The stage is measured at the top of the page: a resize or a scroll (a dragged scrollbar)
  // finishes it at once.
  const y0 = scrollY
  const onResize = (e: Event) => {
    if (e.type === 'scroll' && Math.abs(scrollY - y0) < 2) return
    if (state === 'run' && !freeze) tl?.progress(1, false)
  }
  addEventListener('resize', onResize)
  addEventListener('scroll', onResize, { passive: true })

  const reveal = { v: 0 }
  const setReveal = () => {
    fieldBus.reveal = reveal.v
    html.style.setProperty('--ss-reveal', reveal.v.toFixed(4))
  }

  const build = (): gsap.core.Timeline | null => {
    if (!hero || !nm) return null
    const line = nm.querySelector<HTMLElement>('.nm__line')
    const words = all<HTMLElement>(nm, '.nm__word')
    const chars = all<HTMLElement>(nm, '.nm__ch')
    const guides = all<HTMLElement>(nm, '.nm__g')
    if (!line || !words.length || !chars.length) return null
    // The instrument: rings (two half-arcs each, drawn from the axis), the axis, its details.
    const ins = hero.querySelector<SVGSVGElement>('.ins')
    const rings = all<SVGGElement>(hero, '.ins__ring').map((g) => all<SVGPathElement>(g, 'path'))
    const axes = all<SVGPathElement>(hero, '.ins__axis')
    const ticks = all<SVGElement>(hero, '.ins__tick')
    const details = all<SVGElement>(hero, '.ins__hair, .ins__spin')
    const anchor = hero.querySelector<HTMLElement>('[data-op-anchor]')
    // Read in order: title, brief, lifecycle, then the frame (rail, stacks, mark, sheet).
    const aside = [
      ...all<HTMLElement>(hero, '.hero__title, .hero__brief > *'),
      ...all<HTMLElement>(hero, ':scope > .lifecycle, :scope > .hero__rail, :scope > .hero__stack, :scope > .hero__plus, :scope > .hero__sheet'),
    ]
    const caret = hero.querySelector<HTMLElement>('.brief-text .caret')

    // Rest geometry, measured before anything moves: the point is the instrument's crossing.
    const vw = html.clientWidth
    const vh = html.clientHeight
    const ar = anchor?.getBoundingClientRect()
    const pr = ar && ar.width ? ar : pt?.getBoundingClientRect()
    const cx = pr && pr.width ? pr.left + pr.width / 2 : vw / 2
    const cy = pr && pr.height ? pr.top + pr.height / 2 : vh / 2
    const ink = rings.flat()

    touched = [line, ...chars, ...guides, ...aside]
    for (const el of [ins, anchor, pt, hair, caret, ...ink, ...axes, ...ticks, ...details]) if (el) touched.push(el as HTMLElement)
    nm.classList.add('is-drawing')
    if (mode === 'full') op?.classList.add('is-live', 'is-run')

    const t = gsap.timeline({ paused: true, onComplete: settle })
    // pathLength = 1: a dash of 1 offset by 1 is an undrawn stroke (autoRound off: sub-pixel offsets).
    if (ins) gsap.set(ins, { opacity: 1 })
    gsap.set([...ink, ...axes], { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set([...ticks, ...details], { opacity: 0 })
    if (anchor) gsap.set(anchor, { opacity: 0 })
    if (caret) gsap.set(caret, { opacity: 0 })
    // Ticks light from the crossing outward.
    const order = [...ticks].sort((a, b) => Math.abs(a.getBoundingClientRect().top - cy) - Math.abs(b.getBoundingClientRect().top - cy))

    if (mode === 'short') {
      // No point, no hairline (also when ?opening=short forces this mode on a first visit).
      if (op) {
        touched.push(op)
        gsap.set(op, { display: 'none' })
      }
      gsap.set(chars, { '--f': 0, yPercent: 32 })
      gsap.set(aside, { opacity: 0, y: 12 })
      t.to(reveal, { v: 1, duration: 0.7, ease: 'power2.out', onUpdate: setReveal }, 0)
      rings.forEach((r, i) => t.to(r, { strokeDashoffset: 0, autoRound: false, duration: 0.8, ease: ease.space }, 0.05 + i * 0.06))
      t.to(axes, { strokeDashoffset: 0, autoRound: false, duration: 0.6, ease: ease.write }, 0.05)
      t.to([...order, ...details], { opacity: 1, duration: 0.5, ease: 'power1.out', stagger: 0.01 }, 0.3)
      if (anchor) t.to(anchor, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0.2)
      t.to(chars, { '--f': 1, yPercent: 0, duration: 0.8, ease: ease.write, stagger: 0.02 }, 0.1)
      t.to(aside, { opacity: 1, y: 0, duration: 0.7, ease: ease.write, stagger: 0.04 }, 0.35)
      if (caret) t.set(caret, { opacity: 1 }, 0.9)
      t.call(() => finishBoot(), [], 0.5)
      return t
    }

    // The stage: the name at 1.1x (narrow screens: as large as fits), about its own centre.
    const left = Math.min(...words.map((w) => w.getBoundingClientRect().left))
    const right = Math.max(...words.map((w) => w.getBoundingClientRect().right))
    const s = Math.max(1, Math.min(STAGE_SCALE, (vw * 0.94) / Math.max(1, right - left)))
    gsap.set(line, { scale: s, transformOrigin: '50% 50%' })
    gsap.set(guides, { opacity: 0.16, scaleX: 0, transformOrigin: '50% 50%' })
    gsap.set(chars, { '--f': 0, '--o': 0, '--oa': 1 })
    gsap.set(aside, { opacity: 0, y: 16 })
    if (hair) gsap.set(hair, { top: cy, transformOrigin: `${cx}px 50%`, scaleX: 0, opacity: 1 })
    if (pt) gsap.set(pt, { left: 0, top: 0, x: cx, y: cy, xPercent: -50, yPercent: -50 })

    // The point speaks first: a hairline out of it, the grid from it.
    if (hair) {
      t.to(hair, { scaleX: 1, duration: 0.5, ease: 'power3.out' }, 0)
      t.to(hair, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 0.95)
    }
    t.to(reveal, { v: 1, duration: 1, ease: 'power2.out', onUpdate: setReveal }, 0.4)
    // The instrument: rings outward (each grows both ways from the axis), the axis up and down.
    rings.forEach((r, i) => t.to(r, { strokeDashoffset: 0, autoRound: false, duration: 0.95, ease: ease.space }, 0.45 + i * 0.12))
    t.to(axes, { strokeDashoffset: 0, autoRound: false, duration: 0.8, ease: ease.write }, 0.5)
    t.to(order, { opacity: 1, duration: 0.4, ease: 'power1.out', stagger: 0.03 }, 0.6)
    t.to(details, { opacity: 1, duration: 0.8, ease: 'power1.out', stagger: 0.25 }, 0.9)
    // The name: guides, outline, fill, then the guides away and the settle to 1x, in place.
    t.to(guides, { scaleX: 1, duration: 0.75, ease: ease.write, stagger: 0.035 }, 0.7)
    t.to(chars, { '--o': 1, duration: 0.6, ease: 'power2.inOut', stagger: 0.028 }, 1)
    t.to(chars, { '--f': 1, duration: 0.45, ease: 'power1.inOut', stagger: 0.012 }, 1.8)
    t.to(chars, { '--oa': 0, duration: 0.35, ease: 'power1.out', stagger: 0.012 }, 2.05)
    t.to(guides, { opacity: 0, duration: 0.8, ease: 'power1.out' }, 2.2)
    t.to(line, { scale: 1, duration: 0.8, ease: ease.lift }, 2.4)
    // The point rests where it was born: the instrument's own point (and its glow) takes over.
    if (anchor) t.to(anchor, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 2.3)
    if (pt) t.set(pt, { visibility: 'hidden' }, 2.9)
    t.to(aside, { opacity: 1, y: 0, duration: 0.8, ease: ease.write, stagger: 0.04 }, 2.55)
    t.call(() => finishBoot(), [], 2.6)
    if (caret) t.set(caret, { opacity: 1 }, 3.1)
    return t
  }

  const start = () => {
    if (state !== 'wait') return
    if (html.dataset.boot !== 'play') return settle()
    state = 'run'
    reveal.v = 0
    setReveal()
    tl = build()
    if (!tl) return settle()
    if (freeze) {
      if (freeze.t >= tl.duration()) tl.progress(1, false)
      else {
        tl.seek(freeze.t, false)
        html.dataset.opening = 'frozen'
      }
      return
    }
    html.dataset.opening = 'run'
    tl.play()
  }

  // The gate: only real milestones start the sequence; past the cap it never starts.
  const marks = new Set<Milestone>()
  let subscribed = false
  const check = () => {
    if (!subscribed || state !== 'wait' || !GATE.every((k) => marks.has(k))) return
    if (!freeze && performance.now() > CAP_MS) return settle()
    start()
  }
  const off = onLoaded((k) => {
    marks.add(k)
    check()
  })
  subscribed = true
  check()
  if (!freeze) timers.push(window.setTimeout(() => state === 'wait' && settle(), Math.max(0, CAP_MS - performance.now())))

  return () => {
    off()
    if (state !== 'done') {
      // Leaving mid-sequence must still hand over, or the hero would stay hidden.
      state = 'done'
      timers.forEach(clearTimeout)
      mo.disconnect()
      removeEventListener('resize', onResize)
      removeEventListener('scroll', onResize)
      tl?.kill()
      clean()
      finishBoot()
      delete html.dataset.opening
    }
    stops.forEach((s) => s())
  }
}

/**
 * Living type: on desktop with a fine pointer, letters within RADIUS of the cursor ease their
 * weight from REST_W toward MAX_W (a cosine falloff, lerped per frame). One rAF loop that
 * sleeps when everything has settled; letter centres are cached and re-read on resize/scroll.
 */
export function livingType(env: Pick<Env, 'seek'>): () => void {
  const html = document.documentElement
  const nm = document.querySelector<HTMLElement>('#top .nm')
  const mq = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)')
  if (!nm || env.seek || html.dataset.motion !== 'full') return () => {}
  const chars = all<HTMLElement>(nm, '.nm__ch')
  const n = chars.length
  const cur = new Float32Array(n).fill(REST_W)
  const shown = new Float32Array(n).fill(REST_W)
  const cx = new Float32Array(n)
  const cy = new Float32Array(n)
  let px = -1e5
  let py = -1e5
  let dirty = true
  let raf = 0
  let last = 0

  const measure = () => {
    for (let i = 0; i < n; i++) {
      const r = chars[i].getBoundingClientRect()
      cx[i] = r.left + r.width / 2 + scrollX
      cy[i] = r.top + r.height / 2 + scrollY
    }
    dirty = false
  }

  const frame = (now: number) => {
    raf = 0
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
    last = now
    if (dirty) measure()
    const k = 1 - Math.exp(-dt * 9)
    const mx = px + scrollX
    const my = py + scrollY
    const on = mq.matches
    let moving = false
    for (let i = 0; i < n; i++) {
      const d = Math.hypot(cx[i] - mx, cy[i] - my)
      const target = on && d < RADIUS ? REST_W + (MAX_W - REST_W) * (0.5 + 0.5 * Math.cos((Math.PI * d) / RADIUS)) : REST_W
      cur[i] += (target - cur[i]) * k
      if (Math.abs(target - cur[i]) < 0.4) cur[i] = target
      else moving = true
      if (Math.abs(cur[i] - shown[i]) >= 0.5 || (cur[i] === target && shown[i] !== target)) {
        shown[i] = cur[i]
        if (cur[i] === REST_W) chars[i].style.removeProperty('--w')
        else chars[i].style.setProperty('--w', cur[i].toFixed(1))
      }
    }
    if (moving) raf = requestAnimationFrame(frame)
    else {
      last = 0
      dirty = true // letters reflow with their weight: re-read the centres next time
    }
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    px = e.clientX
    py = e.clientY
    kick()
  }
  const onOut = (e: PointerEvent) => {
    if (e.relatedTarget) return
    px = py = -1e5
    kick()
  }
  const onDirty = () => {
    dirty = true
  }
  addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerout', onOut, { passive: true })
  addEventListener('resize', onDirty, { passive: true })
  addEventListener('scroll', onDirty, { passive: true })
  mq.addEventListener('change', kick)

  return () => {
    cancelAnimationFrame(raf)
    removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerout', onOut)
    removeEventListener('resize', onDirty)
    removeEventListener('scroll', onDirty)
    mq.removeEventListener('change', kick)
    chars.forEach((c) => c.style.removeProperty('--w'))
  }
}
