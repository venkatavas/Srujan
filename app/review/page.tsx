import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fonts } from '@/components/home/fonts.ts'
import { SHOW_PENDING } from '@/content/schema.ts'
import { audit } from '@/lib/content/audit.ts'
import { FACTS_TO_CONFIRM } from '@/lib/content/review.ts'

export const metadata: Metadata = { title: 'For Sai: approve the site', robots: { index: false, follow: false } }

/** The page section each content path belongs to, for grouping. */
const AREAS: [prefix: string, area: string][] = [
  ['page.hero', 'Hero'],
  ['page.about', '01 About'],
  ['page.work', '02 How I work'],
  ['page.path', '03 Path'],
  ['page.ventures', '04 Ventures'],
  ['site.ventures', '04 Ventures'],
  ['page.experience', '05 Experience'],
  ['site.experience', '05 Experience'],
  ['page.education', '06 Education'],
  ['profile.education', '06 Education'],
  ['page.connect', '07 Let’s connect'],
  ['profile', '07 Let’s connect'],
  ['page.labels', 'Labels and buttons'],
]
const areaOf = (path: string) => AREAS.find(([p]) => path === p || path.startsWith(`${p}.`) || path.startsWith(`${p}[`))?.[1] ?? 'Other'

/** Prompts for the one thing the site still lacks: a real example of Sai's work. */
const STORIES = [
  'A product decision at Clinisys you are proud of: the problem, what you did, and what changed. Only what you are comfortable sharing publicly.',
  'Something you advised on at Floryn Health: the question, your recommendation, and how it turned out.',
  'Why you backed Feedec: what you saw in it.',
  'Optional: one number you can share (time saved, adoption, users). Only if it is accurate and public.',
]

/** Private sign-off page for Sai: every question and every draft on the live site. Never in production. */
export default function Review() {
  if (!SHOW_PENDING) notFound()
  const rows = audit()
  const groups = new Map<string, typeof rows>()
  for (const r of rows) groups.set(areaOf(r.path), [...(groups.get(areaOf(r.path)) ?? []), r])
  return (
    <main className={`review ${fonts}`}>
      <h1>Approve the site</h1>
      <p>
        Everything below appears on the live site but still needs your word. Nothing goes public until each item is
        approved, changed or removed. Reply with a number and &ldquo;yes&rdquo;, a correction, or &ldquo;remove&rdquo;.
      </p>

      <h2 className="review__h2">1. Facts to confirm ({FACTS_TO_CONFIRM.length})</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Section</th>
            <th scope="col">Question</th>
          </tr>
        </thead>
        <tbody>
          {FACTS_TO_CONFIRM.map((f, i) => (
            <tr key={f.item}>
              <td>F{i + 1}</td>
              <td>
                {f.area}
                <p className="review__note">{f.kind}</p>
              </td>
              <td>{f.item}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="review__h2">2. One or two real stories</h2>
      <p>
        The site explains how you work but does not yet show it. A short, true example would do more than any design
        change. A few sentences each is enough; we will shape them with you.
      </p>
      <ol className="review__list">
        {STORIES.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h2 className="review__h2">3. Wording to approve ({rows.length})</h2>
      {[...groups].map(([area, list]) => (
        <section key={area} className="review__group" aria-label={area}>
          <h3>{area}</h3>
          <table>
            <tbody>
              {list.map((r) => (
                <tr key={r.path}>
                  <td className="review__id">W{rows.indexOf(r) + 1}</td>
                  <td>
                    {r.value ? <p>&ldquo;{r.value}&rdquo;</p> : <p className="review__note">Not provided yet</p>}
                    <p className="review__note">
                      {r.status === 'pending' ? `Needed: ${r.note}` : r.note} · <code>{r.path}</code>
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </main>
  )
}
