// Sketch Z: "The Worked Example". Person-first editorial: Sai's name at monograph scale on an
// asymmetric grid, and the brief as one bordered exhibit of how he works, not the frame for
// everything. Bricolage Grotesque throughout; plum is Sai's own colour (action, now, decision),
// and tangerine, cobalt and emerald carry People, Technology and Business wherever they appear.
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import {
  COPY,
  NEEDED,
  type Role,
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
  requirements,
  roleTitles,
  roles,
  upcoming,
  v,
  ventures,
} from '@/components/explore/data.ts'
import { D, F, Need } from '@/components/marks.tsx'
import type { ScreenId } from './index.ts'
import { ZTabs } from './ZTabs.tsx'
import './z.css'

export const motion: Record<ScreenId, string> = {
  'hero-person':
    'Still on arrival. Hovering "Write me a brief" slides its arrow 2px to the right; nothing on the screen moves by itself.',
  'hero-brief':
    'Still on arrival. As the visitor scrolls on, the plum underline under "without adding headcount." draws from left to right, and undraws when they scroll back.',
  brief:
    'The four steps of the exhibit connect as it scrolls through view: each arrow node fills in turn from the brief to the decision, reversibly. Choosing a reader cross-fades its points in 160ms.',
  path: 'Still. Hovering a career row stretches its coloured year marker into a short rule; a venture card lifts 2px on hover.',
  contact:
    'Still. Focusing the brief field turns its border plum; choosing a topic fills its chip. Nothing animates on its own.',
}

// Fixed meanings: People (tangerine), Technology (cobalt), Business (emerald), Sai (plum).
const READER_TONE: Record<string, string> = { client: 'tan', operations: 'cob', finance: 'em' }
const PERSPECTIVE_TONE: Record<string, string> = { Technology: 'cob', Business: 'em', People: 'tan' }
// The career's four periods, oldest first, in the order of the mockup's verbs
// (Build · Communicate · Analyse · Advise). Clinisys, the present, is plum.
const PERIOD_TONE = ['cob', 'tan', 'em', 'plum']
// Education: the engineering degree reads as Technology, the MBA as Business.
const EDU_TONE = ['cob', 'em']

/** Consecutive roles at the same organisation form one period. */
function periods(rs: Role[]) {
  const out: { org: string; roles: Role[] }[] = []
  for (const r of rs) {
    const last = out[out.length - 1]
    if (last && last.org === r.org) last.roles.push(r)
    else out.push({ org: r.org, roles: [r] })
  }
  return out
}

const nowList = [...nowOrgs, ...ventures.map((c) => c.name)]

function Nav({ id }: { id: string }) {
  return (
    <div className="z-bar">
      <nav className="z-wrap z-nav" aria-label={id === 'a' ? 'Site' : 'Site, brief-first opening'}>
        <a className="z-nav__name" href="#hero-person">
          {name}
        </a>
        <ul className="z-nav__links">
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
        <a className="z-btn z-btn--sm" href="#contact">
          <D>{COPY.writeBrief}</D>
        </a>
      </nav>
    </div>
  )
}

function Ctas() {
  return (
    <div className="z-ctas">
      <a className="z-btn" href="#contact">
        <D>{COPY.writeBrief}</D>
        <span className="z-btn__ic" aria-hidden="true">
          <ArrowRight size={18} strokeWidth={1.75} />
        </span>
      </a>
      <a className="z-btn z-btn--ghost" href="#brief">
        <D>{COPY.seeHow}</D>
      </a>
    </div>
  )
}

export function Sketch() {
  const groups = periods(roles)
  const verbs = (v(copy.experience.verbs) ?? '').split(' · ')
  const u = v(upcoming)
  const ops = readers.find((r) => r.tradeoff)

  return (
    <div className="sk sz">
      {/* 1 ── Opening, person first ───────────────────────────────────────────── */}
      <section id="hero-person" className="z-screen" aria-labelledby="z-name">
        <Nav id="a" />
        <div className="z-wrap z-hero">
          <h1 id="z-name" className="z-name">
            <span className="z-name__a">{nameLines[0]}</span>{' '}
            <span className="z-name__b">{nameLines[1]}</span>
          </h1>
          <ul className="z-roles">
            {roleTitles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <dl className="z-orgs">
            <div>
              <dt>
                <D>{COPY.now}</D>
              </dt>
              <dd>
                <ul>
                  {nowList.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>
                <D>{COPY.before}</D>
              </dt>
              <dd>
                <ul>
                  {pastOrgs.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
          <div className="z-hero__foot">
            <p className="z-pos">
              <Need>{NEEDED.positioning}</Need>
            </p>
            <Ctas />
          </div>
        </div>
      </section>

      {/* 2 ── Opening, brief first ────────────────────────────────────────────── */}
      <section id="hero-brief" className="z-screen z-screen--brief" aria-labelledby="z-hb">
        <Nav id="b" />
        <div className="z-wrap z-hb">
          <p className="z-kicker">
            <span className="z-sw z-t-plum" aria-hidden="true" />
            <D>{COPY.theBrief}</D>
            <span aria-hidden="true">·</span>
            <D>{COPY.providedBySai}</D>
          </p>
          <h2 id="z-hb" className="z-hb__brief">
            <span>{heroLines[0]}</span> <span className="z-key">{heroLines[1]}</span>
          </h2>
          <div className="z-hb__foot">
            <div className="z-hb__who">
              <p className="z-hb__name">{name}</p>
              <ul className="z-hb__roles">
                {roleTitles.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <Ctas />
          </div>
        </div>
      </section>

      {/* 3 ── The brief, as one worked example ────────────────────────────────── */}
      <section id="brief" className="z-sec" aria-labelledby="z-brief-h">
        <div className="z-wrap">
          <h2 id="z-brief-h" className="z-h2">
            <D>{COPY.howIWork}</D>
          </h2>
          <article className="z-ex" aria-labelledby="z-brief-h">
            <p className="z-ex__note">
              <D>{COPY.illustration}</D>
            </p>
            <div className="z-ex__brief">
              <h3 className="z-cap">
                <D>{COPY.theBrief}</D>
              </h3>
              <p className="z-ex__text">
                {briefLines.map((l, i) => (
                  <span key={l} className={i === briefLines.length - 1 ? 'z-key' : undefined}>
                    {l}
                  </span>
                ))}
              </p>
            </div>
            <ol className="z-flow">
              <li className="z-step">
                <span className="z-node" aria-hidden="true">
                  <ArrowRight size={16} strokeWidth={1.75} />
                </span>
                <h3 className="z-cap">
                  <D>{COPY.requirements}</D>
                </h3>
                <ul className="z-reqs">
                  {requirements.map((r) => (
                    <li key={r.id}>
                      <span className="z-id">{r.id}</span>
                      <span className="z-reqs__k">
                        <D>{r.label}</D>
                      </span>
                      <span className="z-reqs__v">{r.value}</span>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="z-step">
                <span className="z-node" aria-hidden="true">
                  <ArrowRight size={16} strokeWidth={1.75} />
                </span>
                <h3 className="z-cap" id="z-readers-h">
                  <D>{COPY.readers}</D>
                </h3>
                <ZTabs
                  labelledBy="z-readers-h"
                  readers={readers.map((r) => ({
                    id: r.id,
                    label: r.label,
                    points: r.points,
                    tone: READER_TONE[r.id] ?? 'plum',
                  }))}
                />
                {ops && (
                  <p className={`z-trade z-t-${READER_TONE[ops.id] ?? 'plum'}`}>
                    <span className="z-sw" aria-hidden="true" />
                    <span className="z-trade__who">
                      <D>{ops.label}</D>
                    </span>
                    <span className="z-trade__what">
                      <D>{ops.tradeoff}</D>
                    </span>
                  </p>
                )}
              </li>
              <li className="z-step z-step--end">
                <span className="z-node" aria-hidden="true">
                  <ArrowRight size={16} strokeWidth={1.75} />
                </span>
                <h3 className="z-cap">
                  <D>{COPY.decision}</D>
                </h3>
                <ul className="z-persp">
                  {perspectives.map((p) => (
                    <li key={p.label} className={`z-t-${PERSPECTIVE_TONE[p.label] ?? 'plum'}`}>
                      <span className="z-persp__k">
                        <D>{p.label}</D>
                      </span>
                      <span className="z-persp__v">
                        <D>{p.asks.join(' · ')}</D>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="z-decision">
                  <D>{decision}</D>
                </p>
              </li>
            </ol>
          </article>
        </div>
      </section>

      {/* 4 ── Path: ventures, career, education ───────────────────────────────── */}
      <section id="path" className="z-sec z-path" aria-labelledby="z-path-h">
        <div className="z-wrap">
          <h2 id="z-path-h" className="z-h2">
            <D>{COPY.path}</D>
          </h2>

          <div className="z-block">
            <h3 className="z-h3">
              <D>{COPY.ventures}</D>
            </h3>
            <ul className="z-vent">
              {ventures.map((c) => (
                <li key={c.id} className="z-card z-t-em">
                  <p className="z-card__name">{c.name}</p>
                  <p className="z-card__role">
                    <F f={c.role} />
                  </p>
                  <p className="z-card__line">
                    <F f={c.line} />
                  </p>
                  {c.sourceUrl && (
                    <a className="z-ext" href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <D>{COPY.publicRecord}</D>
                      <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
              {u && (
                <li className="z-card z-card--draft">
                  <p className="z-card__name">
                    <D>{u.title}</D>
                  </p>
                  <p className="z-card__role">
                    <D>{u.line}</D>
                  </p>
                  <p className="z-card__line">
                    <D>{u.sectors}</D>
                  </p>
                  <p className="z-tag">
                    <D>{COPY.toConfirm}</D>
                  </p>
                </li>
              )}
            </ul>
          </div>

          <div className="z-block">
            <h3 className="z-h3">
              <D>{COPY.career}</D>
            </h3>
            <ol className="z-index">
              {groups
                .map((g, gi) => ({ ...g, tone: PERIOD_TONE[gi] ?? 'plum', verb: verbs[gi] }))
                .reverse()
                .flatMap((g) =>
                  [...g.roles].reverse().map((r, ri) => {
                    const n = noteFor(r)
                    return (
                      <li key={`${r.org}-${r.title}`} className={`z-row z-t-${g.tone}`}>
                        <p className="z-row__when">
                          <span className="z-mark" aria-hidden="true" />
                          <span className="z-date">{dates(r)}</span>
                          {ri === 0 && g.verb && (
                            <span className="z-verb">
                              <D>{g.verb}</D>
                            </span>
                          )}
                        </p>
                        <div className="z-row__what">
                          <p className="z-row__title">{r.title}</p>
                          <p className="z-row__org">{r.org}</p>
                        </div>
                        {n && <p className="z-row__note">{n.draft ? <D>{n.text}</D> : n.text}</p>}
                      </li>
                    )
                  }),
                )}
            </ol>
          </div>

          <div className="z-block">
            <h3 className="z-h3">
              <D>{COPY.education}</D>
            </h3>
            <ol className="z-index">
              {education.map((e, i) => (
                <li key={e.qualification} className={`z-row z-t-${EDU_TONE[i] ?? 'plum'}`}>
                  <p className="z-row__when">
                    <span className="z-mark" aria-hidden="true" />
                    <span className="z-date">
                      {e.from} - {e.to}
                    </span>
                  </p>
                  <div className="z-row__what">
                    <p className="z-row__title">{e.qualification}</p>
                    <p className="z-row__org">{e.institution}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5 ── Contact: the visitor's brief ───────────────────────────────────── */}
      <section id="contact" className="z-sec z-contact" aria-labelledby="z-ct-h">
        <div className="z-wrap">
          <div className="z-ct">
          <div className="z-ct__lead">
              <p className="z-kicker">
                <span className="z-sw z-t-plum" aria-hidden="true" />
                <D>{COPY.writeBrief}</D>
              </p>
            <h2 id="z-ct-h" className="z-ct__h">
              <F f={contact.headline} />
            </h2>
            <p className="z-ct__body">
              <F f={contact.body} />
            </p>
            <div className="z-conn">
              <p className="z-conn__k">
                <D>{COPY.connect}</D>
              </p>
              <ul>
                <li>
                  LinkedIn{' '}
                  <span className="z-soon">
                    <D>{COPY.comingSoon}</D>
                  </span>
                </li>
                <li>
                  <D>{COPY.email}</D>{' '}
                  <span className="z-soon">
                    <D>{COPY.comingSoon}</D>
                  </span>
                </li>
                <li>
                  <D>{COPY.bookCall}</D>{' '}
                  <span className="z-soon">
                    <D>{COPY.comingSoon}</D>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <form className="z-form" aria-labelledby="z-ct-h">
            <label className="z-form__k" htmlFor="z-brief-field">
              <D>{copy.contact.caption}</D>
            </label>
            <textarea id="z-brief-field" name="brief" rows={7} placeholder={contact.placeholder} />
            <fieldset className="z-topics">
              <legend className="z-form__k">
                <D>{COPY.topic}</D>
              </legend>
              <div className="z-chips">
                {contact.topics.map((t, i) => (
                  <label key={t} className="z-chip">
                    <input type="radio" name="topic" value={t} defaultChecked={i === 0} />
                    <D>{t}</D>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="z-send">
              <button
                type="submit"
                className="z-btn"
                disabled={!contact.email}
                aria-describedby={contact.email ? undefined : 'z-pending'}
              >
                <D>{COPY.sendBrief}</D>
                <span className="z-btn__ic" aria-hidden="true">
                  <ArrowRight size={18} strokeWidth={1.75} />
                </span>
              </button>
              {!contact.email && (
                <p id="z-pending" className="z-pending">
                  <D>{COPY.emailPending}</D>
                </p>
              )}
            </div>
          </form>
          </div>
        </div>
      </section>
    </div>
  )
}
