import { translationLines } from '@/lib/paths.ts'
import type { Controller } from '../runtime.ts'
import { ease, range } from '../tempo.ts'

// TRANSLATION — two grammars negotiate. The technology half (scrub .6) and the business
// half (scrub 1.0) close on the seam with a lag between them, and both lines settle at 45°.
const business: Controller = (el, { gsap, scene, onRefresh, fire }) => {
  const stage = el.querySelector<HTMLElement>('.stage')!
  const svg = stage.querySelector<SVGSVGElement>('svg.art')!
  const lineA = svg.querySelector<SVGPathElement>('.biz__a')!
  const lineB = svg.querySelector<SVGPathElement>('.biz__b')!
  const left = stage.querySelector<HTMLElement>('.biz__half--l')!
  const right = stage.querySelector<HTMLElement>('.biz__half--r')!
  const specWord = left.querySelector<HTMLElement>('span')!
  const intentWord = right.querySelector<HTMLElement>('span')!
  const word = stage.querySelector<HTMLElement>('.biz__word')!
  const seam = stage.querySelector<HTMLElement>('.biz__seam')!
  const after = [...stage.querySelectorAll<HTMLElement>('.biz__list li, .biz__spec')]

  let W = 0
  let H = 0
  const s = { a: 0, b: 0 }
  const render = () => {
    lineA.setAttribute('d', translationLines(W, H, s.a).a)
    lineB.setAttribute('d', translationLines(W, H, s.b).b)
    left.style.clipPath = `inset(0 50% 0 ${s.a * 50}%)`
    right.style.clipPath = `inset(0 ${s.b * 50}% 0 50%)`
    specWord.style.transform = `translateX(${s.a * W * 0.25}px)`
    intentWord.style.transform = `translateX(${-s.b * W * 0.25}px)`
    seam.style.opacity = `${1 - Math.min(s.a, s.b)}`
  }
  onRefresh(() => {
    W = stage.clientWidth
    H = stage.clientHeight
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    render()
  })

  gsap.set(word, { yPercent: -112 })
  gsap.set(after, { opacity: 0 })

  scene(el, 0.6, (p) => {
    s.a = gsap.parseEase('power1.inOut')(range(p, 0, 0.8))
    render()
  })
  let emerged = false
  scene(el, 1.0, (p, st) => {
    s.b = gsap.parseEase('power1.inOut')(range(p, 0, 0.8))
    render()
    if (!emerged && p >= 0.82) {
      emerged = true
      fire(
        gsap
          .timeline({ paused: true })
          .to(word, { yPercent: 0, duration: 1.1, ease: ease.settle })
          .to(after, { opacity: 1, duration: 0.7, stagger: 0.09, ease: ease.write }, 0.5),
        st,
      )
    }
  })
  return () => {}
}

export default business
