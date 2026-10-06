import { profile } from '@/content/profile.ts'
import { valueOf } from '@/content/schema.ts'
import { horizonY } from '@/lib/paths.ts'
import { REF, Section } from './Section.tsx'

export function Hero() {
  const [given, surname] = profile.nameLines
  const hz = horizonY(REF.H)
  return (
    <Section id="top" label={valueOf(profile.name)}>
      <svg className="art" viewBox={`0 0 ${REF.W} ${REF.H}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="line hero__line" d={`M0 ${hz}L${REF.W} ${hz}`} />
      </svg>
      <h1 className="name" data-name>
        <span className="name__given">
          {given.split(' ').map((w, i) => (
            <span key={w} className="name__word">
              {i ? ' ' : ''}
              {w}
            </span>
          ))}
        </span>
        <span className="name__surname">
          {surname}
          <span className="point name__point" aria-hidden="true" />
        </span>
      </h1>
      <p className="positioning">{valueOf(profile.positioning)}</p>
    </Section>
  )
}
