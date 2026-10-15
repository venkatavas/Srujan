import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Frame } from '@/components/explore/Frame.tsx'
import { SKETCHES } from '@/components/explore/sketch/index.ts'
import { options, Sketch } from '@/components/explore/sketch/Y2.tsx'
import { SHOW_PENDING } from '@/content/schema.ts'

export const metadata: Metadata = { title: 'Hero and colour studies', robots: { index: false, follow: false } }

const DEVICES = [
  { label: 'Desktop, 1440 × 900', width: 1440, height: 900, scale: 0.21 },
  { label: 'Phone, 390 × 844', width: 390, height: 844, scale: 0.5 },
] as const

/** Phase 1: Sketch Y, refined, in its three hero compositions and four colour studies, side by side. */
export default function Colours() {
  if (!SHOW_PENDING) notFound()
  return (
    <main className="ex">
      <header className="ex-intro">
        <p className="ex-kicker">Redesign exploration · Phase 1</p>
        <h1 className="ex-h1">{SKETCHES.y2.label}: heroes and colours</h1>
        <p>
          First the three hero compositions (H1 is recommended), then the same page in four colour sets. Every colour keeps
          its meaning (actions and the decision; Client, Operations and Finance; ventures), and every study passes WCAG AA
          contrast. Open any frame at full size to scroll it, switch hero, colour or type, or check it on a phone.
        </p>
        <p>
          <a href="/explore#sketches">Back to the exploration</a>
        </p>
      </header>
      {DEVICES.map((d) => (
        <section key={`hero-${d.width}`} className="ex-section" aria-label={`Heroes, ${d.label}`}>
          <h2 className="ex-h2">Heroes · {d.label}</h2>
          <div className="ex-frames">
            {options.heroes.map((h) => (
              <Frame
                key={h.id}
                width={d.width}
                height={d.height}
                scale={d.width > 1000 ? 0.28 : 0.6}
                label={h.label}
                href={h.id === options.heroes[0].id ? '/explore/sketch/y2' : `/explore/sketch/y2?hero=${h.id}`}
                questions={[]}
              >
                <div data-hero={h.id}>
                  <Sketch />
                </div>
              </Frame>
            ))}
          </div>
        </section>
      ))}
      {DEVICES.map((d) => (
        <section key={d.width} className="ex-section" aria-label={d.label}>
          <h2 className="ex-h2">Colours · {d.label}</h2>
          <div className="ex-frames">
            {options.palettes.map((p) => (
              <Frame
                key={p.id}
                width={d.width}
                height={d.height}
                scale={d.scale}
                label={p.label}
                href={p.id === options.palettes[0].id ? '/explore/sketch/y2' : `/explore/sketch/y2?palette=${p.id}`}
                questions={[]}
              >
                <div data-palette={p.id}>
                  <Sketch />
                </div>
              </Frame>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
