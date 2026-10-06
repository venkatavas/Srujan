'use client'

import { useEffect, useState } from 'react'

/** The interface steps back: a wordmark, the current chapter in plain words, and Index. */
export function Nav({ name }: { name: string }) {
  const [chapter, setChapter] = useState('top')
  const [label, setLabel] = useState('')
  const [env, setEnv] = useState<'night' | 'day'>('night')
  const [marked, setMarked] = useState(false)

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('section[data-chapter]')]
    const read = (el: HTMLElement) => {
      setChapter(el.dataset.chapter!)
      setLabel(el.dataset.chapter === 'top' ? '' : el.dataset.label ?? '')
      setEnv((el.dataset.envNow ?? el.dataset.env) as 'night' | 'day')
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && read(e.target as HTMLElement)),
      { rootMargin: '-4% 0px -95% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    const onEnv = (e: Event) => setEnv((e as CustomEvent).detail)
    const onMark = (e: Event) => setMarked((e as CustomEvent).detail)
    window.addEventListener('tl:env', onEnv)
    window.addEventListener('tl:mark', onMark)
    return () => {
      io.disconnect()
      window.removeEventListener('tl:env', onEnv)
      window.removeEventListener('tl:mark', onMark)
    }
  }, [])

  return (
    <header className="nav" data-env={env} data-chapter={chapter}>
      <a href="#top" className="nav__mark" aria-label={`${name}, back to top`} data-show={chapter !== 'top' || marked}>
        {name}
        <span className="point" aria-hidden="true" />
      </a>
      <div className="nav__right">
        <span key={label} className="nav__label" aria-hidden="true">
          {label}
        </span>
        <button
          type="button"
          className="nav__index"
          aria-haspopup="dialog"
          aria-keyshortcuts="?"
          onClick={() => window.dispatchEvent(new Event('tl:record'))}
        >
          Index
        </button>
      </div>
    </header>
  )
}
