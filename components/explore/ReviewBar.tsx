'use client'

// The review bar on each direction sketch: jump between its five screens, flip to the next
// sketch, show which copy is still a draft, and read the intended motion (sketches are at rest).
// For the chosen direction it also switches the Stage 4 colour and type studies.
import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReviewItem } from '@/lib/content/review.ts'
import type { Choice, SketchOptions } from './sketch/index.ts'

type Screen = { id: string; label: string; note: string }
type Key = 'hero' | 'palette' | 'type'

/** Applies a study to the sketch root and keeps it in the URL, so a link shows the same study. */
function apply(key: Key, value: string, list: Choice[]) {
  const root = document.querySelector<HTMLElement>('.sk')
  const isDefault = value === list[0].id
  if (root) {
    if (isDefault) delete root.dataset[key]
    else root.dataset[key] = value
  }
  const url = new URL(location.href)
  if (isDefault) url.searchParams.delete(key)
  else url.searchParams.set(key, value)
  history.replaceState(null, '', url)
}

/** Nothing to subscribe to: the URL is read once, on the client. */
const subscribeNever = () => () => {}

/** One study dropdown; restores its value from the URL on load. */
function Study({ name, field, list }: { name: string; field: Key; list: Choice[] }) {
  // The URL's choice, read on the client (the server and hydration render the default).
  const fromUrl = useSyncExternalStore(
    subscribeNever,
    () => {
      const v = new URLSearchParams(location.search).get(field)
      return v && list.some((c) => c.id === v) ? v : null
    },
    () => null,
  )
  const [picked, setValue] = useState<string | null>(null)
  const value = picked ?? fromUrl ?? list[0].id
  // Apply the URL's choice to the page once it is known (an external system: the document).
  useEffect(() => {
    if (fromUrl) apply(field, fromUrl, list)
  }, [field, fromUrl, list])
  return (
    <label className="sk-bar__select">
      {name}
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          apply(field, e.target.value, list)
        }}
      >
        {list.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ReviewBar({
  label,
  screens,
  prev,
  next,
  options,
  facts,
}: {
  label: string
  screens: Screen[]
  prev: string
  next: string
  options?: SketchOptions
  /** Facts to confirm with Sai: review only, never shown on the page itself. */
  facts?: ReviewItem[]
}) {
  const [drafts, setDrafts] = useState(false)
  useEffect(() => {
    const d = document.documentElement
    if (drafts) d.dataset.drafts = ''
    else delete d.dataset.drafts
    return () => {
      delete d.dataset.drafts
    }
  }, [drafts])
  return (
    <nav className="sk-bar" aria-label="Sketch review">
      <a href="/explore#sketches">Exploration</a>
      <a href={prev} aria-label="Previous sketch">
        ←
      </a>
      <strong>{label}</strong>
      <a href={next} aria-label="Next sketch">
        →
      </a>
      <ol className="sk-bar__screens">
        {screens.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} title={s.label}>
              {i + 1}
              <span className="sk-bar__sr"> {s.label}</span>
            </a>
          </li>
        ))}
      </ol>
      {options?.heroes && <Study name="Hero" field="hero" list={options.heroes} />}
      {options?.palettes && <Study name="Colour" field="palette" list={options.palettes} />}
      {options?.types && <Study name="Type" field="type" list={options.types} />}
      <label className="sk-bar__toggle">
        <input type="checkbox" checked={drafts} onChange={(e) => setDrafts(e.target.checked)} /> Review marks
      </label>
      {facts && (
        <details className="sk-bar__notes">
          <summary>Facts to confirm ({facts.length})</summary>
          <dl>
            {facts.map((f) => (
              <div key={f.item}>
                <dt>
                  {f.area} · {f.kind}
                </dt>
                <dd>{f.item}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
      <details className="sk-bar__notes">
        <summary>Motion notes</summary>
        <dl>
          {screens.map((s, i) => (
            <div key={s.id}>
              <dt>
                {i + 1}. {s.label}
              </dt>
              <dd>{s.note || 'Still.'}</dd>
            </div>
          ))}
        </dl>
        <p>Sketches are shown at rest. Motion is built only in Stage 5, for the chosen direction.</p>
      </details>
    </nav>
  )
}
