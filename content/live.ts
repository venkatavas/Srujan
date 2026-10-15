// The values the live site derives from the content model, in one place: the home page, the root
// layout (metadata), the share image and the JSON-LD all read the same name and positioning from
// here, so they can never disagree. Nothing here adds a fact: dates and organisations are taken
// from the verified career as given. The preview-only /explore workspace builds on this module;
// this module never depends on it.
import { profile } from './profile.ts'
import { valueOf } from './schema.ts'
import * as site from './site.ts'

export const name = valueOf(profile.name) ?? ''
/** The approved positioning: title and supporting line. */
export const positioning = valueOf(site.home.positioning)
/** "Sai Srujan Pasala, Digital Health Strategist. Building the future of healthcare." */
export const summary =
  [name, positioning?.title].filter(Boolean).join(', ') + (positioning?.line ? `. ${positioning.line}` : '')

// ── Career (verified, LinkedIn) ────────────────────────────────────────────────────────
export type Role = { from?: string; to?: string; title: string; org: string; place?: string; note?: string }
export const roles: Role[] = (valueOf(site.experience.career) ?? []).flatMap((g) => g.roles)
/** The period exactly as given: from and to joined by a hyphen, nothing inferred. */
export const period = (r: Role) => [r.from, r.to].filter(Boolean).join(' - ')
/** A role's note: Sai's own, or the client's reference wording where Sai gave none. `draft` is
 *  true only while that wording is still a draft in the content model. */
export const noteFor = (r: Role): { text: string; draft: boolean } | undefined => {
  if (r.note) return { text: r.note, draft: false }
  const n = site.experience.notes[r.title]
  const t = n ? valueOf(n) : undefined
  return t && n ? { text: t, draft: n.status === 'draft' } : undefined
}

export const education = valueOf(profile.education) ?? []

// ── Ventures (roles verified from the client, lines from public sources) ────────────────
export const ventures = site.ventures.companies.map((c) => ({
  id: c.id,
  name: c.name,
  role: c.role,
  line: c.line,
  sourceUrl: c.line.status === 'verified' ? c.line.source.url : undefined,
}))
