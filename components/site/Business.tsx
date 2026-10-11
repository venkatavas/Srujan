import { ChartColumn, type LucideIcon, Settings, UserRound } from 'lucide-react'
import { valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { Outro, Rings, Stages } from './Chrome.tsx'
import { At, Dia, elbow, type Wire } from './Dia.tsx'
import { Lead, Tile } from './Tile.tsx'

const v = valueOf

/* ── 03 BUSINESS — the negotiation ─────────────────────────────────────────
   From the client's reference image: the requirement at the top, a vermilion connector down to
   the bus, neutral drops to the three people who read it, Operations lit as the conflict. A faint
   ring instrument sits behind, its axis carrying a vermilion point above the requirement and one
   below the panels.

   Diagram units: 1000 = the diagram column's width (35%→89% of the section in the image), so one
   unit is 0.1cqw. Heights were read off the 1672×941 image at the same scale (1% of its height ≈
   10.4 units): requirement 27–40%, bus 44.5%, drop dots 48.5%, panels 50–68%. */

const W = 1000
const H = 427
const REQ = { x: 500, top: 0, bottom: 135 }
const BUS = 182
const DROP = 224
const PANEL_TOP = 240
// Each panel's left edge (units) and where its drop lands, as drawn in the image.
const PANELS = [
  { x: 0, drop: 165 },
  { x: 332, drop: 500 },
  { x: 702, drop: 835 },
]
const ICON: Record<string, LucideIcon> = { client: UserRound, operations: Settings, finance: ChartColumn }

// The ring instrument (placed in business.css, .biz-rings): centred at x 370 units (55% of the
// section), its axis from −146 to 636 (13%→88% of the image height), so its square box is 782
// units. Radii and points are fractions of that box; the inner ring passes through both points,
// as the hero's inner ring meets its crossing.

export function Business() {
  const wires: Wire[] = [
    { d: `M${REQ.x} ${REQ.bottom}L${REQ.x} ${BUS}`, step: 2, accent: true },
    ...PANELS.map((p) => ({ d: elbow(REQ.x, BUS, p.drop, DROP, BUS), step: 3 })),
  ]
  const marks = v(site.home.marks.right) ?? []
  return (
    <Tile id="business" n="03" title="Business" caption={site.business.caption}>
      <div className="split biz">
        <div className="split__copy biz__copy">
          <Lead body={v(site.business.body)}>{v(site.business.headline)}</Lead>
          <a className="btn" href="#leadership">
            See the analysis <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="scroll-x biz__stage">
          <Dia w={W} h={H} className="biz-dia" wires={wires}>
            <Rings
              className="biz-rings"
              radii={[0.373, 0.5, 0.651]}
              dotted={[0.575]}
              points={[0.127, 0.873]}
            />
            <At x={REQ.x} y={REQ.top} w={W} h={H} anchor="center" valign="top" step={1} className="biz-req">
              <span className="biz-req__label">Requirement</span>
              <span className="biz-req__text">{site.business.requirement}</span>
            </At>
            <At x={REQ.x} y={BUS} w={W} h={H} anchor="center" step={2} className="biz-joint biz-joint--bus">
              <i />
            </At>
            {PANELS.map((p) => (
              <At key={p.drop} x={p.drop} y={DROP} w={W} h={H} anchor="center" step={3} className="biz-joint">
                <i />
              </At>
            ))}
            {site.business.people.map((p, i) => {
              const Icon = ICON[p.id]
              return (
                <At
                  key={p.id}
                  x={PANELS[i].x}
                  y={PANEL_TOP}
                  w={W}
                  h={H}
                  valign="top"
                  step={4}
                  className={`biz-panel biz-panel--${p.id} ${p.conflict ? 'is-conflict' : ''}`}
                >
                  {p.conflict && <span className="biz-panel__glow" data-step={6} aria-hidden="true" />}
                  <span className="biz-panel__head">
                    {Icon && <Icon aria-hidden="true" strokeWidth={1.5} />}
                    {p.label}
                  </span>
                  <ul>
                    {p.items.map(([sign, t]) => (
                      <li key={t}>
                        <span aria-hidden="true">{sign}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                  {p.conflict && (
                    <p className="biz-panel__conflict" data-step={5}>
                      <span>Conflict</span>
                      {p.conflict}
                    </p>
                  )}
                </At>
              )
            })}
          </Dia>
        </div>
        {marks.length > 0 && (
          <ul className="biz__marks" aria-hidden="true">
            {marks.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>
      <Stages active="Stakeholders" />
      <Outro lines={site.business.outro} />
    </Tile>
  )
}
