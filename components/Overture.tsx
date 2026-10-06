'use client'

import { useEffect, useRef } from 'react'
import { matchGlyphs } from '@/lib/overture/match.ts'
import { ease } from '@/motion/tempo.ts'

// Draft copy from the brief's direction — client to sign off.
const WORDS = ['Systems', 'Markets', 'Companies']

type Rect = { ch: string; x: number; y: number }

/**
 * "The writing": words rise out of the line, shared letters travel along it to form
 * the next word, and the last word resolves into the name. The real <h1> is painted
 * underneath from the first frame; the overlay hands off when the glyphs coincide.
 */
export function Overture() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    if (html.dataset.overture !== 'play') return
    let dead = false
    let kill: (() => void) | undefined
    const remember = () => {
      try {
        sessionStorage.setItem('tl-overture', '1')
      } catch {}
    }
    const mo = new MutationObserver(() => {
      if (html.dataset.overture !== 'play') {
        dead = true
        remember()
        kill?.()
      }
    })
    mo.observe(html, { attributes: true, attributeFilter: ['data-overture'] })

    ;(async () => {
      const [{ gsap }, fontsOk] = await Promise.all([
        import('gsap'),
        Promise.race([document.fonts.ready.then(() => true), new Promise<boolean>((r) => setTimeout(() => r(false), 1200))]),
      ])
      if (dead) return
      if (!fontsOk) {
        html.dataset.overture = 'skip'
        return
      }
      kill = run(gsap, root.current!, () => {
        remember()
        if (html.dataset.overture === 'play') html.dataset.overture = 'done'
      })
    })()

    return () => {
      dead = true
      mo.disconnect()
      kill?.()
    }
  }, [])

  return (
    <div className="overture" aria-hidden="true" ref={root}>
      <div className="ov__line" />
      <div className="ov__glyphs" />
      <span className="ov__point" />
      <span className="ov__measure" />
    </div>
  )
}

function charRects(node: Node, filter = true): Rect[] {
  const out: Rect[] = []
  const walk = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.textContent ?? ''
      for (let i = 0; i < text.length; i++) {
        if (filter && !text[i].trim()) continue
        const r = document.createRange()
        r.setStart(n, i)
        r.setEnd(n, i + 1)
        const b = r.getBoundingClientRect()
        out.push({ ch: text[i], x: b.left, y: b.top })
      }
    } else n.childNodes.forEach(walk)
  }
  walk(node)
  return out
}

function run(gsap: typeof import('gsap').gsap, root: HTMLElement, done: () => void) {
  const layer = root.querySelector<HTMLElement>('.ov__glyphs')!
  const measure = root.querySelector<HTMLElement>('.ov__measure')!
  const point = root.querySelector<HTMLElement>('.ov__point')!
  const h1 = document.querySelector<HTMLElement>('.name')!
  const surnameEl = h1.querySelector<HTMLElement>('.name__surname')!
  const givenEl = h1.querySelector<HTMLElement>('.name__given')!
  const hPoint = h1.querySelector<HTMLElement>('.name__point')!
  const size = parseFloat(getComputedStyle(h1).fontSize)

  // Baseline = the surname's glyph boxes (they sit on the horizon).
  const surname = charRects(surnameEl)
  const given = charRects(givenEl)
  const baseTop = surname[0].y

  // A glyph's own box offset, measured once.
  const probe = document.createElement('span')
  probe.className = 'ov__g'
  probe.textContent = 'S'
  layer.appendChild(probe)
  const probeRect = charRects(probe)[0]
  const pr = probe.getBoundingClientRect()
  const off = { x: probeRect.x - pr.left, y: probeRect.y - pr.top }
  probe.remove()

  const wordRects = (w: string): Rect[] => {
    measure.textContent = w
    return charRects(measure).map((r) => ({ ...r, y: baseTop }))
  }
  const pointAfter = (rects: Rect[], text: string) => {
    measure.textContent = text
    const r = measure.getBoundingClientRect()
    return r.right + size * 0.05 + size * 0.045
  }

  type G = { el: HTMLElement; ch: string; x: number; y: number }
  const make = (r: Rect): G => {
    const el = document.createElement('span')
    el.className = 'ov__g'
    el.textContent = r.ch
    layer.appendChild(el)
    gsap.set(el, { x: r.x - off.x, y: r.y - off.y + size * 0.95 })
    return { el, ch: r.ch, x: r.x, y: r.y }
  }
  const at = (g: G) => ({ x: g.x - off.x, y: g.y - off.y })

  const tl = gsap.timeline({ onComplete: done })
  gsap.set(point, { xPercent: -50, yPercent: -50, x: window.innerWidth * 0.33 })

  // Beat 1 — SYSTEMS. rises out of the line.
  let current: G[] = wordRects(WORDS[0]).map(make)
  current.forEach((g, i) => tl.to(g.el, { ...at(g), duration: 0.6, ease: ease.write }, i * 0.035))
  tl.to(point, { x: pointAfter(current, WORDS[0]), duration: 0.7, ease: ease.settle }, 0.1)

  const morph = (targets: Rect[], start: number, pointX: number) => {
    const m = matchGlyphs(current, targets)
    const next: G[] = []
    const used = new Set<number>()
    targets.forEach((t, j) => {
      if (m[j] >= 0) {
        const g = current[m[j]]
        used.add(m[j])
        g.x = t.x
        g.y = t.y
        tl.to(g.el, { ...at(g), duration: 0.7, ease: ease.settle }, start)
        next.push(g)
      } else {
        const g = make(t)
        tl.to(g.el, { ...at(g), duration: 0.5, ease: ease.write }, start + 0.25)
        next.push(g)
      }
    })
    current.forEach((g, i) => {
      if (!used.has(i)) tl.to(g.el, { y: `+=${size * 0.95}`, duration: 0.35, ease: ease.depart, onComplete: () => g.el.remove() }, start)
    })
    tl.to(point, { x: pointX, duration: 0.7, ease: ease.settle }, start)
    current = next
  }

  // Beats 2 & 3 — shared letters travel along the line.
  for (const [i, w] of WORDS.slice(1).entries()) {
    const rects = wordRects(w)
    morph(rects, 1.0 + i * 0.9, pointAfter(rects, w))
  }

  // Beat 4 — the name. Shared glyphs travel onto the surname; the given names rise above.
  const pr2 = hPoint.getBoundingClientRect()
  morph(surname, 2.8, pr2.left + pr2.width / 2)
  given.forEach((r, i) => {
    const el = document.createElement('span')
    el.className = 'ov__g'
    el.textContent = r.ch
    layer.appendChild(el)
    gsap.set(el, { x: r.x - off.x, y: r.y - off.y + size * 0.3, opacity: 0 })
    tl.to(el, { y: r.y - off.y, opacity: 1, duration: 0.6, ease: ease.write }, 3.1 + i * 0.03)
  })
  tl.to({}, { duration: 0.15 })

  return () => {
    tl.kill()
    layer.replaceChildren()
  }
}
