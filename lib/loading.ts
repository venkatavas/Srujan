// Real loading milestones behind the preloader counter. The counter never invents progress:
// it eases toward the sum of milestones that have actually settled, and is rate-limited so
// a fast load still reads as a count rather than a jump.

export const WEIGHTS = { doc: 15, type: 25, app: 10, motion: 30, field: 10, load: 10 } as const
export type Milestone = keyof typeof WEIGHTS
export const MILESTONES = Object.keys(WEIGHTS) as Milestone[]

type Registry = { m: Partial<Record<Milestone, number>>; f: ((k: Milestone) => void)[]; mark: (k: Milestone) => void }
declare global {
  interface Window {
    __ssLoad?: Registry
  }
}

/** Sum of the weights of settled milestones (0–100). */
export const targetOf = (marks: Partial<Record<Milestone, unknown>>) =>
  MILESTONES.reduce((s, k) => s + (marks[k] !== undefined ? WEIGHTS[k] : 0), 0)

/**
 * One frame of the displayed count. Monotonic, never above `target`, at most `rate` units/s,
 * eased exponentially toward the target; snaps the last fraction so it can land exactly.
 */
export function stepShown(shown: number, target: number, dt: number, rate: number) {
  if (target <= shown) return shown
  const eased = shown + (target - shown) * (1 - Math.exp(-dt * 7))
  const next = Math.min(target, shown + rate * dt, Math.max(shown, eased))
  return target - next < 0.35 ? target : next
}

/** Settle a milestone. Safe without the head-script registry (e.g. in tests). */
export function markLoaded(k: Milestone) {
  if (typeof window !== 'undefined') window.__ssLoad?.mark(k)
}

/** Subscribe to milestones; already-settled ones are replayed immediately. */
export function onLoaded(cb: (k: Milestone) => void) {
  const r = typeof window !== 'undefined' ? window.__ssLoad : undefined
  if (!r) return () => {}
  ;(Object.keys(r.m) as Milestone[]).forEach(cb)
  r.f.push(cb)
  return () => {
    r.f = r.f.filter((f) => f !== cb)
  }
}

export const settled = () => (typeof window !== 'undefined' ? { ...(window.__ssLoad?.m ?? {}) } : {})
