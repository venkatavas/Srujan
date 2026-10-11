import { profile } from '@/content/profile.ts'
import { valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import type { CareerRole } from '@/content/site.ts'
import { Outro, Rings, Stages } from './Chrome.tsx'
import { At, Dia, type Wire } from './Dia.tsx'
import { Lead, Tile } from './Tile.tsx'

const v = valueOf

/* ── 06 EXPERIENCE — a career of expanding impact ─────────────────────────
   From the client's reference image (1672 × 941): copy at 5–30% of the section, the stage at
   34–96%. The stage is 1000 units wide (1cqw = 10 units): the timeline above (labels, dotted
   drops, the curve, its nodes) is a Dia of W × H units, and the role cards below sit in a grid
   of one column per role whose gaps are the same 20 units, so every node and drop lands on its
   column's left edge at any width. Groups start at their first role's column; the glowing node
   is the current role ("Present").
   Draw-in (motion/chapters/draw.ts): labels 1, drops 2, curve 3, nodes 4, cards 5–7 by group,
   the glowing node and its light streak 8. */

const W = 1000
const H = 220
const GAP = 20 // column gap, units (also .xp-roles column-gap: 2cqw)
const DROP_TOP = 50 // below the two label lines
// The curve's height at each group's node (units; reference: 49%, 45%, 47.6%, … of the height),
// and where the current role's node rides it, highest, before the curve runs off to the right.
const NODE_Y = [190, 155, 172, 145]
const NOW_Y = 103
const TAIL = { l: { x: -55, y: 214 }, r: { x: 1070, y: 76 } }
// (The light streak through the current node is 150 units tall, set in experience.css.)

type Pt = { x: number; y: number }
const f = (n: number) => Math.round(n * 10) / 10

/** A smooth curve through points ordered by x (cubic Hermite, tangents from the neighbours). */
function smooth(p: Pt[]) {
  const m = p.map((_, i) => {
    const a = p[Math.max(0, i - 1)]
    const b = p[Math.min(p.length - 1, i + 1)]
    return (b.y - a.y) / (b.x - a.x)
  })
  let d = `M${f(p[0].x)} ${f(p[0].y)}`
  for (let i = 0; i < p.length - 1; i++) {
    const dx = (p[i + 1].x - p[i].x) / 3
    d += `C${f(p[i].x + dx)} ${f(p[i].y + m[i] * dx)} ${f(p[i + 1].x - dx)} ${f(p[i + 1].y - m[i + 1] * dx)} ${f(p[i + 1].x)} ${f(p[i + 1].y)}`
  }
  return d
}

const when = (r: CareerRole) => [r.from, r.to].filter(Boolean).join(' – ')
const noteOf = (r: CareerRole) => {
  if (r.note) return r.note
  const n = site.experience.notes[r.title]
  return n ? v(n) : undefined
}

export function Experience() {
  const x = site.experience
  const groups = x.career.status === 'verified' ? x.career.value : []
  const verbs = (v(x.verbs) ?? '').split(' · ')
  const resume = v(profile.linkedin)

  // One column per role; each group starts at its first role's column.
  const cols = groups.reduce((n, g) => n + g.roles.length, 0)
  const colX = (i: number) => (i * (W + GAP)) / Math.max(1, cols)
  const starts = groups.map((_, gi) => groups.slice(0, gi).reduce((n, g) => n + g.roles.length, 0))
  const nodes = starts.map((c, gi) => ({ x: colX(c), y: NODE_Y[gi] ?? NODE_Y[NODE_Y.length - 1] }))
  // The current role, if one is open-ended: lit at the top of the curve.
  const flat = groups.flatMap((g) => g.roles)
  const nowAt = flat.findIndex((r) => r.to === 'Present')
  const now = nowAt > 0 ? { x: colX(nowAt), y: NOW_Y } : undefined

  const wires: Wire[] = [{ d: smooth([TAIL.l, ...nodes, ...(now ? [now] : []), TAIL.r]), step: 3 }]
  const step = (gi: number) => 5 + Math.min(2, Math.round((gi * 2) / Math.max(1, groups.length - 1)))

  return (
    <Tile id="experience" n="06" title="Experience" caption={x.caption}>
      <Rings className="xp-rings" radii={[0.5, 0.41, 0.31]} dotted={[0.455]} />
      <span className="xp-cross xp-cross--a" aria-hidden="true" />
      <span className="xp-cross xp-cross--b" aria-hidden="true" />

      <div className="split xp">
        <div className="split__copy xp__copy">
          <Lead body={v(x.body)}>{v(x.headline)}</Lead>
          {resume ? (
            <a className="btn" href={resume} target="_blank" rel="noopener noreferrer">
              View resume <span aria-hidden="true">→</span>
            </a>
          ) : (
            <a className="btn" role="link" aria-disabled="true" title="Resume link coming soon">
              View resume <span aria-hidden="true">→</span>
            </a>
          )}
        </div>

        <div className="xp-stage">
          {now && <span className="xp-meridian" style={{ left: `${(now.x / W) * 100}%` }} aria-hidden="true" />}

          <Dia w={W} h={H} className="xp-dia" wires={wires}>
            <svg className="xp-drops" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="xp-curve-fade" gradientUnits="userSpaceOnUse" x1={TAIL.l.x} y1="0" x2={TAIL.r.x} y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.07" stopColor="#fff" stopOpacity="0.22" />
                  <stop offset="0.14" stopColor="#fff" stopOpacity="0.36" />
                  <stop offset="0.84" stopColor="#fff" stopOpacity="0.36" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {nodes.map((n) => (
                <line key={n.x} x1={n.x} y1={DROP_TOP} x2={n.x} y2={n.y - 9} data-step={2} />
              ))}
            </svg>

            {nodes.map((n, gi) => (
              <At key={`l${n.x}`} x={n.x} y={0} w={W} h={H} valign="top" step={1} className="xp-label" as="p">
                <span aria-hidden="true">{String(gi + 1).padStart(2, '0')}</span>
                <span aria-hidden="true">{verbs[gi]}</span>
              </At>
            ))}
            {nodes.map((n) => (
              <At key={`n${n.x}`} x={n.x} y={n.y} w={W} h={H} anchor="center" step={4} className="xp-node">
                {null}
              </At>
            ))}
            {now && (
              <>
                <At x={now.x} y={now.y} w={W} h={H} anchor="center" step={8} className="xp-streak">
                  {null}
                </At>
                <At x={now.x} y={now.y} w={W} h={H} anchor="center" step={8} className="xp-node xp-node--now">
                  {null}
                </At>
              </>
            )}
          </Dia>

          <ol className="xp-roles" style={{ '--cols': cols } as React.CSSProperties}>
            {groups.map((g, gi) => (
              <li key={gi} className="xp-group" style={{ '--span': g.roles.length } as React.CSSProperties}>
                <h3 className="xp-group__h">
                  <span>{String(gi + 1).padStart(2, '0')}</span> {verbs[gi]}
                </h3>
                <ol className="xp-group__roles">
                  {g.roles.map((r) => {
                    const note = noteOf(r)
                    return (
                      <li
                        key={r.title + r.org}
                        className={`xp-role ${r.to === 'Present' ? 'is-now' : ''}`}
                        data-step={step(gi)}
                      >
                        <p className="xp-role__when">{when(r)}</p>
                        <h4 className="xp-role__title">{r.title}</h4>
                        <p className="xp-role__org">{r.org}</p>
                        {r.place && <p className="xp-role__place">{r.place}</p>}
                        <i className="xp-role__rule" aria-hidden="true" />
                        {note && <p className="xp-role__note">{note}</p>}
                      </li>
                    )
                  })}
                </ol>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Stages active="Experience" extra={['Experience']} />
      <Outro lines={x.outro} />
    </Tile>
  )
}
