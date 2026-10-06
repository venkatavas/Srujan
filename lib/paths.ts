// Pure path generators for each behaviour of the line.
// All coordinates are in CSS pixels of the stage (W × H), rounded to 2 decimals
// so server and client produce byte-identical strings.

import { valueNoise } from './prng.ts'

export type Pt = readonly [number, number]

export const HORIZON = 0.62
export const MARGIN = 0.04

const r2 = (n: number) => Math.round(n * 100) / 100

export function toPath(points: readonly Pt[]): string {
  let d = ''
  for (let i = 0; i < points.length; i++) d += `${i ? 'L' : 'M'}${r2(points[i][0])} ${r2(points[i][1])}`
  return d
}

export const horizonY = (H: number) => r2(H * HORIZON)

/** x of the i-th of 13 column edges of the 12-column grid. */
export function gridX(W: number, i: number) {
  const m = W * MARGIN
  return r2(m + (i * (W - 2 * m)) / 12)
}

export function polylineLength(points: readonly Pt[]) {
  let L = 0
  for (let i = 1; i < points.length; i++) L += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
  return L
}

/* ── SYSTEM: an orthogonal trace that draws three open modules (3 : 2 : 4 columns) ── */

export type Module = { x0: number; x1: number; top: number }

export function systemTrace(W: number, H: number) {
  const hz = horizonY(H)
  const spans: [number, number, number][] = [
    [0, 3, 0.2],
    [4, 6, 0.2],
    [7, 11, 0.2],
  ]
  const modules: Module[] = spans.map(([a, b, h]) => ({ x0: gridX(W, a), x1: gridX(W, b), top: r2(hz - H * h) }))
  const pts: Pt[] = [[0, hz]]
  const closes: number[] = [] // polyline length at which each module closes
  for (const m of modules) {
    pts.push([m.x0, hz], [m.x0, m.top], [m.x1, m.top], [m.x1, hz])
    closes.push(polylineLength(pts))
  }
  pts.push([W, hz])
  const length = polylineLength(pts)
  return { d: toPath(pts), modules, length, closes: closes.map((c) => c / length), cell: (W - 2 * W * MARGIN) / 12 }
}

/* ── TRANSLATION: an orthogonal line and a curved line settle on one 45° line ── */

export function translationLines(W: number, H: number, t: number, n = 360) {
  const hz = horizonY(H)
  const h = H * 0.12
  const a = W * 0.3
  const b = W * 0.7
  const lo = a - h
  const hi = b + h
  const sep = H * 0.06 * (1 - t)
  const A: Pt[] = []
  const B: Pt[] = []
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * W
    const fused = hz - Math.max(0, Math.min(h, x - lo, hi - x)) // 45° in pixel space
    const step = x >= a - h / 2 && x <= b + h / 2 ? hz - h : hz
    const bell = x > lo && x < hi ? hz - h * 0.5 * (1 - Math.cos((2 * Math.PI * (x - lo)) / (hi - lo))) : hz
    A.push([x, step + (fused - step) * t - sep])
    B.push([x, bell + (fused - bell) * t + sep])
  }
  return { a: toPath(A), b: toPath(B) }
}

/* ── SIGNAL: noise resolving into a sine ── */

export function makeSignal(seed = 2021, n = 220) {
  const noise = valueNoise(n, seed)
  return (W: number, H: number, clarity: number, amp = 1, phase = 0) => {
    const hz = horizonY(H)
    const A = H * 0.045 * amp
    const k = (Math.PI * 2 * 3.5) / W
    const pts: Pt[] = []
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * W
      const clean = Math.sin(k * x + phase) * A
      pts.push([x, hz - clean - (1 - clarity) * noise[i] * H * 0.11])
    }
    return toPath(pts)
  }
}

/* ── HORIZON: the grid tilts into a one-point perspective floor ── */

// Each grid line lives below the horizon and pivots on it: its top slides along the
// horizon to the vanishing point while its foot spreads — the grid becomes a floor.
export function roomRays(W: number, H: number, t: number, vpX = 0.38) {
  const hz = horizonY(H)
  const vx = W * vpX
  let d = ''
  for (let i = 0; i <= 12; i++) {
    const x = gridX(W, i)
    const spread = vx + (x - vx) * 2.4
    d += `M${r2(x + (vx - x) * t)} ${hz}L${r2(x + (spread - x) * t)} ${r2(H)}`
  }
  return d
}

// Receding transversals: equal floor steps projected (1/z spacing), so the floor reads as depth.
export function floorTransversals(W: number, H: number) {
  const hz = horizonY(H)
  return [1, 1.6, 2.6, 4.4, 8]
    .map((z) => r2(hz + (H - hz) / z))
    .map((y) => `M0 ${y}L${r2(W)} ${y}`)
    .join('')
}

/* ── NETWORK: octilinear (Beck) routing — vertical, 45°, then vertical or horizontal ── */

export function octiRoute(x1: number, y1: number, x2: number, y2: number, lead = 18): string {
  const dy = y2 - y1
  const dx = x2 - x1
  const adx = Math.abs(dx)
  const sx = Math.sign(dx)
  const pts: Pt[] = [[x1, y1]]
  if (adx <= dy - 2 * lead) {
    const v = (dy - adx) / 2
    pts.push([x1, y1 + v], [x2, y1 + v + adx], [x2, y2])
  } else {
    const diag = Math.max(0, dy - 2 * lead)
    pts.push([x1, y1 + lead], [x1 + sx * diag, y1 + lead + diag], [x2, y1 + lead + diag], [x2, y2])
  }
  return toPath(pts)
}
