import { organisations } from '@/content/organisations.ts'
import { profile } from '@/content/profile.ts'
import { SHOW_PENDING, type Source, valueOf } from '@/content/schema.ts'
import { Pending } from '../Pending.tsx'

type Row = { from?: number; to?: number; sort?: number; when: string; what: string; where: string; source?: Source; pending?: string }

/** The to-scale line: segment length = verified tenure. Unverified gaps are drawn as gaps. */
export function RecordContent() {
  const rows: Row[] = []
  if (profile.education.status === 'verified')
    for (const e of profile.education.value)
      rows.push({
        from: e.from,
        to: e.to,
        when: `${e.from}–${e.to}`,
        what: `${e.qualification} (${e.result})`,
        where: e.institution,
        source: profile.education.source,
      })
  if (profile.engineeringRoles.status === 'pending')
    rows.push({ sort: 2017, when: '2017 onward', what: 'Engineering roles', where: '', pending: profile.engineeringRoles.note })
  for (const o of organisations) {
    if (o.name.status === 'pending') continue
    const period = valueOf(o.period)
    const y = period && /^\d{4}$/.test(period) ? Number(period) : undefined
    rows.push({
      from: y,
      to: y ? y + 1 : undefined,
      when: period ?? '',
      what: [valueOf(o.title), o.kind === 'venture' ? valueOf(o.relationship) ?? 'Venture / advisory association' : undefined]
        .filter(Boolean)
        .join(', '),
      where: o.name.value,
      source: o.period.status === 'verified' ? o.period.source : o.sources[0],
      pending: o.period.status === 'pending' ? o.period.note : undefined,
    })
  }
  rows.sort((a, b) => (a.from ?? a.sort ?? 9999) - (b.from ?? b.sort ?? 9999))

  const Y0 = 2013
  const Y1 = 2027
  const x = (y: number) => ((y - Y0) / (Y1 - Y0)) * 100
  const dated = rows.filter((r) => r.from && r.to)

  return (
    <section className="record__body" aria-label="Chronology">
      <p className="record__name">{valueOf(profile.name)}</p>
      <p className="record__pos">{valueOf(profile.positioning)}</p>

      <figure className="scale" aria-label="Verified periods drawn to scale">
        <div className="scale__axis">
          {Array.from({ length: Y1 - Y0 + 1 }, (_, i) => (
            <span key={i} style={{ left: `${x(Y0 + i)}%` }} className={(Y0 + i) % 5 === 0 ? 'is-major' : ''}>
              {(Y0 + i) % 2 === 1 ? Y0 + i : ''}
            </span>
          ))}
        </div>
        {dated.map((r, i) => (
          <div key={i} className="scale__seg" style={{ left: `${x(r.from!)}%`, width: `${x(r.to!) - x(r.from!)}%` }}>
            <span>{r.where}</span>
          </div>
        ))}
        <figcaption>Verified periods, drawn to scale.</figcaption>
      </figure>

      <table className="record__table">
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">What</th>
            <th scope="col">Where</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.when || (r.pending && SHOW_PENDING ? '—' : '')}</td>
              <td>{r.what || (r.pending ? <Pending note={r.pending} /> : '')}</td>
              <td>{r.where || (r.pending ? <Pending note={r.pending} /> : '')}</td>
              <td>
                {r.source?.url ? (
                  <a href={r.source.url} target="_blank" rel="noopener noreferrer">
                    {r.source.label}
                  </a>
                ) : (
                  r.source?.label
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
