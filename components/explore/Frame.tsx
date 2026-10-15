'use client'

// A wireframe shown at a real device width (1440 or 390), scaled down with CSS zoom, with a line
// where the first screen ends. Below it, a live check of which ten-second answers sit above that line.
import { type ReactNode, useEffect, useRef, useState } from 'react'

type Question = { q: string; label: string }
type Hits = Record<string, boolean>

function measure(root: HTMLElement, fold: number, questions: readonly Question[]): Hits {
  const hits: Hits = {}
  for (const { q } of questions) {
    const el = root.querySelector(`[data-q="${q}"]`)
    hits[q] = !!el && el.getBoundingClientRect().bottom <= fold + 1
  }
  return hits
}

function Checks({ hits, questions }: { hits: Hits | null; questions: readonly Question[] }) {
  return (
    <ul className="ex-checks">
      {questions.map(({ q, label }) => {
        const ok = hits?.[q]
        return (
          <li key={q} data-ok={hits ? String(ok) : undefined}>
            <span aria-hidden="true">{hits ? (ok ? '✓' : '✕') : '·'}</span> {label}
            <span className="ex-sr">{hits ? (ok ? ': in the first screen' : ': not in the first screen') : ''}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function Frame({
  width,
  height,
  scale,
  label,
  href,
  questions,
  children,
}: {
  width: number
  height: number
  scale: number
  label: string
  href: string
  questions: readonly Question[]
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hits, setHits] = useState<Hits | null>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const run = () => {
      const line = root.querySelector('.ex-fold')
      if (line) setHits(measure(root, line.getBoundingClientRect().top, questions))
    }
    run()
    document.fonts?.ready.then(run)
    const ro = new ResizeObserver(run)
    ro.observe(root)
    return () => ro.disconnect()
  }, [questions])
  return (
    <figure className="ex-figure">
      <figcaption className="ex-figcap">
        <span>{label}</span>
        <a href={href}>Open at full size</a>
      </figcaption>
      <div className="ex-frame" style={{ width: width * scale }}>
        {/* Thumbnails are for looking, not tabbing through. */}
        <div ref={ref} className="ex-viewport" inert style={{ width, zoom: scale, ['--vh' as string]: `${height}px` }}>
          {children}
          <div className="ex-fold" style={{ top: height }} aria-hidden="true">
            <span>First screen ends</span>
          </div>
        </div>
      </div>
      <Checks hits={hits} questions={questions} />
    </figure>
  )
}

/** The same check on a full-size page, against the real window. */
export function FoldPanel({ questions }: { questions: readonly Question[] }) {
  const [hits, setHits] = useState<Hits | null>(null)
  const [size, setSize] = useState('')
  useEffect(() => {
    const run = () => {
      const root = document.querySelector<HTMLElement>('.wf-page')
      if (!root) return
      // Measured as if scrolled to the top.
      const fold = window.innerHeight - window.scrollY
      setHits(measure(root, fold, questions))
      setSize(`${window.innerWidth} × ${window.innerHeight}`)
    }
    run()
    document.fonts?.ready.then(run)
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
  }, [questions])
  return (
    <aside aria-label="Ten-second check">
      <details className="ex-panel" open>
        <summary>First screen at {size || '…'}</summary>
        <Checks hits={hits} questions={questions} />
      </details>
    </aside>
  )
}
