// Letter migration: which glyph of word A travels to which slot of word B.
// Same letter (case-insensitive), globally nearest pairs first. Unmatched → -1.

export type Glyph = { ch: string; x: number }

export function matchGlyphs(from: readonly Glyph[], to: readonly Glyph[]): number[] {
  const pairs: [number, number, number][] = []
  to.forEach((t, j) => {
    if (!t.ch.trim()) return
    from.forEach((f, i) => {
      if (f.ch.toUpperCase() === t.ch.toUpperCase()) pairs.push([Math.abs(f.x - t.x), i, j])
    })
  })
  pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
  const usedFrom = new Set<number>()
  const result = to.map(() => -1)
  for (const [, i, j] of pairs) {
    if (usedFrom.has(i) || result[j] !== -1) continue
    usedFrom.add(i)
    result[j] = i
  }
  return result
}

export const sharedCount = (m: number[]) => m.filter((i) => i >= 0).length
