import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as site from '../../content/site.ts'

describe('site content honours the fact rules', () => {
  it('venture lines are verified facts with a source', () => {
    for (const c of site.ventures.companies) {
      expect(c.line.status).toBe('verified')
      if (c.line.status === 'verified') expect(c.line.source.url).toMatch(/^https:\/\//)
    }
  })

  it('Feedec is described as the public record states (social commerce), not as the mockup did', () => {
    const feedec = site.ventures.companies.find((c) => c.id === 'feedec')!
    expect(feedec.line.status === 'verified' && feedec.line.value).toMatch(/social commerce/i)
  })

  it('the career is verified and shows only the dates the client gave', () => {
    const c = site.experience.career
    expect(c.status).toBe('verified')
    const given = new Set(['May 2018', 'Apr 2019', 'Aug 2020', '2021', 'Jul 2022', 'Feb 2023', 'Jul 2023', 'Present'])
    const roles = c.status === 'verified' ? c.value.flatMap((g) => g.roles) : []
    for (const r of roles) for (const d of [r.from, r.to]) if (d) expect(given.has(d), d).toBe(true)
    // The ventures live in the Ventures section, with no dates (none were given).
    expect(roles.filter((r) => /Floryn|Feedec/.test(r.org))).toEqual([])
  })

  it('the Times of India note is draft copy, not a verified fact', () => {
    expect(site.experience.notes['Marketing Lead']?.status).toBe('draft')
  })

  it('the career has one verb per period', () => {
    const c = site.experience.career
    const verbs = site.experience.verbs.status === 'pending' ? [] : site.experience.verbs.value.split(' · ')
    expect(c.status === 'verified' && c.value.length).toBe(verbs.length)
  })

  it('every role in the hero title is a verified role (career or ventures)', () => {
    const t = site.home.title
    expect(t.status).toBe('verified')
    const c = site.experience.career
    const career = c.status === 'verified' ? c.value.flatMap((g) => g.roles.map((r) => r.title)) : []
    const ventures = site.ventures.companies.flatMap((co) => (co.role.status === 'verified' ? co.role.value : ''))
    const known = [...career, ...ventures].join(' | ')
    if (t.status === 'verified')
      for (const part of t.value.split(' · ')) expect(known.replaceAll(' · ', ' & ')).toContain(part.replace(' · ', ' & '))
  })

  it('the Upcoming venture card is draft copy for Sai to approve, never a verified fact', () => {
    const u = site.ventures.upcoming
    expect(u.status).toBe('draft')
    expect(u.status).not.toBe('verified')
  })
})

describe('no coordinates are rendered (client decision)', () => {
  const files: string[] = []
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(tsx?|css|mdx?|json)$/.test(f)) files.push(p)
    }
  }
  ;['app', 'components', 'content'].forEach(walk)

  it('no source file under app, components or content holds the Hyderabad coordinates', () => {
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) {
      const s = readFileSync(f, 'utf8')
      expect(s, f).not.toContain('17.3856')
      expect(s, f).not.toContain('78.4867')
    }
  })
})

describe('the site has no images', () => {
  const roots = ['app', 'components', 'content', 'lib']
  const files: string[] = []
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(tsx?|css)$/.test(f)) files.push(p)
    }
  }
  roots.forEach(walk)

  it('no <img>, next/image or /media/ references anywhere in app code', () => {
    for (const f of files) {
      const s = readFileSync(f, 'utf8')
      expect(s, f).not.toMatch(/<img\b|next\/image|\/media\//)
    }
  })

  it('no image files are shipped', () => {
    let found: string[] = []
    try {
      found = readdirSync('public').filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
    } catch {}
    expect(found).toEqual([])
  })
})

describe('the live page and its content agree', () => {
  const story = readFileSync('components/home/Story.tsx', 'utf8')
  const pointsIn = (name: string) => {
    const block = story.slice(story.indexOf(`const ${name}: Point[] = [`), story.indexOf('\n]', story.indexOf(`const ${name}`)))
    return (block.match(/\{ x:/g) ?? []).length
  }

  it('each wave timeline has exactly one drawn point per step', async () => {
    const { page } = await import('../../content/page.ts')
    const { valueOf } = await import('../../content/schema.ts')
    expect(valueOf(page.work.steps)?.length).toBe(pointsIn('WORK_POINTS'))
    expect(valueOf(page.path.items)?.length).toBe(pointsIn('PATH_POINTS'))
  })

  it('every explore-only path in the content audit still exists (no stale exclusions)', async () => {
    const { EXPLORE_ONLY } = await import('../../lib/content/audit.ts')
    const at = (path: string) => path.split('.').slice(1).reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], site)
    for (const p of EXPLORE_ONLY) expect(at(p), p).toBeDefined()
  })

  it('the nav uses the sections’ own labels', async () => {
    const { NAV_SECTIONS } = await import('../../components/nav/sections.ts')
    const { page } = await import('../../content/page.ts')
    const { valueOf } = await import('../../content/schema.ts')
    const L = valueOf(page.labels)!
    expect(NAV_SECTIONS.find((s) => s.id === 'connect')?.label).toBe(L.connect)
    expect(NAV_SECTIONS.find((s) => s.id === 'work')?.label).toBe(L.work)
  })
})

describe('phone decks keep their lists', () => {
  const story = readFileSync('components/home/Story.tsx', 'utf8')
  it('every Deck holds exactly one list (ul or ol) and nothing else: its items are the cards', () => {
    // The body of each <Deck ...> ... </Deck>, from the line after its opening tag.
    const bodies = story
      .split('<Deck ')
      .slice(1)
      .map((b) => b.slice(b.indexOf('\n'), b.indexOf('</Deck>')).trim())
    expect(bodies.length).toBe(3)
    for (const body of bodies) {
      const tag = body.match(/^<(ul|ol)\b/)?.[1]
      expect(tag, body.slice(0, 60)).toBeDefined()
      // It ends with that list's closing tag, and the list is not closed (then reopened) earlier.
      expect(body.endsWith(`</${tag}>`), body.slice(-60)).toBe(true)
      expect(body.indexOf(`</${tag}>`), body.slice(0, 60)).toBe(body.length - `</${tag}>`.length)
    }
  })
})
