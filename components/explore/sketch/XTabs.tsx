'use client'

// Sketch X: the three readers as annotation pens on the same requirement. A real tabs pattern:
// role tablist/tab/tabpanel, aria-selected, arrow keys with Home and End, and a roving tabindex.
// Every word here is draft wording from the content model.
import { type KeyboardEvent, useRef, useState } from 'react'
import { readers } from '../data.ts'
import { D } from '@/components/marks.tsx'

/** A short pen stroke: decoration only, it encodes nothing. */
function Tick() {
  return (
    <svg className="sx-tick" viewBox="0 0 18 10" aria-hidden="true" focusable="false">
      <path d="M1.5 6.2c2.6-.4 5-1.6 7.2-2.9 2.3-1.3 4.6-2.3 7.8-2.1" />
    </svg>
  )
}

export function XTabs({ labelledBy }: { labelledBy: string }) {
  const [sel, setSel] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const go = (i: number) => {
    const n = (i + readers.length) % readers.length
    setSel(n)
    tabs.current[n]?.focus()
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => go(sel + 1),
      ArrowLeft: () => go(sel - 1),
      Home: () => go(0),
      End: () => go(readers.length - 1),
    }
    const k = keys[e.key]
    if (k) {
      e.preventDefault()
      k()
    }
  }

  const ops = readers.find((r) => r.tradeoff)

  return (
    <div className="sx-readers">
      <div className="sx-tabs" role="tablist" aria-labelledby={labelledBy}>
        {readers.map((r, i) => (
          <button
            key={r.id}
            ref={(el) => {
              tabs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`sx-tab-${r.id}`}
            aria-controls={`sx-panel-${r.id}`}
            aria-selected={i === sel}
            tabIndex={i === sel ? 0 : -1}
            className={`sx-tab sx-pen--${r.id}`}
            onClick={() => setSel(i)}
            onKeyDown={onKey}
          >
            <span className="sx-tab__nib" aria-hidden="true" />
            <D>{r.label}</D>
          </button>
        ))}
      </div>
      <div className="sx-readers__body">
        {readers.map((r, i) => (
          <div
            key={r.id}
            role="tabpanel"
            id={`sx-panel-${r.id}`}
            aria-labelledby={`sx-tab-${r.id}`}
            hidden={i !== sel}
            tabIndex={0}
            className={`sx-panel sx-pen--${r.id}`}
          >
            <ul>
              {r.points.map((p) => (
                <li key={p}>
                  <Tick />
                  <D>{p}</D>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {ops?.tradeoff && (
          <p className={`sx-trade sx-pen--${ops.id}`}>
            <span className="sx-trade__who">
              <D>{ops.label}</D>
            </span>
            <span className="sx-trade__what">
              <D>{ops.tradeoff}</D>
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
