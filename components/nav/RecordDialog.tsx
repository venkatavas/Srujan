'use client'

import { useEffect, useRef, useState } from 'react'
import { jumpTo } from '@/lib/jump.ts'

type Item = { id: string; label: string; key: string }

/** The Record: a plain, printable, keyboard-first index — the fast path through the site. */
export function RecordDialog({ chapters, children }: { chapters: Item[]; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(document.documentElement.dataset.motion === 'reduce')
    const open = () => ref.current?.open || ref.current?.showModal()
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (e.key === '?') {
        e.preventDefault()
        if (ref.current?.open) ref.current.close()
        else open()
        return
      }
      const c = chapters.find((x) => x.key === e.key)
      if (c) {
        ref.current?.close()
        jumpTo(c.id)
      }
    }
    window.addEventListener('tl:record', open)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('tl:record', open)
      window.removeEventListener('keydown', onKey)
    }
  }, [chapters])

  const toggleMotion = () => {
    try {
      if (reduced) localStorage.removeItem('tl-motion')
      else localStorage.setItem('tl-motion', 'reduce')
    } catch {}
    location.reload()
  }

  return (
    <dialog ref={ref} className="record" aria-labelledby="record-h" onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <div className="record__inner">
        <div className="record__bar">
          <h2 id="record-h" className="record__h">
            Record
          </h2>
          <button type="button" className="record__close" onClick={() => ref.current?.close()}>
            Close
          </button>
        </div>
        <nav aria-label="Chapters" className="record__nav">
          <ol>
            {chapters.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    ref.current?.close()
                    jumpTo(c.id)
                  }}
                >
                  <kbd>{c.key}</kbd> {c.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        {children}
        <div className="record__tools">
          <button type="button" onClick={() => window.print()}>
            Print record
          </button>
          <button type="button" onClick={toggleMotion} aria-pressed={reduced}>
            {reduced ? 'Turn motion back on' : 'Reduce motion'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
