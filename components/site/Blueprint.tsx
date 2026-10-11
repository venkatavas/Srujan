'use client'

import { useEffect, useRef } from 'react'
import { markLoaded } from '@/lib/loading.ts'

type Nav = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }

/**
 * The living blueprint: a WebGL layer that takes over from the CSS field once its first frame
 * is drawn. Never started under reduced motion, save-data or a low-memory device; ?gl=off keeps
 * the CSS field, ?gl=force skips the device checks, ?seek freezes it for screenshots.
 */
export function Blueprint() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const q = new URLSearchParams(location.search)
    const force = q.get('gl') === 'force'
    const nav = navigator as Nav
    const skip =
      q.get('gl') === 'off' ||
      document.documentElement.dataset.motion !== 'full' ||
      (!force && (nav.connection?.saveData === true || (nav.deviceMemory ?? 8) < 4))
    if (skip) {
      markLoaded('field')
      return
    }
    let cancelled = false
    let stop: (() => void) | null = null
    import('@/motion/field/blueprint.ts')
      .then(({ start }) => {
        if (cancelled) return
        stop = start(canvas, { force, frozen: q.has('seek') })
        if (!stop) markLoaded('field')
      })
      .catch(() => markLoaded('field'))
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])
  return <canvas ref={ref} className="field__gl" aria-hidden="true" />
}
