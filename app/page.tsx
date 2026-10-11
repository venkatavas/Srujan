import { MotionRoot } from '@/components/MotionRoot.tsx'
import { Nav } from '@/components/nav/Nav.tsx'
import { Opening } from '@/components/Opening.tsx'
import { Field } from '@/components/site/Field.tsx'
import {
  Business,
  Contact,
  Education,
  Experience,
  Hero,
  Leadership,
  Technology,
  Ventures,
} from '@/components/site/Sections.tsx'
import { profile } from '@/content/profile.ts'
import { valueOf } from '@/content/schema.ts'

export default function Page() {
  const name = valueOf(profile.name) ?? ''
  const email = valueOf(profile.email)
  return (
    <>
      <Field />
      <Nav name={name} contactHref={email ? `mailto:${email}` : '#contact'} />
      <main>
        <Hero sections={9} />
        <Technology />
        <Business />
        <Leadership />
        <Ventures />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Opening />
      <MotionRoot />
    </>
  )
}
