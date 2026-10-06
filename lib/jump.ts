// Jumps never scroll through scrubbed animation (it strobes): fade a veil,
// jump instantly to the chapter's poster frame, focus its heading.

export const JUMP_FLAG = '__tlJumpAt'

export function posterTop(el: HTMLElement) {
  const top = el.getBoundingClientRect().top + window.scrollY
  if (document.documentElement.dataset.motion !== 'full') return top
  const len = parseFloat(el.style.getPropertyValue('--len')) || 0 // svh
  return top + (len / 100) * window.innerHeight
}

export function jumpTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const veil = document.querySelector<HTMLElement>('.veil')
  const full = document.documentElement.dataset.motion === 'full'
  const go = () => {
    ;(window as unknown as Record<string, number>)[JUMP_FLAG] = performance.now()
    window.scrollTo({ top: posterTop(el), behavior: 'instant' as ScrollBehavior })
    const h = el.querySelector<HTMLElement>('h1, h2')
    if (h) {
      h.setAttribute('tabindex', '-1')
      h.focus({ preventScroll: true })
    }
    requestAnimationFrame(() => veil?.classList.remove('is-on'))
  }
  if (veil && full) {
    veil.classList.add('is-on')
    setTimeout(go, 250)
  } else go()
}

export const recentlyJumped = () =>
  performance.now() - ((window as unknown as Record<string, number>)[JUMP_FLAG] ?? -1e9) < 600
