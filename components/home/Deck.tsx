'use client'

// A swipeable row of cards on phones (story.css, .st-deck): the list scrolls sideways and snaps
// card by card, with the next card peeking in, so a long group reads as a set rather than a long
// column. It is plain CSS scrolling, so it works without JavaScript; this component adds the
// position dots (and makes the row focusable for the keyboard) only once its script runs and only
// on phones (the same 719px breakpoint as the CSS). On wider screens the row is the section's
// normal layout and none of this applies.
//
// With full motion the row also glides on its own, slowly and endlessly, from the moment any of it
// is on screen. The glide moves the list with a transform (smooth between pixels, on the GPU, like
// a marquee) and eases in when it starts. A copy of the cards follows the real ones (hidden from
// screen readers and the keyboard) and the glide steps back by exactly one set on reaching the
// copy, so the loop has no seam. Scrolling the page past the row never stops it; grabbing the row
// does: a sideways swipe, a tap, a press, a wheel, keys, keyboard focus, a dot. Then the transform
// is handed over to the row's own scroll position (so the swipe is native), the row settles on a
// card, and the glide starts again RESUME_MS after the last touch. Under reduced motion it never
// moves.
import { type ReactNode, useEffect, useRef, useState } from 'react'

const SPEED = 30 // px per second at full speed
const EASE_IN_MS = 900
const RESUME_MS = 4000
const PHONE = '(max-width: 719px)'

/** The layout's boot script folds the OS setting and the saved choice into html[data-motion]. */
const reduced = () => document.documentElement.dataset.motion === 'reduce'
/** When the glide may start again after an interaction. */
const later = () => performance.now() + RESUME_MS

/** Scroll the row so this card sits at its start (the row's scroll padding). */
function scrollToCard(row: HTMLElement, card: Element, behavior: ScrollBehavior) {
  const pad = parseFloat(getComputedStyle(row).scrollPaddingLeft) || 0
  row.scrollTo({ left: row.scrollLeft + card.getBoundingClientRect().left - row.getBoundingClientRect().left - pad, behavior })
}

/** The card nearest the row's start. */
function nearest(row: HTMLElement, cards: Element[]) {
  const pad = parseFloat(getComputedStyle(row).scrollPaddingLeft) || 0
  const start = row.getBoundingClientRect().left + pad
  let best: Element | undefined
  let gap = Infinity
  for (const c of cards) {
    const d = Math.abs(c.getBoundingClientRect().left - start)
    if (d < gap) [best, gap] = [c, d]
  }
  return best
}

export function Deck({ label, unit, children }: { label: string; unit: string; children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(0)
  const [active, setActive] = useState(0)
  const [canDrift, setCanDrift] = useState(false)
  // A dot tap pauses the glide too; `grab` is set by the glide effect.
  const grab = useRef<() => void>(() => {})

  // How many real cards, on phones while the row scrolls; 0 otherwise (a normal grid).
  useEffect(() => {
    const el = scroller.current
    const list = el?.firstElementChild
    if (!el || !list) return
    const mq = matchMedia(PHONE)
    const real = () => [...list.children].filter((c) => !(c as HTMLElement).dataset.clone).length
    const measure = () => {
      const n = mq.matches && el.scrollWidth > el.clientWidth + 1 ? real() : 0
      setCount(n)
      // Whether this row may glide at all: phones, full motion.
      setCanDrift(n > 1 && !reduced())
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    mq.addEventListener('change', measure)
    measure()
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', measure)
    }
  }, [])

  // Which card is in view (a copy counts as its original), only while there are dots to show it.
  useEffect(() => {
    const el = scroller.current
    const list = el?.firstElementChild
    if (!el || !list || count < 2) return
    const io = new IntersectionObserver(
      (entries) => {
        const cards = [...list.children]
        for (const e of entries) if (e.isIntersecting) setActive(cards.indexOf(e.target) % count)
      },
      { root: el, threshold: 0.6 },
    )
    const watch = () => [...list.children].forEach((c) => io.observe(c))
    watch()
    // The copies arrive with the glide (below): watch them too.
    const mo = new MutationObserver(watch)
    mo.observe(list, { childList: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [count])

  // The glide.
  useEffect(() => {
    const el = scroller.current
    const list = el?.firstElementChild as HTMLElement | null
    if (!el || !list || !canDrift) return
    // Set up (copy the cards, measure, listen) only once the row is about a screen away, so a
    // page load never pays for rows the visitor has not reached.
    let teardown = () => {}
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        near.disconnect()
        teardown = setup()
      },
      { rootMargin: '100% 0px' },
    )
    near.observe(el)
    return () => {
      near.disconnect()
      teardown()
    }

    function setup() {
      const el = scroller.current!
      const list = el.firstElementChild as HTMLElement
      const reals = [...list.children].filter((c) => !(c as HTMLElement).dataset.clone) as HTMLElement[]
      // The copy is made from the server-rendered cards, which never change after load.
      const copies = reals.map((c) => {
        const k = c.cloneNode(true) as HTMLElement
        k.dataset.clone = ''
        k.setAttribute('aria-hidden', 'true')
        k.inert = true
        list.append(k)
        return k
      })
      const all = [...reals, ...copies]
      // One set's width: where the first copy sits relative to the first real card.
      let set = 0
      const measure = () => (set = copies[0].offsetLeft - reals[0].offsetLeft)
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(el)

      let held = false // a finger, mouse or keyboard focus is on the row
      let inView = false
      let gliding = false
      let resumeAt = 0
      let off = 0 // the glide's offset, on top of the row's scroll position
      let began = 0
      let last = 0
      let raf = 0
      let timer = 0
      let quietUntil = 0 // scroll events before this are the hand-over's own, not the visitor's

      const canRun = () => inView && !held && !document.hidden && performance.now() >= resumeAt
      const paint = () => (list.style.transform = off ? `translate3d(${-off}px, 0, 0)` : '')

      const start = () => {
        gliding = true
        el.classList.add('is-drifting')
        off = 0
        began = performance.now()
        last = 0
        raf = requestAnimationFrame(tick)
      }
      /** Stop gliding: hand the offset over to the row's scroll position (nothing moves). */
      const stop = () => {
        if (!gliding) return
        gliding = false
        cancelAnimationFrame(raf)
        let at = el.scrollLeft + off
        if (set > 0 && at >= set) at -= set
        off = 0
        paint()
        quietUntil = performance.now() + 150
        el.scrollLeft = at // snap is still off here, so this lands exactly
        el.classList.remove('is-drifting')
      }
      /** Start or stop to match the current state; if only waiting, check again when the wait ends. */
      const check = () => {
        window.clearTimeout(timer)
        if (canRun()) {
          if (!gliding) start()
          return
        }
        stop()
        const wait = resumeAt - performance.now()
        if (wait > 0) timer = window.setTimeout(check, wait + 20)
      }
      function tick(t: number) {
        if (!canRun()) return check()
        const dt = last ? Math.min(t - last, 64) : 0
        last = t
        // Ease in from rest (ease-out cubic on the speed), so it never jerks into motion.
        const k = Math.min(1, (t - began) / EASE_IN_MS)
        off += (SPEED * (1 - (1 - k) ** 3) * dt) / 1000
        // Step back one set on reaching the copy: identical cards, so no seam.
        if (set > 0 && el!.scrollLeft + off >= set) off -= set
        paint()
        raf = requestAnimationFrame(tick)
      }
      /** The visitor has the row: stop now, start again RESUME_MS after they let go. */
      const take = () => {
        resumeAt = later()
        check()
      }
      grab.current = take

      // Touch. A finger that moves mostly up or down is scrolling the page past the row: the glide
      // carries on. One that moves sideways, or lifts without moving (a tap), has the row.
      let x0 = 0
      let y0 = 0
      let decided = false
      const touchStart = (e: TouchEvent) => {
        x0 = e.touches[0].clientX
        y0 = e.touches[0].clientY
        decided = false
      }
      const touchMove = (e: TouchEvent) => {
        if (decided) return
        const dx = Math.abs(e.touches[0].clientX - x0)
        const dy = Math.abs(e.touches[0].clientY - y0)
        if (dx < 6 && dy < 6) return
        decided = true
        if (dx > dy) {
          held = true
          take()
        }
      }
      const touchEnd = (e: TouchEvent) => {
        if (e.touches.length) return
        if (!decided || held) {
          held = false
          take()
          // A tap leaves the row where the glide had it: settle onto that card.
          window.setTimeout(() => {
            const card = !gliding && nearest(el, all)
            if (card) scrollToCard(el, card, 'smooth')
          }, 60)
        }
      }
      // Mouse and pen: held until released anywhere (the press may end outside the row).
      function pointerUp() {
        removeEventListener('pointerup', pointerUp)
        removeEventListener('pointercancel', pointerUp)
        held = false
        take()
      }
      const pointerDown = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return
        held = true
        take()
        addEventListener('pointerup', pointerUp)
        addEventListener('pointercancel', pointerUp)
      }
      // While the glide is off, any scroll of the row (a swipe's momentum, keys, find-in-page) is
      // the visitor's: restart the wait. (The glide itself never scrolls the row.)
      const scrolled = () => {
        if (performance.now() < quietUntil) return
        if (gliding) take()
        else if (resumeAt > performance.now()) resumeAt = later()
      }
      // Keyboard focus holds the row while inside; a tap also focuses the row (it is focusable), but
      // that is a touch, already handled.
      const focusIn = (e: FocusEvent) => {
        if (!(e.target as Element).matches(':focus-visible')) return
        held = true
        take()
      }
      const focusOut = (e: FocusEvent) => {
        if (el.contains(e.relatedTarget as Node)) return
        held = false
        take()
      }
      // Glide whenever any of the row is on screen.
      const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting
        check()
      })

      el.addEventListener('touchstart', touchStart, { passive: true })
      el.addEventListener('touchmove', touchMove, { passive: true })
      el.addEventListener('touchend', touchEnd, { passive: true })
      el.addEventListener('touchcancel', touchEnd, { passive: true })
      el.addEventListener('pointerdown', pointerDown, { passive: true })
      el.addEventListener('wheel', take, { passive: true })
      el.addEventListener('keydown', take)
      el.addEventListener('scroll', scrolled, { passive: true })
      el.addEventListener('focusin', focusIn)
      el.addEventListener('focusout', focusOut)
      document.addEventListener('visibilitychange', check)
      io.observe(el)

      return () => {
        grab.current = () => {}
        cancelAnimationFrame(raf)
        window.clearTimeout(timer)
        io.disconnect()
        ro.disconnect()
        el.removeEventListener('touchstart', touchStart)
        el.removeEventListener('touchmove', touchMove)
        el.removeEventListener('touchend', touchEnd)
        el.removeEventListener('touchcancel', touchEnd)
        el.removeEventListener('pointerdown', pointerDown)
        el.removeEventListener('wheel', take)
        el.removeEventListener('keydown', take)
        el.removeEventListener('scroll', scrolled)
        el.removeEventListener('focusin', focusIn)
        el.removeEventListener('focusout', focusOut)
        document.removeEventListener('visibilitychange', check)
        removeEventListener('pointerup', pointerUp)
        removeEventListener('pointercancel', pointerUp)
        list.style.transform = ''
        el.classList.remove('is-drifting')
        // If the row rests on a copy, move to the same place among the real cards before removing it.
        if (set > 0 && el.scrollLeft >= set - 1) el.scrollLeft -= set
        copies.forEach((k) => k.remove())
      }
    }
  }, [canDrift])

  // Slide the row only: the page itself never moves. The glide waits, then resumes.
  const go = (k: number) => {
    const el = scroller.current
    const card = el?.firstElementChild?.children[k]
    if (!el || !card) return
    grab.current()
    scrollToCard(el, card, reduced() ? 'instant' : 'smooth')
  }

  const scrolls = count > 1
  return (
    <div className="st-deck">
      {/* data-lenis-prevent-horizontal: sideways swipes over the row move the row, not the page. */}
      <div
        ref={scroller}
        className="st-deck__row"
        data-lenis-prevent-horizontal=""
        {...(scrolls ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {})}
      >
        {children}
      </div>
      {scrolls ? (
        <div className="st-deck__dots">
          {Array.from({ length: count }, (_, k) => (
            <button
              key={k}
              type="button"
              className="st-deck__dot"
              aria-label={`Show ${unit} ${k + 1} of ${count}`}
              aria-current={k === active ? 'true' : undefined}
              onClick={() => go(k)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
