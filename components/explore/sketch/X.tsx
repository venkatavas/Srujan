// Sketch X: "The Living Document". The site as a calm, typeset working document: a reading
// column, a margin for notes, a contents rail, and an editor's coloured pens with fixed meanings
// (violet: Sai's own hand and every action; marigold: the brief's requirements; teal, coral and
// cobalt: the three readers). Every fact comes from ../data.ts; drafts are wrapped in <D>.
import { ArrowDown, ArrowRight } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import {
  COPY,
  NEEDED,
  briefLines,
  contact,
  copy,
  dates,
  decision,
  education,
  heroLines,
  name,
  nameLines,
  noteFor,
  nowOrgs,
  pastOrgs,
  perspectives,
  readers,
  requirementLine,
  requirements,
  roleTitles,
  roles,
  upcoming,
  v,
  ventures,
} from '../data.ts'
import { D, F, Need } from '@/components/marks.tsx'
import type { ScreenId } from './index.ts'
import { XTabs } from './XTabs.tsx'
import './x.css'

export const motion: Record<ScreenId, string> = {
  'hero-person':
    'Still on arrival. Hovering or focusing a field label draws a thin pen underline beneath it; nothing moves on its own.',
  'hero-brief':
    'Still on arrival. As the visitor scrolls, the marigold highlights sweep in behind each phrase, left to right, and sweep back out when scrolling up.',
  brief:
    'Scroll-linked and reversible: each highlight lights its matching margin note R1-R4 as it reaches the reading line. Choosing a reader slides that pen’s annotation in over 180ms; the decision record stays still.',
  path: 'Still. The contents rail marks the current part (Ventures, Career, Education) as it is read, following scroll in both directions.',
  contact:
    'Still. Focusing the page brings its ruled lines up slightly in contrast; choosing a topic fills its chip with violet ink.',
}

// The label for the brief, as the shared brief proposes it. Draft wording.
const BRIEF_LABEL = 'The brief'
const BRIEF_SOURCE = 'Provided by Sai'

/** Now: the current employer plus the two ventures (all verified names). */
const NOW = [...nowOrgs, ...ventures.map((c) => c.name)]

// ── Highlights: the brief's phrases marked where R1-R4 quote them ─────────────────────────

type Range = { id: string; s: number; e: number }
const within = (a: Range, b: Range) => a !== b && b.s <= a.s && b.e >= a.e

/** A line of the brief with each requirement's verbatim phrase highlighted, optionally numbered. */
function Marked({ text, refs = false }: { text: string; refs?: boolean }) {
  const all: Range[] = requirements.flatMap((r) => {
    const s = text.indexOf(r.value)
    return s < 0 ? [] : [{ id: r.id, s, e: s + r.value.length }]
  })
  const render = (s: number, e: number, pool: Range[], parentEnd: number): ReactNode[] => {
    const top = pool.filter((a) => !pool.some((b) => within(a, b))).sort((a, b) => a.s - b.s)
    const out: ReactNode[] = []
    let at = s
    for (const a of top) {
      if (a.s > at) out.push(text.slice(at, a.s))
      const kids = pool.filter((b) => within(b, a))
      // References that end where this phrase ends are gathered after it, in order.
      const ending = [a, ...kids.filter((k) => k.e === a.e)].map((x) => x.id).sort()
      out.push(
        <Fragment key={a.id}>
          <mark className="sx-hl">{render(a.s, a.e, kids, a.e)}</mark>
          {refs && a.e !== parentEnd && <sup className="sx-ref">{ending.join(' ')}</sup>}
        </Fragment>,
      )
      at = a.e
    }
    if (at < e) out.push(text.slice(at, e))
    return out
  }
  return <>{render(0, text.length, all, -1)}</>
}

// ── Shared pieces ────────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="sx-nav" aria-label="Primary">
      <a className="sx-nav__name" href="#hero-person">
        {name}
      </a>
      <ul className="sx-nav__links">
        <li>
          <a href="#brief">
            <D>{COPY.howIWork}</D>
          </a>
        </li>
        <li>
          <a href="#path">
            <D>{COPY.path}</D>
          </a>
        </li>
      </ul>
      <a className="sx-btn sx-btn--sm" href="#contact">
        <D>{COPY.writeBrief}</D>
      </a>
    </nav>
  )
}

const TOC = [
  { id: 'brief', label: COPY.howIWork, sub: [] },
  {
    id: 'path',
    label: COPY.path,
    sub: [
      { id: 'sx-ventures', label: COPY.ventures },
      { id: 'sx-career', label: COPY.career },
      { id: 'sx-education', label: COPY.education },
    ],
  },
  { id: 'contact', label: COPY.writeBrief, sub: [] },
]

/** The contents rail: a margin outline on desktop, a compact row on a phone. */
function Rail({ at }: { at: string }) {
  return (
    <nav className="sx-rail" aria-label="Contents">
      <a className="sx-rail__doc" href="#hero-person">
        {name}
      </a>
      <ol className="sx-rail__list">
        {TOC.map((t) => (
          <li key={t.id} className={t.id === at ? 'is-at' : undefined}>
            <a href={`#${t.id}`} aria-current={t.id === at ? 'location' : undefined}>
              <D>{t.label}</D>
            </a>
            {t.sub.length > 0 && (
              <ol className="sx-rail__sub">
                {t.sub.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      <D>{s.label}</D>
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Roles({ className }: { className: string }) {
  return (
    <p className={className}>
      {roleTitles.map((t, i) => (
        <Fragment key={t}>
          {i > 0 && (
            <span className="sx-dot" aria-hidden="true">
              {' · '}
            </span>
          )}
          <span className="sx-role">{t}</span>
        </Fragment>
      ))}
    </p>
  )
}

/** Front matter: Now and Before, set like a document's header fields. */
function FrontMatter({ compact = false }: { compact?: boolean }) {
  return (
    <dl className={`sx-fm${compact ? ' sx-fm--compact' : ''}`}>
      <div>
        <dt>
          <D>{COPY.now}</D>
        </dt>
        <dd>
          {NOW.map((o, i) => (
            <Fragment key={o}>
              {i > 0 && <span className="sx-dot"> · </span>}
              <span className="sx-org">{o}</span>
            </Fragment>
          ))}
        </dd>
      </div>
      <div>
        <dt>
          <D>{COPY.before}</D>
        </dt>
        <dd>
          {pastOrgs.map((o, i) => (
            <Fragment key={o}>
              {i > 0 && <span className="sx-dot"> · </span>}
              <span className="sx-org">{o}</span>
            </Fragment>
          ))}
        </dd>
      </div>
    </dl>
  )
}

function Ctas() {
  return (
    <div className="sx-ctas">
      <a className="sx-btn" href="#contact">
        <D>{COPY.writeBrief}</D>
        <ArrowRight className="sx-ico" strokeWidth={1.75} aria-hidden="true" />
      </a>
      <a className="sx-btn sx-btn--ghost" href="#brief">
        <D>{COPY.seeHow}</D>
        <ArrowDown className="sx-ico" strokeWidth={1.75} aria-hidden="true" />
      </a>
    </div>
  )
}

function BriefLabel({ className = '' }: { className?: string }) {
  return (
    <p className={`sx-label sx-label--mari ${className}`}>
      <D>{BRIEF_LABEL}</D>
      <span aria-hidden="true"> · </span>
      <D>{BRIEF_SOURCE}</D>
    </p>
  )
}

/** The three reader pens, as a key. Label and colour together, never colour alone. */
function Pens() {
  return (
    <ul className="sx-pens">
      {readers.map((r) => (
        <li key={r.id} className={`sx-pen sx-pen--${r.id}`}>
          <span className="sx-pen__nib" aria-hidden="true" />
          <D>{r.label}</D>
        </li>
      ))}
    </ul>
  )
}

// ── The sketch ───────────────────────────────────────────────────────────────────────────

export function Sketch() {
  const u = v(upcoming)
  const index = [...roles].reverse()
  return (
    <div className="sk sx">
      {/* 1. Opening, person first: a document header with front matter and one margin note. */}
      <section id="hero-person" className="sx-screen sx-hero" aria-labelledby="sx-name">
        <Nav />
        <div className="sx-hero__grid">
          <div className="sx-hero__main">
            <h1 id="sx-name" className="sx-name">
              {nameLines.map((l, i) => (
                <Fragment key={l}>
                  {i > 0 && ' '}
                  <span>{l}</span>
                </Fragment>
              ))}
            </h1>
            <Roles className="sx-roles" />
            <FrontMatter />
            <p className="sx-hero__pos">
              <Need>{NEEDED.positioning}</Need>
            </p>
            <Ctas />
          </div>
          <aside className="sx-hero__margin" aria-label={BRIEF_LABEL}>
            <div className="sx-note">
              <BriefLabel />
              <p className="sx-note__brief">
                {briefLines.map((l, i) => (
                  <Fragment key={l}>
                    {i > 0 && ' '}
                    <span className="sx-line">
                      <Marked text={l} />
                    </span>
                  </Fragment>
                ))}
              </p>
              <div className="sx-note__foot">
                <p className="sx-label">
                  <D>{COPY.readers}</D>
                </p>
                <Pens />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 2. Opening, brief first: the brief is the title of the page; Sai signs it below. */}
      <section id="hero-brief" className="sx-screen sx-hb" aria-labelledby="sx-hb-h">
        <Nav />
        <div className="sx-hb__grid">
          <BriefLabel className="sx-hb__label" />
          <h2 id="sx-hb-h" className="sx-hb__brief">
            {heroLines.map((l, i) => (
              <Fragment key={l}>
                {i > 0 && ' '}
                <span className="sx-line">
                  <Marked text={l} />
                </span>
              </Fragment>
            ))}
          </h2>
          <div className="sx-hb__band">
            <div className="sx-hb__by">
              <p className="sx-hb__name">{name}</p>
              <Roles className="sx-hb__roles" />
            </div>
            <FrontMatter compact />
            <Ctas />
          </div>
        </div>
      </section>

      {/* 3. The brief at its decision: highlights, margin notes, three pens and a decision record. */}
      <section id="brief" className="sx-screen sx-doc" aria-labelledby="sx-brief-h">
        <Rail at="brief" />
        <div className="sx-b">
          <h2 id="sx-brief-h" className="sx-h2 sx-b__h">
            <D>{COPY.howIWork}</D>
          </h2>
          <p className="sx-b__note">
            <D>{COPY.illustration}</D>
          </p>

          <div className="sx-b__brief">
            <BriefLabel />
            <p className="sx-b__text">
              {briefLines.map((l, i) => (
                <Fragment key={l}>
                  {i > 0 && ' '}
                  <span className="sx-line">
                    <Marked text={l} refs />
                  </span>
                </Fragment>
              ))}
            </p>
          </div>

          <div className="sx-b__reqs">
            <h3 id="sx-req-h" className="sx-label sx-label--mari">
              <D>{COPY.requirements}</D>
            </h3>
            <ol className="sx-reqs" aria-labelledby="sx-req-h">
              {requirements.map((r) => (
                <li key={r.id} className="sx-req">
                  <span className="sx-req__id">{r.id}</span>
                  <span className="sx-req__label">
                    <D>{r.label}</D>
                  </span>
                  <span className="sx-req__value">{r.value}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="sx-b__readers">
            <h3 id="sx-readers-h" className="sx-label">
              <D>{COPY.readers}</D>
            </h3>
            <p className="sx-reqline">
              <D>{requirementLine}</D>
            </p>
            <XTabs labelledBy="sx-readers-h" />
          </div>

          <div className="sx-b__decision">
            <div className="sx-record">
              <h3 id="sx-dec-h" className="sx-label sx-label--violet">
                <D>{COPY.decision}</D>
              </h3>
              <ul className="sx-persp">
                {perspectives.map((p) => (
                  <li key={p.label}>
                    <p className="sx-persp__label">
                      <D>{p.label}</D>
                    </p>
                    <ul className="sx-persp__asks">
                      {p.asks.map((a) => (
                        <li key={a}>
                          <D>{a}</D>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <p className="sx-decision">
                <ArrowRight className="sx-ico" strokeWidth={1.75} aria-hidden="true" />
                <D>{decision}</D>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Path: a quiet ruled index of ventures, roles and education. */}
      <section id="path" className="sx-screen sx-doc" aria-labelledby="sx-path-h">
        <Rail at="path" />
        <div className="sx-p">
          <h2 id="sx-path-h" className="sx-h2">
            <D>{COPY.path}</D>
          </h2>

          <div id="sx-ventures" className="sx-part">
            <h3 className="sx-label sx-label--violet sx-part__h">
              <D>{COPY.ventures}</D>
            </h3>
            <ul className="sx-ventures">
              {ventures.map((c) => (
                <li key={c.id} className="sx-venture">
                  <h4 className="sx-venture__name">{c.name}</h4>
                  <p className="sx-venture__role">
                    <F f={c.role} />
                  </p>
                  <p className="sx-venture__line">
                    <F f={c.line} />
                  </p>
                  {c.sourceUrl && (
                    <a className="sx-a sx-venture__src" href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <D>{COPY.publicRecord}</D> <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </li>
              ))}
              {u && (
                <li className="sx-venture sx-venture--draft">
                  <h4 className="sx-venture__name">
                    <D>{u.title}</D>
                  </h4>
                  <p className="sx-venture__role">
                    <D>{u.line}</D>
                  </p>
                  <p className="sx-venture__line">
                    <D>{u.sectors}</D>
                  </p>
                  <p className="sx-tag">
                    <D>{COPY.toConfirm}</D>
                  </p>
                </li>
              )}
            </ul>
          </div>

          <div id="sx-career" className="sx-part">
            <h3 className="sx-label sx-label--violet sx-part__h">
              <D>{COPY.career}</D>
            </h3>
            <ol className="sx-index">
              {index.map((r) => {
                const n = noteFor(r)
                return (
                  <li key={`${r.org}${r.title}`} className={r.to === 'Present' ? 'is-now' : undefined}>
                    <span className="sx-index__date">{dates(r)}</span>
                    <span className="sx-index__what">
                      <span className="sx-index__title">{r.title}</span>
                      <span className="sx-index__org">{r.org}</span>
                    </span>
                    {n && <span className="sx-index__note">{n.draft ? <D>{n.text}</D> : n.text}</span>}
                  </li>
                )
              })}
            </ol>
          </div>

          <div id="sx-education" className="sx-part">
            <h3 className="sx-label sx-label--violet sx-part__h">
              <D>{COPY.education}</D>
            </h3>
            <ol className="sx-index">
              {education.map((e) => (
                <li key={e.qualification}>
                  <span className="sx-index__date">
                    {e.from} - {e.to}
                  </span>
                  <span className="sx-index__what">
                    <span className="sx-index__title">{e.qualification}</span>
                    <span className="sx-index__org">{e.institution}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5. Contact: a blank ruled page for the visitor's own brief. */}
      <section id="contact" className="sx-screen sx-doc" aria-labelledby="sx-ct-h">
        <Rail at="contact" />
        <div className="sx-c">
          <div className="sx-c__intro">
            <h2 id="sx-ct-h" className="sx-h2 sx-c__h">
              <F f={contact.headline} />
            </h2>
            <p className="sx-lede">
              <F f={contact.body} />
            </p>
          </div>

          <form className="sx-form" aria-labelledby="sx-ct-h">
            <label htmlFor="sx-field" className="sx-label sx-label--violet">
              <D>{copy.contact.caption}</D>
            </label>
            <textarea id="sx-field" name="brief" className="sx-page" rows={7} placeholder={contact.placeholder} />
            <fieldset className="sx-topics">
              <legend className="sx-label">
                <D>{COPY.topic}</D>
              </legend>
              <div className="sx-chips">
                {contact.topics.map((t, i) => (
                  <label key={t} className="sx-chip">
                    <input type="radio" name="sx-topic" value={t} defaultChecked={i === 0} />
                    <span>
                      <D>{t}</D>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="sx-send">
              <button type="submit" className="sx-btn" disabled={!contact.email}>
                <D>{COPY.sendBrief}</D>
                <ArrowRight className="sx-ico" strokeWidth={1.75} aria-hidden="true" />
              </button>
              {!contact.email && (
                <p className="sx-send__note">
                  <D>{COPY.emailPending}</D>
                </p>
              )}
            </div>
          </form>

          <div className="sx-connect">
            <p className="sx-label">
              <D>{COPY.connect}</D>
            </p>
            <ul>
              {(['LinkedIn', 'Email', 'Book a call'] as const).map((l) => (
                <li key={l}>
                  <span className="sx-connect__name">
                    <D>{l}</D>
                  </span>
                  <span className="sx-connect__soon">
                    <D>{COPY.comingSoon}</D>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
