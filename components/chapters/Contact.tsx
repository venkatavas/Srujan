import { organisations } from '@/content/organisations.ts'
import { profile } from '@/content/profile.ts'
import { SHOW_PENDING, SRC, type Source, valueOf } from '@/content/schema.ts'
import { horizonY } from '@/lib/paths.ts'
import { Pending } from '../Pending.tsx'
import { EmailActions } from './EmailActions.tsx'
import { REF, Section } from './Section.tsx'

export function Contact() {
  const { W, H } = REF
  const hz = horizonY(H)
  const email = valueOf(profile.email)
  const linkedin = valueOf(profile.linkedin)
  const openTo = profile.openTo

  const ledger: { fact: string; source: Source }[] = []
  if (profile.education.status === 'verified')
    for (const e of profile.education.value)
      ledger.push({ fact: `${e.qualification}, ${e.institution}, ${e.from}–${e.to}`, source: profile.education.source })
  for (const o of organisations) {
    for (const f of [o.name, o.title, o.period, o.sector, o.hq, o.note]) {
      if (f?.status === 'verified' && f.source !== SRC.brief && f.source !== SRC.client)
        ledger.push({ fact: `${valueOf(o.name)}: ${f.value}`, source: f.source })
    }
  }
  ledger.push({ fact: 'Times of India, Marketing Lead, 2021', source: SRC.brief })

  return (
    <Section
      id="contact"
      labelledBy="contact-h"
      after={
        <footer className="ledger">
          <h2 className="ledger__h">Sources</h2>
          <ol className="ledger__list">
            {ledger.map((l, i) => (
              <li key={i}>
                <span>{l.fact}</span>
                <span className="ledger__src">
                  {l.source.url ? (
                    <a href={l.source.url} rel="noopener noreferrer" target="_blank">
                      {l.source.label}
                    </a>
                  ) : (
                    l.source.label
                  )}
                  {l.source.accessed && `, accessed ${l.source.accessed}`}
                </span>
              </li>
            ))}
          </ol>
          <p className="ledger__colophon">
            {SHOW_PENDING
              ? 'Preview build. Typeset in IBM Plex as a placeholder for ABC Arizona; items marked “Content required” are hidden in production.'
              : 'Built in 2026.'}
          </p>
        </footer>
      }
    >
      <svg className="art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="line contact__escape m-only" d={`M0 ${hz}L${W} ${hz}`} />
      </svg>
      <span className="point contact__escape-point m-only" aria-hidden="true" />

      <div className="contact__open">
        {openTo.status === 'pending' ? <Pending note={openTo.note} /> : <p>{openTo.value}</p>}
      </div>

      <h2 id="contact-h" className="sr-only">
        Contact
      </h2>
      <div className="contact__mail">
        {email ? (
          <a className="contact__address" href={`mailto:${email}`}>
            {email}
          </a>
        ) : (
          <span className="contact__address is-pending">Email</span>
        )}
        <span className="contact__underline" aria-hidden="true" />
        <span className="point contact__point" aria-hidden="true" />
        <EmailActions email={email} />
      </div>
      <p className="contact__links">
        {linkedin ? <a href={linkedin}>LinkedIn</a> : profile.linkedin.status === 'pending' && <Pending note={profile.linkedin.note} />}
      </p>
    </Section>
  )
}
