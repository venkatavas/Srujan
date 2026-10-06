import { industries, organisations, roles, type Organisation } from '@/content/organisations.ts'
import { profile } from '@/content/profile.ts'
import { SHOW_PENDING, type Fact, type Source, valueOf } from '@/content/schema.ts'
import { horizonY } from '@/lib/paths.ts'
import { layoutLineage, type LayoutInput } from '@/lib/network/layout.ts'
import { Lineage, type Detail, type NodeView } from './Lineage.tsx'
import { REF, Section } from './Section.tsx'

const shown = (f: Fact<unknown>) => f.status !== 'pending' || SHOW_PENDING
const text = (f: Fact<string>) => (f.status === 'pending' ? { pending: f.note } : { value: f.value })

export function Ventures() {
  const { W, H } = REF
  const hz = horizonY(H)
  const orgs = organisations.filter((o) => shown(o.name))
  const inds = industries.filter((i) => shown(i.label))
  const input: LayoutInput = {
    roles: roles.map((r) => r.id),
    orgs: orgs.map((o) => ({ id: o.id, role: o.role, industry: o.industry })),
    industries: inds.map((i) => i.id),
  }
  const { nodes, edges } = layoutLineage(input)
  const name = valueOf(profile.name) ?? ''

  const views: NodeView[] = nodes.map((n) => {
    if (n.id === 'person') return { ...n, kind: 'person', label: { value: name } }
    const org = orgs.find((o) => o.id === n.id)
    if (org) return { ...n, kind: org.kind, label: text(org.name) }
    const role = roles.find((r) => r.id === n.id)
    if (role) return { ...n, kind: 'role', label: text(role.label) }
    const ind = inds.find((i) => i.id === n.id)!
    return { ...n, kind: 'industry', label: text(ind.label) }
  })

  const details: Record<string, Detail> = {}
  const orgDetail = (o: Organisation): Detail => ({
    title: text(o.name),
    rows: (
      [
        ['Sector', o.sector],
        ['HQ', o.hq],
        ['Capacity', o.title],
        ['Relationship', o.relationship],
        ['Period', o.period],
      ] as const
    )
      .filter(([, f]) => shown(f))
      .map(([k, f]) => ({ k, ...text(f) })),
    note: o.note && valueOf(o.note),
    sources: o.sources.filter((s: Source) => s.url),
  })
  for (const o of orgs) details[o.id] = orgDetail(o)
  const list = (ids: Organisation[]) => ids.map((o) => (o.name.status === 'pending' ? `(${o.name.note})` : o.name.value))
  for (const r of roles)
    details[r.id] = { title: text(r.label), rows: [], members: list(orgs.filter((o) => o.role === r.id)) }
  for (const i of inds)
    details[i.id] = { title: text(i.label), rows: [], members: list(orgs.filter((o) => o.industry === i.id)) }
  details.person = { title: { value: name }, rows: [], members: list(orgs) }

  return (
    <Section id="ventures" labelledBy="ventures-h">
      <svg className="art m-only ventures__horizon" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="line" d={`M0 ${hz}L${W} ${hz}`} />
      </svg>
      <span className="point ventures__point m-only" aria-hidden="true" />
      <Lineage nodes={views} edges={edges} input={input} details={details} />
    </Section>
  )
}
