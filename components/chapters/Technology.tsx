import { disciplines, profile } from '@/content/profile.ts'
import { gridX, horizonY, systemTrace } from '@/lib/paths.ts'
import { Pending } from '../Pending.tsx'
import { REF, Section, pct } from './Section.tsx'

export function Technology() {
  const { W, H } = REF
  const trace = systemTrace(W, H)
  const hz = horizonY(H)
  const labels = disciplines.technology.status === 'verified' ? disciplines.technology.value : []
  const word = 'Technology'
  const bachelor = profile.education.status === 'verified' ? profile.education.value[0] : null
  const eng = profile.engineeringRoles
  return (
    <Section id="technology" labelledBy="technology-h">
      <svg className="art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <g className="grid">
          {Array.from({ length: 13 }, (_, i) => (
            <path key={i} d={`M${gridX(W, i)} 0L${gridX(W, i)} ${H}`} />
          ))}
        </g>
        <path className="line tech__trace" d={trace.d} />
        <path className="tech__reg m-only" d="M-6 0H6M0 -6V6" />
      </svg>

      {trace.modules.map((m, i) => (
        <p
          key={labels[i]}
          className="tech__module"
          data-module={i}
          style={{ left: pct(m.x0, W), top: pct(m.top, H), width: pct(m.x1 - m.x0, W) }}
        >
          {labels[i]}
        </p>
      ))}

      <h2 id="technology-h" className="tech__word" aria-label={word} style={{ top: pct(hz, H) }}>
        {[...word].map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{ left: pct(gridX(W, i + 2), W), width: pct(gridX(W, i + 3) - gridX(W, i + 2), W) }}
          >
            {ch}
          </span>
        ))}
      </h2>

      <div className="spec">
        {bachelor && (
          <p>
            <span className="spec__k">{bachelor.qualification}</span>
            <span>
              {bachelor.institution}, {bachelor.from}–{bachelor.to}
            </span>
          </p>
        )}
        {eng.status === 'pending' && <Pending note={eng.note} />}
      </div>
    </Section>
  )
}
