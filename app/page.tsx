import { fonts } from '@/components/home/fonts.ts'
import { Motion } from '@/components/home/Motion.tsx'
import { Hero } from '@/components/home/Hero.tsx'
import { Preloader } from '@/components/home/Preloader.tsx'
import { Smooth } from '@/components/home/Smooth.tsx'
import { About, Connect, Education, Experience, Footer, Journey, Ventures, Work } from '@/components/home/Story.tsx'
import { Nav } from '@/components/nav/Nav.tsx'
import { name, positioning } from '@/content/live.ts'
import { page } from '@/content/page.ts'
import { profile } from '@/content/profile.ts'
import { type Fact, valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { SITE_URL } from '@/lib/site-url.ts'
import '@/components/home/scroll.css'
import type { Metadata } from 'next'

// The home page is the canonical address; other routes (/review, 404) do not inherit it.
export const metadata: Metadata = SITE_URL ? { alternates: { canonical: '/' } } : {}

// The site: the approved hero (Sketch Y, refined) and the sections from the client's full-page
// reference, with the preserved floating nav. It opens with a short preloader and scrolls
// smoothly (Lenis), with a reading-progress line and scroll-linked drawing (scroll.css). The dark
// build it replaces is kept at the tag dark-brief-final.
// Structured data for search and link previews (schema.org Person). Stricter than the page on
// purpose: verified facts only, so a draft value (shown on previews) is never published to search
// engines. Today every value it reads is verified, so it matches the page exactly.
const verifiedOf = <T,>(f: Fact<T>): T | undefined => (f.status === 'verified' ? f.value : undefined)

function personLd() {
  const name = verifiedOf(profile.name)
  const title = verifiedOf(site.home.positioning)?.title
  const email = verifiedOf(profile.email)
  const linkedin = verifiedOf(profile.linkedin)
  const current = verifiedOf(site.experience.career)
    ?.flatMap((g) => g.roles)
    .find((r) => r.to === 'Present')
  const schools = verifiedOf(profile.education) ?? []
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    ...(name ? { name } : {}),
    ...(title ? { jobTitle: title } : {}),
    ...(email ? { email: `mailto:${email}` } : {}),
    ...(linkedin ? { sameAs: [linkedin] } : {}),
    ...(current ? { worksFor: { '@type': 'Organization', name: current.org } } : {}),
    ...(schools.length ? { alumniOf: schools.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })) } : {}),
    ...(SITE_URL ? { url: SITE_URL } : {}),
  }
}

export default function Page() {
  const email = valueOf(profile.email)
  return (
    <div className={`site sy sy2 ${fonts}`}>
      <Preloader name={name} eyebrow={valueOf(page.hero.focus) ?? []} title={positioning?.title ?? ''} line={positioning?.line ?? ''} />
      <a className="skip" href="#about">
        Skip to content
      </a>
      <div className="st-progress" aria-hidden="true">
        <i />
      </div>
      <Nav name={name} contactHref={email ? `mailto:${email}` : '#connect'} />
      <main>
        <Hero />
        <About />
        <Work />
        <Journey />
        <Ventures />
        <Experience />
        <Education />
        <Connect />
      </main>
      <Footer />
      <Motion />
      <Smooth />
      <script
        type="application/ld+json"
        // Built from verified content only; < is escaped so the JSON cannot close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd()).replace(/</g, '\\u003c') }}
      />
    </div>
  )
}
