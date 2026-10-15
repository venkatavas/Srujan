// Stage 1 wireframes for the redesign exploration (/explore): grey, unstyled layouts of the
// candidate structures, built only from the content model. Drafts and copy not yet tracked as a
// fact are marked; missing content is shown as "Needed". Nothing here is a design proposal.
import type { ReactNode } from 'react'
import { brief, spec } from '@/content/brief.ts'
import { profile } from '@/content/profile.ts'
import { type Fact, valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { LEGACY_SECTIONS as NAV_SECTIONS } from '../nav/sections.ts'

const v = valueOf

/** Copy that needs Sai's sign-off: a draft, or plain text not yet tracked as a fact. */
function D({ children }: { children: ReactNode }) {
  return (
    <span className="wf-d" title="Draft copy, awaiting Sai's approval">
      {children}
    </span>
  )
}
/** Content that does not exist yet. */
function Need({ children }: { children: ReactNode }) {
  return <span className="wf-need">Needed: {children}</span>
}
/** Renders a fact: verified text plain, draft text marked, pending as "Needed". */
function F({ f, note }: { f: Fact<string>; note?: string }) {
  if (f.status === 'pending') return <Need>{note ?? f.note}</Need>
  return f.status === 'draft' ? <D>{f.value}</D> : <>{f.value}</>
}
/** A placeholder for a diagram or interaction, labelled with what it holds. */
function Box({ label, children, className = '' }: { label: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`wf-box ${className}`}>
      <span className="wf-box__label">{label}</span>
      {children}
    </div>
  )
}
function Head({ caption, headline, body }: { caption?: string; headline: Fact<string>; body?: Fact<string> }) {
  return (
    <header className="wf-head">
      {caption && (
        <p className="wf-label">
          <D>{caption}</D>
        </p>
      )}
      <h2 className="wf-h2">
        <F f={headline} />
      </h2>
      {body && (
        <p className="wf-body">
          <F f={body} />
        </p>
      )}
    </header>
  )
}
function Outro({ f }: { f: Fact<string[]> }) {
  const l = v(f)
  return l ? (
    <p className="wf-outro">
      <D>{l.join(' ')}</D>
    </p>
  ) : null
}

// ── Facts derived from the verified career (no new facts) ─────────────────────────────

const roles = (v(site.experience.career) ?? []).flatMap((g) => g.roles)
const unique = (xs: string[]) => [...new Set(xs)]
// Current: roles the career marks as "Present"; the ventures are current per the client.
const nowOrgs = unique(roles.filter((r) => r.to === 'Present').map((r) => r.org))
const pastOrgs = unique(roles.filter((r) => r.to !== 'Present').map((r) => r.org)).filter((o) => !nowOrgs.includes(o))
const ventureNames = site.ventures.companies.map((c) => c.name)
const dates = (r: (typeof roles)[number]) =>
  r.from && r.to ? `${r.from} - ${r.to}` : r.from ? `From ${r.from}` : r.to === 'Present' ? 'Now' : ''
const name = v(profile.name) ?? ''
const title = v(site.home.title) ?? ''
const education = v(profile.education) ?? []

// ── Shared pieces ──────────────────────────────────────────────────────────────────────

function Readers({ tabs }: { tabs?: boolean }) {
  const people = site.business.people
  if (tabs)
    return (
      <Box label="Interaction: three readers, one requirement (tabs)">
        <p className="wf-tabs">
          {people.map((p, i) => (
            <span key={p.id} className={i === 0 ? 'is-on' : undefined}>
              <D>{p.label}</D>
            </span>
          ))}
        </p>
        <ul className="wf-list">
          {people[0].items.map(([, t]) => (
            <li key={t}>
              <D>{t}</D>
            </li>
          ))}
        </ul>
      </Box>
    )
  return (
    <div className="wf-cols">
      {people.map((p) => (
        <div key={p.id} className="wf-col">
          <p className="wf-strong">
            <D>{p.label}</D>
          </p>
          <ul className="wf-list">
            {p.items.map(([, t]) => (
              <li key={t}>
                <D>{t}</D>
              </li>
            ))}
          </ul>
          {p.conflict && (
            <p className="wf-small">
              <D>Trade-off: {p.conflict}</D>
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function Spec() {
  return (
    <ol className="wf-spec">
      {spec.map((s, i) => (
        <li key={s.key}>
          <span className="wf-mono">R{i + 1}</span> <D>{s.label}</D>: {s.value}
        </li>
      ))}
    </ol>
  )
}

function Companies() {
  return (
    <div className="wf-cols">
      {site.ventures.companies.map((c) => (
        <div key={c.id} className="wf-col wf-card">
          <p className="wf-strong">{c.name}</p>
          <p>
            <F f={c.role} />
          </p>
          <p className="wf-small">
            <F f={c.line} />
          </p>
        </div>
      ))}
      {(() => {
        const u = v(site.ventures.upcoming)
        return u ? (
          <div className="wf-col wf-card wf-card--dashed">
            <p className="wf-strong">
              <D>{u.title}</D>
            </p>
            <p>
              <D>{u.line}</D>
            </p>
            <p className="wf-small">
              <D>{u.sectors}</D> (to confirm)
            </p>
          </div>
        ) : null
      })()}
    </div>
  )
}

function Career() {
  return (
    <ul className="wf-index">
      {roles.map((r) => (
        <li key={`${r.org}-${r.title}`}>
          <span className="wf-mono">{dates(r)}</span>
          <span className="wf-strong">{r.title}</span>
          <span>{r.org}</span>
        </li>
      ))}
    </ul>
  )
}

function Schooling() {
  return (
    <ul className="wf-index">
      {education.map((e) => (
        <li key={e.qualification}>
          <span className="wf-mono">
            {e.from} - {e.to}
          </span>
          <span className="wf-strong">{e.qualification}</span>
          <span>{e.institution}</span>
        </li>
      ))}
    </ul>
  )
}

function BriefForm() {
  const c = site.contact
  return (
    <Box label="Form" className="wf-form">
      <p className="wf-field">
        <D>{c.placeholder}</D>
      </p>
      <p className="wf-chips">
        {(v(c.topics) ?? []).map((t) => (
          <span key={t}>
            <D>{t}</D>
          </span>
        ))}
      </p>
      <p>
        <span className="wf-btn wf-btn--off">
          <D>Send brief</D>
        </span>{' '}
        <Need>Sai&apos;s email address (sending is off until then)</Need>
      </p>
      <p className="wf-small">
        <D>Or connect via</D>: LinkedIn, Email, Book a call. <Need>links for all three</Need>
      </p>
    </Box>
  )
}

// ── Structure 8: the current site, section for section ─────────────────────────────────

function Nav8() {
  return (
    <nav className="wf-nav" aria-label="Wireframe navigation">
      <span className="wf-strong">{name}</span>
      <ol className="wf-nav__items">
        {NAV_SECTIONS.map((s) => (
          <li key={s.id} data-q={s.id === 'contact' ? 'reach' : undefined}>
            {s.n} <D>{s.label}</D>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Hero8() {
  const marks = { l: v(site.home.marks.left) ?? [], r: v(site.home.marks.right) ?? [] }
  return (
    <section className="wf-sec wf-sec--full wf-hero8">
      <Box label="Construction geometry: rings, axis, accent point" className="wf-geo" />
      <div className="wf-center">
        <h1 className="wf-h1 wf-caps" data-q="who">
          {name}
        </h1>
        <p data-q="roles">{title}</p>
        <p className="wf-label">
          <D>The brief</D> · <D>Provided by Sai</D>
        </p>
        <p className="wf-brief">
          {brief.heroLines.map((l) => (
            <span key={l}>{l} </span>
          ))}
        </p>
        <ol className="wf-stops">
          {site.home.lifecycle.map((s) => (
            <li key={s}>
              <D>{s}</D>
            </li>
          ))}
        </ol>
      </div>
      <p className="wf-corner wf-corner--l">
        <D>{marks.l.join(' · ')}</D>
      </p>
      <p className="wf-corner wf-corner--r">
        <D>{marks.r.join(' · ')}</D>
      </p>
    </section>
  )
}

function Technology8() {
  const t = site.technology
  return (
    <section className="wf-sec wf-sec--full wf-split">
      <Head caption={t.caption} headline={t.headline} body={t.body} />
      <Box label="Diagram: the brief becomes requirements">
        <p className="wf-brief">{brief.lines.join(' ')}</p>
        <Spec />
        <p className="wf-small">
          <F f={t.resolved} />
        </p>
      </Box>
    </section>
  )
}

function Business8() {
  const b = site.business
  return (
    <section className="wf-sec wf-sec--full">
      <Head caption={b.caption} headline={b.headline} body={b.body} />
      <Box label="Diagram: one requirement, three readers">
        <p className="wf-strong">
          <D>{b.requirement}</D>
        </p>
        <Readers />
      </Box>
      <Outro f={b.outro} />
    </section>
  )
}

function Leadership8() {
  const l = site.leadership
  return (
    <section className="wf-sec wf-sec--full wf-split">
      <Head caption={l.caption} headline={l.headline} body={l.body} />
      <Box label="Diagram: perspectives converge into a decision">
        <div className="wf-cols">
          {l.circles.map((c) => (
            <div key={c.label} className="wf-col">
              <p className="wf-strong">
                <D>{c.label}</D>
              </p>
              <p className="wf-small">
                <D>{(v(c.items) ?? []).join(' · ')}</D>
              </p>
            </div>
          ))}
        </div>
        <p className="wf-small">
          <D>{l.inputs.join(' · ')}</D> → <D>{(v(l.analysis) ?? []).join(' · ')}</D>
        </p>
        <p className="wf-strong">
          <D>{l.decision}</D>
        </p>
      </Box>
      <Outro f={l.outro} />
    </section>
  )
}

function Ventures8() {
  const x = site.ventures
  return (
    <section className="wf-sec wf-sec--full">
      <Head caption={x.caption} headline={x.headline} body={x.body} />
      <Box label="Diagram: inputs → product → companies">
        <p className="wf-small">
          <D>{(v(x.inputs) ?? []).map((i) => i.label).join(' · ')}</D>
        </p>
        <Companies />
      </Box>
      <Outro f={x.outro} />
    </section>
  )
}

function Experience8() {
  const x = site.experience
  return (
    <section className="wf-sec wf-sec--full wf-split">
      <Head caption={x.caption} headline={x.headline} body={x.body} />
      <Box label="Diagram: career line">
        <Career />
        <p className="wf-small">
          <D>{v(x.verbs)}</D>
        </p>
      </Box>
      <Outro f={x.outro} />
    </section>
  )
}

function Education8() {
  const x = site.education
  return (
    <section className="wf-sec wf-sec--full wf-split">
      <Head caption={x.caption} headline={x.headline} body={x.body} />
      <Box label="Diagram: engineering foundation + business layer">
        <Schooling />
        <p className="wf-small">
          <D>{(v(x.tags) ?? []).join(' / ')}</D>
        </p>
      </Box>
      <Outro f={x.outro} />
    </section>
  )
}

function Contact8() {
  const c = site.contact
  return (
    <section className="wf-sec wf-sec--full wf-split">
      <div>
        <Head caption={c.caption} headline={c.headline} body={c.body} />
        <p className="wf-small">
          <D>{(v(c.focus) ?? []).join(' · ')}</D>
        </p>
      </div>
      <BriefForm />
      <Outro f={c.outro} />
    </section>
  )
}

// ── Structure 5: five sections at natural height, person first ─────────────────────────

function Nav5() {
  return (
    <nav className="wf-nav" aria-label="Wireframe navigation">
      <span className="wf-strong">{name}</span>
      <ol className="wf-nav__items">
        {['How I work', 'Now', 'Path'].map((s) => (
          <li key={s}>
            <D>{s}</D>
          </li>
        ))}
        <li className="wf-btn" data-q="reach">
          <D>Write me a brief</D>
        </li>
      </ol>
    </nav>
  )
}

function Intro5() {
  return (
    <section className="wf-sec wf-intro5">
      <h1 className="wf-h1" data-q="who">
        {name}
      </h1>
      <p className="wf-lead" data-q="roles">
        {title}
      </p>
      <p data-q="orgs">
        <D>Now</D>: {[...nowOrgs, ...ventureNames].join(' · ')}
      </p>
      <p data-q="past">
        <D>Before</D>: {pastOrgs.join(' · ')}
      </p>
      <p>
        <Need>one positioning line in Sai&apos;s own words</Need>
      </p>
    </section>
  )
}

function Brief5() {
  return (
    <section className="wf-sec">
      <header className="wf-head">
        <p className="wf-label">
          <D>How I work</D>
        </p>
        <h2 className="wf-h2">{brief.lines.join(' ')}</h2>
        <p className="wf-small">
          <D>An illustration of how I approach a brief, not a client case study.</D>
        </p>
      </header>
      <div className="wf-cols wf-cols--3">
        <Box label="Requirements">
          <Spec />
        </Box>
        <Readers tabs />
        <Box label="Decision">
          <p className="wf-small">
            <D>{site.leadership.circles.map((c) => c.label).join(' + ')}</D>
          </p>
          <p className="wf-strong">
            <D>{site.leadership.decision}</D>
          </p>
        </Box>
      </div>
    </section>
  )
}

function Now5() {
  const spm = roles.find((r) => r.to === 'Present')
  return (
    <section className="wf-sec">
      <header className="wf-head">
        <h2 className="wf-h2">
          <D>Now</D>
        </h2>
      </header>
      <div className="wf-cols">
        {spm && (
          <div className="wf-col wf-card">
            <p className="wf-strong">{spm.org}</p>
            <p>{spm.title}</p>
          </div>
        )}
      </div>
      <Companies />
    </section>
  )
}

function Path5() {
  return (
    <section className="wf-sec">
      <header className="wf-head">
        <h2 className="wf-h2">
          <D>Path</D>
        </h2>
      </header>
      <Career />
      <Schooling />
    </section>
  )
}

function Contact5() {
  const c = site.contact
  return (
    <section className="wf-sec wf-split">
      <Head headline={c.headline} body={c.body} />
      <BriefForm />
    </section>
  )
}

// ── The candidate structures ───────────────────────────────────────────────────────────

export const STRUCTURES = {
  s8: {
    name: 'Structure 8',
    blurb: 'The current site: eight full-screen sections, the brief leads the first screen.',
    nav: Nav8,
    blocks: [Hero8, Technology8, Business8, Leadership8, Ventures8, Experience8, Education8, Contact8],
  },
  s5a: {
    name: 'Structure 5, order A',
    blurb: 'Five sections at natural height. Person first, then how he works, then what he does now.',
    nav: Nav5,
    blocks: [Intro5, Brief5, Now5, Path5, Contact5],
  },
  s5b: {
    name: 'Structure 5, order B',
    blurb: 'Five sections at natural height. Person first, then what he does now, then how he works.',
    nav: Nav5,
    blocks: [Intro5, Now5, Brief5, Path5, Contact5],
  },
} as const

export type StructureId = keyof typeof STRUCTURES
export const isStructure = (id: string): id is StructureId => id in STRUCTURES

/** The ten-second questions each first screen should answer, keyed by `data-q`. */
export const QUESTIONS = [
  { q: 'who', label: 'Who he is (name)' },
  { q: 'roles', label: 'His current roles' },
  { q: 'orgs', label: 'Where he works now' },
  { q: 'past', label: 'Past employers' },
  { q: 'reach', label: 'A way to get in touch' },
] as const

export function Wire({ id }: { id: StructureId }) {
  const s = STRUCTURES[id]
  const Nav = s.nav
  return (
    <div className="wf-page">
      <Nav />
      {s.blocks.map((B, i) => (
        <B key={i} />
      ))}
    </div>
  )
}
