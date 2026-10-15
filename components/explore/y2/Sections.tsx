// The review sketch's sections (Sketch Y, refined, Phase 1; the hero is in Hero.tsx): the current
// roles as plain rows, "How I work" as an
// open four-stage sequence on one rule, one editorial index for career and education, and a calm
// contact close with the page's only raised surface. Every fact comes from the content model via
// components/explore/data.ts; drafts render in <D>. Elements marked data-reveal rise in on scroll
// (components/home/Motion.tsx); without JavaScript or with reduced motion they are simply shown.
import { ArrowUpRight } from 'lucide-react'
import { type CSSProperties, Fragment } from 'react'
import {
  briefText,
  COPY,
  contact,
  copy,
  currentRole,
  decision,
  education,
  noteFor,
  period,
  perspectives,
  readers,
  requirementLine,
  requirements,
  roles,
  ventures,
} from '@/components/explore/data.ts'
import { D, F } from '@/components/marks.tsx'
import { Readers } from './Readers.tsx'
import '@/components/home/tokens.css'
import '@/components/home/home.css'
import './y2.css'
import '@/components/home/site.css'

// ── The brief, with each requirement's phrase marked ────────────────────────────────────

type Span = { text: string; rs: string[]; ends: string[] }

/** Splits the verified brief into runs, each tagged with the requirements whose phrase covers it. */
function segments(): Span[] {
  const cover: string[][] = [...briefText].map(() => [])
  const endAt = new Map<number, string[]>()
  for (const r of requirements) {
    const at = briefText.indexOf(r.value)
    if (at < 0) continue
    for (let i = at; i < at + r.value.length; i++) cover[i].push(r.id)
    const end = at + r.value.length - 1
    endAt.set(end, [...(endAt.get(end) ?? []), r.id])
  }
  const out: Span[] = []
  let cur: Span | undefined
  ;[...briefText].forEach((ch, i) => {
    const key = cover[i].join(' ')
    if (!cur || cur.rs.join(' ') !== key) {
      cur = { text: '', rs: cover[i], ends: [] }
      out.push(cur)
    }
    cur.text += ch
    const ends = endAt.get(i)
    if (ends) {
      cur.ends = ends
      cur = undefined
    }
  })
  return out
}

export function Now() {
  return (
    <section id="now" className="y2-sec" aria-labelledby="y2-now-h">
      <div className="y2-wrap">
        <h2 id="y2-now-h" className="y2-h2" data-reveal>
          <D>{COPY.now}</D>
        </h2>
        <ul className="y2-now">
          {currentRole && (
            <li className="y2-now__row y2-tone-now" data-reveal style={{ '--i': 1 } as CSSProperties}>
              <span className="y2-now__org">{currentRole.org}</span>
              <span className="y2-now__role">{currentRole.title}</span>
            </li>
          )}
          {ventures.map((v, i) => (
            <li key={v.id} className="y2-now__row y2-tone-venture" data-reveal style={{ '--i': i + 2 } as CSSProperties}>
              <span className="y2-now__org">{v.name}</span>
              <span className="y2-now__role">
                <F f={v.role} />
              </span>
              <span className="y2-now__line">
                <F f={v.line} />
                {v.sourceUrl ? (
                  <>
                    {' '}
                    <a className="y2-link" href={v.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <D>{COPY.publicRecord}</D>
                      <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                      <span className="sk-bar__sr"> (opens in a new tab)</span>
                    </a>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function HowIWork() {
  const op = readers.find((r) => r.tradeoff)
  return (
    <section id="brief" className="y2-sec y2-how" aria-labelledby="y2-how-h">
      <div className="y2-wrap">
        <header className="y2-head" data-reveal>
          <h2 id="y2-how-h" className="y2-h2">
            <D>{COPY.howIWork}</D>
          </h2>
          <p className="y2-caption">
            <D>{COPY.illustration}</D>
          </p>
        </header>

        <ol className="y2-stages">
          <li className="y2-stage" data-reveal>
            <span className="y2-stage__n" aria-hidden="true">
              01
            </span>
            <h3 className="y2-stage__label">
              <D>{COPY.stepBrief}</D>
            </h3>
            <div className="y2-stage__body">
              <p className="y2-brieftext">
                {segments().map((s, i) => (
                  <Fragment key={i}>
                    <span className={s.rs.length ? `y2-mark y2-mark--${s.rs.length}` : undefined}>{s.text}</span>
                    {s.ends.length ? (
                      <sup className="y2-rid" aria-hidden="true">
                        {s.ends.join(' ')}
                      </sup>
                    ) : null}
                  </Fragment>
                ))}
              </p>
            </div>
          </li>

          <li className="y2-stage" data-reveal>
            <span className="y2-stage__n" aria-hidden="true">
              02
            </span>
            <h3 className="y2-stage__label">
              <D>{COPY.requirements}</D>
            </h3>
            <div className="y2-stage__body">
              <ol className="y2-reqs">
                {requirements.map((r) => (
                  <li key={r.id}>
                    <span className="y2-reqs__id">{r.id}</span>
                    <span className="y2-reqs__label">
                      <D>{r.label}</D>
                    </span>
                    <span className="y2-reqs__value">{r.value}</span>
                  </li>
                ))}
              </ol>
            </div>
          </li>

          <li className="y2-stage" data-reveal>
            <span className="y2-stage__n" aria-hidden="true">
              03
            </span>
            <h3 id="y2-readers-h" className="y2-stage__label">
              <D>{COPY.readers}</D>
            </h3>
            <div className="y2-stage__body">
              <p className="y2-subject">
                <D>{requirementLine}</D>
              </p>
              <Readers readers={readers} labelledBy="y2-readers-h" />
              {op ? (
                <p className="y2-aside y2-tone-operations">
                  <D>{op.label}</D>: <D>{op.tradeoff}</D>
                </p>
              ) : null}
            </div>
          </li>

          <li className="y2-stage y2-stage--decision" data-reveal>
            <span className="y2-stage__n" aria-hidden="true">
              04
            </span>
            <h3 className="y2-stage__label">
              <D>{COPY.decision}</D>
            </h3>
            <div className="y2-stage__body">
              <ul className="y2-persp">
                {perspectives.map((p) => (
                  <li key={p.label}>
                    <span className="y2-persp__label">
                      <D>{p.label}</D>
                    </span>
                    <span className="y2-persp__q">
                      <D>{p.asks[0]}</D>
                    </span>
                    <span className="y2-persp__rest">
                      <D>{p.asks.slice(1).join(' · ')}</D>
                    </span>
                  </li>
                ))}
              </ul>
              <svg className="y2-converge" viewBox="0 0 600 56" preserveAspectRatio="none" aria-hidden="true">
                <path d="M100 0 C100 34, 300 22, 300 56" pathLength={1} />
                <path d="M300 0 L300 56" pathLength={1} />
                <path d="M500 0 C500 34, 300 22, 300 56" pathLength={1} />
              </svg>
              <p className="y2-decision">
                <span className="y2-decision__text">
                  <D>{decision}</D>
                </span>
                <span className="y2-tag">
                  <D>{COPY.illustrative}</D>
                </span>
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  )
}

export function Path() {
  const career = [...roles].reverse()
  return (
    <section id="path" className="y2-sec" aria-labelledby="y2-path-h">
      <div className="y2-wrap">
        <h2 id="y2-path-h" className="y2-h2" data-reveal>
          <D>{COPY.path}</D>
        </h2>
        <div className="y2-path">
          <div data-reveal>
            <h3 className="y2-h3">
              <D>{COPY.career}</D>
            </h3>
            <ol className="y2-index">
              {career.map((r) => {
                const note = noteFor(r)
                return (
                  <li key={`${r.title}-${r.org}`}>
                    <span className="y2-index__when">{period(r)}</span>
                    <span className="y2-index__what">
                      <span className="y2-index__title">{r.title}</span>
                      <span className="y2-index__org">
                        {r.org}
                        {r.place ? <span className="y2-index__place"> · {r.place}</span> : null}
                      </span>
                      {/* Verified notes only; draft responsibilities stay off the page. */}
                      {note && !note.draft ? <span className="y2-index__note">{note.text}</span> : null}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
          <div data-reveal style={{ '--i': 1 } as CSSProperties}>
            <h3 className="y2-h3">
              <D>{COPY.education}</D>
            </h3>
            <ol className="y2-index">
              {education.map((e) => (
                <li key={e.qualification}>
                  <span className="y2-index__when">
                    {e.from} - {e.to}
                  </span>
                  <span className="y2-index__what">
                    <span className="y2-index__title">{e.qualification}</span>
                    <span className="y2-index__org">{e.institution}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  const ready = contact.email !== undefined
  const channels = [COPY.linkedin, COPY.email, COPY.bookCall]
  return (
    <section id="contact" className="y2-sec y2-contact" aria-labelledby="y2-contact-h">
      <div className="y2-wrap y2-contact__grid">
        <div className="y2-contact__text" data-reveal>
          <h2 id="y2-contact-h" className="y2-h2 y2-h2--big">
            <F f={contact.headline} />
          </h2>
          <p className="y2-lede">
            <F f={contact.body} />
          </p>
          {/* Unavailable channels: listed only in review mode, never as dead links in public. */}
          <ul className="y2-channels" aria-label={COPY.connect}>
            {channels.map((c) => (
              <li key={c}>
                <D>{c}</D> <span className="y2-channels__state">{COPY.unavailable}</span>
              </li>
            ))}
          </ul>
        </div>
        <form className="y2-form" aria-labelledby="y2-contact-h" data-reveal style={{ '--i': 1 } as CSSProperties}>
          <fieldset className="y2-topics">
            <legend className="y2-label">
              <D>{COPY.topic}</D>
            </legend>
            <div className="y2-topics__list">
              {contact.topics.map((t) => (
                <label key={t} className="y2-topic">
                  <input type="radio" name="y2-topic" value={t} />
                  <span>
                    <D>{t}</D>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="y2-brief-text" className="y2-label">
            <D>{copy.contact.caption}</D>
          </label>
          <textarea id="y2-brief-text" name="brief" rows={5} placeholder={contact.placeholder} />
          <div className="y2-send">
            <button type="submit" className="y2-btn" disabled={!ready} aria-describedby={ready ? undefined : 'y2-send-note'}>
              <D>{COPY.sendBrief}</D>
            </button>
            {!ready ? (
              <p id="y2-send-note" className="y2-send__note">
                <D>{COPY.emailPending}</D>
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  )
}
