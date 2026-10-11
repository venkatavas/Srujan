'use client'

// LimelightNav — an icon bar with a sliding "limelight" over the active item.
// Adapted from the supplied shadcn-style component; its look is unchanged (h-16 bar, p-5 items,
// 5px bar + cone). Additions: hrefs, controlled mode, an expanding active label, CSS-only
// tooltips, and ResizeObserver re-measuring.

import React, { cloneElement, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
)
const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
)
const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

export type NavItem = {
  id: string | number
  icon: React.ReactElement
  label?: string
  /** Renders a real link (focusable, follows the hash); without it the item acts as a button. */
  href?: string
  onClick?: () => void
}

const defaultNavItems: NavItem[] = [
  { id: 'default-home', icon: <DefaultHomeIcon />, label: 'Home' },
  { id: 'default-explore', icon: <DefaultCompassIcon />, label: 'Explore' },
  { id: 'default-notifications', icon: <DefaultBellIcon />, label: 'Notifications' },
]

type LimelightNavProps = {
  items?: NavItem[]
  defaultActiveIndex?: number
  /** Controlled mode: when defined it wins over the internal state. */
  activeIndex?: number
  onTabChange?: (index: number) => void
  className?: string
  limelightClassName?: string
  iconContainerClassName?: string
  iconClassName?: string
  /** The active item shows its label beside the icon; the limelight re-centres on it. */
  showActiveLabel?: boolean
  /** CSS-only tooltip under each inactive item, on hover and keyboard focus. */
  tooltips?: boolean
  ariaLabel?: string
}

type IconEl = React.ReactElement<{ className?: string; 'aria-hidden'?: boolean }>

export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  activeIndex: controlledIndex,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
  showActiveLabel = false,
  tooltips = false,
  ariaLabel,
}: LimelightNavProps) => {
  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex)
  const activeIndex = controlledIndex ?? internalIndex
  const [isReady, setIsReady] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const limelightRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef(activeIndex)
  const readyRef = useRef(false)
  // The item the pointer (or keyboard focus) is over: the limelight follows it, then returns.
  const hoverRef = useRef<number | null>(null)

  // Sizes the labels (0 ↔ their text width, in px so the width can transition) and places the
  // limelight on where the active item will be once they settle: one clean move, not a chase.
  // With labels on, the limelight also widens to cover the whole item (icon + label).
  // Returns false while the bar is not laid out (e.g. display:none at this breakpoint).
  const layout = useCallback(() => {
    const limelight = limelightRef.current
    const els = navItemRefs.current.slice(0, items.length)
    const active = activeRef.current
    if (!limelight || !els[active] || !limelight.offsetWidth) return false
    const reads = els.map((el, i) => {
      const wrap = labelRefs.current[i]
      const full = (wrap?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0
      return { item: el?.offsetWidth ?? 0, now: wrap?.offsetWidth ?? 0, target: wrap && i === active ? full : 0 }
    })
    reads.forEach((r, i) => {
      const wrap = labelRefs.current[i]
      if (wrap) wrap.style.width = `${r.target}px`
    })
    const widths = reads.map((r) => r.item - r.now + r.target)
    let x = els[0]?.offsetLeft ?? 0
    for (let i = 0; i < active; i++) x += widths[i]
    let w = limelight.offsetWidth
    if (showActiveLabel) {
      const cs = getComputedStyle(els[active]!)
      const content = widths[active] - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      w = Math.max(44, Math.round(content + 12))
      limelight.style.width = `${w}px`
    }
    limelight.style.left = `${x + widths[active] / 2 - w / 2}px`
    return true
  }, [items.length, showActiveLabel])

  // Light an item the reader is pointing at: a plain icon-width limelight over it.
  const aim = useCallback(
    (i: number) => {
      const limelight = limelightRef.current
      const el = navItemRefs.current[i]
      if (!limelight || !el || !limelight.offsetWidth) return
      if (i === activeRef.current) {
        layout()
        return
      }
      const w = 44
      limelight.style.width = `${w}px`
      limelight.style.left = `${el.offsetLeft + el.offsetWidth / 2 - w / 2}px`
    },
    [layout],
  )

  // The first placement happens without a transition; the slide is switched on a beat later.
  const place = useCallback(() => {
    if (hoverRef.current !== null) {
      aim(hoverRef.current)
      return
    }
    if (layout() && !readyRef.current) {
      readyRef.current = true
      setTimeout(() => setIsReady(true), 50)
    }
  }, [layout, aim])

  const hover = (i: number | null) => {
    hoverRef.current = i
    if (i === null) layout()
    else aim(i)
  }

  useLayoutEffect(() => {
    activeRef.current = activeIndex
    if (items.length > 0) place()
  }, [activeIndex, isReady, items, place])

  // Resizes (breakpoints, late fonts, a hidden bar becoming visible) re-centre the limelight.
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => place())
    ro.observe(nav)
    navItemRefs.current.forEach((el) => el && ro.observe(el))
    labelRefs.current.forEach((el) => el?.firstElementChild && ro.observe(el.firstElementChild))
    return () => ro.disconnect()
  }, [items, place, showActiveLabel])

  if (items.length === 0) {
    return null
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    hoverRef.current = null
    setInternalIndex(index)
    onTabChange?.(index)
    itemOnClick?.()
  }

  return (
    <nav
      ref={navRef}
      data-limelight=""
      aria-label={ariaLabel}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'width') place()
      }}
      onPointerLeave={() => hover(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hover(null)
      }}
      className={cn('relative inline-flex items-center h-16 rounded-lg bg-card text-foreground border border-solid border-border px-2', className)}
    >
      {items.map(({ id, icon, label, href, onClick }, index) => {
        const active = activeIndex === index
        const el = icon as IconEl
        return (
          <a
            key={id}
            ref={(node) => {
              navItemRefs.current[index] = node
            }}
            href={href}
            role={href ? undefined : 'button'}
            tabIndex={href ? undefined : 0}
            data-navlink=""
            aria-label={label}
            aria-current={active ? 'true' : undefined}
            className={cn('group relative z-20 flex h-full cursor-pointer items-center justify-center p-5', iconContainerClassName)}
            onClick={() => handleItemClick(index, onClick)}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse' || e.pointerType === 'pen') hover(index)
            }}
            onFocus={() => hover(index)}
            onKeyDown={
              href
                ? undefined
                : (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleItemClick(index, onClick)
                    }
                  }
            }
          >
            {cloneElement(el, {
              'aria-hidden': true,
              className: cn(
                'w-6 h-6 shrink-0 transition-opacity duration-100 ease-in-out motion-reduce:transition-none',
                active ? 'opacity-100' : 'opacity-40',
                el.props.className,
                iconClassName,
              ),
            })}
            {showActiveLabel && label ? (
              <span
                ref={(node) => {
                  labelRefs.current[index] = node
                }}
                data-limelight-label=""
                aria-hidden="true"
                className={cn(
                  'block shrink-0 overflow-hidden whitespace-nowrap transition-[width,opacity] duration-400 ease-in-out motion-reduce:transition-none',
                  active ? 'opacity-100' : 'w-0 opacity-0',
                )}
              >
                <span className="inline-block w-max pl-2.5 font-mono text-[11px] leading-none font-medium uppercase tracking-[0.16em]">
                  {label}
                </span>
              </span>
            ) : null}
            {tooltips && label && !active ? (
              <span
                aria-hidden="true"
                data-limelight-tip=""
                className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-30 -translate-x-1/2 -translate-y-0.5 whitespace-nowrap rounded-full border border-solid border-border bg-[#0b0e14]/95 px-2.5 py-[5px] font-mono text-[10.5px] leading-none uppercase tracking-[0.14em] text-foreground opacity-0 shadow-[0_6px_18px_rgba(4,5,8,0.5)] transition-[opacity,translate] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                {label}
              </span>
            ) : null}
          </a>
        )
      })}

      <div
        ref={limelightRef}
        className={cn(
          'absolute top-0 z-10 w-11 h-[5px] rounded-full bg-primary shadow-[0_50px_15px_var(--primary)]',
          isReady && 'transition-[left,width] duration-400 ease-in-out motion-reduce:transition-none',
          limelightClassName,
        )}
        style={{ left: '-999px' }}
      >
        <div className="absolute left-[-30%] top-[5px] w-[160%] h-[var(--limelight-cone,3.5rem)] [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)] bg-gradient-to-b from-primary/30 to-transparent pointer-events-none" />
      </div>
    </nav>
  )
}
