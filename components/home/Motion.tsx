'use client'

// Calm motion for the site. Sections rise in once as they enter; in "How I work" the brief's
// underlines draw and the perspectives' lines join into the decision; the hero's light leans a
// little toward the pointer, and the edge rails' points glide along their lines. Nothing moves on
// its own. Under reduced motion (html[data-motion='reduce'], set before paint by the layout) and
// without JavaScript, everything is simply shown.
import { useEffect } from 'react'

export function Motion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.site')
    if (!root) return
    const reduce =
      document.documentElement.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    root.classList.add('is-motion')

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

    // The hero's light follows a fine pointer by a few percent, eased.
    const hero = root.querySelector<HTMLElement>('.y2-hero')
    let raf = 0
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let r = 0
    let tr = 0
    const step = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      r += (tr - r) * 0.06
      hero?.style.setProperty('--gx', `${x.toFixed(2)}%`)
      hero?.style.setProperty('--gy', `${y.toFixed(2)}%`)
      // The edge rails' points glide along their lines, in opposite directions.
      hero?.style.setProperty('--ry', r.toFixed(3))
      raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tr - r) * 50 > 0.05 ? requestAnimationFrame(step) : 0
    }
    const onMove = (e: PointerEvent) => {
      if (!hero) return
      const box = hero.getBoundingClientRect()
      if (e.clientY > box.bottom) return
      tx = (e.clientX / innerWidth - 0.5) * 18
      ty = ((e.clientY - box.top) / box.height - 0.5) * 14
      tr = Math.max(-0.5, Math.min(0.5, (e.clientY - box.top) / box.height - 0.5))
      if (!raf) raf = requestAnimationFrame(step)
    }
    const fine = matchMedia('(pointer: fine)').matches
    if (fine) addEventListener('pointermove', onMove, { passive: true })

    // The reading-progress line, where CSS scroll timelines are not supported (scroll.css).
    const bar = root.querySelector<HTMLElement>('.st-progress i')
    let sraf = 0
    const onScroll = () => {
      if (sraf) return
      sraf = requestAnimationFrame(() => {
        sraf = 0
        const max = document.documentElement.scrollHeight - innerHeight
        bar?.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(4) : '0')
      })
    }
    const timelines = CSS.supports('animation-timeline: scroll()')
    if (bar && !timelines) {
      addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }

    return () => {
      io.disconnect()
      removeEventListener('pointermove', onMove)
      removeEventListener('scroll', onScroll)
      cancelAnimationFrame(sraf)
      cancelAnimationFrame(raf)
      root.classList.remove('is-motion')
    }
  }, [])
  return null
}
