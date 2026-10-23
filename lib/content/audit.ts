// Lists every fact in the content model that is not yet verified: the prebuild gate
// (scripts/check-content.ts) and the private /review page both use it.
// Fail-safe: every fact is audited unless its path is listed in NOT_RENDERED below, so content the
// site starts rendering later is gated by default. NOT_RENDERED names content the public site never
// shows (so Sai is not asked to approve it); a path leaves that list the moment the site renders it.
import { page } from '../../content/page.ts'
import { profile } from '../../content/profile.ts'
import * as site from '../../content/site.ts'

type AuditRow = { path: string; status: 'draft' | 'pending'; note: string; required: boolean; value?: string }

type AnyFact = { status: string; note?: string; requiredForLaunch?: boolean; value?: unknown }
const isFact = (v: unknown): v is AnyFact =>
  !!v && typeof v === 'object' && 'status' in v && ['verified', 'draft', 'pending'].includes((v as AnyFact).status)

/** Content the site (app/page.tsx) never renders. */
export const NOT_RENDERED: ReadonlySet<string> = new Set([
  // Role notes reach the page only once verified (Story.tsx, Experience); a draft note never shows.
  'site.experience.notes',
])

/** Any value as readable text: strings as they are, lists and records joined. */
const text = (v: unknown): string =>
  typeof v === 'string'
    ? v
    : Array.isArray(v)
      ? v.map(text).join(' / ')
      : v && typeof v === 'object'
        ? Object.entries(v)
            .map(([k, x]) => (typeof x === 'string' ? `${k}: ${x}` : `${k}: ${text(x)}`))
            .join(' / ')
        : String(v ?? '')

export function audit(): AuditRow[] {
  const rows: AuditRow[] = []
  const walk = (v: unknown, path: string) => {
    if (NOT_RENDERED.has(path)) return
    if (isFact(v)) {
      if (v.status !== 'verified')
        rows.push({
          path,
          status: v.status as AuditRow['status'],
          note: v.note ?? '',
          // Drafts are always launch-blocking: Sai must sign off on every word in his voice.
          required: v.status === 'draft' || !!v.requiredForLaunch,
          value: v.status === 'draft' ? text(v.value) : undefined,
        })
      return
    }
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${(x as { id?: string })?.id ?? i}]`))
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k)
  }
  walk({ profile, page, site: { ...site } }, '')
  return rows
}
