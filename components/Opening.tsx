'use client'

import { useEffect } from 'react'
import { markLoaded } from '@/lib/loading.ts'
import { fieldBus } from '@/motion/field-bus.ts'
import { CAP_MS, finishBoot, freezeParam } from '@/motion/opening.ts'

/**
 * The opening's stage: one vermilion point and a hairline, server-rendered so the first frame
 * (CSS only, html[data-boot='play']) is ink and the point breathing where the hero's instrument
 * will cross (app/styles/hero.css: --ins-py), so the opening's point and the resting point are
 * one and the same. The sequence itself is
 * motion/opening.ts, loaded with the runtime. Here: the 'app' and 'type' milestones, the field
 * held at reveal 0 from the point, and the hand-over if the runtime never arrives in time.
 */

// As soon as this chunk evaluates (before hydration, long before the field's first GL frame).
if (typeof window !== 'undefined' && document.documentElement.dataset.boot === 'play') {
  fieldBus.reveal = 0
  fieldBus.ox = -1
  fieldBus.oy = -1
}

/** Settle 'type' once the three site families are really usable (fallback: fonts.ready). */
function checkType() {
  const done = () => markLoaded('type')
  const fonts = document.fonts
  if (!fonts) return done()
  const ready = () => fonts.ready.then(done, done)
  try {
    const cs = getComputedStyle(document.documentElement)
    const fam = (v: string) => v.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '') ?? ''
    const [serif, sans, mono] = ['--f-serif', '--f-sans', '--f-mono'].map((p) => fam(cs.getPropertyValue(p)))
    const want = [serif && `320 32px "${serif}"`, sans && `400 32px "${sans}"`, mono && `400 32px "${mono}"`, mono && `500 32px "${mono}"`]
    const specs = want.filter((s): s is string => !!s)
    if (specs.length < 4) return void ready()
    Promise.all(specs.map((s) => fonts.load(s))).then(
      (faces) => (faces.every((f) => f.length) ? done() : void ready()),
      () => void ready(),
    )
  } catch {
    void ready()
  }
}

export function Opening() {
  useEffect(() => {
    markLoaded('app')
    checkType()
    const html = document.documentElement
    if (html.dataset.boot !== 'play') return

    // The grid will unfold from the point: the instrument's crossing (the CSS places the
    // breathing point there too, from the same root variables).
    if (!html.dataset.opening) {
      const r = (document.querySelector('[data-op-anchor]') ?? document.querySelector('.op__pt'))?.getBoundingClientRect()
      const ox = r && r.width ? r.left + r.width / 2 : html.clientWidth / 2
      const oy = r && r.height ? r.top + r.height / 2 : html.clientHeight / 2
      fieldBus.reveal = 0
      fieldBus.ox = ox
      fieldBus.oy = oy
      html.style.setProperty('--ss-ox', `${ox}px`)
      html.style.setProperty('--ss-oy', `${oy}px`)
    }

    // Until motion/opening.ts takes over, a skip or the time cap hands the page over here.
    const waiting = () => !['run', 'frozen', 'done'].includes(html.dataset.opening ?? '')
    const mo = new MutationObserver(() => {
      if (html.dataset.boot !== 'play' && waiting()) finishBoot()
    })
    mo.observe(html, { attributes: true, attributeFilter: ['data-boot'] })
    const frozen = freezeParam(location.search) !== null
    const cap = frozen
      ? 0
      : window.setTimeout(() => {
          if (html.dataset.boot === 'play' && waiting()) finishBoot()
        }, Math.max(0, CAP_MS - performance.now()))
    return () => {
      mo.disconnect()
      clearTimeout(cap)
    }
  }, [])

  return (
    <div className="op" aria-hidden="true">
      <span className="op__hair" />
      <span className="op__pt" />
    </div>
  )
}
