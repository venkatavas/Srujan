// Walks every content module and lists facts that are not yet verified.
// Used by the prebuild gate (scripts/check-content.ts) and the private /review page.
import { brief } from '../../content/brief.ts'
import { profile } from '../../content/profile.ts'
import * as site from '../../content/site.ts'

type AuditRow = { path: string; status: 'draft' | 'pending'; note: string; required: boolean; value?: string }

type AnyFact = { status: string; note?: string; requiredForLaunch?: boolean; value?: unknown }
const isFact = (v: unknown): v is AnyFact =>
  !!v && typeof v === 'object' && 'status' in v && ['verified', 'draft', 'pending'].includes((v as AnyFact).status)

export function audit(): AuditRow[] {
  const rows: AuditRow[] = []
  const walk = (v: unknown, path: string) => {
    if (isFact(v)) {
      if (v.status !== 'verified')
        rows.push({
          path,
          status: v.status as AuditRow['status'],
          note: v.note ?? '',
          // Drafts are always launch-blocking: Sai must sign off on every word in his voice.
          required: v.status === 'draft' || !!v.requiredForLaunch,
          value: typeof v.value === 'string' ? v.value : undefined,
        })
      return
    }
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${(x as { id?: string })?.id ?? i}]`))
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k)
  }
  walk({ profile, brief, site }, '')
  return rows
}
