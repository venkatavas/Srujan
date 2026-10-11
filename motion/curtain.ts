import { layoutTops } from '../lib/layout.ts'
import type { Env } from './runtime.ts'
import { ease } from './tempo.ts'

// Nav jumps. A neighbouring section is reached by a smooth glide (Lenis); a far
// one by a curtain: a drafting sheet with an accent edge covers the page in the direction
// of travel while its label scrambles to the target ("05 LEADERSHIP"), the page jumps
// underneath, then the sheet lifts and the target replays its entrance and draw-in.
// Clicks retarget the curtain until the jump; after it, they wait for the lift.

type Phase = 'idle' | 'glide' | 'cover' | 'reveal'

export function curtain(env: Env, sections: HTMLElement[]) {
  const { gsap, ScrollTrigger, bus, registry } = env

  const root = document.createElement('div')
  root.className = 'curtain'
  root.setAttribute('aria-hidden', 'true')
  root.innerHTML = '<i class="curtain__edge"></i><p class="curtain__label"><span class="curtain__n"></span><span class="curtain__t"></span></p>'
  document.body.append(root)
  const edge = root.querySelector<HTMLElement>('.curtain__edge')!
  const labelN = root.querySelector<HTMLElement>('.curtain__n')!
  const labelT = root.querySelector<HTMLElement>('.curtain__t')!

  let phase: Phase = 'idle'
  let target: HTMLElement | null = null
  let tl: gsap.core.Timeline | null = null

  const indexAt = (tops: number[]) => {
    let i = 0
    for (let k = 0; k < tops.length; k++) if (tops[k] <= scrollY + 0.45 * innerHeight) i = k
    return i
  }

  const settle = (to: HTMLElement) => {
    if (location.hash !== `#${to.id}`) history.pushState(null, '', `#${to.id}`)
    if (!to.hasAttribute('tabindex')) to.setAttribute('tabindex', '-1')
    to.focus({ preventScroll: true })
  }

  const label = (to: HTMLElement) => {
    const n = to.querySelector('.tile__n')?.textContent ?? '01'
    const title = to.querySelector('.tile__title')?.textContent?.slice(n.length).trim() || 'Home'
    gsap.to(labelN, { scrambleText: { text: n, chars: '0123456789' }, duration: 0.35, ease: 'none', overwrite: true })
    gsap.to(labelT, { scrambleText: { text: title, chars: 'upperCase' }, duration: 0.35, ease: 'none', overwrite: true })
  }

  // The visible band of the sheet: inset from the top and bottom; the edge rides the moving side.
  const paint = (top: number, bottom: number, edgeY: number) => {
    root.style.clipPath = `inset(${top}px 0px ${bottom}px 0px)`
    // Whole pixels: a 1px line at a fractional offset smears into a pale grey.
    edge.style.transform = `translate3d(0, ${Math.round(edgeY)}px, 0)`
    bus.sweep = edgeY
  }

  const jump = () => {
    if (!target) return
    const to = target
    const y = layoutTops(sections)[sections.indexOf(to)]
    env.settle(600) // sections passed on the way arrive finished
    env.scroll.to(y, { immediate: true })
    ScrollTrigger.update()
    settle(to)
    bus.energy = 1
    phase = 'reveal'
  }

  const run = (down: boolean) => {
    const H = innerHeight
    const a = { v: 0 }
    const b = { v: 0 }
    phase = 'cover'
    tl = gsap.timeline({
      onComplete: () => {
        gsap.set(root, { visibility: 'hidden', clearProps: 'clipPath' })
        bus.sweep = -1
        phase = 'idle'
        tl = null
      },
    })
    tl.set(root, { visibility: 'visible' })
    tl.to(a, {
      v: 1,
      duration: 0.5,
      ease: 'power3.in',
      onUpdate: () => {
        const r = (1 - a.v) * H
        if (down) paint(r, 0, r)
        else paint(0, r, H - r - 1)
      },
    })
    tl.call(jump)
    tl.to({}, { duration: 0.12 })
    tl.call(() => {
      const id = target?.id
      if (!id) return
      registry.get(id)?.enter?.()
      registry.get(id)?.draw?.()
    })
    tl.to(b, {
      v: 1,
      duration: 0.62,
      ease: ease.lift,
      onUpdate: () => {
        const r = b.v * H
        if (down) paint(0, r, H - r - 1)
        else paint(r, 0, r)
      },
    })
    tl.to(bus, { energy: 0, duration: 0.62, ease: 'power1.out' }, '<')
  }

  const go = (to: HTMLElement) => {
    if (phase === 'reveal') return
    if (phase === 'cover') {
      target = to
      label(to)
      return
    }
    const tops = layoutTops(sections)
    const ti = sections.indexOf(to)
    const ci = indexAt(tops)
    target = to
    if (Math.abs(ti - ci) <= 1) {
      // A wheel or touch during the glide takes over; the next click starts afresh.
      phase = 'glide'
      const y = tops[ti]
      env.scroll.to(y, {
        duration: Math.max(0.8, Math.abs(y - scrollY) / 1400),
        onComplete: () => {
          settle(to)
          phase = 'idle'
        },
      })
      return
    }
    label(to)
    run(ti > ci)
  }

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]')
    const id = a?.getAttribute('href')?.slice(1)
    const to = id ? sections.find((s) => s.id === id) : undefined
    if (!to) return
    e.preventDefault()
    go(to)
  }
  document.addEventListener('click', onClick)

  // Back and forward through the pushed hashes.
  const onPop = () => {
    const i = sections.findIndex((s) => `#${s.id}` === location.hash)
    if (i < 0) return
    env.scroll.to(layoutTops(sections)[i], { immediate: true })
    ScrollTrigger.update()
  }
  addEventListener('popstate', onPop)

  return () => {
    document.removeEventListener('click', onClick)
    removeEventListener('popstate', onPop)
    tl?.kill()
    gsap.killTweensOf([labelN, labelT])
    root.remove()
    bus.sweep = -1
  }
}
