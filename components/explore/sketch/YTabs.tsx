'use client'
// Sketch Y: the reader choice as a segmented control. A real tabs pattern: a tablist with roving
// tabindex, arrow keys, Home and End. Every reader string is a draft, so it renders inside <D>.
// Operations' trade-off is shown beside the control (always visible), not inside its panel.
import { useRef, useState, type KeyboardEvent } from 'react'
import { D } from '@/components/marks.tsx'

type Reader = { id: string; label: string; points: string[]; tradeoff?: string }

export function YTabs({ readers, labelledBy }: { readers: Reader[]; labelledBy: string }) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (to: number) => {
    const n = (to + readers.length) % readers.length
    setActive(n)
    tabs.current[n]?.focus()
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const map: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: readers.length - 1,
    }
    if (e.key in map) {
      e.preventDefault()
      move(map[e.key])
    }
  }

  return (
    <div className="sy-tabs">
      <div className="sy-seg" role="tablist" aria-labelledby={labelledBy}>
        {readers.map((r, i) => (
          <button
            key={r.id}
            ref={(el) => {
              tabs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`sy-tab-${r.id}`}
            aria-controls={`sy-panel-${r.id}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className={`sy-seg__tab sy-tone-${r.id}`}
            onClick={() => setActive(i)}
            onKeyDown={onKey}
          >
            <span className="sy-dot" aria-hidden="true" />
            <D>{r.label}</D>
          </button>
        ))}
      </div>
      {readers.map((r, i) => (
        <div
          key={r.id}
          role="tabpanel"
          id={`sy-panel-${r.id}`}
          aria-labelledby={`sy-tab-${r.id}`}
          hidden={i !== active}
          tabIndex={0}
          className={`sy-panel sy-tone-${r.id}`}
        >
          <p className="sy-panel__who">
            <span className="sy-dot" aria-hidden="true" />
            <D>{r.label}</D>
          </p>
          <ul className="sy-panel__points">
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
