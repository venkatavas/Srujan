'use client'

import { useEffect } from 'react'
import { markLoaded } from '@/lib/loading.ts'
import { finishBoot } from '@/motion/opening.ts'

/**
 * Loads choreography after hydration, only in full-motion mode. Posters never depend on it.
 * While the opening plays, the runtime loads at once: it carries the opening's sequence
 * (motion/opening.ts), which waits for this 'motion' milestone; otherwise at idle.
 * Settles 'motion' either way; a failed import hands the page over at once.
 */
export function MotionRoot() {
  useEffect(() => {
    const html = document.documentElement
    if (html.dataset.motion !== 'full') {
      markLoaded('motion')
      return
    }
    let cleanup: (() => void) | undefined
    let cancelled = false
    const start = () =>
      import('@/motion/runtime.ts')
        .then(({ boot }) => {
          if (cancelled) return
          cleanup = boot()
          markLoaded('motion')
        })
        .catch(() => {
          markLoaded('motion')
          // No runtime, no opening: show the finished hero now rather than at the cap.
          if (html.dataset.boot === 'play') finishBoot()
        })
    const ric = 'requestIdleCallback' in window
    let id = 0
    if (html.dataset.boot === 'play') void start()
    else if (ric) id = window.requestIdleCallback(() => void start())
    else id = window.setTimeout(() => void start(), 1)
    return () => {
      cancelled = true
      if (ric) window.cancelIdleCallback(id)
      else clearTimeout(id)
      cleanup?.()
    }
  }, [])
  return null
}
