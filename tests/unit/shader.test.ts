import { describe, expect, it } from 'vitest'
import { chapterAt } from '../../motion/chapters/field-state.ts'
import { FRAG, KEYS, STATES, STATE_NAMES, UNIFORM_FLOATS, VERT, stateParams } from '../../motion/field/shader.ts'

const ACCENT = [0.8784, 0.2706, 0.1686]

/** `const vec3 NAME=vec3(r,g,b)` declarations, parsed to numbers. */
const constants = () =>
  [...FRAG.matchAll(/const\s+vec3\s+(\w+)\s*=\s*vec3\(([^)]*)\)/g)].map(([, name, args]) => ({
    name,
    rgb: args.split(',').map((a) => Number(a.trim())),
  }))

describe('blueprint shader', () => {
  it('is GLSL ES 3.0', () => {
    expect(FRAG.startsWith('#version 300 es')).toBe(true)
    expect(VERT.startsWith('#version 300 es')).toBe(true)
  })

  it('uses no textures, samplers or loops', () => {
    for (const src of [FRAG, VERT]) {
      expect(src).not.toMatch(/sampler/)
      expect(src).not.toMatch(/texture\s*\(/)
      expect(src).not.toMatch(/\bfor\s*\(/)
      expect(src).not.toMatch(/\bwhile\s*\(/)
    }
  })

  it('declares the uniforms the runtime sets', () => {
    for (const u of ['uRes', 'uDpr', 'uTime', 'uFlow', 'uMouse', 'uLens', 'uScroll', 'uSweep', 'uEnergy', 'uReveal', 'uOrigin', 'uScan', 'uScene', 'uP'])
      expect(FRAG).toMatch(new RegExp(`uniform [^;]*\\b${u}\\b`))
    expect(FRAG).toContain(`uniform vec4 uP[${UNIFORM_FLOATS / 4}]`)
  })

  it('maps every shader parameter to its own uniform slot', () => {
    KEYS.slice(0, UNIFORM_FLOATS).forEach((k, j) => expect(FRAG).toContain(`#define ${k} uP[${j >> 2}].${'xyzw'[j & 3]}`))
    expect(UNIFORM_FLOATS % 4).toBe(0)
  })

  it('keeps colour literals in named constants', () => {
    const literals = [...FRAG.matchAll(/vec3\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)/g)].length
    expect(literals).toBe(constants().length)
  })

  it('has one chromatic constant, the accent; the rest are neutral or cool tints', () => {
    const consts = constants()
    expect(consts.length).toBeGreaterThan(1)
    const chromatic = consts.filter(({ rgb }) => {
      const [r, g, b] = rgb
      const spread = Math.max(r, g, b) - Math.min(r, g, b)
      const neutral = spread <= 0.12
      // a cool tint: blue-led and ordered r <= g <= b, never more than a pale wash
      const cool = r <= g && g <= b && spread <= 0.24
      return !neutral && !cool
    })
    expect(chromatic.map((c) => c.name)).toEqual(['ACCENT'])
    expect(chromatic[0].rgb).toEqual(ACCENT)
  })

  it('has ten chapter states, every one subtle', () => {
    expect(STATES).toHaveLength(8)
    expect(STATE_NAMES).toHaveLength(8)
    for (const st of STATES) {
      expect(st.GRID_A).toBeGreaterThanOrEqual(0.01)
      expect(st.GRID_A).toBeLessThanOrEqual(0.06)
      expect(st.CRS_A).toBeLessThanOrEqual(0.2)
      expect(st.LAMP_A).toBeLessThanOrEqual(0.07)
      for (const k of KEYS) expect(Number.isFinite(st[k])).toBe(true)
    }
    // the hero matches the CSS fallback it cross-fades from
    expect(STATES[0].GRID_A).toBe(0.032)
    expect(STATES[0].CRS_A).toBe(0.16)
  })

  it('blends adjacent states linearly and clamps outside 0..7', () => {
    const g = KEYS.indexOf('GRID_A')
    const mid = stateParams(2.5)[g]
    expect(mid).toBeCloseTo((STATES[2].GRID_A + STATES[3].GRID_A) / 2, 6)
    expect(stateParams(-3)[g]).toBeCloseTo(STATES[0].GRID_A, 6)
    expect(stateParams(42)[g]).toBeCloseTo(STATES[7].GRID_A, 6)
    expect(stateParams(NaN)[g]).toBeCloseTo(STATES[0].GRID_A, 6)
  })
})

describe('chapter mapping', () => {
  const vh = 900
  // eight sections (Technology a tall pinned track)
  const heights = [900, 2880, 1800, 900, 2700, 756, 756, 756]
  const tops = heights.map((_, i) => heights.slice(0, i).reduce((a, b) => a + b, 0))
  const end = tops[7] + heights[7] - vh

  it('stays in [0, 7], is monotonic, and reaches both ends', () => {
    let prev = -1
    for (let y = 0; y <= end; y += 7) {
      const c = chapterAt(y, vh, tops, heights)
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(7)
      expect(c).toBeGreaterThanOrEqual(prev - 1e-9)
      prev = c
    }
    expect(chapterAt(0, vh, tops, heights)).toBe(0)
    expect(chapterAt(end, vh, tops, heights)).toBe(7)
    expect(chapterAt(-200, vh, tops, heights)).toBe(0)
    expect(chapterAt(end + 500, vh, tops, heights)).toBe(7)
  })

  it('holds a state while its section owns the reading line', () => {
    // Technology's top at the viewport top: well into state 1, not yet blending into 2
    expect(chapterAt(tops[1], vh, tops, heights)).toBe(1)
    // Business's top at the reading line: state 2, exactly
    expect(chapterAt(tops[2] - 0.55 * vh, vh, tops, heights)).toBeCloseTo(2, 9)
  })

  it('is continuous (no jumps larger than a smooth step allows)', () => {
    for (let y = 0; y <= end; y += 1) {
      const d = chapterAt(y + 1, vh, tops, heights) - chapterAt(y, vh, tops, heights)
      expect(d).toBeLessThan(0.02)
    }
  })

  it('degrades without layout', () => {
    expect(chapterAt(500, vh, [], [])).toBe(0)
  })
})
