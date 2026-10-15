// Content for the redesign exploration (/explore), derived only from the content model.
// Every sketch and wireframe reads from here, so all directions show exactly the same facts.
// Nothing here adds a fact: derived values (current and past organisations, date ranges) are
// computed from the verified career. New microcopy proposed by the sketches is listed in COPY
// and is always a draft.
import { brief, spec } from '@/content/brief.ts'
import { profile } from '@/content/profile.ts'
import { type Fact, valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { education, name, noteFor, period, positioning, type Role, roles, ventures } from '@/content/live.ts'

export { education, name, noteFor, period, positioning, type Role, roles, ventures }

export const v = valueOf

// ── Who ────────────────────────────────────────────────────────────────────────────────
/** ['Sai Srujan', 'Pasala'] */
export const nameLines = profile.nameLines
/** The three verified current roles, in the client's order. */
export const roleTitles = (v(site.home.title) ?? '').split(' · ')

// ── Career (verified, LinkedIn) ────────────────────────────────────────────────────────
const unique = (xs: string[]) => [...new Set(xs)]
/** Organisations where a role is marked "Present": Clinisys. */
export const nowOrgs = unique(roles.filter((r) => r.to === 'Present').map((r) => r.org))
/** Earlier organisations: Tech Mahindra, Times of India, Gait Global. */
export const pastOrgs = unique(roles.filter((r) => r.to !== 'Present').map((r) => r.org)).filter((o) => !nowOrgs.includes(o))
/** The current Clinisys role. */
export const currentRole = roles.find((r) => r.to === 'Present')
/** Dates exactly as given; a hyphen, never an en dash. Roles without dates show none. */
export const dates = (r: Role) =>
  r.from && r.to ? `${r.from} - ${r.to}` : r.from ? `From ${r.from}` : r.to === 'Present' ? 'Now' : ''

// ── Ventures (roles verified from the client, lines from public sources) ────────────────
/** Draft card from the client's mockup: show only marked "to confirm". */
export const upcoming = site.ventures.upcoming

// ── The brief and how it is read ───────────────────────────────────────────────────────
export const briefText = v(brief.text) ?? ''
export const briefLines = brief.lines
export const heroLines = brief.heroLines
/** R1-R4: verbatim fragments of the brief. Labels (Actor, Need…) are draft wording. */
export const requirements = spec.map((s, i) => ({ id: `R${i + 1}`, key: s.key, label: s.label, value: s.value }))
/** The three readers. All of their points are draft wording. */
export const readers = site.business.people.map((p) => ({
  id: p.id,
  label: p.label,
  points: p.items.map(([, t]) => t),
  tradeoff: p.conflict,
}))
export const requirementLine = site.business.requirement
/** The perspectives that converge (labels and questions are drafts). */
export const perspectives = site.leadership.circles.map((c) => ({ label: c.label, asks: v(c.items) ?? [] }))
export const decision = site.leadership.decision
/** The current site's journey stops (plain strings, treat as drafts). */
export const lifecycle = site.home.lifecycle

// ── Section copy from the client's mockup (drafts) ─────────────────────────────────────
export const copy = {
  technology: site.technology,
  business: site.business,
  leadership: site.leadership,
  ventures: site.ventures,
  experience: site.experience,
  education: site.education,
  contact: site.contact,
}

// ── Contact ────────────────────────────────────────────────────────────────────────────
export const contact = {
  headline: site.contact.headline,
  body: site.contact.body,
  placeholder: site.contact.placeholder,
  topics: v(site.contact.topics) ?? [],
  focus: v(site.contact.focus) ?? [],
  email: v(profile.email),
  linkedin: v(profile.linkedin),
  booking: v(profile.booking),
}

/**
 * New microcopy the sketches may use. All drafts: nothing here is Sai's wording yet.
 * Sketches must not invent other copy; anything else missing is shown with <Need>.
 */
export const COPY = {
  howIWork: 'How I work',
  now: 'Now',
  before: 'Before',
  path: 'Path',
  ventures: 'Ventures',
  writeBrief: 'Write me a brief',
  seeHow: 'See how I work',
  illustration: 'An illustration of how I approach a brief, not a client case study.',
  requirements: 'Requirements',
  readers: 'Read three ways',
  decision: 'Decision',
  sendBrief: 'Send brief',
  connect: 'Or connect via',
  emailPending: 'Sending opens once Sai’s email is confirmed.',
  comingSoon: 'Coming soon',
  publicRecord: 'Public record',
  toConfirm: 'To confirm',
  education: 'Education',
  career: 'Career',
  theBrief: 'The brief',
  providedBySai: 'Provided by Sai',
  topic: 'Topic',
  stepBrief: 'Brief',
  stepReaders: 'Readers',
  linkedin: 'LinkedIn',
  email: 'Email',
  bookCall: 'Book a call',
  illustrative: 'Illustrative',
  contactLink: 'Contact',
  unavailable: 'Not yet available',
} as const

/** Content that does not exist yet and must not be written for Sai. */
export const NEEDED = {
  positioning: 'One positioning line in Sai’s own words',
} as const

export type { Fact }
