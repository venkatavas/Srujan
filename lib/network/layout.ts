// Deterministic layered layout for the lineage: PERSON → ROLES → COMPANIES → INDUSTRIES.
// Fixed strata, equal spacing, barycentric ordering, octilinear edges.

import { octiRoute } from '../paths.ts'

export type LNode = { id: string; layer: 0 | 1 | 2 | 3; x: number; y: number }
export type LEdge = { id: string; from: string; to: string; d: string; depth: 1 | 2 | 3 }

export type LayoutInput = {
  roles: string[] // in preferred order
  orgs: { id: string; role: string; industry: string }[]
  industries: string[]
}

export const VIEW = { w: 1000, h: 620, left: 150, right: 800 } as const
export const STRATA = [62, 222, 382, 542] as const

export function layoutLineage(input: LayoutInput) {
  const roleIndex = new Map(input.roles.map((r, i) => [r, i]))
  const orgs = [...input.orgs].sort((a, b) => (roleIndex.get(a.role) ?? 0) - (roleIndex.get(b.role) ?? 0))
  // Few companies keep label room on the right; many companies widen the chart to keep spacing ≥ 70.
  const span = Math.min(VIEW.w - 30 - VIEW.left, Math.max(VIEW.right - VIEW.left, (orgs.length - 1) * 70))
  const slot = (i: number, n: number) => VIEW.left + (n === 1 ? span / 2 : (i * span) / (n - 1))

  const nodes = new Map<string, LNode>()
  orgs.forEach((o, i) => nodes.set(o.id, { id: o.id, layer: 2, x: slot(i, orgs.length), y: STRATA[2] }))

  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length
  for (const r of input.roles) {
    const xs = orgs.filter((o) => o.role === r).map((o) => nodes.get(o.id)!.x)
    if (xs.length) nodes.set(r, { id: r, layer: 1, x: mean(xs), y: STRATA[1] })
  }
  for (const ind of input.industries) {
    const xs = orgs.filter((o) => o.industry === ind).map((o) => nodes.get(o.id)!.x)
    if (xs.length) nodes.set(ind, { id: ind, layer: 3, x: mean(xs), y: STRATA[3] })
  }
  const roleXs = input.roles.filter((r) => nodes.has(r)).map((r) => nodes.get(r)!.x)
  nodes.set('person', { id: 'person', layer: 0, x: mean(roleXs), y: STRATA[0] })

  const edges: LEdge[] = []
  const link = (from: string, to: string, depth: 1 | 2 | 3) => {
    const a = nodes.get(from)
    const b = nodes.get(to)
    if (!a || !b) return
    edges.push({ id: `${from}>${to}`, from, to, depth, d: octiRoute(a.x, a.y, b.x, b.y) })
  }
  for (const r of input.roles) link('person', r, 1)
  for (const o of orgs) link(o.role, o.id, 2)
  for (const o of orgs) link(o.id, o.industry, 3)

  return { nodes: [...nodes.values()], edges }
}

/** Every edge on the path person → role → org → industry that passes through `id`. */
export function lineageOf(id: string, input: LayoutInput): Set<string> {
  const out = new Set<string>()
  const add = (o: LayoutInput['orgs'][number]) => {
    out.add(`person>${o.role}`)
    out.add(`${o.role}>${o.id}`)
    out.add(`${o.id}>${o.industry}`)
  }
  for (const o of input.orgs) if (o.id === id || o.role === id || o.industry === id || id === 'person') add(o)
  return out
}
