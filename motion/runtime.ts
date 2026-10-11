import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { layoutTops, pageSections } from '../lib/layout.ts'
import draw from './chapters/draw.ts'
import drift from './chapters/drift.ts'
import enter from './chapters/enter.ts'
import { fieldState } from './chapters/field-state.ts'
import sceneTechnology from './chapters/scene-technology.ts'
import { curtain } from './curtain.ts'
import { fieldBus } from './field-bus.ts'
import { opening } from './opening.ts'
import { nativeScroll, smooth, type ScrollApi } from './smooth.ts'
import { LIFT, VELOCITY_SKIP } from './tempo.ts'

// The motion runtime, loaded only in full-motion mode. Order matters: smooth scrolling first
// (everything else scrolls through it), the draw-ins, deterministic ?seek / #hash placement,
// the entrances (after fonts, for SplitText), the scrubbed parallax, the nav curtain, and a
// final refresh.

export type Replay = { draw?: () => void; enter?: () => void }

export type Env = {
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  /** Play a timed beat — or complete it at once for skimmers and jumps. */
  fire: (tl: gsap.core.Timeline, st?: ScrollTrigger) => void
  /** For the next `ms`, fire() completes beats at once (seek, curtain jumps). */
  settle: (ms: number) => void
  /** Per-section replay hooks (keyed by section id), used by the nav curtain after a jump. */
  registry: Map<string, Replay>
  /** Deterministic screenshot mode (?seek=…): native scroll, no parallax, settled states. */
  seek: boolean
  /** State handed to the background shader. */
  bus: typeof fieldBus
  /** Programmatic scrolling: Lenis when it runs, native otherwise. */
  scroll: ScrollApi
}

export type Controller = (el: HTMLElement, env: Env) => () => void

export function boot() {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase)
  CustomEase.create('lift', LIFT)
  ScrollTrigger.config({ ignoreMobileResize: true })

  const seekParam = new URLSearchParams(location.search).get('seek')
  let settleUntil = -1
  const env: Env = {
    gsap,
    ScrollTrigger,
    registry: new Map(),
    seek: seekParam !== null,
    bus: fieldBus,
    scroll: nativeScroll,
    settle(ms) {
      settleUntil = Math.max(settleUntil, performance.now() + ms)
    },
    // Seek mode is for deterministic captures: every beat arrives finished.
    fire(tl, st) {
      if (seekParam !== null || performance.now() < settleUntil || (st && Math.abs(st.getVelocity()) > VELOCITY_SKIP)) tl.progress(1)
      else tl.play()
    },
  }

  const cleanups: (() => void)[] = []
  const smoothed = smooth(env)
  env.scroll = smoothed.api
  cleanups.push(smoothed.cleanup)

  // The living field follows the story: scroll position → chapter state.
  cleanups.push(fieldState(env))
  // The opening constructs the hero (no-op unless the boot is playing).
  cleanups.push(opening(env))

  const secs = pageSections()
  const hashed = !env.seek && location.hash ? secs.find((s) => `#${s.id}` === location.hash) : undefined
  // Is the browser's own anchor jump still in place (not scrolled away) as we arrive?
  const atHash = hashed && Math.abs(hashed.getBoundingClientRect().top - innerHeight * 0.25) < innerHeight * 0.3

  // Every section.
  const tiles = [...document.querySelectorAll<HTMLElement>('[data-tile]')]
  tiles.forEach((el) => cleanups.push(draw(el, env)))

  // Pinned scenes (major moments).
  const tech = document.getElementById('technology')
  if (tech) cleanups.push(sceneTechnology(tech, env))

  // Deterministic states for review and screenshots: ?seek=technology places Technology's top
  // at the top of the viewport; ?seek=technology:0.5 scrolls a further half viewport. Any other
  // element id works too; the browser clamps at the page's end.
  const seekY = () => {
    const [id, p] = (seekParam ?? '').split(':')
    const i = secs.findIndex((s) => s.id === id)
    const other = i < 0 && id ? document.getElementById(id) : null
    if (i < 0 && !other) return null
    const top = other ? other.getBoundingClientRect().top + scrollY : layoutTops(secs)[i]
    const t = Number(p)
    if (p === undefined || !Number.isFinite(t)) return top
    // [scene-seek] A pinned scene (section[data-scene]) maps p to its own scroll range: from
    // its top (plus data-scene-offset, when a stage taller than the viewport sticks late) to
    // its bottom meeting the viewport's bottom — the same range its ScrollTrigger scrubs.
    const el = other ?? secs[i]
    if (el?.hasAttribute('data-scene')) {
      const off = Number(el.dataset.sceneOffset) || 0
      return top + off + Math.min(1, Math.max(0, t)) * Math.max(0, el.offsetHeight - innerHeight - off)
    }
    // [/scene-seek]
    return top + Math.max(0, t) * innerHeight
  }
  // Re-placed after fonts load (heights change) unless the reader has scrolled since.
  let placed: number | null = null
  const place = () => {
    if (placed !== null && Math.abs(scrollY - placed) > 2) return
    const y = env.seek ? seekY() : atHash && hashed ? layoutTops(secs)[secs.indexOf(hashed)] : null
    if (y === null) return
    env.scroll.to(y, { immediate: true })
    placed = scrollY
  }
  if (env.seek && seekY() !== null) env.settle(2100)
  place()
  requestAnimationFrame(place)

  let alive = true
  document.fonts.ready.then(() => {
    if (!alive) return
    place()
    tiles.forEach((el) => cleanups.push(enter(el, env)))
    ScrollTrigger.refresh()
  })

  // Scrubbed parallax: off in seek mode, so captures stay deterministic.
  if (!env.seek) tiles.forEach((el) => cleanups.push(drift(el, env)))

  cleanups.push(curtain(env, secs))

  // Content that changes height (fonts, the brief form) moves every later trigger.
  let raf = 0
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => ScrollTrigger.refresh())
  })
  ro.observe(document.body)
  cleanups.push(() => {
    ro.disconnect()
    cancelAnimationFrame(raf)
  })

  ScrollTrigger.refresh()

  return () => {
    alive = false
    cleanups.reverse().forEach((c) => c())
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }
}
