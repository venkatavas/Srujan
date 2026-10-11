// Shared section chrome from the client's reference images: the journey row (Brief → Decision)
// with the section's own stop lit, the closing line at the bottom right, and the faint ring
// instrument drawn behind a section's diagram.

import { type Fact, valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'

type Stage = (typeof site.home.lifecycle)[number] | 'Experience' | 'Education' | 'Contact'

/**
 * The journey row; `active` is lit vermilion. Later sections extend it: `extra` stops are added
 * after the lifecycle (Brief → Decision), e.g. ['Experience', 'Education'].
 */
export function Stages({ active, extra = [] }: { active: Stage; extra?: Stage[] }) {
  const stops: Stage[] = [...site.home.lifecycle, ...extra]
  const at = stops.indexOf(active)
  return (
    <ol
      className="stages"
      aria-label="Where this sits in the journey"
      data-step={1}
      style={{ '--n': stops.length } as React.CSSProperties}
    >
      {stops.map((s, i) => (
        <li key={s} className={`stages__stop ${i === at ? 'is-on' : ''}`} aria-current={i === at ? 'step' : undefined}>
          <i aria-hidden="true" />
          <span>{s}</span>
        </li>
      ))}
    </ol>
  )
}

/** Two short lines after a vermilion rule, bottom right. */
export function Outro({ lines }: { lines: Fact<string[]> }) {
  const l = valueOf(lines)
  if (!l) return null
  return (
    <p className="outro" data-step={2}>
      <i aria-hidden="true" />
      <span>
        {l.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </span>
    </p>
  )
}

/**
 * Faint concentric rings with a vertical axis, in a square box the caller positions.
 * `points` are vermilion points on the axis, as fractions of the box height (0 = top).
 */
export function Rings({
  radii = [0.5, 0.4, 0.3],
  dotted = [],
  points = [],
  className,
}: {
  radii?: number[]
  dotted?: number[]
  points?: number[]
  className?: string
}) {
  return (
    <div className={`rings ${className ?? ''}`} aria-hidden="true">
      <svg viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid meet">
        {radii.map((r) => (
          <circle key={`r${r}`} cx="0" cy="0" r={r * 1000} className="rings__ring" />
        ))}
        {dotted.map((r) => (
          <circle key={`d${r}`} cx="0" cy="0" r={r * 1000} className="rings__ring rings__ring--dot" />
        ))}
        <line x1="0" y1="-500" x2="0" y2="500" className="rings__axis" />
      </svg>
      {points.map((p) => (
        <span key={p} className="rings__pt" style={{ top: `${p * 100}%` }} />
      ))}
    </div>
  )
}
