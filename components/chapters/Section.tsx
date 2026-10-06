import { chapterById, type ChapterId } from '@/content/chapters.ts'

/** A chapter: a tall section holding a sticky 100svh stage for `len` of scroll. */
export function Section({
  id,
  labelledBy,
  label,
  className,
  stageClassName,
  children,
  after,
}: {
  id: ChapterId
  labelledBy?: string
  label?: string
  className?: string
  stageClassName?: string
  children: React.ReactNode
  after?: React.ReactNode
}) {
  const ch = chapterById(id)
  return (
    <section
      id={id}
      className={`ch ch--${id} ${className ?? ''}`}
      data-chapter={id}
      data-env={ch.env}
      data-label={ch.label}
      style={{ '--len': `${ch.len}svh` } as React.CSSProperties}
      aria-labelledby={labelledBy}
      aria-label={label}
    >
      <div className="ch__track">
        <div className={`stage ${stageClassName ?? ''}`}>{children}</div>
      </div>
      {after}
    </section>
  )
}

// Poster frames are authored at a 1440 × 900 reference; controllers regenerate at real size.
export const REF = { W: 1440, H: 900 } as const
export const pct = (v: number, of: number) => `${Math.round((v / of) * 100000) / 1000}%`
