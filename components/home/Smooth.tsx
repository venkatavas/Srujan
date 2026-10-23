'use client'

// Smooth, momentum scrolling (Lenis) for the site, including in-page links (the nav, the skip link
// and the footer glide to their section). After a glide, keyboard focus moves to the section too,
// so the next Tab continues from there, as it would with a native jump. Paused while the opening
// plays. Under reduced motion in-page links jump instantly (focus still moves) and the browser's
// own scrolling is used.
// Lenis is loaded once the page is idle, so it never competes with the first paint. In-page links
// are handled from the start: before Lenis arrives they use the browser's smooth scrolling.
import 'lenis/dist/lenis.css'
import type Lenis from 'lenis'
import { useEffect } from 'react'
import { reducedMotion } from '@/lib/motion.ts'

/** The element a #hash names, or null (a malformed escape such as /#%E0 names nothing). */
function hashTarget(hash: string) {
  if (!hash || hash === '#') return null
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
}

/** Move keyboard focus to a section after scrolling to it, without scrolling again. */
function focusSection(target: HTMLElement) {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

export function Smooth() {
  useEffect(() => {
    const d = document.documentElement
    const reduce = reducedMotion()
    const undo: (() => void)[] = []
    let cancelled = false
    let lenis: Lenis | undefined

    // A shared link to a section (/#connect): go straight there, instantly, as soon as the page
    // starts, and again once the page and its fonts have fully loaded (the fonts can change the
    // height of what is above), unless the visitor has scrolled, swiped or pressed a key by then.
    // The boot script keeps the hash, skips the opening and sets html[data-hashload], which keeps
    // these jumps instant; it is removed once settled, or at once if the hash names nothing.
    if ('hashload' in d.dataset) {
      const target = hashTarget(location.hash)
      if (!target) delete d.dataset.hashload
      else {
        let moved = false
        const mark = () => (moved = true)
        const kinds = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
        kinds.forEach((k) => addEventListener(k, mark, { passive: true }))
        const jump = () => {
          if (!moved) target.scrollIntoView({ behavior: 'instant', block: 'start' })
        }
        let raf = 0
        const settle = () => {
          kinds.forEach((k) => removeEventListener(k, mark))
          delete d.dataset.hashload
        }
        jump()
        const loaded = new Promise<void>((r) => (document.readyState === 'complete' ? r() : addEventListener('load', () => r(), { once: true })))
        Promise.all([loaded, document.fonts?.ready]).then(() => {
          if (cancelled) return
          raf = requestAnimationFrame(() => {
            jump()
            settle()
          })
        })
        undo.push(() => {
          cancelAnimationFrame(raf)
          settle()
        })
      }
    }

    // In-page links: glide with Lenis once it is here, with the browser's smooth scrolling before
    // that, instantly under reduced motion; then move keyboard focus to the section.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      const target = a ? hashTarget(a.getAttribute('href') ?? '') : null
      if (!target) return
      e.preventDefault()
      if (lenis) {
        lenis.scrollTo(target, { offset: 0, onComplete: () => focusSection(target) })
        return
      }
      target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' })
      if (reduce) focusSection(target)
      else {
        // Focus once the glide ends (scrollend), or after a moment where it is not supported.
        const done = () => {
          window.clearTimeout(fallback)
          removeEventListener('scrollend', done)
          focusSection(target)
        }
        const fallback = window.setTimeout(done, 900)
        addEventListener('scrollend', done, { once: true })
      }
    }
    document.addEventListener('click', onClick)
    undo.push(() => document.removeEventListener('click', onClick))

    if (!reduce) {
      const boot = async () => {
        const { default: Lenis } = await import('lenis')
        if (cancelled) return
        const l = new Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 0.9 })
        lenis = l
        undo.push(() => l.destroy())
        if (d.dataset.pre === 'on') {
          l.stop()
          const mo = new MutationObserver(() => {
            if (d.dataset.pre !== 'on') {
              l.start()
              mo.disconnect()
            }
          })
          mo.observe(d, { attributes: true, attributeFilter: ['data-pre'] })
          undo.push(() => mo.disconnect())
        }
      }
      // After the first paint and the page's own start-up work.
      const ric = 'requestIdleCallback' in window
      const handle = ric ? window.requestIdleCallback(() => void boot(), { timeout: 1500 }) : window.setTimeout(() => void boot(), 200)
      undo.push(() => (ric ? window.cancelIdleCallback(handle) : window.clearTimeout(handle)))
    }

    return () => {
      cancelled = true
      undo.forEach((f) => f())
    }
  }, [])
  return null
}
