'use client'
// The three readers ("How I work", stage 3). Progressive: without JavaScript (and before hydration) all
// three readers are shown stacked, each with its heading; once enhanced it becomes a real tabs
// pattern (tablist, roving tabindex, arrow keys, Home and End). Every reader string is a draft.
import { type KeyboardEvent, useRef, useState, useSyncExternalStore } from 'react'
import { D } from '@/components/marks.tsx'

type Reader = { id: string; label: string; points: string[] }

const subscribe = () => () => {}

export function Readers({ readers, labelledBy }: { readers: Reader[]; labelledBy: string }) {
  // False on the server and during hydration (the stacked fallback), true once on the client.
  const enhanced = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  if (!enhanced)
    return (
      <div className="y2-readers y2-readers--stacked">
        {readers.map((r) => (
          <section key={r.id} className={`y2-reader y2-tone-${r.id}`} aria-label={r.label}>
            <h4 className="y2-reader__who">
              <D>{r.label}</D>
            </h4>
            <Points points={r.points} />
          </section>
        ))}
      </div>
    )

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
    <div className="y2-readers">
      <div className="y2-tabs" role="tablist" aria-labelledby={labelledBy}>
        {readers.map((r, i) => (
          <button
            key={r.id}
            ref={(el) => {
              tabs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`y2-tab-${r.id}`}
            aria-controls={`y2-panel-${r.id}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className={`y2-tab y2-tone-${r.id}`}
            onClick={() => setActive(i)}
            onKeyDown={onKey}
          >
            <D>{r.label}</D>
          </button>
        ))}
      </div>
      {readers.map((r, i) => (
        <div
          key={r.id}
          role="tabpanel"
          id={`y2-panel-${r.id}`}
          aria-labelledby={`y2-tab-${r.id}`}
          hidden={i !== active}
          tabIndex={0}
          className={`y2-reader y2-tone-${r.id}`}
        >
          <Points points={r.points} />
        </div>
      ))}
    </div>
  )
}

function Points({ points }: { points: string[] }) {
  return (
    <ul className="y2-points">
      {points.map((p) => (
        <li key={p}>
          <D>{p}</D>
        </li>
      ))}
    </ul>
  )
}
