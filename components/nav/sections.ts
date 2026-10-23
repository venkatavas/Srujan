// The nav's sections, in page order. Each id is a `main > section` id (tests/unit/nav.test.ts).
import { page } from '../../content/page.ts'
import { valueOf } from '../../content/schema.ts'

// Labels are the sections' own (content/page.ts), so the nav and the section always agree.
const L = valueOf(page.labels)

// One item per section, in page order, numbered like the sections themselves (the hero has none).
export const NAV_SECTIONS = [
  { id: 'top', n: '', label: 'Home' },
  { id: 'about', n: '01', label: L?.about ?? 'About' },
  { id: 'work', n: '02', label: L?.work ?? 'How I work' },
  { id: 'path', n: '03', label: L?.path ?? 'Path' },
  { id: 'ventures', n: '04', label: L?.ventures ?? 'Ventures' },
  { id: 'experience', n: '05', label: L?.experience ?? 'Experience' },
  { id: 'education', n: '06', label: L?.education ?? 'Education' },
  { id: 'connect', n: '07', label: L?.connect ?? 'Contact' },
] as const

export type NavSectionId = (typeof NAV_SECTIONS)[number]['id']
