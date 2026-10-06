import type { Controller } from '../runtime.ts'
import { ease } from '../tempo.ts'

// NEXT — the point leaves the frame (accelerating), 1.1s of stillness, the sentence,
// then the line re-enters from the left edge and becomes the underline of the address.
const contact: Controller = (el, { gsap, ScrollTrigger, fire }) => {
  const stage = el.querySelector<HTMLElement>('.stage')!
  const escapeSvg = stage.querySelector<SVGSVGElement>('svg.art')!
  const escapePoint = stage.querySelector<HTMLElement>('.contact__escape-point')!
  const open = stage.querySelector<HTMLElement>('.contact__open')!
  const address = stage.querySelector<HTMLElement>('.contact__address')!
  const underline = stage.querySelector<HTMLElement>('.contact__underline')!
  const point = stage.querySelector<HTMLElement>('.contact__point')!
  const rest = [...stage.querySelectorAll<HTMLElement>('.contact__actions, .contact__links')]

  gsap.set([open, address, ...rest], { opacity: 0 })
  gsap.set(address, { y: 18 })
  gsap.set(underline, { scaleX: 0 })
  gsap.set(point, { opacity: 0, scale: 0 })

  const tl = gsap.timeline({ paused: true })
  tl.to([escapeSvg, escapePoint], { x: () => stage.clientWidth + 40, duration: 0.9, ease: ease.depart }, 0)
    .to(open, { opacity: 1, duration: 0.8, ease: ease.write }, 0.9 + 1.1)
    .to(underline, { scaleX: 1, duration: 0.8, ease: ease.write }, 2.6)
    .to(address, { opacity: 1, y: 0, duration: 0.7, ease: ease.write }, 3.0)
    .to(point, { opacity: 1, scale: 1, duration: 0.4, ease: ease.settle }, 3.3)
    .to(rest, { opacity: 1, duration: 0.6, stagger: 0.1 }, 3.5)

  const st = ScrollTrigger.create({
    trigger: el.querySelector('.ch__track'),
    start: 'top top',
    once: true,
    onEnter: (self) => fire(tl, self),
  })
  return () => st.kill()
}

export default contact
