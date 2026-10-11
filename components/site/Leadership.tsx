import { ChartColumn, Laptop, UsersRound, type LucideIcon } from 'lucide-react'
import { valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { Outro, Rings, Stages } from './Chrome.tsx'
import { At, Dia } from './Dia.tsx'
import { Lead, Tile } from './Tile.tsx'

const v = valueOf

/* ── 04 LEADERSHIP — three perspectives, one decision ──────────────────── */

// The instrument is one square of S × S units (S = 1000), centred on the decision: the faint
// rings, the axis, the Venn and the decision point all share it, so they stay registered at
// any size. Fractions below were measured from the client's reference image (1672 × 941),
// where S spans 0.84 of the viewport height.
const S = 1000
const R = 190 // each perspective's circle
const meet = { x: 500, y: 500 } // the triple intersection: the decision
const circles: { x: number; y: number; label: { x: number; y: number }; icon: LucideIcon }[] = [
  { x: 355, y: 420, label: { x: 325, y: 392 }, icon: Laptop }, // Technology, top left
  { x: 645, y: 420, label: { x: 675, y: 392 }, icon: ChartColumn }, // Business, top right
  { x: 500, y: 660, label: { x: 500, y: 706 }, icon: UsersRound }, // People, below
]
// The axis runs top to bottom through the decision, broken where it would cross People's label.
const axis = ['M500 78L500 616', 'M500 794L500 912']

/** A full circle that starts (and so draws in) from the point facing the decision. */
function ring(cx: number, cy: number, r: number) {
  const a = Math.atan2(meet.y - cy, meet.x - cx)
  const [x1, y1] = [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  const [x2, y2] = [cx - r * Math.cos(a), cy - r * Math.sin(a)]
  const f = (n: number) => Math.round(n * 10) / 10
  return `M${f(x1)} ${f(y1)}A${r} ${r} 0 1 1 ${f(x2)} ${f(y2)}A${r} ${r} 0 1 1 ${f(x1)} ${f(y1)}`
}

// Faint dots resting on the outer ring (degrees, clockwise from three o'clock).
const specks = [204, 231, 313, 338, 22, 57, 121, 156].map((d) => ({
  x: 500 + 520 * Math.cos((d * Math.PI) / 180),
  y: 500 + 520 * Math.sin((d * Math.PI) / 180),
}))

export function Leadership() {
  const l = site.leadership
  const steps = [
    { n: '01', title: 'Inputs', items: l.inputs },
    { n: '02', title: 'Analysis', items: v(l.analysis) ?? [] },
    { n: '03', title: 'Decision', text: l.decision },
  ]
  return (
    <Tile id="leadership" n="04" title="Leadership" caption={l.caption}>
      <div className="split lship">
        <div className="split__copy">
          <Lead body={v(l.body)}>{v(l.headline)}</Lead>
          <a className="btn" href="#ventures">
            See the process <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="lship__board">
          <div className="lship__frame scroll-x">
            <div className="lship__crop">
              <div className="lship__stage">
                <div className="lship__instrument" data-step={0} aria-hidden="true">
                  <Rings className="lship__rings" radii={[0.52, 0.49]} dotted={[0.43]} points={[0.162]} />
                  <svg className="lship__specks" viewBox={`0 0 ${S} ${S}`}>
                    {specks.map((p, i) => (
                      <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.6" />
                    ))}
                  </svg>
                </div>

                <Dia w={S} h={S} className="lship__venn">
                  <svg className="lship__wires" viewBox={`0 0 ${S} ${S}`} preserveAspectRatio="none" aria-hidden="true">
                    {axis.map((d) => (
                      <path key={d} d={d} pathLength={1} data-step={1} className="lship__axis" />
                    ))}
                    <line x1="145" y1="500" x2="1040" y2="500" data-step={1} className="lship__level" />
                    {circles.map((c, i) => (
                      <path key={i} d={ring(c.x, c.y, R)} pathLength={1} data-step={2 + i} className="lship__circle" />
                    ))}
                  </svg>

                  {l.circles.map((c, i) => {
                    const { label, icon: Icon } = circles[i]
                    return (
                      <At key={c.label} x={label.x} y={label.y} w={S} h={S} anchor="center" step={3 + i} className="lship__view">
                        <Icon className="lship__icon" strokeWidth={1.25} aria-hidden="true" />
                        <p className="lship__label">{c.label}</p>
                        <ul>
                          {(v(c.items) ?? []).map((t) => (
                            <li key={t}>
                              <i aria-hidden="true">+</i>
                              {t}
                            </li>
                          ))}
                        </ul>
                      </At>
                    )
                  })}

                  {/* The decision itself: lit with the timeline's 03 (same step). */}
                  <At x={meet.x} y={meet.y} w={S} h={S} anchor="center" step={7} className="lship__decision">
                    {null}
                  </At>
                </Dia>
              </div>
            </div>
          </div>

          <ol className="lship__steps" aria-label="From inputs to a decision">
            {steps.map((s, i) => (
              <li key={s.n} className={`lship__step ${s.text ? 'is-decision' : ''}`} data-step={5 + i}>
                <i aria-hidden="true" />
                <p className="lship__step-h">
                  <span>{s.n}</span> {s.title}
                </p>
                {s.items ? (
                  <ul>
                    {s.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="lship__step-t">{s.text}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Stages active="Decision" />
      <Outro lines={l.outro} />
    </Tile>
  )
}
