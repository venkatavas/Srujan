import { organisations } from '@/content/organisations.ts'
import { valueOf } from '@/content/schema.ts'
import { makeSignal } from '@/lib/paths.ts'
import { REF, Section } from './Section.tsx'

export function Media() {
  const { W, H } = REF
  const wave = makeSignal(2021)(W, H, 1)
  const toi = organisations.find((o) => o.id === 'times-of-india')!
  const year = valueOf(toi.period) ?? ''
  return (
    <Section id="media" labelledBy="media-h">
      <div className="ruler" aria-hidden="true">
        <div className="ruler__track" />
        <span className="ruler__needle" />
      </div>

      <span className="year" aria-hidden="true">
        {year}
      </span>

      <svg className="art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="line media__wave" d={wave} />
      </svg>

      <h2 id="media-h" className="media__meta">
        <span className="media__org">{valueOf(toi.name)}</span>
        <span className="media__role">
          {valueOf(toi.title)}, {year}
        </span>
      </h2>
    </Section>
  )
}
