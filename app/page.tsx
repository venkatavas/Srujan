import { Business } from '@/components/chapters/Business.tsx'
import { Contact } from '@/components/chapters/Contact.tsx'
import { Hero } from '@/components/chapters/Hero.tsx'
import { Leadership } from '@/components/chapters/Leadership.tsx'
import { Media } from '@/components/chapters/Media.tsx'
import { Technology } from '@/components/chapters/Technology.tsx'
import { Ventures } from '@/components/chapters/Ventures.tsx'
import { MotionRoot } from '@/components/MotionRoot.tsx'
import { Nav } from '@/components/nav/Nav.tsx'
import { RecordContent } from '@/components/nav/RecordContent.tsx'
import { RecordDialog } from '@/components/nav/RecordDialog.tsx'
import { Overture } from '@/components/Overture.tsx'
import { chapters } from '@/content/chapters.ts'
import { profile } from '@/content/profile.ts'
import { valueOf } from '@/content/schema.ts'

export default function Page() {
  const name = valueOf(profile.name) ?? ''
  const index = chapters.filter((c) => c.key).map((c) => ({ id: c.id, label: c.label, key: c.key! }))
  return (
    <>
      <Nav name={name} />
      <main>
        <Hero />
        <Technology />
        <Business />
        <Media />
        <Leadership />
        <Ventures />
        <Contact />
      </main>
      <RecordDialog chapters={index}>
        <RecordContent />
      </RecordDialog>
      <div className="veil" aria-hidden="true" />
      <Overture />
      <MotionRoot />
    </>
  )
}
