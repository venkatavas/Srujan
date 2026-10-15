// The Stage 3 direction sketches, labelled by letter so the client judges the experience,
// not a concept name. Each module renders the same five screens from components/explore/data.ts.
import * as C from './Control.tsx'
import * as X from './X.tsx'
import * as Y from './Y.tsx'
import * as Y2 from './Y2.tsx'
import * as Z from './Z.tsx'

export const SCREENS = [
  { id: 'hero-person', label: 'Opening, person first' },
  { id: 'hero-brief', label: 'Opening, brief first' },
  { id: 'brief', label: 'The brief, at its decision' },
  { id: 'path', label: 'Career and education' },
  { id: 'contact', label: 'Contact' },
] as const
export type ScreenId = (typeof SCREENS)[number]['id']

export type Choice = { id: string; label: string }
/** Optional Stage 4 studies a sketch offers: colour sets and type families. The first is the default. */
export type SketchOptions = { heroes?: Choice[]; palettes?: Choice[]; types?: Choice[] }
export type SketchModule = {
  Sketch: () => React.ReactNode
  /** Intended motion per screen id (sketches are shown at rest). */
  motion: Record<string, string>
  options?: SketchOptions
  /** A sketch with its own sections lists them here; otherwise SCREENS applies. */
  screens?: { id: string; label: string }[]
}

export const SKETCHES = {
  x: { label: 'Sketch X', ...X },
  y: { label: 'Sketch Y', ...Y },
  y2: { label: 'Sketch Y, refined', ...Y2 },
  z: { label: 'Sketch Z', ...Z },
  control: { label: 'Control: the current site, lit', ...C },
} satisfies Record<string, SketchModule & { label: string }>

export type SketchId = keyof typeof SKETCHES
export const isSketch = (id: string): id is SketchId => id in SKETCHES
