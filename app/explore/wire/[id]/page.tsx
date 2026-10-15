import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FoldPanel } from '@/components/explore/Frame.tsx'
import { isStructure, QUESTIONS, STRUCTURES, Wire } from '@/components/explore/Wire.tsx'
import { SHOW_PENDING } from '@/content/schema.ts'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export function generateStaticParams() {
  return Object.keys(STRUCTURES).map((id) => ({ id }))
}

/** One candidate structure at full size, to scroll through on a desktop or a phone. */
export default async function WirePage({ params }: { params: Promise<{ id: string }> }) {
  if (!SHOW_PENDING) notFound()
  const { id } = await params
  if (!isStructure(id)) notFound()
  return (
    <div className="ex ex--full">
      <p className="ex-bar">
        <a href="/explore">Back to the exploration</a>
        <span>
          {STRUCTURES[id].name}. Grey wireframe: layout and content only, no visual design.
        </span>
      </p>
      <div className="ex-viewport ex-viewport--full">
        <Wire id={id} />
      </div>
      <FoldPanel questions={QUESTIONS} />
    </div>
  )
}
