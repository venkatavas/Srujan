'use client'

// Floating nav: one glass pill — name · Limelight sections · Get in touch — that slips away while
// scrolling down and returns on the way up. Under 720px the sections move to a bottom dock.

import { Briefcase, Compass, GraduationCap, Home, Mail, Rocket, Route, User, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LimelightNav, type NavItem } from '@/components/ui/limelight-nav.tsx'
import { layoutTops, pageSections } from '@/lib/layout.ts'
import { NAV_SECTIONS, type NavSectionId } from './sections.ts'

export { NAV_SECTIONS }

const ICONS: Record<NavSectionId, LucideIcon> = {
  top: Home,
  about: User,
  work: Compass,
  path: Route,
  ventures: Rocket,
  experience: Briefcase,
  education: GraduationCap,
  connect: Mail,
}

const ITEMS: NavItem[] = NAV_SECTIONS.map(({ id, n, label }) => {
  const Icon = ICONS[id]
  return { id, href: `#${id}`, label: n ? `${n} ${label}` : label, icon: <Icon strokeWidth={1.75} /> }
})

const HIDE_AFTER = 120 // px of scroll before the pill may hide
const HIDE_DELTA = 8 // px of continuous downward scroll that hides it
const REVEAL_ZONE = 80 // a mouse this close to the top brings it back

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export function Nav({ name, contactHref }: { name: string; contactHref: string }) {
  const [active, setActive] = useState(0)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const sections = pageSections()
    let tops = layoutTops(sections)
    const root = document.documentElement
    const pinned = root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = scrollY
    let downFrom = scrollY
    let scrolledAway = false
    let pointerNear = false

    const apply = () => headerRef.current?.toggleAttribute('data-hidden', scrolledAway && !pointerNear && !pinned)

    // Active: the last section whose layout top is above 45% of the viewport.
    const check = () => {
      raf = 0
      const y = scrollY
      const probe = y + 0.45 * innerHeight
      // The last section whose top has passed the probe (any section without a nav item keeps
      // the one before it lit).
      let idx = 0
      for (let k = 0; k < tops.length; k++) {
        if (tops[k] > probe) break
        const j = NAV_SECTIONS.findIndex((s) => s.id === sections[k]?.id)
        if (j >= 0) idx = j
      }
      setActive(idx)

      if (y < HIDE_AFTER || y < last) {
        scrolledAway = false
        downFrom = y
      } else if (y - downFrom > HIDE_DELTA) scrolledAway = true
      last = y
      apply()
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    const measure = () => {
      tops = layoutTops(sections)
      onScroll()
    }
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const near = e.clientY < REVEAL_ZONE
      if (near !== pointerNear) {
        pointerNear = near
        apply()
      }
    }

    const ro = new ResizeObserver(measure)
    const main = sections[0]?.parentElement
    if (main) ro.observe(main)
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', measure)
    addEventListener('pointermove', onPointer, { passive: true })
    measure()
    return () => {
      ro.disconnect()
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', measure)
      removeEventListener('pointermove', onPointer)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <header ref={headerRef} className="navf">
        <a href="#top" className="nav__name navf__name">
          <span className="navf__full">
            <b>{name.split(' ').slice(0, -1).join(' ')}</b> {name.split(' ').at(-1)}
          </span>
          <span className="navf__short">{initials(name)}</span>
        </a>
        <span className="navf__sep" aria-hidden="true" />
        <LimelightNav
          items={ITEMS}
          activeIndex={active}
          onTabChange={setActive}
          showActiveLabel
          tooltips
          ariaLabel="Sections"
          className="navf__links h-[54px] rounded-none border-0 bg-transparent px-1 [--limelight-cone:46px]"
          iconContainerClassName="px-2.5 py-0 min-[960px]:px-3.5"
          iconClassName="h-[18px] w-[18px]"
          limelightClassName="shadow-[0_40px_15px_var(--primary)]"
        />
        <span className="navf__sep navf__sep--links" aria-hidden="true" />
        <a href={contactHref} className="nav__cta navf__cta">
          Get in touch <span aria-hidden="true">→</span>
        </a>
      </header>
      <LimelightNav
        items={ITEMS}
        activeIndex={active}
        onTabChange={setActive}
        ariaLabel="Sections"
        className="navf__dock h-14 rounded-2xl border-0 bg-transparent px-3 [--limelight-cone:44px]"
        iconContainerClassName="px-[7px] py-0"
        iconClassName="h-5 w-5"
        limelightClassName="w-8 shadow-[0_40px_14px_var(--primary)]"
      />
    </>
  )
}
