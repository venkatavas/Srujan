'use client'

// The opening, handed straight to the hero. The preloader is laid out with the hero's own layout
// and type classes (invisible placeholders hold the lines it does not show), so its name, line
// and point sit exactly where the hero's are. The name's words rise and the line draws from its
// point while a 0 to 100 counter fills; then the opening simply fades away over the identical
// hero name and line, which never move, and the rest of the hero arrives in reading order
// (site.css, html[data-handoff]). About 1.3s (1s on phones), once per browser session.
// The layout's boot script turns it on before first paint (html[data-pre='on']) only with full
// motion on the home page, skips it on any key, click, wheel or touch (even before this script
// loads), and owns the exit (window.__ssPreEnd, app/layout.tsx). This component only decides when
// the opening has played long enough. Without JavaScript or with reduced motion it never shows.
// Failsafes: this script ends it by 3s after navigation, and CSS hides it at 3.5s regardless.
import { type CSSProperties, useEffect } from 'react'
import './preloader.css'

const MIN_MS = 1300
const MIN_MS_PHONE = 1000
const FAILSAFE_MS = 3000

declare global {
  interface Window {
    __ssPreEnd?: () => void
  }
}

export function Preloader({ name, eyebrow, title, line }: { name: string; eyebrow: string[]; title: string; line: string }) {
  useEffect(() => {
    if (document.documentElement.dataset.pre !== 'on') return
    const end = () => window.__ssPreEnd?.()
    const ready = document.fonts?.ready ?? Promise.resolve()
    const minMs = matchMedia('(max-width: 719px)').matches ? MIN_MS_PHONE : MIN_MS
    // Timed from the navigation, as its CSS animations are: a late hydration never adds a pause.
    const min = new Promise((r) => window.setTimeout(r, Math.max(0, minMs - performance.now())))
    Promise.all([ready, min]).then(end)
    // Timed from the navigation too, so a slow hydration cannot leave scrolling paused.
    const failsafe = window.setTimeout(end, Math.max(0, FAILSAFE_MS - performance.now()))
    return () => window.clearTimeout(failsafe)
  }, [])

  return (
    <div className="pre" aria-hidden="true">
      {/* The hero's own layout: the same core, the same type classes, the same slots. */}
      <div className="pre__hero">
        <div className="y2-hero__core">
          <p className="y2-eyebrow pre__ghost">
            {eyebrow.map((f, i) => (
              <span key={f}>
                {i > 0 ? <span className="y2-eyebrow__dot"> · </span> : null}
                {f}
              </span>
            ))}
          </p>
          <p className="y2-name pre__name">
            {name.split(' ').map((w, i, all) => (
              <span key={i}>
                <span className="pre__w" style={{ '--i': i } as CSSProperties}>
                  <span>{w}</span>
                </span>
                {i < all.length - 1 ? ' ' : null}
              </span>
            ))}
          </p>
          <p className="y2-title pre__ghost">{title}</p>
          <div className="y2-rule pre__rule">
            <span className="y2-rule__pt pre__pt" />
          </div>
          <p className="y2-sub pre__caption">{line}</p>
        </div>
      </div>
      <div className="pre__foot">
        <span className="pre__count" />
        <span className="pre__bar">
          <i />
        </span>
      </div>
    </div>
  )
}
