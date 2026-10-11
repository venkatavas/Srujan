import type { Controller } from '../runtime.ts'

// Light, scrubbed parallax (desktop, fine pointer). Across a section's pass the copy column
// drifts 28px each way and the diagram column 44px, so the two read as separate planes;
// In the hero only the instrument moves (it lags the page).
// Only containers move: the elements enter.ts animates (headline lines, body copy, buttons)
// and draw.ts's [data-step] diagram parts are never targets, so no element carries two
// competing transforms.

const DESKTOP = '(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const COPY = 28
const DIAGRAM = 44

/** Containers only: never a draw.ts step, never inside one. */
const own = (n: HTMLElement | null): n is HTMLElement => !!n && !n.closest('[data-step]')

const drift: Controller = (el, { gsap }) => {
  const mm = gsap.matchMedia()
  const hero = el.id === 'top'

  mm.add(DESKTOP, () => {
    // The hero starts at rest (scroll 0) and only drifts on its way out.
    const pass = () => ({ trigger: el, start: hero ? 'top top' : 'top bottom', end: 'bottom top', scrub: 0.6 })
    const layer = (n: HTMLElement | null, d: number) => {
      if (!own(n)) return
      if (hero) gsap.fromTo(n, { y: 0 }, { y: -d, ease: 'none', scrollTrigger: pass() })
      else gsap.fromTo(n, { y: d }, { y: -d, ease: 'none', scrollTrigger: pass() })
    }

    if (hero) {
      // Only the instrument drifts (slower than the page); the name, title and brief hold.
      layer(el.querySelector<HTMLElement>(':scope > .hero__instrument'), -DIAGRAM)
      return
    }

    const split = el.querySelector<HTMLElement>('.split')
    if (split) {
      layer(split.querySelector<HTMLElement>(':scope > .split__copy'), COPY)
      layer(split.querySelector<HTMLElement>(':scope > :not(.split__copy)'), DIAGRAM)
    }
    layer(el.querySelector<HTMLElement>(':scope > .foundation'), COPY)
  })

  return () => mm.revert()
}

export default drift
