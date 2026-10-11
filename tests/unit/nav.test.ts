import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { NAV_SECTIONS } from '../../components/nav/sections.ts'

// Static source check: the nav's 8 items map 1:1, in order, onto the page's sections.
const root = process.cwd()
const read = (p: string) => readFileSync(join(root, p), 'utf8')

describe('floating nav', () => {
  const page = read('app/page.tsx')
  // Section components live in Sections.tsx, with Hero and Technology split into their own files.
  const sections = ['Sections', 'Hero', 'Technology', 'Business', 'Leadership', 'Ventures', 'Experience', 'Education', 'Contact'].map((f) => read(`components/site/${f}.tsx`)).join('\n')

  // <main>'s components in order, then the section id each one renders.
  const main = page.slice(page.indexOf('<main>'), page.indexOf('</main>'))
  const order = [...main.matchAll(/<([A-Z]\w*)\b/g)].map((m) => m[1])
  const idOf = (component: string) => {
    const start = sections.indexOf(`export function ${component}(`)
    expect(start, `${component} is defined in components/site`).toBeGreaterThan(-1)
    const next = sections.indexOf('\nexport function', start + 1)
    const body = sections.slice(start, next < 0 ? undefined : next)
    const m = body.match(/<(?:section|Tile)\b[^>]*?\bid=(?:"([^"]+)"|\{['"]([^'"]+)['"]\})/)
    return m?.[1] ?? m?.[2]
  }

  it('has the eight sections in page order', () => {
    expect(NAV_SECTIONS.map((s) => s.id)).toEqual([
      'top',
      'technology',
      'business',
      'leadership',
      'ventures',
      'experience',
      'education',
      'contact',
    ])
    expect(NAV_SECTIONS.map((s) => s.n)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08'])
  })

  it('maps 1:1 onto the section ids rendered inside <main>', () => {
    expect(order.map(idOf)).toEqual(NAV_SECTIONS.map((s) => s.id))
  })

  it('every nav id is a section id in components/site', () => {
    for (const { id } of NAV_SECTIONS) {
      expect(sections).toMatch(new RegExp(`<(?:section|Tile)\\b[^>]*\\bid=(?:"${id}"|\\{['"]${id}['"]\\})`))
    }
  })
})
