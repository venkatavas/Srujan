// Every string in the content model, with its status and where it lands in each candidate
// structure. Used by the preview-only /explore route (Stage 1 of the redesign exploration).
// Unlike audit(), this also lists verified facts and strings not yet wrapped as facts.
import { brief, spec } from '../../content/brief.ts'
import { page } from '../../content/page.ts'
import { profile } from '../../content/profile.ts'
import * as site from '../../content/site.ts'

export type MapStatus = 'verified' | 'draft' | 'pending' | 'unwrapped'
export type MapRow = { path: string; status: MapStatus; text: string; note?: string; s8: string; s5: string }

type AnyFact = { status: MapStatus; note?: string; value?: unknown; source?: { label: string } }
const isFact = (v: unknown): v is AnyFact =>
  !!v && typeof v === 'object' && 'status' in v && ['verified', 'draft', 'pending'].includes((v as AnyFact).status)

// Plain strings that are verbatim fragments of a verified fact: shown as verified only if they
// really are a fragment (checked below), otherwise they fall back to 'unwrapped'.
const FRAGMENTS: [prefix: string, of: string][] = [
  ['brief.lines', 'brief'],
  ['brief.heroLines', 'brief'],
  ['spec', 'brief'],
  ['profile.nameLines', 'name'],
]
const SOURCE_TEXT = { brief: brief.text.status === 'verified' ? brief.text.value : '', name: profile.name.status === 'verified' ? profile.name.value : '' }

// Where each part of the content model appears: [path prefix, Structure 8 section, Structure 5 section].
// "optional" marks copy the five-section structure may keep or drop.
const PLACES: [string, string, string][] = [
  ['profile.name', 'Hero', 'Intro'],
  ['profile.nameLines', 'Hero', 'Intro'],
  ['profile.email', 'Contact', 'Contact'],
  ['profile.linkedin', 'Contact', 'Contact'],
  ['profile.booking', 'Contact', 'Contact'],
  ['profile.education', 'Education', 'Path'],
  ['brief.heroLines', 'Hero', 'The brief'],
  ['brief', 'Technology', 'The brief'],
  ['spec', 'Technology', 'The brief'],
  ['site.home.title', 'Hero', 'Intro'],
  ['site.home.positioning', 'Hero', 'Intro'],
  ['site.home.lifecycle', 'Hero', 'The brief'],
  ['site.home.marks', 'Hero', 'optional'],
  ['site.technology', 'Technology', 'The brief'],
  ['site.business', 'Business', 'The brief'],
  ['site.leadership', 'Leadership', 'The brief'],
  ['site.ventures.companies', 'Ventures', 'Now'],
  ['site.ventures.upcoming', 'Ventures', 'Now (to confirm)'],
  ['site.ventures', 'Ventures', 'Now'],
  ['site.experience.career', 'Experience', 'Path'],
  ['site.experience', 'Experience', 'Path'],
  ['site.education', 'Education', 'Path'],
  ['site.contact', 'Contact', 'Contact'],
  // The site's section copy from the client's full-page reference (content/page.ts).
  ['page', 'Site (new)', 'Site (new)'],
]
// Identifiers, not copy.
const SKIP = new Set(['id', 'key'])
// Section framing that the five-section structure treats as optional.
const OPTIONAL = /\.(caption|outro|verbs)\b/

function place(path: string): [string, string] {
  const hit = PLACES.find(([p]) => path === p || path.startsWith(`${p}.`) || path.startsWith(`${p}[`))
  if (!hit) return ['?', '?']
  return [hit[1], OPTIONAL.test(path) ? 'optional' : hit[2]]
}

export function contentMap(): MapRow[] {
  const rows: MapRow[] = []
  const push = (path: string, status: MapStatus, text: string, note?: string) => {
    const [s8, s5] = place(path)
    rows.push({ path, status, text, note, s8, s5 })
  }
  // Leaf strings and numbers inside a value, each a row with the inherited status.
  const leaves = (v: unknown, path: string, status: MapStatus, note?: string) => {
    if (typeof v === 'string' || typeof v === 'number') {
      // Symbols such as the '+' bullets are layout, not copy.
      if (typeof v === 'string' && !/[\p{L}\p{N}]/u.test(v)) return
      if (status === 'unwrapped') {
        const frag = FRAGMENTS.find(([p]) => path === p || path.startsWith(`${p}.`) || path.startsWith(`${p}[`))
        if (frag && typeof v === 'string' && SOURCE_TEXT[frag[1] as keyof typeof SOURCE_TEXT].includes(v))
          return push(path, 'verified', v, 'Verbatim fragment of a verified fact')
      }
      return push(path, status, String(v), note)
    }
    if (Array.isArray(v)) v.forEach((x, i) => leaves(x, `${path}[${i}]`, status, note))
    else if (v && typeof v === 'object')
      for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) leaves(x, `${path}.${k}`, status, note)
  }
  const walk = (v: unknown, path: string) => {
    if (isFact(v)) {
      if (v.status === 'pending') return push(path, 'pending', '', v.note)
      return leaves(v.value, path, v.status, v.status === 'verified' ? v.source?.label : v.note)
    }
    if (typeof v === 'string' || typeof v === 'number') return leaves(v, path, 'unwrapped')
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) walk(x, path ? `${path}.${k}` : k)
  }
  walk({ profile, brief, spec, site, page }, '')
  return rows
}
