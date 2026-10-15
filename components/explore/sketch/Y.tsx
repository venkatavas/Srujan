// Sketch Y: "The Soft Instrument". A calm, light canvas with a few elevated soft surfaces. The
// story is told by one soft object that changes state: the brief, read into requirements, read by
// three people, resolved into a decision. Every fact comes from data.ts; drafts render in <D>.
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import {
  briefLines,
  contact,
  COPY,
  copy,
  currentRole,
  dates,
  decision,
  education,
  heroLines,
  name,
  nameLines,
  NEEDED,
  noteFor,
  nowOrgs,
  pastOrgs,
  perspectives,
  readers,
  requirementLine,
  requirements,
  roles,
  roleTitles,
  upcoming,
  ventures,
} from '@/components/explore/data.ts'
import { D, F, Need } from '@/components/marks.tsx'
import type { ScreenId } from './index.ts'
import { YTabs } from './YTabs.tsx'
import './y.css'
import './y-palettes.css'

export const motion: Record<ScreenId, string> = {
  'hero-person':
    'Still on arrival. On pointer movement the soft light behind the name drifts a few pixels toward the cursor, and the Now surface lifts slightly on hover; nothing moves on its own.',
  'hero-brief':
    'Still on arrival. As the visitor scrolls, the brief surface eases into the full instrument below, and the step indicator advances from Brief only as far as the scroll position, reversibly.',
  brief:
    'The instrument steps Brief, Requirements, Readers, Decision in step with scroll: each stage settles in with a short fade and rise, and scrolling back returns it to the earlier state. Choosing a reader slides the segmented control’s highlight and cross-fades the panel.',
  path: 'Static. Venture surfaces lift by two pixels with a deeper tinted shadow on hover or focus; career rows tint on hover.',
  contact:
    'Static. Topic chips fill with periwinkle when chosen, the textarea’s inner core brightens on focus, and the send button wakes only once an email exists.',
}

const IDS = {
  person: 'sy-hero-person-h',
  heroBrief: 'sy-hero-brief-h',
  brief: 'sy-brief-h',
  readers: 'sy-readers-h',
  path: 'sy-path-h',
  contact: 'sy-contact-h',
}

/** Now: the current Clinisys role plus the ventures, with Sai's role in each. */
const nowRows = [
  ...nowOrgs.map((org) => ({ org, tone: 'now', role: <>{currentRole?.org === org ? currentRole.title : ''}</> })),
  ...ventures.map((v) => ({ org: v.name, tone: 'venture', role: <F f={v.role} /> })),
]

const STEPS = [
  { key: 'brief', label: <D>{COPY.stepBrief}</D> },
  { key: 'requirements', label: <D>{COPY.requirements}</D> },
  { key: 'readers', label: <D>{COPY.stepReaders}</D> },
  { key: 'decision', label: <D>{COPY.decision}</D> },
]

function Steps({ at }: { at: number }) {
  return (
    <ol className="sy-steps">
      {STEPS.map((s, i) => (
        <li
          key={s.key}
          className={i < at ? 'is-done' : i === at ? 'is-now' : 'is-next'}
          aria-current={i === at ? 'step' : undefined}
        >
          <span className="sy-steps__mark" aria-hidden="true">
            {i < at ? <Check size={12} strokeWidth={2} /> : null}
          </span>
          {s.label}
        </li>
      ))}
    </ol>
  )
}

function Nav() {
  return (
    <nav className="sy-nav" aria-label={name}>
      <a className="sy-nav__name" href="#hero-person">
        <span className="sy-nav__given">{nameLines[0]}</span>
        <span className="sy-nav__family"> {nameLines[1]}</span>
      </a>
      <ul className="sy-nav__links">
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
      <a className="sy-btn sy-btn--primary sy-btn--sm" href="#contact">
        <D>{COPY.writeBrief}</D>
      </a>
    </nav>
  )
}

function Ctas() {
  return (
    <div className="sy-ctas">
      <a className="sy-btn sy-btn--primary" href="#contact">
        <D>{COPY.writeBrief}</D>
        <span className="sy-btn__orb" aria-hidden="true">
          <ArrowRight size={16} strokeWidth={1.75} />
        </span>
      </a>
      <a className="sy-btn sy-btn--ghost" href="#brief">
        <D>{COPY.seeHow}</D>
      </a>
    </div>
  )
}

function HeroPerson() {
  return (
    <section id="hero-person" className="sy-screen sy-hero" aria-labelledby={IDS.person}>
      <Nav />
      <div className="sy-wrap sy-hero__grid">
        <div className="sy-hero__text">
          <h1 id={IDS.person} className="sy-display">
            <span className="sy-display__line">{nameLines[0]}</span>{' '}
            <span className="sy-display__line">{nameLines[1]}</span>
          </h1>
          <ul className="sy-roles">
            {roleTitles.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <Need className="sy-need">{NEEDED.positioning}</Need>
          <Ctas />
        </div>

        <div className="sy-hero__object">
          <div className="sy-card sy-now">
            <p className="sy-label">
              <D>{COPY.now}</D>
            </p>
            <ul className="sy-now__list">
              {nowRows.map((r) => (
                <li key={r.org} className={`sy-now__row sy-tone-${r.tone}`}>
                  <span className="sy-dot" aria-hidden="true" />
                  <span className="sy-now__org">{r.org}</span>
                  <span className="sy-now__role">{r.role}</span>
                </li>
              ))}
            </ul>
            <div className="sy-before">
              <p className="sy-label">
                <D>{COPY.before}</D>
              </p>
              <ul className="sy-before__list">
                {pastOrgs.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroBrief() {
  return (
    <section id="hero-brief" className="sy-screen sy-hero sy-hero--brief" aria-labelledby={IDS.heroBrief}>
      <Nav />
      <div className="sy-wrap sy-hb">
        <div className="sy-card sy-hb__card">
          <div className="sy-hb__top">
            <p className="sy-label">
              <D>{COPY.theBrief}</D>
              <span className="sy-label__sep" aria-hidden="true" />
              <span className="sy-label__soft">
                <D>{COPY.providedBySai}</D>
              </span>
            </p>
            <Steps at={0} />
          </div>
          <h2 id={IDS.heroBrief} className="sy-hb__brief">
            <span className="sy-hb__bold">{heroLines[0]}</span>{' '}
            <span className="sy-hb__light">{heroLines[1]}</span>
          </h2>
        </div>
        <div className="sy-hb__by">
          <p className="sy-hb__who">
            <span className="sy-hb__name">{name}</span>
            <span className="sy-hb__roles">
              {roleTitles.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </span>
          </p>
          <Ctas />
        </div>
      </div>
    </section>
  )
}

function Brief() {
  const op = readers.find((r) => r.tradeoff)
  return (
    <section id="brief" className="sy-screen sy-brief" aria-labelledby={IDS.brief}>
      <div className="sy-wrap">
        <header className="sy-head">
          <h2 id={IDS.brief} className="sy-h2">
            <D>{COPY.howIWork}</D>
          </h2>
          <p className="sy-illus">
            <D>{COPY.illustration}</D>
          </p>
        </header>

        <div className="sy-card sy-inst">
          <div className="sy-inst__bar">
            <Steps at={3} />
          </div>

          <div className="sy-inst__grid">
            <div className="sy-inst__left">
              <h3 className="sy-label">
                <D>{COPY.stepBrief}</D>
              </h3>
              <p className="sy-inst__brief">
                {briefLines.map((l, i) => (
                  <span key={l}>
                    {i > 0 ? ' ' : null}
                    <span className="sy-inst__line">{l}</span>
                  </span>
                ))}
              </p>

              <h3 className="sy-label sy-inst__sub">
                <D>{COPY.requirements}</D>
              </h3>
              <ul className="sy-reqs">
                {requirements.map((r) => (
                  <li key={r.id} className="sy-req">
                    <span className="sy-req__id">{r.id}</span>
                    <span className="sy-req__label">
                      <D>{r.label}</D>
                    </span>
                    <span className="sy-req__value">{r.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sy-inst__right">
              <h3 id={IDS.readers} className="sy-label">
                <D>{COPY.readers}</D>
              </h3>
              <p className="sy-inst__subject">
                <D>{requirementLine}</D>
              </p>
              <YTabs readers={readers} labelledBy={IDS.readers} />
              {op ? (
                <p className="sy-trade sy-tone-operations">
                  <span className="sy-chip">
                    <span className="sy-dot" aria-hidden="true" />
                    <D>{op.label}</D>
                  </span>
                  <span className="sy-trade__text">
                    <D>{op.tradeoff}</D>
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="sy-decision">
            <h3 className="sy-label sy-decision__label">
              <D>{COPY.decision}</D>
            </h3>
            <ul className="sy-persp">
              {perspectives.map((p) => (
                <li key={p.label}>
                  <p className="sy-persp__label">
                    <D>{p.label}</D>
                  </p>
                  <p className="sy-persp__q">
                    <D>{p.asks[0]}</D>
                  </p>
                  <p className="sy-persp__rest">
                    {p.asks.slice(1).map((a) => (
                      <span key={a}>
                        <D>{a}</D>
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
            <svg className="sy-converge" viewBox="0 0 600 48" preserveAspectRatio="none" aria-hidden="true">
              <path d="M100 0 C100 30, 300 18, 300 48" />
              <path d="M300 0 L300 48" />
              <path d="M500 0 C500 30, 300 18, 300 48" />
            </svg>
            <p className="sy-decision__line">
              <D>{decision}</D>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Path() {
  const up = upcoming.status === 'pending' ? undefined : upcoming.value
  const career = [...roles].reverse()
  return (
    <section id="path" className="sy-screen sy-path" aria-labelledby={IDS.path}>
      <div className="sy-wrap">
        <header className="sy-head">
          <h2 id={IDS.path} className="sy-h2">
            <D>{COPY.path}</D>
          </h2>
        </header>

        <div className="sy-block">
          <div className="sy-block__head">
            <h3 className="sy-h3">
              <D>{COPY.ventures}</D>
            </h3>
            <p className="sy-lighter">
              <F f={copy.ventures.headline} />
            </p>
          </div>
          <ul className="sy-ventures">
            {ventures.map((v) => (
              <li key={v.id} className="sy-card sy-venture sy-tone-venture">
                <div className="sy-venture__top">
                  <span className="sy-dot" aria-hidden="true" />
                  <h4 className="sy-venture__name">{v.name}</h4>
                </div>
                <p className="sy-venture__role">
                  <F f={v.role} />
                </p>
                <p className="sy-venture__line">
                  <F f={v.line} />
                </p>
                {v.sourceUrl ? (
                  <a className="sy-link" href={v.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <D>{COPY.publicRecord}</D>
                    <span className="sy-link__orb" aria-hidden="true">
                      <ArrowUpRight size={14} strokeWidth={1.75} />
                    </span>
                  </a>
                ) : null}
              </li>
            ))}
            {up ? (
              <li className="sy-venture sy-venture--draft">
                <p className="sy-tag">
                  <D>{COPY.toConfirm}</D>
                </p>
                <h4 className="sy-venture__name">
                  <D>{up.title}</D>
                </h4>
                <p className="sy-venture__role">
                  <D>{up.line}</D>
                </p>
                <p className="sy-venture__line">
                  <D>{up.sectors}</D>
                </p>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="sy-block sy-split">
          <div className="sy-career">
            <div className="sy-block__head">
              <h3 className="sy-h3">
                <D>{COPY.career}</D>
              </h3>
              <p className="sy-lighter">
                <F f={copy.experience.body} />
              </p>
            </div>
            <ol className="sy-index">
              {career.map((r) => {
                const note = noteFor(r)
                return (
                  <li key={`${r.title}-${r.org}`} className={`sy-row${r.to === 'Present' ? ' is-now' : ''}`}>
                    <span className="sy-row__when">{dates(r)}</span>
                    <span className="sy-row__what">
                      <span className="sy-row__title">{r.title}</span>
                      <span className="sy-row__org">{r.org}</span>
                    </span>
                    {note ? (
                      <span className="sy-row__note">{note.draft ? <D>{note.text}</D> : note.text}</span>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </div>

          <aside className="sy-edu" aria-labelledby="sy-edu-h">
            <div className="sy-card sy-edu__card">
              <h3 id="sy-edu-h" className="sy-h3">
                <D>{COPY.education}</D>
              </h3>
              <ul className="sy-edu__list">
                {education.map((e) => (
                  <li key={e.qualification}>
                    <span className="sy-edu__when">
                      {e.from} - {e.to}
                    </span>
                    <span className="sy-edu__q">{e.qualification}</span>
                    <span className="sy-edu__i">{e.institution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const ready = contact.email !== undefined
  const channels = [
    { key: 'linkedin', label: <D>{COPY.linkedin}</D> },
    { key: 'email', label: <D>{COPY.email}</D> },
    { key: 'booking', label: <D>{COPY.bookCall}</D> },
  ]
  return (
    <section id="contact" className="sy-screen sy-contact" aria-labelledby={IDS.contact}>
      <div className="sy-wrap sy-contact__grid">
        <div className="sy-contact__text">
          <h2 id={IDS.contact} className="sy-contact__h">
            <F f={contact.headline} />
          </h2>
          <p className="sy-contact__body">
            <F f={contact.body} />
          </p>
          <div className="sy-connect">
            <p className="sy-label">
              <D>{COPY.connect}</D>
            </p>
            <ul className="sy-connect__list">
              {channels.map((c) => (
                <li key={c.key}>
                  <span className="sy-connect__name">{c.label}</span>
                  <span className="sy-connect__soon">
                    <D>{COPY.comingSoon}</D>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sy-bezel">
          <form className="sy-bezel__core" aria-labelledby={IDS.contact}>
            <fieldset className="sy-topics">
              <legend className="sy-topics__legend">
                <D>{COPY.topic}</D>
              </legend>
              <div className="sy-topics__list">
                {contact.topics.map((t) => (
                  <label key={t} className="sy-topic">
                    <input type="radio" name="sy-topic" value={t} />
                    <span>
                      <D>{t}</D>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="sy-field">
              <label htmlFor="sy-brief-text" className="sy-label">
                <D>{copy.contact.caption}</D>
              </label>
              <textarea id="sy-brief-text" name="brief" rows={6} placeholder={contact.placeholder} />
            </div>

            <div className="sy-send">
              <button
                type="submit"
                className="sy-btn sy-btn--primary"
                disabled={!ready}
                aria-describedby={ready ? undefined : 'sy-send-note'}
              >
                <D>{COPY.sendBrief}</D>
                <span className="sy-btn__orb" aria-hidden="true">
                  <ArrowRight size={16} strokeWidth={1.75} />
                </span>
              </button>
              {!ready ? (
                <p id="sy-send-note" className="sy-send__note">
                  <D>{COPY.emailPending}</D>
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

/** Stage 4 studies, switchable from the review bar (data-palette / data-type on the root). */
export const options = {
  palettes: [
    { id: 'soft', label: 'Soft (Y as drawn)' },
    { id: 'bloom', label: 'Violet Bloom' },
    { id: 'haze', label: 'Amethyst Haze' },
    { id: 'coastal', label: 'Coastal (no purple)' },
  ],
  types: [
    { id: 'outfit', label: 'Outfit' },
    { id: 'jakarta', label: 'Plus Jakarta Sans' },
  ],
}

export function Sketch() {
  return (
    <div className="sk sy">
      <HeroPerson />
      <HeroBrief />
      <Brief />
      <Path />
      <Contact />
    </div>
  )
}
