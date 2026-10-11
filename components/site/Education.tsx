import { GraduationCap } from 'lucide-react'
import { Fragment } from 'react'
import { profile } from '@/content/profile.ts'
import { valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { Outro, Rings, Stages } from './Chrome.tsx'
import { Dia, type Wire } from './Dia.tsx'
import { Lead, Tile } from './Tile.tsx'

const v = valueOf

/* ── 07 EDUCATION — the foundation ─────────────────────────────────────────
   From the client's reference image (1672 × 941): copy at the left, the two qualifications as
   cards on a vertical axis at the centre (latest on top), and what each one added as a "+" list
   at the right, joined to its card by a bracket. Faint rings sit behind the axis.

   The plate (education.css, .edu__plate) is the reference image itself at any 16:9-ish size:
   W × H units are the image's pixels, so every measurement below is read straight off it.
   1 unit = 100cqw / 1672 (--px in education.css). */

const W = 1672
const H = 941
const AXIS = { x: 841, top: 151, bottom: 781 } // x 50.3%, y 16% → 83%
const CENTRE = 488 // the rings' centre and the point between the cards (≈52%)
const TICKS = [151, 203, 739, 781] // small neutral dots on the axis, clear of the cards
const OUTER = 376 // outer ring radius (0.4 of the height); the inner ring meets the top point
// Faint vermilion crosses (x, y), as placed in the image.
const CROSSES = [
  [485, 743],
  [1567, 306],
  [1517, 630],
]

/** A point on the plate, in image units. */
const pos = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` })

// Display titles: the short forms the image uses. The facts stay as given in profile.ts.
const SHORT: Record<string, string> = {
  'Master of Business Administration': 'MBA',
  'B.Tech, Computer Science Engineering': 'B.Tech CSE',
}

/** "A · B · C": wraps only between its parts, never inside one. */
function Parts({ text }: { text: string }) {
  const parts = text.split(' · ')
  return parts.map((t, i) => (
    <Fragment key={t}>
      <span className="edu-nw">{t}</span>
      {i < parts.length - 1 && ' · '}
    </Fragment>
  ))
}

export function Education() {
  const e = site.education
  const list = profile.education.status === 'verified' ? profile.education.value : []
  const tags = v(e.tags) ?? []
  // Latest first, as drawn (MBA above B.Tech). Tags are keyed by profile order, the layers by
  // display order; the layer's number is the qualification's place in time (01 = B.Tech).
  const rows = list
    .map((q, i) => ({ q, n: String(i + 1).padStart(2, '0'), tags: tags[i] }))
    .sort((a, b) => b.q.to - a.q.to)
    .slice(0, 2)
    .map((r, k) => ({ ...r, layer: e.layers[k] }))

  const resume = v(profile.linkedin)
  const wires: Wire[] = [{ d: `M${AXIS.x} ${AXIS.top}V${AXIS.bottom}`, step: 1 }]
  // Draw-in (motion/chapters/draw.ts): rings and axis 1, top point 2, then per card: card,
  // bracket, list; the point between the cards lights after the first.
  const steps = [
    { card: 3, bracket: 4, list: 5 },
    { card: 7, bracket: 8, list: 9 },
  ]

  return (
    <Tile id="education" n="07" title="Education" caption={e.caption}>
      <div className="split edu">
        <div className="split__copy edu__copy">
          <Lead body={v(e.body)}>{v(e.headline)}</Lead>
          {resume ? (
            <a className="btn" href={resume} target="_blank" rel="noopener noreferrer">
              Download resume <span aria-hidden="true">→</span>
            </a>
          ) : (
            // LinkedIn is pending: the button is shown but inactive, never a placeholder link.
            <a className="btn" role="link" aria-disabled="true" title="Resume link coming soon">
              Download resume <span aria-hidden="true">→</span>
            </a>
          )}
        </div>

        <div className="edu__board">
          <div className="edu__plate">
            <Dia w={W} h={H} className="edu-dia" wires={wires}>
              <div className="edu-rings" data-step={1} aria-hidden="true">
                <Rings radii={[0.5, (CENTRE - 254) / (2 * OUTER)]} />
              </div>
              {TICKS.map((y) => (
                <i key={y} className="edu-tick" data-step={1} aria-hidden="true" style={pos(AXIS.x, y)} />
              ))}
              {CROSSES.map(([x, y]) => (
                <i key={`${x}`} className="edu-cross" data-step={1} aria-hidden="true" style={pos(x, y)} />
              ))}
            </Dia>

            <i className="edu-pt" data-step={2} aria-hidden="true" />
            <i className="edu-pt edu-pt--mid" data-step={6} aria-hidden="true" />

            <ol className="edu__quals" aria-label="Qualifications">
              {rows.map(({ q, n, tags: t, layer }, k) => (
                <li key={q.qualification} className={`edu-qual edu-qual--${k === 0 ? 'top' : 'bottom'}`}>
                  <article className="edu-card" data-step={steps[k].card}>
                    <GraduationCap className="edu-card__icon" strokeWidth={1.25} aria-hidden="true" />
                    <h3 className="edu-card__t">
                      {SHORT[q.qualification] ? <abbr title={q.qualification}>{SHORT[q.qualification]}</abbr> : q.qualification}
                    </h3>
                    <p className="edu-card__inst">{q.institution}</p>
                    <p className="edu-card__years">
                      {q.from} – {q.to}
                    </p>
                    {t && (
                      <p className="edu-card__tags">
                        <Parts text={t} />
                      </p>
                    )}
                  </article>
                  {layer && (
                    <div className="edu-layer" data-step={steps[k].bracket}>
                      <div className="edu-layer__body" data-step={steps[k].list}>
                        <p className="edu-layer__h">
                          <span>{n}</span> {layer.label}
                        </p>
                        <ul>
                          {(v(layer.items) ?? []).map((it) => (
                            <li key={it}>
                              <i aria-hidden="true">+</i>
                              {it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <Stages active="Education" extra={['Experience', 'Education']} />
      <Outro lines={e.outro} />
    </Tile>
  )
}
