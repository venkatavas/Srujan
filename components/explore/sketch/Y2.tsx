// Sketch Y, refined (Phase 1), as a review sketch: the site's hero (components/home) with the
// in-page pill nav and this sketch's own sections (components/explore/y2), plus the hero, colour
// and type studies for the review bar.
import { Hero } from '@/components/home/Hero.tsx'
import { PillNav } from '@/components/explore/y2/PillNav.tsx'
import { Contact, HowIWork, Now, Path } from '@/components/explore/y2/Sections.tsx'
import './y-palettes.css'

/** This sketch's own sections, for the review bar's jump links. */
export const screens = [
  { id: 'top', label: 'Hero' },
  { id: 'now', label: 'Now' },
  { id: 'brief', label: 'How I work' },
  { id: 'path', label: 'Career and education' },
  { id: 'contact', label: 'Contact' },
]

export const motion: Record<string, string> = {
  top: 'Still on arrival: the name, title and line are simply there. The hairline extends from its centre point once (about 600ms) on first load only; reduced motion shows it complete.',
  now: 'Rows fade in and rise 8px as the section enters, one after another, reversible on scroll back.',
  brief:
    'Each stage settles as it reaches the reading line (fade and 8px rise, reversible). The underlines under the brief draw left to right, then their R marks appear; the convergence lines draw once into the decision. Switching readers cross-fades the panel. Reduced motion: everything at rest.',
  path: 'Still. Rows tint softly on hover.',
  contact: 'Still. The field brightens on focus; Send wakes only once an email exists.',
}

/** Stage 4 and Phase 1 studies, switchable from the review bar. The first of each is the default. */
export const options = {
  heroes: [
    { id: 'h1', label: 'H1 Bold and light pair' },
    { id: 'h2', label: 'H2 Title-led' },
    { id: 'h3', label: 'H3 Instrument line' },
  ],
  palettes: [
    { id: 'soft', label: 'Soft (Y as drawn)' },
    { id: 'bloom', label: 'Violet Bloom' },
    { id: 'haze', label: 'Amethyst Haze' },
    { id: 'coastal', label: 'Coastal (no purple)' },
  ],
  types: [
    { id: 'outfit', label: 'Outfit' },
    { id: 'jakarta', label: 'Plus Jakarta Sans' },
  ],
}

export function Sketch() {
  return (
    <div className="sk sy sy2">
      <Hero nav={<PillNav />} />
      <Now />
      <HowIWork />
      <Path />
      <Contact />
    </div>
  )
}
