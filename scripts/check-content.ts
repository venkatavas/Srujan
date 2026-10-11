// Lists every fact that is not yet verified. With --gate, fails a production build
// (VERCEL_ENV=production) if any launch-required fact — including every draft — is unresolved.
import { audit } from '../lib/content/audit.ts'

const rows = audit()
const required = rows.filter((r) => r.required)
console.log(`\nCONTENT CHECK — ${rows.length} fact(s) not yet verified\n`)
for (const r of rows) console.log(`${r.required ? '!' : ' '} ${r.status.padEnd(7)} ${r.path}\n            ${r.note}`)
console.log(`\n${required.length} launch-blocking fact(s). Full list on /review in development and previews.\n`)
if (process.argv.includes('--gate') && process.env.VERCEL_ENV === 'production' && required.length) {
  console.error('Production build blocked: unapproved drafts or missing launch-required content.')
  process.exit(1)
}
