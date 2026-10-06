import { type Fact, type Source, SRC, pending, verified } from './schema.ts'

// The lineage: PERSON → ROLES → COMPANIES → INDUSTRIES.
// There are deliberately no fields for amounts, valuations, counts or exits.

export type Role = { id: string; label: Fact<string> }
export type Industry = { id: string; label: Fact<string> }
export type Organisation = {
  id: string
  name: Fact<string>
  kind: 'venture' | 'career'
  role: string // Role id
  industry: string // Industry id
  title: Fact<string>
  relationship: Fact<string>
  period: Fact<string>
  sector: Fact<string>
  hq: Fact<string>
  note?: Fact<string>
  sources: Source[]
}

export const roles: Role[] = [
  { id: 'engineering', label: verified('Software engineering', SRC.brief) },
  { id: 'marketing', label: verified('Marketing', SRC.brief) },
  { id: 'venture', label: verified('Venture & advisory', SRC.brief) },
]

export const industries: Industry[] = [
  { id: 'enterprise', label: verified('Enterprise technology', SRC.brief) },
  { id: 'media', label: verified('Media', SRC.brief) },
  { id: 'floryn-sector', label: pending('Floryn Health sector', true) },
  { id: 'social-commerce', label: verified('Social commerce', SRC.playFeedec) },
]

export const organisations: Organisation[] = [
  {
    id: 'engineering-employer',
    name: pending('Engineering employer(s)', true),
    kind: 'career',
    role: 'engineering',
    industry: 'enterprise',
    title: pending('Title'),
    relationship: pending('Employment'),
    period: pending('Period'),
    sector: verified('Enterprise technology', SRC.brief),
    hq: pending('Location'),
    sources: [],
  },
  {
    id: 'times-of-india',
    name: verified('Times of India', SRC.brief),
    kind: 'career',
    role: 'marketing',
    industry: 'media',
    title: verified('Marketing Lead', SRC.brief),
    relationship: verified('Role', SRC.brief),
    period: verified('2021', SRC.brief),
    sector: verified('Media', SRC.brief),
    hq: pending('Location of role'),
    sources: [SRC.brief],
  },
  {
    id: 'floryn-health',
    name: verified('Floryn Health', SRC.brief),
    kind: 'venture',
    role: 'venture',
    industry: 'floryn-sector',
    title: pending('Title / capacity'),
    relationship: pending('Nature of association — advisor, investor, board or founder', true),
    period: pending('Period', true),
    sector: pending('Sector'),
    hq: verified('India', SRC.tracxnFloryn),
    note: verified('Floryn Health Private Limited, incorporated 27 October 2023.', SRC.tracxnFloryn),
    sources: [SRC.tracxnFloryn],
  },
  {
    id: 'feedec',
    name: verified('Feedec', SRC.brief),
    kind: 'venture',
    role: 'venture',
    industry: 'social-commerce',
    title: pending('Title / capacity'),
    relationship: pending('Nature of association — advisor, investor, board or founder', true),
    period: pending('Period', true),
    sector: verified('Social commerce', SRC.playFeedec),
    hq: verified('Roorkee, India', SRC.internshalaFeedec),
    note: verified('Operated by Feedpreneur Ventures Private Limited.', SRC.internshalaFeedec),
    sources: [SRC.playFeedec, SRC.internshalaFeedec],
  },
]
