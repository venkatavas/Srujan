import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans, Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import './sketch.css'

// One type family per direction, so the sketches differ in voice as well as layout:
// X Instrument Sans, Y Outfit, Z Bricolage Grotesque. Geist Mono for ids and dates in any of them.
// The control keeps the current site's Newsreader and Hanken Grotesk (loaded by the root layout).
const x = Instrument_Sans({ subsets: ['latin'], variable: '--f-x', axes: ['wdth'] })
const y = Outfit({ subsets: ['latin'], variable: '--f-y' })
const z = Bricolage_Grotesque({ subsets: ['latin'], variable: '--f-z', axes: ['opsz', 'wdth'] })
const code = Geist_Mono({ subsets: ['latin'], variable: '--f-code' })
// Stage 4 type option for the chosen direction (X): Violet Bloom's family.
const pj = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--f-pj' })

/** Fonts for the Stage 3 direction sketches only. */
export default function SketchLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${x.variable} ${y.variable} ${z.variable} ${code.variable} ${pj.variable}`}>{children}</div>
}
