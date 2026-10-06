import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { recentlyJumped } from '@/lib/jump.ts'
import business from './chapters/business.ts'
import contact from './chapters/contact.ts'
import hero from './chapters/hero.ts'
import leadership from './chapters/leadership.ts'
import media from './chapters/media.ts'
import technology from './chapters/technology.ts'
import ventures from './chapters/ventures.ts'
import { VELOCITY_SKIP } from './tempo.ts'

export type Env = {
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  touch: boolean
  narrow: boolean
  /** Play a timed beat — or complete it at once for skimmers and keyboard jumps. */
  fire: (tl: gsap.core.Timeline, st?: ScrollTrigger) => void
  /** A scroll-scrubbed scene over the chapter's sticky track; fn receives progress 0..1. */
  scene: (el: HTMLElement, scrub: number | true, fn: (p: number, st: ScrollTrigger) => void) => ScrollTrigger
  /** Called on every ScrollTrigger refresh (resize, fonts) — regenerate geometry here. */
  onRefresh: (fn: () => void) => void
}

export type Controller = (el: HTMLElement, env: Env) => () => void

const controllers: Record<string, Controller> = { top: hero, technology, business, media, leadership, ventures, contact }

export function boot() {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })

  const refreshers: (() => void)[] = []
  const env: Env = {
    gsap,
    ScrollTrigger,
    touch: matchMedia('(hover: none)').matches,
    narrow: matchMedia('(max-width: 760px)').matches,
    fire(tl, st) {
      if (recentlyJumped() || (st && Math.abs(st.getVelocity()) > VELOCITY_SKIP)) tl.progress(1)
      else tl.play()
    },
    scene(el, scrub, fn) {
      const proxy = { p: 0 }
      const tw = gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: { trigger: el.querySelector('.ch__track')!, start: 'top top', end: 'bottom bottom', scrub },
        onUpdate: () => fn(proxy.p, tw.scrollTrigger!),
      })
      return tw.scrollTrigger!
    },
    onRefresh(fn) {
      refreshers.push(fn)
      fn()
    },
  }

  const onRefreshInit = () => refreshers.forEach((f) => f())
  ScrollTrigger.addEventListener('refreshInit', onRefreshInit)

  const cleanups: (() => void)[] = []
  document.querySelectorAll<HTMLElement>('section[data-chapter]').forEach((el) => {
    const c = controllers[el.dataset.chapter!]
    if (c) cleanups.push(c(el, env))
  })

  document.fonts.ready.then(() => ScrollTrigger.refresh())

  // Deterministic states for review and tests: ?seek=media:0.72
  const seek = new URLSearchParams(location.search).get('seek')
  if (seek) {
    const [id, p] = seek.split(':')
    const el = document.getElementById(id)
    const track = el?.querySelector<HTMLElement>('.ch__track')
    if (track) {
      ;(window as unknown as Record<string, number>).__tlJumpAt = performance.now() + 1500
      const top = track.getBoundingClientRect().top + scrollY
      requestAnimationFrame(() => window.scrollTo(0, top + Number(p || 1) * (track.offsetHeight - innerHeight)))
    }
  }

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
    cleanups.forEach((c) => c())
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }
}
