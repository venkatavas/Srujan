// Deterministic PRNG (mulberry32): identical output on server and client.
export function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Smoothed value noise in [-1, 1], sampled at n points.
export function valueNoise(n: number, seed: number, knots = 48): number[] {
  const rand = prng(seed)
  const k = Array.from({ length: knots + 1 }, () => rand() * 2 - 1)
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * knots
    const j = Math.min(Math.floor(u), knots - 1)
    const f = u - j
    const s = f * f * (3 - 2 * f)
    // Add a high-frequency component so it reads as noise, not as a curve.
    const hf = rand() * 2 - 1
    out.push((k[j] * (1 - s) + k[j + 1] * s) * 0.7 + hf * 0.3)
  }
  return out
}
