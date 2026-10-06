'use client'

import { useMemo, useState } from 'react'
import { lineageOf, STRATA, VIEW, type LayoutInput, type LEdge, type LNode } from '@/lib/network/layout.ts'

type Text = { value?: string; pending?: string }
export type NodeView = LNode & { kind: 'person' | 'role' | 'venture' | 'career' | 'industry'; label: Text }
export type Detail = {
  title: Text
  rows: ({ k: string } & Text)[]
  note?: string
  sources?: { label: string; url?: string }[]
  members?: string[]
}

const STRATA_LABELS = ['Person', 'Roles', 'Companies', 'Industries']
const px = (v: number, of: number) => `${(v / of) * 100}%`
const show = (t: Text) => t.value ?? t.pending ?? ''

export function Lineage({
  nodes,
  edges,
  input,
  details,
}: {
  nodes: NodeView[]
  edges: LEdge[]
  input: LayoutInput
  details: Record<string, Detail>
}) {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const active = hover ?? pinned
  const activeNode = nodes.find((n) => n.id === active)
  const dir = activeNode?.kind === 'industry' ? 'up' : 'down'

  const lit = useMemo(() => (active ? lineageOf(active, input) : new Set<string>()), [active, input])
  const litNodes = useMemo(() => {
    const s = new Set<string>()
    edges.forEach((e) => lit.has(e.id) && (s.add(e.from), s.add(e.to)))
    return s
  }, [lit, edges])

  const detail = active ? details[active] : null

  return (
    <div className={`lin ${active ? 'has-active' : ''}`} data-dir={dir}>
      <div className="lin__scroll">
        <div className="lin__chart">
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden="true">
            <g className="lin__edges">
              {edges.map((e) => (
                <path key={e.id} d={e.d} pathLength={1} data-depth={e.depth} className="lin__edge" />
              ))}
            </g>
            <g className="lin__hls">
              {edges.map((e) => (
                <path
                  key={e.id}
                  d={e.d}
                  pathLength={1}
                  className={`lin__hl ${lit.has(e.id) ? 'is-on' : ''}`}
                  style={{ transitionDelay: lit.has(e.id) ? `${(dir === 'down' ? e.depth - 1 : 3 - e.depth) * 110}ms` : '0ms' }}
                />
              ))}
            </g>
          </svg>

          {STRATA.map((y, i) => (
            <span key={y} className="lin__stratum" style={{ top: px(y, VIEW.h) }}>
              {STRATA_LABELS[i]}
            </span>
          ))}

          <ul className="lin__nodes">
            {nodes.map((n) => (
              <li
                key={n.id}
                className={`lin__node lin__node--${n.kind} ${n.label.pending ? 'is-pending' : ''} ${
                  active && !litNodes.has(n.id) && n.id !== active ? 'is-dim' : ''
                } ${n.id === active ? 'is-active' : ''}`}
                data-node={n.id}
                data-layer={n.layer}
                style={{ left: px(n.x, VIEW.w), top: px(n.y, VIEW.h) }}
              >
                <button
                  type="button"
                  aria-pressed={pinned === n.id}
                  aria-describedby={`lin-d-${n.id}`}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(n.id)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
                  onFocus={() => setHover(n.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => setPinned((p) => (p === n.id ? null : n.id))}
                >
                  <span className="lin__dot" aria-hidden="true" />
                  <span className="lin__label">{show(n.label)}</span>
                </button>
                <span id={`lin-d-${n.id}`} className="sr-only">
                  {describe(details[n.id])}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Small screens: the same lineage read vertically — ventures first, tap to expand. */}
      <ol className="lin__list">
        <li className="lin__list-person">
          <span className="lin__dot" aria-hidden="true" />
          {show(nodes.find((n) => n.id === 'person')!.label)}
        </li>
        {orgOrder(nodes).map((n) => {
          const org = input.orgs.find((o) => o.id === n.id)!
          const role = nodes.find((x) => x.id === org.role)
          const ind = nodes.find((x) => x.id === org.industry)
          const d = details[n.id]
          const open = pinned === n.id
          return (
            <li key={n.id} className={`lin__item lin__item--${n.kind} ${open ? 'is-open' : ''}`}>
              <button type="button" aria-expanded={open} onClick={() => setPinned(open ? null : n.id)}>
                <span className={`lin__item-name ${n.label.pending ? 'is-pending' : ''}`}>{show(n.label)}</span>
                <span className="lin__item-path">
                  {[role && show(role.label), ind && show(ind.label)].filter(Boolean).join(' / ')}
                </span>
              </button>
              {open && d && (
                <dl className="lin__rows">
                  {d.rows.map((r) => (
                    <div key={r.k}>
                      <dt>{r.k}</dt>
                      <dd className={r.pending ? 'is-pending' : ''}>{r.value ?? `Content required — ${r.pending}`}</dd>
                    </div>
                  ))}
                  {d.note && (
                    <div>
                      <dt>Note</dt>
                      <dd>{d.note}</dd>
                    </div>
                  )}
                  {d.sources && d.sources.length > 0 && (
                    <div>
                      <dt>Source</dt>
                      <dd className="lin__sources">
                        {d.sources.map((s, i) => (
                          <span key={s.label}>
                            {i > 0 && '; '}
                            <a href={s.url} target="_blank" rel="noopener noreferrer">
                              {s.label}
                            </a>
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </li>
          )
        })}
      </ol>

      <aside className="lin__read" aria-hidden="true">
        {detail ? (
          <>
            <p className={`lin__title ${detail.title.pending ? 'is-pending' : ''}`}>{show(detail.title)}</p>
            {detail.rows.length > 0 && (
              <dl className="lin__rows">
                {detail.rows.map((r) => (
                  <div key={r.k}>
                    <dt>{r.k}</dt>
                    <dd className={r.pending ? 'is-pending' : ''}>{r.value ?? `Content required — ${r.pending}`}</dd>
                  </div>
                ))}
              </dl>
            )}
            {detail.members && <p className="lin__members">{detail.members.join(', ')}</p>}
            {detail.note && <p className="lin__note">{detail.note}</p>}
            {detail.sources && detail.sources.length > 0 && (
              <p className="lin__sources">
                Source{detail.sources.length > 1 ? 's' : ''}: {detail.sources.map((s) => s.label).join('; ')}
              </p>
            )}
          </>
        ) : (
          <>
            <h2 id="ventures-h" className="lin__heading">
              Ventures and the organisations around them
            </h2>
            <p className="lin__hint">Select any name to trace how it connects.</p>
          </>
        )}
      </aside>
      {detail && (
        <h2 id="ventures-h" className="sr-only">
          Ventures and the organisations around them
        </h2>
      )}
    </div>
  )
}

const orgOrder = (nodes: NodeView[]) =>
  nodes
    .filter((n) => n.kind === 'venture' || n.kind === 'career')
    .sort((a, b) => (a.kind === b.kind ? a.x - b.x : a.kind === 'venture' ? -1 : 1))

function describe(d?: Detail) {
  if (!d) return ''
  const parts = d.rows.filter((r) => r.value).map((r) => `${r.k}: ${r.value}.`)
  if (d.members?.length) parts.push(`Connected: ${d.members.join(', ')}.`)
  if (d.note) parts.push(d.note)
  return parts.join(' ')
}
