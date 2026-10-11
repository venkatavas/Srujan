import { describe, expect, it } from 'vitest'
import { MILESTONES, type Milestone, WEIGHTS, stepShown, targetOf } from '../../lib/loading.ts'

// Deterministic PRNG so failures reproduce.
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 2 ** 32
}

describe('loading milestones', () => {
  it('weights sum to 100 and every milestone carries weight', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100)
    for (const k of MILESTONES) expect(WEIGHTS[k]).toBeGreaterThan(0)
  })

  it('targetOf counts only settled marks', () => {
    expect(targetOf({})).toBe(0)
    expect(targetOf({ doc: 12.5 })).toBe(WEIGHTS.doc)
    expect(targetOf({ doc: 1, motion: 2 })).toBe(WEIGHTS.doc + WEIGHTS.motion)
    expect(targetOf({ doc: undefined, type: 0 })).toBe(WEIGHTS.type)
    expect(targetOf(Object.fromEntries(MILESTONES.map((k) => [k, 1])))).toBe(100)
  })
})

describe('stepShown', () => {
  const rand = rng(7)
  const cases = Array.from({ length: 2000 }, () => {
    const shown = rand() * 100
    return { shown, target: shown + rand() * (100 - shown), dt: rand() * 0.1, rate: rand() < 0.5 ? 140 : 320 }
  })

  it('is monotonic, never exceeds the target and respects the rate cap', () => {
    for (const { shown, target, dt, rate } of cases) {
      const next = stepShown(shown, target, dt, rate)
      expect(next).toBeGreaterThanOrEqual(shown)
      expect(next).toBeLessThanOrEqual(target)
      if (next !== target) expect(next).toBeLessThanOrEqual(shown + rate * dt + 1e-9)
    }
  })

  it('returns the target only when it is close', () => {
    for (const { shown, target, dt, rate } of cases) {
      if (stepShown(shown, target, dt, rate) === target) expect(target - shown).toBeLessThanOrEqual(rate * dt + 0.35 + 1e-9)
    }
    expect(stepShown(0, 100, 1 / 60, 140)).toBeLessThan(100)
    expect(stepShown(99.8, 100, 1 / 60, 140)).toBe(100)
  })

  it('never moves backwards when the target is behind', () => {
    expect(stepShown(40, 25, 1 / 60, 140)).toBe(40)
    expect(stepShown(40, 40, 1 / 60, 140)).toBe(40)
  })
})

describe('the counter over a simulated load at 60fps', () => {
  for (let seed = 1; seed <= 40; seed++) {
    it(`seed ${seed}: reaches 100 only after every milestone, never decreasing`, () => {
      const rand = rng(seed)
      const rate = seed % 2 ? 140 : 320
      const at = Object.fromEntries(MILESTONES.map((k) => [k, rand() * 3])) as Record<Milestone, number>
      const lastMark = Math.max(...Object.values(at))
      const dt = 1 / 60
      let shown = 0
      let reached = -1
      for (let f = 0; f < 60 * 8; f++) {
        const t = f * dt
        const marks = Object.fromEntries(MILESTONES.filter((k) => at[k] <= t).map((k) => [k, at[k]]))
        const target = targetOf(marks)
        const next = stepShown(shown, target, dt, rate)
        expect(next).toBeGreaterThanOrEqual(shown)
        expect(next).toBeLessThanOrEqual(target)
        expect(next - shown).toBeLessThanOrEqual(rate * dt + 0.35 + 1e-9)
        shown = next
        if (shown === 100 && reached < 0) reached = t
      }
      expect(shown).toBe(100)
      expect(reached).toBeGreaterThanOrEqual(lastMark)
    })
  }
})
