import { disciplines, profile } from '@/content/profile.ts'
import { translationLines } from '@/lib/paths.ts'
import { REF, Section } from './Section.tsx'

export function Business() {
  const { W, H } = REF
  const fused = translationLines(W, H, 1)
  const items = disciplines.business.status === 'verified' ? disciplines.business.value : []
  const mba = profile.education.status === 'verified' ? profile.education.value[1] : null
  return (
    <Section id="business" labelledBy="business-h">
      <div className="biz__fused">
        <div className="biz__clip">
          <h2 id="business-h" className="biz__word">
            Understanding
          </h2>
        </div>
        <ul className="biz__list">
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {mba && (
          <p className="spec biz__spec">
            <span className="spec__k">{mba.qualification}</span>
            <span>
              {mba.institution}, {mba.from}–{mba.to}
            </span>
          </p>
        )}
      </div>

      <div className="biz__half biz__half--l m-only" aria-hidden="true">
        <span className="biz__spec-word">Specification</span>
      </div>
      <div className="biz__half biz__half--r m-only" aria-hidden="true">
        <span className="biz__intent-word">Intention</span>
      </div>
      <span className="biz__seam m-only" aria-hidden="true" />

      <svg className="art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="line biz__a" d={fused.a} />
        <path className="line biz__b" d={fused.b} />
      </svg>
    </Section>
  )
}
