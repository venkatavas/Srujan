import { layoutTops, pageSections } from '../../lib/layout.ts'
import type { Env } from '../runtime.ts'

// The living field follows the story: scroll position → bus.chapter = i + t, the field
// blending from chapter state i into i + 1 (motion/field/shader.ts). Entries are the page's
// sections in order; Contact, the last, ends on the quiet sheet.
//
// A reading line sits 55% down the viewport. While it crosses section i, the chapter is i;
// over the last stretch before the next section's top (35% of section i, at most half a
// viewport) it eases into i + 1, landing exactly as that top reaches the line. Over the last
// viewport of scroll the line slides to the bottom edge, so the end of the page always
// reaches the final state even when the last section is short. Monotonic in scrollY.

const LINE = 0.55
const ZONE = 0.35

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

/** The chapter (0 … entries − 1) at scroll position `y`, for entries at `tops` with `heights`. */
export function chapterAt(y: number, viewport: number, tops: number[], heights: number[]): number {
  const n = tops.length
  if (n < 2) return 0
  const max = Math.max(0, tops[n - 1] + heights[n - 1] - viewport)
  const r = y + viewport * (LINE + (1 - LINE) * ease((y - (max - viewport)) / viewport))
  for (let i = 0; i < n - 1; i++) {
    const next = tops[i + 1]
    if (r < next) {
      const z = Math.max(1, Math.min(ZONE * heights[i], 0.5 * viewport, next - tops[i]))
      return i + ease((r - (next - z)) / z)
    }
  }
  return n - 1
}

export function fieldState(env: Env): () => void {
  const { gsap, ScrollTrigger, bus } = env
  let tops: number[] = []
  let heights: number[] = []

  const measure = () => {
    const secs = pageSections()
    tops = layoutTops(secs)
    heights = secs.map((s) => s.offsetHeight)
  }
  // A pure function of scroll and layout, so ?seek captures stay deterministic.
  const update = () => {
    bus.chapter = chapterAt(scrollY, innerHeight, tops, heights)
  }
  const onRefresh = () => {
    measure()
    update()
  }

  onRefresh()
  ScrollTrigger.addEventListener('refresh', onRefresh)
  addEventListener('scroll', update, { passive: true })
  gsap.ticker.add(update)

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh)
    removeEventListener('scroll', update)
    gsap.ticker.remove(update)
    bus.chapter = 0
  }
}
