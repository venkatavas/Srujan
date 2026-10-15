// The control: the current site's composition and type, only lit (light ground, same single
// vermilion accent, still). Not a candidate to build. It shows how far each direction moves
// beyond a recolour, and keeps the centred hero the client asked to preserve in view.
import { Fragment } from 'react'
import { LEGACY_SECTIONS as NAV_SECTIONS } from '../../nav/sections.ts'
import {
  COPY,
  contact,
  copy,
  dates,
  decision,
  education,
  heroLines,
  lifecycle,
  perspectives,
  readers,
  requirementLine,
  requirements,
  roleTitles,
  roles,
  name,
  noteFor,
  v,
  ventures,
  upcoming,
} from '../data.ts'
import { D, F } from '@/components/marks.tsx'
import type { ScreenId } from './index.ts'
import './control.css'

export const motion: Record<ScreenId, string> = {
  'hero-person': 'As built today: the rings draw, the name builds letter by letter, a 3s opening. Shown here still.',
  'hero-brief': 'As built today: the brief scrambles into place and its phrases fly into R1-R4 on scroll.',
  brief: 'As built today: wires draw step by step as the section enters.',
  path: 'As built today: the career line draws with the roles.',
  contact: 'As built today: the caret blinks in the field.',
}

const RINGS = [120, 170, 230, 300]

function Lifecycle() {
  return (
    <ol className="sc-stops" aria-label="Journey">
      {lifecycle.map((s, i) => (
        <li key={s} className={i === 0 ? 'is-on' : undefined}>
          <i aria-hidden="true" />
          <D>{s}</D>
        </li>
      ))}
    </ol>
  )
}

function Nav() {
  return (
    <nav className="sc-nav" aria-label="Sections">
      <span className="sc-nav__name">{name}</span>
      <ol>
        {NAV_SECTIONS.map((s, i) => (
          <li key={s.id} className={i === 0 ? 'is-on' : undefined}>
            <a href={s.id === 'contact' ? '#contact' : '#brief'}>
              <D>{s.label}</D>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Sketch() {
  const lead = copy.technology
  const biz = copy.business
  const xp = copy.experience
  const u = v(upcoming)
  return (
    <div className="sk sc">
      {/* 1. The current hero, lit. */}
      <section id="hero-person" className="sc-screen sc-hero" aria-labelledby="sc-name">
        <Nav />
        <svg className="sc-geo" viewBox="-320 -320 640 640" aria-hidden="true">
          {RINGS.map((r) => (
            <circle key={r} r={r} />
          ))}
          <path d="M0 -300V300" />
          <circle className="sc-geo__pt" cy={-RINGS[0]} r={5} />
        </svg>
        <div className="sc-hero__core">
          <h1 id="sc-name" className="sc-name">
            {name}
          </h1>
          <p className="sc-roles">
            {roleTitles.map((t, i) => (
              <Fragment key={t}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                {t}
              </Fragment>
            ))}
          </p>
          <p className="sc-label">
            <D>{COPY.theBrief}</D> · <D>{COPY.providedBySai}</D>
          </p>
          <p className="sc-brief">
            {heroLines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          <Lifecycle />
        </div>
      </section>

      {/* 2. The current Technology opening, lit. */}
      <section id="hero-brief" className="sc-screen sc-split" aria-labelledby="sc-tech">
        <div className="sc-lead">
          <p className="sc-label">
            <D>{lead.caption}</D>
          </p>
          <h2 id="sc-tech" className="sc-h2">
            <F f={lead.headline} />
          </h2>
          <p className="sc-body">
            <F f={lead.body} />
          </p>
        </div>
        <ol className="sc-spec">
          {requirements.map((r) => (
            <li key={r.id}>
              <span className="sc-mono">{r.id}</span>
              <span className="sc-spec__k">
                <D>{r.label}</D>
              </span>
              <span className="sc-spec__v">{r.value}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. The current Business and Leadership diagrams, lit. */}
      <section id="brief" className="sc-screen" aria-labelledby="sc-biz">
        <div className="sc-lead">
          <h2 id="sc-biz" className="sc-h2">
            <F f={biz.headline} />
          </h2>
          <p className="sc-body">
            <F f={biz.body} />
          </p>
          <p className="sc-small">
            <D>{COPY.illustration}</D>
          </p>
        </div>
        <p className="sc-req">
          <D>{requirementLine}</D>
        </p>
        <div className="sc-readers">
          {readers.map((r) => (
            <div key={r.id} className="sc-reader">
              <h3>
                <D>{r.label}</D>
              </h3>
              <ul>
                {r.points.map((p) => (
                  <li key={p}>
                    <D>{p}</D>
                  </li>
                ))}
              </ul>
              {r.tradeoff && (
                <p className="sc-small">
                  <D>{r.tradeoff}</D>
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="sc-decision">
          <p className="sc-small">
            <D>{perspectives.map((p) => p.label).join(' + ')}</D>
          </p>
          <p className="sc-decision__line">
            <i aria-hidden="true" />
            <D>{decision}</D>
          </p>
        </div>
      </section>

      {/* 4. The current Ventures and Experience, lit. */}
      <section id="path" className="sc-screen sc-split" aria-labelledby="sc-xp">
        <div className="sc-lead">
          <h2 id="sc-xp" className="sc-h2">
            <F f={xp.headline} />
          </h2>
          <div className="sc-ventures">
            {ventures.map((c) => (
              <div key={c.id} className="sc-venture">
                <h3>{c.name}</h3>
                <p>
                  <F f={c.role} />
                </p>
                <p className="sc-small">
                  <F f={c.line} />
                </p>
                {c.sourceUrl && (
                  <a className="sc-link" href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <D>{COPY.publicRecord}</D> ↗
                  </a>
                )}
              </div>
            ))}
            {u && (
              <div className="sc-venture sc-venture--draft">
                <h3>
                  <D>{u.title}</D>
                </h3>
                <p className="sc-small">
                  <D>{u.sectors}</D> · <D>{COPY.toConfirm}</D>
                </p>
              </div>
            )}
          </div>
        </div>
        <ul className="sc-career">
          {roles.map((r) => {
            const n = noteFor(r)
            return (
              <li key={`${r.org}${r.title}`} className={r.to === 'Present' ? 'is-on' : undefined}>
                <span className="sc-mono">{dates(r)}</span>
                <span className="sc-career__t">{r.title}</span>
                <span className="sc-small">{r.org}</span>
                {n && <span className="sc-small">{n.draft ? <D>{n.text}</D> : n.text}</span>}
              </li>
            )
          })}
          {education.map((e) => (
            <li key={e.qualification}>
              <span className="sc-mono">
                {e.from} - {e.to}
              </span>
              <span className="sc-career__t">{e.qualification}</span>
              <span className="sc-small">{e.institution}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. The current Contact, lit. */}
      <section id="contact" className="sc-screen sc-split" aria-labelledby="sc-ct">
        <div className="sc-lead">
          <h2 id="sc-ct" className="sc-h2">
            <F f={contact.headline} />
          </h2>
          <p className="sc-body">
            <F f={contact.body} />
          </p>
        </div>
        <form className="sc-form" aria-labelledby="sc-ct">
          <label htmlFor="sc-brief-field" className="sc-label">
            <D>{copy.contact.caption}</D>
          </label>
          <textarea id="sc-brief-field" rows={5} placeholder={contact.placeholder} />
          <fieldset>
            <legend className="sc-label">
              <D>{COPY.topic}</D>
            </legend>
            <div className="sc-chips">
              {contact.topics.map((t, i) => (
                <label key={t}>
                  <input type="radio" name="sc-topic" defaultChecked={i === 0} /> <D>{t}</D>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" className="sc-btn" disabled={!contact.email}>
            <D>{COPY.sendBrief}</D> <span aria-hidden="true">→</span>
          </button>
          {!contact.email && (
            <p className="sc-small">
              <D>{COPY.emailPending}</D>
            </p>
          )}
          <p className="sc-small">
            <D>{COPY.connect}</D>: <D>{COPY.linkedin}</D>, <D>{COPY.email}</D>, <D>{COPY.bookCall}</D> (<D>{COPY.comingSoon}</D>)
          </p>
        </form>
      </section>
    </div>
  )
}
