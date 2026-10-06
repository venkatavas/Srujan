// Lists every fact that is not yet verified. With --gate, fails a production
// build (VERCEL_ENV=production) if any launch-required fact is still pending.
import { profile, disciplines } from '../content/profile.ts'
import { organisations, roles, industries } from '../content/organisations.ts'

type AnyFact = { status: string; note?: string; requiredForLaunch?: boolean }
const isFact = (v: unknown): v is AnyFact =>
  !!v && typeof v === 'object' && 'status' in v && ['verified', 'draft', 'pending'].includes((v as AnyFact).status)

const rows: { path: string; status: string; note: string; required: boolean }[] = []
function walk(v: unknown, path: string) {
  if (isFact(v)) {
    if (v.status !== 'verified') rows.push({ path, status: v.status, note: v.note ?? '', required: !!v.requiredForLaunch })
    return
  }
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${(x as { id?: string })?.id ?? i}]`))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k)
}
walk({ profile, disciplines, roles, industries, organisations }, '')

const gate = process.argv.includes('--gate')
const pendingRequired = rows.filter((r) => r.status === 'pending' && r.required)
console.log(`\nCONTENT CHECK — ${rows.length} fact(s) not yet verified\n`)
for (const r of rows) console.log(`${r.required ? '!' : ' '} ${r.status.padEnd(7)} ${r.path}\n            ${r.note}`)
console.log(`\n${pendingRequired.length} launch-required fact(s) pending.\n`)
if (gate && process.env.VERCEL_ENV === 'production' && pendingRequired.length) {
  console.error('Production build blocked: launch-required content is pending.')
  process.exit(1)
}
