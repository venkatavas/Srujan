'use client'

// Smooth, momentum scrolling (Lenis) for the site, including in-page links (the nav, the skip link
// and the footer glide to their section). After a glide, keyboard focus moves to the section too,
// so the next Tab continues from there, as it would with a native jump. Paused while the opening
// plays. Under reduced motion the browser's own scrolling is used, unchanged.
// Lenis is loaded once the page is idle, so it never competes with the first paint; until then
// the browser's own scrolling (and the CSS smooth scrolling for in-page links) is in place.
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'

export function Smooth() {
  useEffect(() => {
    const d = document.documentElement
    // A shared link to a section (/#connect): go straight there, instantly, as soon as the page
    // starts, and again once the page and its fonts have fully loaded (the fonts can change the
    // height of what is above), unless the visitor has scrolled, swiped or pressed a key by then.
    // The boot script keeps the hash, skips the opening and sets html[data-hashload], which keeps
    // these jumps instant; it is removed once the page has settled.
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
    if (target) {
      let moved = false
      const mark = () => (moved = true)
      const kinds = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
      kinds.forEach((k) => addEventListener(k, mark, { passive: true }))
      const jump = () => {
        if (!moved) target.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
      jump()
      const loaded = new Promise<void>((r) => (document.readyState === 'complete' ? r() : addEventListener('load', () => r(), { once: true })))
      Promise.all([loaded, document.fonts?.ready]).then(() =>
        requestAnimationFrame(() => {
          jump()
          delete d.dataset.hashload
          kinds.forEach((k) => removeEventListener(k, mark))
        }),
      )
    }
    if (d.dataset.motion === 'reduce') return
    let cleanup = () => {}
    let cancelled = false

    const boot = async () => {
      const { default: Lenis } = await import('lenis')
      if (cancelled) return
      const lenis = new Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 0.9 })

      const onClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
        const id = a?.getAttribute('href')?.slice(1)
        const target = id ? document.getElementById(id) : null
        if (!target) return
        e.preventDefault()
        lenis.scrollTo(target, {
          offset: 0,
          onComplete: () => {
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
            target.focus({ preventScroll: true })
          },
        })
      }
      document.addEventListener('click', onClick)

      let mo: MutationObserver | undefined
      if (d.dataset.pre === 'on') {
        lenis.stop()
        mo = new MutationObserver(() => {
          if (d.dataset.pre !== 'on') {
            lenis.start()
            mo?.disconnect()
          }
        })
        mo.observe(d, { attributes: true, attributeFilter: ['data-pre'] })
      }
      cleanup = () => {
        document.removeEventListener('click', onClick)
        mo?.disconnect()
        lenis.destroy()
      }
    }

    // After the first paint and the page's own start-up work.
    const ric = 'requestIdleCallback' in window
    const handle = ric ? window.requestIdleCallback(() => void boot(), { timeout: 1500 }) : window.setTimeout(() => void boot(), 200)
    return () => {
      cancelled = true
      if (ric) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
      cleanup()
    }
  }, [])
  return null
}
