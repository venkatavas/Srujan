import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SHOW_PENDING } from '@/content/schema.ts'
import { audit } from '@/lib/content/audit.ts'

export const metadata: Metadata = { title: 'Content review', robots: { index: false, follow: false } }

/** Private sign-off list — every draft and pending fact. Never available in production. */
export default function Review() {
  if (!SHOW_PENDING) notFound()
  const rows = audit()
  return (
    <main className="review">
      <h1>Content awaiting sign-off</h1>
      <p>
        Drafts are shown on the preview site as written. Pending items render nothing. Production builds fail until every
        row below is approved or supplied.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Status</th>
            <th scope="col">Field</th>
            <th scope="col">Current text / what is needed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.path}>
              <td>{r.status}</td>
              <td>
                <code>{r.path}</code>
              </td>
              <td>
                {r.value && <p>“{r.value}”</p>}
                <p className="review__note">{r.note}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
