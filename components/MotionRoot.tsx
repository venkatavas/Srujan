'use client'

import { useEffect } from 'react'

/** Loads choreography after hydration, only in full-motion mode. Posters never depend on it. */
export function MotionRoot() {
  useEffect(() => {
    if (document.documentElement.dataset.motion !== 'full') return
    let cleanup: (() => void) | undefined
    let cancelled = false
    const start = () =>
      import('@/motion/runtime.ts').then(({ boot }) => {
        if (!cancelled) cleanup = boot()
      })
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1))
    const id = idle(() => void start())
    return () => {
      cancelled = true
      window.cancelIdleCallback?.(id as number)
      cleanup?.()
    }
  }, [])
  return null
}
