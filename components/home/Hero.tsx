// The hero: the identity line (focus areas, name, approved positioning, supporting line) with its
// quiet instrument rails. Its own module, so pages that only need the hero do not ship the other
// sections' client code. The floating nav sits above it.
import { Fragment } from 'react'
import { name, positioning } from '@/content/live.ts'
import { page } from '@/content/page.ts'
import { valueOf } from '@/content/schema.ts'
import './tokens.css'
import './home.css'
import './site.css'

/** The positioning's last word carries the accent: "Digital Health" + "Strategist". */
const titleWords = (positioning?.title ?? '').split(' ')
const titleHead = titleWords.slice(0, -1).join(' ')
const titleLast = titleWords.at(-1) ?? ''

export function Hero() {
  return (
    <section id="top" className="y2-hero" aria-labelledby="y2-name">
      {/* Two quiet instrument rails at the edges; their points follow the pointer (Motion.tsx). */}
      <span className="y2-rail y2-rail--l" aria-hidden="true">
        <i />
      </span>
      <span className="y2-rail y2-rail--r" aria-hidden="true">
        <i />
      </span>
      <div className="y2-hero__core">
        <p className="y2-eyebrow">
          {(valueOf(page.hero.focus) ?? []).map((f, i) => (
            <Fragment key={f}>
              {i > 0 ? (
                <span className="y2-eyebrow__dot" aria-hidden="true">
                  {' '}·{' '}
                </span>
              ) : null}
              {f}
            </Fragment>
          ))}
        </p>
        <h1 id="y2-name" className="y2-name">
          {name}
        </h1>
        <p className="y2-title">
          {titleHead} <span className="y2-title__accent">{titleLast}</span>
        </p>
        <div className="y2-rule" aria-hidden="true">
          <span className="y2-rule__pt" />
        </div>
        <p className="y2-sub">{positioning?.line}</p>
      </div>
    </section>
  )
}

