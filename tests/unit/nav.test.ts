import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { NAV_SECTIONS } from '../../components/nav/sections.ts'

// Static source check: the nav's items are sections the page renders inside <main>, in page order.
const root = process.cwd()
const read = (p: string) => readFileSync(join(root, p), 'utf8')

describe('floating nav', () => {
  const page = read('app/page.tsx')
  // The hero lives in components/home/Hero.tsx, every later section in Story.tsx.
  const heroFile = read('components/home/Hero.tsx')
  const sections = heroFile + '\n' + read('components/home/Story.tsx')

  // <main>'s components in order, then the section id each one renders.
  const main = page.slice(page.indexOf('<main>'), page.indexOf('</main>'))
  const order = [...main.matchAll(/<([A-Z]\w*)\b/g)].map((m) => m[1])
  const idOf = (component: string) => {
    const start = sections.indexOf(`export function ${component}(`)
    expect(start, `${component} is defined in components/home`).toBeGreaterThan(-1)
    const next = sections.indexOf('\nexport function', start + 1)
    const body = sections.slice(start, next < 0 ? undefined : next)
    const m = body.match(/<(?:section|Section)\b[^>]*?\bid=(?:"([^"]+)"|\{['"]([^'"]+)['"]\})/)
    return m?.[1] ?? m?.[2]
  }
  const pageIds = order.map(idOf)

  it('has one item per section, numbered like the page (the hero has no number)', () => {
    expect(NAV_SECTIONS.map((s) => s.id)).toEqual(['top', 'about', 'work', 'path', 'ventures', 'experience', 'education', 'connect'])
    expect(NAV_SECTIONS.map((s) => s.n)).toEqual(['', '01', '02', '03', '04', '05', '06', '07'])
  })

  it('maps 1:1 onto the sections rendered inside <main>', () => {
    expect(pageIds).toEqual(NAV_SECTIONS.map((s) => s.id))
  })

  it('every section inside <main> has an id, and they are unique', () => {
    expect(pageIds.every(Boolean)).toBe(true)
    expect(new Set(pageIds).size).toBe(pageIds.length)
  })

  it('every nav item is a section inside <main>, in page order', () => {
    const at = NAV_SECTIONS.map((s) => pageIds.indexOf(s.id))
    expect(at.every((x) => x >= 0)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
  })

  it('keeps the hero to the approved identity: no buttons or calls to action in it', () => {
    const start = heroFile.indexOf('export function Hero(')
    const hero = heroFile.slice(start, heroFile.indexOf('\nexport function', start + 1))
    expect(hero).not.toMatch(/<button|writeBrief|seeHow|roleTitles/)
    expect(hero).toContain('{titleHead}')
    expect(hero).toContain('{titleLast}')
    expect(hero).toContain('positioning?.line')
    expect(heroFile).toContain("(positioning?.title ?? '').split(' ')")
  })
})
