import { disciplines, profile } from '@/content/profile.ts'
import { valueOf } from '@/content/schema.ts'
import { floorTransversals, horizonY, roomRays } from '@/lib/paths.ts'
import { Pending } from '../Pending.tsx'
import { REF, Section } from './Section.tsx'

export function Leadership() {
  const { W, H } = REF
  const hz = horizonY(H)
  const roles = profile.leadershipRoles
  return (
    <Section id="leadership" labelledBy="leadership-h" stageClassName="stage--night">
      <svg className="art m-only" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="line" d={`M0 ${hz}L${W} ${hz}`} />
      </svg>
      <div className="lead__day">
        <svg className="art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <g className="lead__room">
            <path className="lead__rays" d={roomRays(W, H, 1)} />
            <path className="lead__rays lead__cross" d={floorTransversals(W, H)} />
          </g>
          <path className="line" d={`M0 ${hz}L${W} ${hz}`} />
        </svg>
        <h2 id="leadership-h" className="lead__statement">
          <span>{valueOf(disciplines.leadership)?.replace(/\.$/, '')}</span>
        </h2>
        {roles.status === 'pending' && (
          <div className="lead__pending">
            <Pending note={roles.note} />
          </div>
        )}
      </div>
    </Section>
  )
}
