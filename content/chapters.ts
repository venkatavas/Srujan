// Chapter order is data. If the verified chronology changes, reorder here.
// `len` is the scroll distance (svh) the sticky stage holds the chapter for.
// Total scroll-animation budget (sum of len): ≤ 900svh. Each stage also occupies 100svh of reading.

export type ChapterId = 'top' | 'technology' | 'business' | 'media' | 'leadership' | 'ventures' | 'contact'

export type Chapter = { id: ChapterId; label: string; env: 'night' | 'day'; len: number; key?: string }

export const chapters: Chapter[] = [
  { id: 'top', label: 'Index', env: 'night', len: 60 },
  { id: 'technology', label: 'Technology', env: 'night', len: 120, key: '1' },
  { id: 'business', label: 'Business', env: 'night', len: 130, key: '2' },
  { id: 'media', label: 'Media', env: 'night', len: 110, key: '3' },
  { id: 'leadership', label: 'Leadership', env: 'day', len: 110, key: '4' },
  { id: 'ventures', label: 'Ventures', env: 'day', len: 80, key: '5' },
  { id: 'contact', label: 'Contact', env: 'day', len: 80, key: '6' },
]

export const chapterById = (id: ChapterId) => chapters.find((c) => c.id === id)!
