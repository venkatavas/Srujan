'use client'

// Smooth, momentum scrolling (Lenis) for the site, including in-page links (the nav, the skip link
// and the footer glide to their section). After a glide, keyboard focus moves to the section too,
// so the next Tab continues from there, as it would with a native jump. Paused while the opening
// plays. Under reduced motion the browser's own scrolling is used, unchanged.
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'

export function Smooth() {
  useEffect(() => {
    const d = document.documentElement
    const reduce = d.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
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
    return () => {
      document.removeEventListener('click', onClick)
      mo?.disconnect()
      lenis.destroy()
    }
  }, [])
  return null
}
