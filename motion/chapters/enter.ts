import { SplitText } from 'gsap/SplitText'
import type { Controller } from '../runtime.ts'
import { ease } from '../tempo.ts'

// The entrance of every section, played once when its head reaches 85% of the viewport.
// Tiles: the number and caption scramble to their own text, the accent rule grows, the
// headline lines rise out of masks, the copy fades up. The hero's first entrance is the opening
// (motion/opening.ts), so nothing here plays on load; skipped (reload, hash, seek) it is simply
// finished. A nav-curtain jump to the top replays a light one: the instrument, letters rise.
// Initial states are only set on sections that will actually animate (never via CSS), so
// reduced motion, no-JS and sections already on screen are untouched. Diagram elements
// (`data-step`) belong to draw.ts and are never touched here.

type SplitVars = NonNullable<Parameters<typeof SplitText.create>[1]>
const free = (n: Element) => !n.closest('[data-step]')

/** Is the section on screen right now? (Sections are never stuck or transformed.) */
function onScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return r.top < innerHeight && r.bottom > 0
}

const enter: Controller = (el, env) => {
  const { gsap, ScrollTrigger, fire, registry } = env
  const hero = el.id === 'top'
  const q = (s: string) => [...el.querySelectorAll<HTMLElement>(s)].filter(free)

  let ctx: gsap.Context | null = null
  let tl: gsap.core.Timeline | null = null
  let splits: SplitText[] = []
  let width = 0
  let done = false
  let st: ScrollTrigger | undefined

  const unsplit = () => {
    splits.forEach((s) => s.revert())
    splits = []
  }
  const split = (t: Element | Element[], vars: SplitVars) => {
    const s = SplitText.create(t, vars)
    splits.push(s)
    return s
  }

  const tile = (t: gsap.core.Timeline) => {
    const n = el.querySelector('.tile__n')
    if (n) t.to(n, { scrambleText: { text: n.textContent ?? '', chars: '0123456789' }, duration: 0.5, ease: 'none' }, 0)
    const cap = el.querySelector('.tile__caption')
    if (cap) t.to(cap, { scrambleText: { text: cap.textContent ?? '', chars: 'upperCase' }, duration: 0.7, ease: 'none' }, 0.05)

    const rules = q('.lead, .statement')
    if (rules.length) t.fromTo(rules, { '--rule': 0 }, { '--rule': 1, duration: 0.6, ease: ease.write }, 0.1)

    q('.lead__h, .statement').forEach((h) => {
      const lines = split(h, { type: 'lines', mask: 'lines' }).lines
      t.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: ease.write }, 0.15)
    })

    const copy = q('.lead__body, .credential, .split__copy .btn, .ruled')
    if (copy.length) t.fromTo(copy, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: ease.write }, 0.45)
  }

  // The hero after a curtain jump: the instrument fades up, letters rise, the rest follows.
  const intro = (t: gsap.core.Timeline) => {
    const ins = q('.hero__instrument')
    if (ins.length) t.fromTo(ins, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0)
    const chars = q('.nm__ch')
    if (chars.length) t.fromTo(chars, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.02, ease: ease.write }, 0.1)
    const rest = q('.hero__title, .hero__brief > *, :scope > .hero__rail, :scope > .hero__stack, :scope > .hero__plus')
    if (rest.length) t.fromTo(rest, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: ease.write }, 0.35)
  }

  /** (Re)build the paused timeline; its from-states hide what is about to enter. */
  const build = () => {
    ctx?.revert()
    unsplit()
    width = el.clientWidth
    ctx = gsap.context(() => {
      tl = gsap.timeline({ paused: true, onComplete: unsplit })
      if (hero) intro(tl)
      else tile(tl)
    })
  }

  const play = (self?: ScrollTrigger) => {
    if (done || !tl) return
    done = true
    fire(tl, self)
  }

  // Line breaks depend on width: re-split anything that has not played yet.
  const onRefresh = () => {
    if (!done && tl && el.clientWidth !== width) build()
  }

  // The hero's entrance is the opening; skipped (reload, hash, seek) it is simply finished.
  // Only the nav curtain replays it (below).
  if (hero) done = true
  else if (!onScreen(el)) {
    build()
    const head = el.querySelector<HTMLElement>('.tile__head') ?? el
    st = ScrollTrigger.create({ trigger: head, start: 'top 85%', once: true, onEnter: (self) => play(self) })
  } else done = true
  ScrollTrigger.addEventListener('refreshInit', onRefresh)

  // The nav curtain replays the target's entrance after a jump.
  if (el.id)
    registry.set(el.id, {
      ...registry.get(el.id),
      enter: () => {
        st?.kill()
        done = true
        build()
        tl?.play(0)
      },
    })

  return () => {
    st?.kill()
    ScrollTrigger.removeEventListener('refreshInit', onRefresh)
    ctx?.revert()
    unsplit()
    tl = null
  }
}

export default enter
