import { ArrowUpRight } from 'lucide-react'
import { Fragment } from 'react'
import { valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { Outro, Stages } from './Chrome.tsx'
import { At, curve, Dia, type Wire } from './Dia.tsx'
import { Lead, Tile } from './Tile.tsx'

const v = valueOf

/* ── 05 VENTURES — the assembly ───────────────────────────────────────────
   From the client's reference image: four inputs wire into one PRODUCT, which wires out to the
   company cards. The stage (the diagram plus the cards column) spans 35.5–95% of the section;
   its units are 1000 wide × 440 tall, the diagram taking the first 692 and the cards the last
   308, so every wire meets its dot at any width. Draw-in order (motion/chapters/draw.ts):
   inputs and dots 1, curves in 2, PRODUCT 3, curves out 4, cards 5, light streaks 6. */

const W = 692
const H = 440
// Input title lines; the dot on each title line; where the curves meet PRODUCT.
const INPUT_Y = [14, 128, 241, 355]
const DOT_X = 143
const P = { l: 345, r: 512, cx: 428.5, t: 175, cy: 208 }
// The grey dot above PRODUCT, joined to its top edge by a neutral line.
const MAST = 24
// Card tops in stage units (also in ventures.css as %), the title line 25 units below each top.
const CARD_TOP = [14, 155, 296]
const CARD_DOT = { x: 684, dy: 25 }

/** A "A · B · C" line that wraps only between its parts, never inside one. */
function Parts({ text }: { text: string }) {
  const parts = text.split(' · ')
  return parts.map((t, i) => (
    <Fragment key={t}>
      <span className="vx-nw">{t}</span>
      {i < parts.length - 1 && ' · '}
    </Fragment>
  ))
}

type Card = { id: string; title: string; lines: { text: string; tone: 'role' | 'mute' }[]; href?: string; label?: string }

export function Ventures() {
  const inputs = v(site.ventures.inputs) ?? []
  const up = v(site.ventures.upcoming)
  const cards: Card[] = [
    ...site.ventures.companies.map((co) => {
      const role = v(co.role)
      const line = v(co.line)
      return {
        id: co.id,
        title: co.name,
        lines: [
          ...(role ? [{ text: role, tone: 'role' as const }] : []),
          ...(line ? [{ text: line, tone: 'mute' as const }] : []),
        ],
        href: co.line.status === 'verified' ? co.line.source.url : undefined,
        label: `${co.name} — public record`,
      }
    }),
    // Draft copy from the reference image (Sai to approve); absent, the card is not drawn.
    ...(up
      ? [
          {
            id: 'upcoming',
            title: up.title,
            lines: [
              { text: up.line, tone: 'mute' as const },
              { text: up.sectors, tone: 'role' as const },
            ],
          },
        ]
      : []),
  ].slice(0, CARD_TOP.length)

  const ys = INPUT_Y.slice(0, inputs.length)
  const cardY = cards.map((_, i) => CARD_TOP[i] + CARD_DOT.dy)
  const wires: Wire[] = [
    ...ys.map((y) => ({ d: curve(DOT_X, y, P.l, P.cy), step: 2, accent: true })),
    { d: `M${P.cx} ${MAST + 4}V${P.t}`, step: 3 },
    ...cardY.map((y) => ({ d: curve(P.r, P.cy, CARD_DOT.x, y), step: 4, accent: true })),
  ]

  return (
    <Tile id="ventures" n="05" title="Ventures" caption={site.ventures.caption}>
      <span className="vx-streak vx-streak--top" aria-hidden="true" data-step={6} />
      <span className="vx-streak vx-streak--bottom" aria-hidden="true" data-step={6} />

      <div className="vx">
        <div className="vx__copy split__copy">
          <Lead body={v(site.ventures.body)}>{v(site.ventures.headline)}</Lead>
          <a className="btn" href="#ventures-companies">
            See the portfolio <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="vx-stage">
          <div className="scroll-x vx-scroll">
            <Dia w={W} h={H} className="vx-dia" wires={wires}>
              {inputs.map((g, i) => (
                <At key={g.label} x={0} y={ys[i]} w={W} h={H} valign="top" step={1} className="vx-in">
                  <span className="vx-in__t">{g.label}</span>
                  {g.lines.map((l) => (
                    <span key={l} className="vx-in__l">
                      {l}
                    </span>
                  ))}
                </At>
              ))}
              {ys.map((y) => (
                <At key={`d${y}`} x={DOT_X} y={y} w={W} h={H} anchor="center" step={1} className="vx-pt">
                  {null}
                </At>
              ))}

              <At x={P.cx} y={MAST} w={W} h={H} anchor="center" step={3} className="vx-pt vx-pt--grey">
                {null}
              </At>
              <At x={P.cx} y={P.cy} w={W} h={H} anchor="center" step={3} className="vx-product">
                Product
              </At>
              <At x={P.cx} y={P.t} w={W} h={H} anchor="center" step={3} className="vx-pt vx-pt--glow">
                {null}
              </At>

              {cardY.map((y) => (
                <At key={`c${y}`} x={CARD_DOT.x} y={y} w={W} h={H} anchor="center" step={4} className="vx-pt">
                  {null}
                </At>
              ))}
            </Dia>
          </div>

          <ul id="ventures-companies" className="vx-cards" aria-label="Companies">
            {cards.map((c) => (
              <li key={c.id} className={`vx-card vx-card--${c.id}`} data-step={5}>
                <h3 className="vx-card__t">{c.title}</h3>
                {c.href ? (
                  <a className="vx-card__go" href={c.href} target="_blank" rel="noopener noreferrer" aria-label={c.label}>
                    <ArrowUpRight aria-hidden="true" strokeWidth={1.25} absoluteStrokeWidth />
                  </a>
                ) : (
                  <span className="vx-card__go" aria-hidden="true">
                    <ArrowUpRight strokeWidth={1.25} absoluteStrokeWidth />
                  </span>
                )}
                {c.lines.map((l) => (
                  <p key={l.text} className={`vx-card__${l.tone}`}>
                    <Parts text={l.text} />
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Stages active="Decision" />
      <Outro lines={site.ventures.outro} />
    </Tile>
  )
}
