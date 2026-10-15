'use client'

// Sketch Z: the three readers as real tabs. Client is selected at rest; each reader keeps its
// own colour and its label, so the choice never depends on colour alone.
import { type KeyboardEvent, useRef, useState } from 'react'
import { D } from '@/components/marks.tsx'

export type ZReader = { id: string; label: string; points: string[]; tone: string }

export function ZTabs({ readers, labelledBy }: { readers: ZReader[]; labelledBy: string }) {
  const [sel, setSel] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const go = (i: number) => {
    const n = (i + readers.length) % readers.length
    setSel(n)
    tabs.current[n]?.focus()
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(sel + 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(sel - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(readers.length - 1)
    else return
    e.preventDefault()
  }

  return (
    <div className="z-tabs">
      <div role="tablist" aria-labelledby={labelledBy} className="z-tabs__list">
        {readers.map((r, i) => (
          <button
            key={r.id}
            ref={(el) => {
              tabs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`z-tab-${r.id}`}
            aria-selected={sel === i}
            aria-controls={`z-panel-${r.id}`}
            tabIndex={sel === i ? 0 : -1}
            className={`z-tab z-t-${r.tone}`}
            onClick={() => setSel(i)}
            onKeyDown={onKey}
          >
            <span className="z-sw" aria-hidden="true" />
            <D>{r.label}</D>
          </button>
        ))}
      </div>
      {readers.map((r, i) => (
        <div
          key={r.id}
          role="tabpanel"
          id={`z-panel-${r.id}`}
          aria-labelledby={`z-tab-${r.id}`}
          hidden={sel !== i}
          tabIndex={0}
          className={`z-panel z-t-${r.tone}`}
        >
          <ul>
            {r.points.map((p) => (
              <li key={p}>
                <D>{p}</D>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
