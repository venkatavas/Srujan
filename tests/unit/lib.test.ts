import { describe, expect, it } from 'vitest'
import { matchGlyphs, sharedCount } from '../../lib/overture/match.ts'
import { layoutLineage, lineageOf, STRATA } from '../../lib/network/layout.ts'
import { floorTransversals, gridX, horizonY, makeSignal, octiRoute, roomRays, systemTrace, translationLines } from '../../lib/paths.ts'
import { prng } from '../../lib/prng.ts'

const glyphs = (w: string) => [...w].map((ch, i) => ({ ch, x: i * 10 }))

describe('prng', () => {
  it('is deterministic', () => {
    const a = prng(7)
    const b = prng(7)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})

describe('matchGlyphs', () => {
  it('SYSTEMS → MARKETS shares exactly four letters (one S, T, E, M)', () => {
    expect(sharedCount(matchGlyphs(glyphs('SYSTEMS'), glyphs('MARKETS')))).toBe(4)
  })
  it('MARKETS → COMPANIES shares M, A, E, S', () => {
    const m = matchGlyphs(glyphs('MARKETS'), glyphs('COMPANIES'))
    expect(sharedCount(m)).toBe(4)
  })
  it('never reuses a source glyph and is case-insensitive', () => {
    const m = matchGlyphs(glyphs('COMPANIES'), glyphs('Pasala'))
    const used = m.filter((i) => i >= 0)
    expect(new Set(used).size).toBe(used.length)
    expect(sharedCount(m)).toBe(3) // P, A, S — COMPANIES has one A
  })
  it('handles names with no overlap', () => {
    expect(sharedCount(matchGlyphs(glyphs('COMPANIES'), glyphs('LU YU')))).toBe(0)
  })
  it('property: any name of 3–30 chars yields a valid injective mapping', () => {
    const rand = prng(42)
    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ '
    for (let k = 0; k < 1000; k++) {
      const len = 3 + Math.floor(rand() * 28)
      const name = Array.from({ length: len }, () => abc[Math.floor(rand() * abc.length)]).join('')
      const m = matchGlyphs(glyphs('COMPANIES'), glyphs(name))
      expect(m).toHaveLength(len)
      const used = m.filter((i) => i >= 0)
      expect(new Set(used).size).toBe(used.length)
      m.forEach((i, j) => {
        if (i >= 0) expect('COMPANIES'[i]).toBe(name[j].toUpperCase())
      })
    }
  })
})

describe('paths', () => {
  it('horizon sits at 62%', () => expect(horizonY(1000)).toBe(620))
  it('grid spans margin to margin', () => {
    expect(gridX(1000, 0)).toBe(40)
    expect(gridX(1000, 12)).toBe(960)
  })
  it('system trace starts and ends on the horizon at the stage edges (seam contract)', () => {
    const { d, closes } = systemTrace(1440, 900)
    expect(d.startsWith(`M0 ${horizonY(900)}`)).toBe(true)
    expect(d.endsWith(`L1440 ${horizonY(900)}`)).toBe(true)
    expect(closes).toHaveLength(3)
    closes.forEach((c, i) => expect(c).toBeGreaterThan(i ? closes[i - 1] : 0))
  })
  it('translation lines are identical once fused', () => {
    const { a, b } = translationLines(1440, 900, 1)
    expect(a).toBe(b)
  })
  it('translation lines meet the horizon at both edges', () => {
    const { a } = translationLines(1440, 900, 1)
    expect(a.startsWith(`M0 ${horizonY(900)}`)).toBe(true)
  })
  it('signal is deterministic and clean at clarity 1', () => {
    const s1 = makeSignal(2021)
    const s2 = makeSignal(2021)
    expect(s1(1440, 900, 0.3)).toBe(s2(1440, 900, 0.3))
    expect(s1(1440, 900, 1)).toMatch(/^M0 558/)
  })
  it('room rays converge on the vanishing point at t = 1', () => {
    const d = roomRays(1000, 1000, 1)
    expect(d.match(/M380 620/g)).toHaveLength(13)
  })
  it('room rays never rise above the horizon at any t', () => {
    for (const t of [0, 0.3, 0.7, 1]) {
      const ys = [...roomRays(1000, 1000, t).matchAll(/[ML][\d.-]+ ([\d.-]+)/g)].map((m) => Number(m[1]))
      ys.forEach((y) => expect(y).toBeGreaterThanOrEqual(620))
    }
  })
  it('floor transversals recede toward the horizon', () => {
    const ys = [...floorTransversals(1000, 1000).matchAll(/M0 ([\d.]+)/g)].map((m) => Number(m[1]))
    for (let i = 1; i < ys.length; i++) expect(ys[i - 1] - ys[i]).toBeGreaterThan(0)
    ys.forEach((y) => expect(y).toBeGreaterThan(620))
  })
  it('octilinear routes only use vertical, horizontal or 45° segments', () => {
    for (const [x1, x2] of [[100, 400], [500, 520], [800, 150]]) {
      const pts = octiRoute(x1, 62, x2, 222)
        .split(/[ML]/)
        .filter(Boolean)
        .map((p) => p.split(' ').map(Number))
      for (let i = 1; i < pts.length; i++) {
        const dx = Math.abs(pts[i][0] - pts[i - 1][0])
        const dy = Math.abs(pts[i][1] - pts[i - 1][1])
        expect(dx === 0 || dy === 0 || Math.abs(dx - dy) < 0.02).toBe(true)
      }
    }
  })
})

describe('lineage layout', () => {
  const input = {
    roles: ['engineering', 'marketing', 'venture'],
    orgs: [
      { id: 'eng', role: 'engineering', industry: 'enterprise' },
      { id: 'toi', role: 'marketing', industry: 'media' },
      { id: 'floryn', role: 'venture', industry: 'health' },
      { id: 'feedec', role: 'venture', industry: 'commerce' },
    ],
    industries: ['enterprise', 'media', 'health', 'commerce'],
  }
  it('places every node on its stratum without overlap', () => {
    const { nodes } = layoutLineage(input)
    for (const layer of [0, 1, 2, 3] as const) {
      const xs = nodes.filter((n) => n.layer === layer).map((n) => n.x).sort((a, b) => a - b)
      nodes.filter((n) => n.layer === layer).forEach((n) => expect(n.y).toBe(STRATA[layer]))
      for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThan(60)
    }
  })
  it('scales to 3–12 companies without overlap', () => {
    for (let n = 3; n <= 12; n++) {
      const orgs = Array.from({ length: n }, (_, i) => ({ id: `o${i}`, role: 'venture', industry: `i${i}` }))
      const { nodes } = layoutLineage({ roles: ['venture'], orgs, industries: orgs.map((o) => o.industry) })
      const xs = nodes.filter((x) => x.layer === 2).map((x) => x.x)
      for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThan(60)
    }
  })
  it('lineage of a company is exactly three edges', () => {
    expect([...lineageOf('feedec', input)]).toEqual(['person>venture', 'venture>feedec', 'feedec>commerce'])
  })
  it('lineage of a role covers its companies', () => {
    expect(lineageOf('venture', input).size).toBe(5)
  })
})
