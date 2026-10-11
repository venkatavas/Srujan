import { type CSSProperties, Fragment } from 'react'
import { brief } from '@/content/brief.ts'
import { profile } from '@/content/profile.ts'
import { valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { BriefSentence } from '../BriefSentence.tsx'
import { NAV_SECTIONS } from '../nav/sections.ts'
import { At, Dia } from './Dia.tsx'

const v = valueOf

/* ── 01 HERO — the instrument ─────────────────────────────────────────────
   A centred, symmetric drawing: concentric hairline rings on a vertical axis, the vermilion
   point at the crossing on the inner ring's top, the name on one line beneath it, then the
   title, the brief and its lifecycle; the section rail on the left, word stacks in the lower
   corners. The opening (motion/opening.ts) builds exactly this markup in front of the visitor;
   at rest, and without JS or under reduced motion, it is already complete. Letters are separate
   boxes (the outline draw, living type), so the font's pair kerning is restored by hand. */

// Newsreader pair kerning at opsz 72, wght 320, in em (measured from the font's own shaping).
const KERN: Record<string, number> = { SA: -0.0215, RU: -0.026, UJ: -0.027, JA: -0.046, PA: -0.068, AS: -0.016 }
const GUIDES = ['cap', 'x', 'base'] as const

// The instrument, in units of the hero's height (1000 = 1 hero): radii, the axis, the crossing.
const RINGS = [250, 330, 430, 550]
const SPIN = 390
const AXIS = [-370, 290]
const CROSS = -RINGS[0]
const TICKS = Array.from({ length: 16 }, (_, i) => -350 + i * 40).filter((y) => Math.abs(y - CROSS) > 30)
const half = (r: number, side: 0 | 1) => `M0 ${-r}A${r} ${r} 0 0 ${side} 0 ${r}`

// The drafting sheet: dotted rules and square markers near the edges, in % of the hero.
const RULES: [number, number, number, 'h' | 'v'][] = [
  [2.5, 17, 10, 'h'],
  [86.5, 58, 11, 'h'],
  [90, 19, 13, 'v'],
  [2.5, 66, 8, 'v'],
]
const SQUARES: [number, number][] = [
  [12.5, 17],
  [86.5, 58],
  [21, 15],
  [77, 92],
  [3.5, 72],
  [96.5, 41],
]

export function Hero({ sections }: { sections: number }) {
  const [given, surname] = profile.nameLines
  const words = [...given.split(' '), surname].map((w) => w.toUpperCase())
  const full = v(profile.name) ?? words.join(' ')
  const title = (v(site.home.title) ?? '').split(' · ')
  const marks = { left: v(site.home.marks.left) ?? [], right: v(site.home.marks.right) ?? [] }
  const W = 1000
  const H = 90
  const stops = site.home.lifecycle
  const xs = stops.map((_, i) => 70 + (i * (W - 140)) / (stops.length - 1))
  return (
    <section id="top" className="sec sec--hero" data-tile data-nav="top" aria-labelledby="hero-name">
      <div className="hero__sheet" aria-hidden="true">
        {RULES.map(([x, y, l, d], i) => (
          <span key={i} className={`hero__rule hero__rule--${d}`} style={d === 'h' ? { left: `${x}%`, top: `${y}%`, width: `${l}%` } : { left: `${x}%`, top: `${y}%`, height: `${l}%` }} />
        ))}
        {SQUARES.map(([x, y], i) => (
          <span key={i} className="hero__sq" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
      </div>

      <div className="hero__instrument" aria-hidden="true">
        <svg className="ins" viewBox="-600 -600 1200 1200">
          {RINGS.map((r, i) => (
            <g key={r} className={`ins__ring ins__ring--${i + 1}`}>
              <path d={half(r, 1)} pathLength={1} />
              <path d={half(r, 0)} pathLength={1} />
            </g>
          ))}
          <circle className="ins__spin" r={SPIN} />
          <path className="ins__axis" d={`M0 ${CROSS}V${AXIS[0]}`} pathLength={1} />
          <path className="ins__axis" d={`M0 ${CROSS}V${AXIS[1]}`} pathLength={1} />
          <path className="ins__hair" d={`M-120 ${CROSS}H120`} />
          {TICKS.map((y) => (
            <circle key={y} className="ins__tick" cy={y} r={1.6} />
          ))}
        </svg>
        <span className="hero__pt" data-op-anchor />
      </div>

      <div className="hero__core">
        <h1 id="hero-name" className="nm hero__name">
          <span className="nm__sr">{full}</span>
          <span className="nm__line" aria-hidden="true">
            {GUIDES.map((g) => (
              <span key={g} className={`nm__g nm__g--${g}`} />
            ))}
            {words.map((w, wi) => (
              <Fragment key={w}>
                {wi > 0 && ' '}
                {wi > 0 && wi === words.length - 1 && <br className="nm__br" />}
                <span className="nm__word">
                  {[...w].map((c, ci) => (
                    <span key={ci} className="nm__ch" data-ch={c} style={{ '--k': `${KERN[w.slice(ci, ci + 2)] ?? 0}em` } as CSSProperties}>
                      {c}
                    </span>
                  ))}
                </span>
              </Fragment>
            ))}
          </span>
        </h1>

        <p className="hero__title">
          {title.map((t, i) => (
            <Fragment key={t}>
              {i > 0 && <span className="hero__sep"> · </span>}
              <span className="hero__role">{t}</span>
            </Fragment>
          ))}
        </p>

        <div className="hero__brief">
          <p className="hero__label">
            <span>The brief</span>
            <span>Provided by Sai</span>
          </p>
          <p className="brief-text" data-hero-brief>
            <BriefSentence caret lines={brief.heroLines} />
          </p>
        </div>
      </div>

      <Dia w={W} h={H} className="lifecycle" wires={xs.slice(1).map((x, i) => ({ d: `M${xs[i] + 12} 30L${x - 12} 30`, step: i + 2 }))}>
        {stops.map((s, i) => (
          <At key={s} x={xs[i]} y={30} w={W} h={H} step={i + 1} anchor="center" className={`stop ${i === 0 ? 'is-on' : ''}`}>
            <span className="stop__dot" />
            <span className="stop__label">{s}</span>
          </At>
        ))}
      </Dia>

      <nav className="hero__rail" aria-label="Sections">
        <ol>
          {NAV_SECTIONS.slice(0, sections).map((s, i) => (
            <li key={s.id} className={i === 0 ? 'is-on' : undefined}>
              <a href={`#${s.id}`} aria-label={`${s.n} ${s.label}`} aria-current={i === 0 ? 'location' : undefined}>
                {s.n}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ul className="hero__stack hero__stack--l">
        {marks.left.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <ul className="hero__stack hero__stack--r">
        {marks.right.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <span className="hero__plus" aria-hidden="true" />
    </section>
  )
}
