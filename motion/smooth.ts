import Lenis from 'lenis'
import type { Env } from './runtime.ts'

// Smooth wheel scrolling (Lenis on the window), driven by GSAP's ticker so ScrollTrigger,
// the scrubbed parallax and the scroll position all advance on the same frame. Touch keeps
// native scrolling. Scroll speed feeds the background shader: fast scrolling quickens its
// vermilion pulses. In ?seek mode, or if Lenis fails, every call falls back to native scroll.

export type ScrollTo = { immediate?: boolean; duration?: number; onComplete?: () => void }

export type ScrollApi = {
  to: (y: number, opts?: ScrollTo) => void
  /** Pixels per frame (signed); 0 under native scrolling. */
  velocity: () => number
  stop: () => void
  start: () => void
}

/** easeInOutQuad, the shape of the old ScrollTo glide (power2.inOut). */
const glide = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

export const nativeScroll: ScrollApi = {
  to(y, { onComplete } = {}) {
    window.scrollTo({ top: y, behavior: 'instant' })
    onComplete?.()
  },
  velocity: () => 0,
  stop() {},
  start() {},
}

export function smooth(env: Pick<Env, 'gsap' | 'ScrollTrigger' | 'bus' | 'seek'>): { api: ScrollApi; cleanup: () => void } {
  if (env.seek) return { api: nativeScroll, cleanup: () => {} }
  const { gsap, ScrollTrigger, bus } = env

  let lenis: Lenis
  try {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // A scrollable field (the brief textarea) keeps its own wheel.
      prevent: (node) => node.nodeName === 'TEXTAREA',
    })
  } catch {
    return { api: nativeScroll, cleanup: () => {} }
  }

  const onScroll = () => ScrollTrigger.update()
  lenis.on('scroll', onScroll)
  const tick = (t: number) => {
    lenis.raf(t * 1000)
    // The curtain tweens energy too; a max() lets its burst decay on its own terms.
    bus.energy = Math.max(bus.energy * 0.92, Math.min(1, Math.abs(lenis.velocity) / 45))
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  const api: ScrollApi = {
    to(y, { immediate, duration, onComplete } = {}) {
      if (immediate) {
        // Heights may have changed since Lenis last measured (fonts, the brief form).
        lenis.resize()
        lenis.scrollTo(y, { immediate: true, force: true, onComplete: () => onComplete?.() })
        return
      }
      lenis.scrollTo(y, {
        duration: duration ?? 1,
        easing: glide,
        onComplete: () => onComplete?.(),
      })
    },
    velocity: () => lenis.velocity,
    stop: () => lenis.stop(),
    start: () => lenis.start(),
  }

  return {
    api,
    cleanup() {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      bus.energy = 0
    },
  }
}
