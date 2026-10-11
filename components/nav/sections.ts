// The nav's sections, in page order. Each id is a `main > section` id (tests/unit/nav.test.ts).

export const NAV_SECTIONS = [
  { id: 'top', n: '01', label: 'Home' },
  { id: 'technology', n: '02', label: 'Technology' },
  { id: 'business', n: '03', label: 'Business' },
  { id: 'leadership', n: '04', label: 'Leadership' },
  { id: 'ventures', n: '05', label: 'Ventures' },
  { id: 'experience', n: '06', label: 'Experience' },
  { id: 'education', n: '07', label: 'Education' },
  { id: 'contact', n: '08', label: 'Contact' },
] as const

export type NavSectionId = (typeof NAV_SECTIONS)[number]['id']
