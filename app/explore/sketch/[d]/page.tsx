import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReviewBar } from '@/components/explore/ReviewBar.tsx'
import { isSketch, SCREENS, SKETCHES, type SketchId } from '@/components/explore/sketch/index.ts'
import { SHOW_PENDING } from '@/content/schema.ts'
import { FACTS_TO_CONFIRM } from '@/lib/content/review.ts'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export function generateStaticParams() {
  return Object.keys(SKETCHES).map((d) => ({ d }))
}

/** One direction sketch: the same five screens, at rest, in colour. */
export default async function SketchPage({ params }: { params: Promise<{ d: string }> }) {
  if (!SHOW_PENDING) notFound()
  const { d } = await params
  if (!isSketch(d)) notFound()
  const ids = Object.keys(SKETCHES) as SketchId[]
  const s = SKETCHES[d]
  const i = ids.indexOf(d)
  return (
    <>
      <s.Sketch />
      <ReviewBar
        label={s.label}
        screens={('screens' in s ? s.screens : SCREENS).map((x) => ({ ...x, note: (s.motion as Record<string, string>)[x.id] ?? '' }))}
        prev={`/explore/sketch/${ids[(i + ids.length - 1) % ids.length]}`}
        next={`/explore/sketch/${ids[(i + 1) % ids.length]}`}
        options={'options' in s ? s.options : undefined}
        facts={d === 'y2' ? FACTS_TO_CONFIRM : undefined}
      />
    </>
  )
}
