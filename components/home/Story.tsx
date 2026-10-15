// The site's sections after the hero, built to the client's reference images (2026-10-12):
// About, How I work, Path, Ventures, Experience, Education, Let's connect, and a footer. Each
// numbered section opens with the same left column (label, short rule, serif heading, optional
// line). Copy comes from content/page.ts (the client's wording, recorded as final); every fact
// (roles, organisations, dates, places, ventures, education, email) from the verified content
// model (content/live.ts). Only content still marked draft in the model is marked <D>. Elements marked
// data-reveal fade in on scroll and headings rise line by line (Motion.tsx, scroll.css); without
// JavaScript or with reduced motion everything is simply shown.
import { ArrowRight, CalendarDays, GraduationCap, Mail } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { D, F } from '@/components/marks.tsx'
import { education, name, noteFor, period, type Role, roles, ventures } from '@/content/live.ts'
import { page, type Step } from '@/content/page.ts'
import { CopyEmail } from './CopyEmail.tsx'
import { Deck } from './Deck.tsx'
import { profile } from '@/content/profile.ts'
import * as site from '@/content/site.ts'
import { type Fact, valueOf } from '@/content/schema.ts'
import './story.css'

const v = valueOf
const L = v(page.labels)
type Tone = 'indigo' | 'coral' | 'teal' | 'blue' | 'grey'
const TONES: Tone[] = ['indigo', 'coral', 'teal', 'blue']
/** The k-th colour, repeating the four in order for longer lists. */
const tone = (k: number) => TONES[k % TONES.length]
const vars = (o: Record<string, string | number>) => o as CSSProperties
const num = (k: number) => String(k + 1).padStart(2, '0')

/** One heading line in its own mask: it rises from behind its bottom edge on scroll (scroll.css,
 *  .st-ln). Whole lines move, never single words, so no letter is ever shown sliced mid-word. `i`
 *  staggers a heading's authored lines; a heading the browser wraps by itself moves as one block. */
function Line({ i = 0, className, children }: { i?: number; className?: string; children: ReactNode }) {
  return (
    <span className={className ? `st-ln ${className}` : 'st-ln'}>
      <span style={vars({ '--li': i })}>{children}</span>
    </span>
  )
}

/** "01 / ABOUT" */
function Label({ n, text }: { n: string; text?: string }) {
  return (
    <p className="st-label">
      <span className="st-label__n">{n}</span>
      <span aria-hidden="true"> / </span>
      {text}
    </p>
  )
}

/** The serif heading; its closing full stop carries an accent colour. */
function Heading({ id, f, end }: { id: string; f: Fact<string>; end?: Tone }) {
  const t = v(f) ?? ''
  const stop = t.endsWith('.') ? '.' : ''
  const line = (
    <Line>
      {stop ? t.slice(0, -1) : t}
      {stop ? <span className={end ? `st-h__end st-c-${end}` : undefined}>{stop}</span> : null}
    </Line>
  )
  return (
    <h2 id={id} className="st-h">
      {f.status === 'draft' ? <D>{line}</D> : line}
    </h2>
  )
}

/** The left column every numbered section shares: label, rule, heading and an optional line. */
function Side({
  n,
  label,
  id,
  heading,
  end,
  sub,
  children,
}: {
  n: string
  label?: string
  id: string
  heading: Fact<string>
  end?: Tone
  sub?: Fact<string>
  children?: ReactNode
}) {
  return (
    <div className="st-side" data-reveal>
      <Label n={n} text={label} />
      <span className="st-rule" aria-hidden="true" />
      <Heading id={id} f={heading} end={end} />
      {sub ? (
        <p className="st-sub">
          <F f={sub} />
        </p>
      ) : null}
      {children}
    </div>
  )
}

function Section({ id, className = '', children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`st-sec ${className}`} aria-labelledby={`${id}-h`}>
      <div className="st-wrap">{children}</div>
    </section>
  )
}

// ── 01 About ───────────────────────────────────────────────────────────────────────────

export function About() {
  const [l1, l2, l3 = ''] = v(page.about.heading) ?? []
  const body = v(page.about.body) ?? []
  const pillars = v(page.about.pillars) ?? []
  const principles = v(page.about.principles) ?? []
  return (
    <Section id="about" className="st-about">
      <div className="st-about__grid">
        <div className="st-side" data-reveal>
          <Label n="01" text={L?.about} />
          <span className="st-rule" aria-hidden="true" />
          <h2 id="about-h" className="st-about__h">
            <Line i={0} className="st-about__l1">
              {l1}
            </Line>{' '}
            <Line i={1} className="st-about__l2">
              {l2}
            </Line>{' '}
            <Line i={2} className="st-about__l3">
              {l3.replace(/\.$/, '')}
              <span className="st-c-coral st-h__end">.</span>
            </Line>
          </h2>
          <p className="st-sub st-sub--lg">
            <F f={page.about.sub} />
          </p>
        </div>

        <div className="st-about__mid" data-reveal style={vars({ '--i': 1 })}>
          <p className="st-kicker">
            {L?.perspective}
          </p>
          <div className="st-about__text">
            {body.map((p) => (
              <p key={p}>
                {p}
              </p>
            ))}
          </div>
          <Deck label={L?.perspective ?? 'Perspective'} unit="card">
            <ul className="st-pillars">
              {pillars.map((p, k) => (
                <li key={p.title} className={`st-c-${tone(k)}`}>
                  <span className="st-pillars__t">
                    {p.title}
                  </span>
                  <span className="st-pillars__p">
                    {p.text}
                  </span>
                </li>
              ))}
            </ul>
          </Deck>
        </div>

        <div className="st-about__side" data-reveal style={vars({ '--i': 2 })}>
          <p className="st-kicker">
            {L?.principles}
          </p>
          <ol className="st-principles">
            {principles.map((p, k) => (
              <li key={p.title} className={`st-c-${tone(k)}`}>
                <span className="st-principles__t">
                  {p.title}
                </span>
                <span className="st-principles__p">
                  {p.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}

// ── Wave timelines (02 How I work, 03 Path) ────────────────────────────────────────────

/** A point on the wave, in the drawing's 1000 x 400 space; `up` puts the step's text above it. */
type Point = { x: number; y: number; up: boolean }

/** How far along a wave's path (0 to 1, by length) the line has drawn when it reaches each
 *  position along its run: x for the wide drawing (left to right), y for the phone drawing (top to
 *  bottom). The stroke draws by length (pathLength=1), so a node keyed to this lights exactly as
 *  the line arrives. Supports what the waves use: one absolute M, then absolute C curves that only
 *  move forward along that axis. Anything else (relative or other commands) falls back to a plain
 *  share of the drawing's extent, so nodes still light in order, just less precisely. */
function reachAt(d: string, xs: number[], axis: 0 | 1 = 0, extent = 1000): number[] {
  if (!/^\s*M[\s\d.,-]+(C[\s\d.,-]+)+$/.test(d)) return xs.map((x) => Math.min(1, Math.max(0, x / extent)))
  const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number)
  const pts: [number, number][] = [[n[0], n[1]]]
  for (let i = 2; i + 5 < n.length; i += 6) {
    const [x0, y0] = pts[pts.length - 1]
    const [x1, y1, x2, y2, x3, y3] = n.slice(i, i + 6)
    for (let t = 1; t <= 48; t++) {
      const u = t / 48
      const m = 1 - u
      pts.push([
        m * m * m * x0 + 3 * m * m * u * x1 + 3 * m * u * u * x2 + u * u * u * x3,
        m * m * m * y0 + 3 * m * m * u * y1 + 3 * m * u * u * y2 + u * u * u * y3,
      ])
    }
  }
  const run = [0]
  for (let i = 1; i < pts.length; i++) run.push(run[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const total = run[run.length - 1] || 1
  return xs.map((x) => {
    const i = pts.findIndex((p) => p[axis] >= x)
    return i < 0 ? 1 : +(run[i] / total).toFixed(3)
  })
}
/** The paths are constants: work each one out once, not on every render. */
const reachMemo = new Map<string, number[]>()
function reachFor(d: string, xs: number[], axis: 0 | 1 = 0, extent = 1000): number[] {
  const key = `${d}|${xs.join(',')}|${axis}|${extent}`
  let r = reachMemo.get(key)
  if (!r) reachMemo.set(key, (r = reachAt(d, xs, axis, extent)))
  return r
}

/** The phone drawing: the same line turned to run down the screen, in its own narrow lane at the
 *  left edge (story.css: 88px wide, the text starts beyond it), so it never crosses a word. It
 *  weaves through one point per step, alternating 9.5 and 20.5 in a 30-wide drawing (28px and
 *  60px), V_STEP units per step: each step is one equal row, so its point sits at the row's
 *  middle. 30 x 48 units keeps the drawing close to its on-screen proportions, so the stroke stays
 *  even. `tail` runs on to the lane's middle at the bottom, where Path's end circle sits. Smooth:
 *  every curve leaves and arrives vertically. */
const V_STEP = 48
const V_W = 30
function portrait(n: number, tail: boolean) {
  const pts: [number, number][] = Array.from({ length: n }, (_, k) => [k % 2 ? 20.5 : 9.5, (k + 0.5) * V_STEP])
  if (tail) pts.push([V_W / 2, n * V_STEP])
  if (!pts.length) return { d: `M${V_W / 2} 0`, h: V_STEP, ys: [] }
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const m = (y1 - y0) / 2
    d += ` C ${x0} ${y0 + m}, ${x1} ${y1 - m}, ${x1} ${y1}`
  }
  return { d, h: n * V_STEP, ys: pts.slice(0, n).map((p) => p[1]) }
}

/**
 * Steps along a drawn wave. On wide screens each step hangs off its point (number badge, dashed
 * stem, text); on phones the line runs down the screen and the steps sit on it, alternating sides.
 * Tablets keep a plain stacked list. The drawings are decorative.
 */

function Wave({
  steps,
  points,
  d,
  className,
  centre,
  endCircle,
}: {
  steps: Step[]
  points: Point[]
  d: string
  className: string
  centre?: { x: number; y: number; label?: string }
  endCircle?: { x: number; y: number }
}) {
  // Where the drawn line reaches each step and the centre (story.css, scroll.css: --f). The end
  // (arrowhead or end circle) is the end of the line: --f 1.
  const reach = reachFor(d, [...points.map((p) => p.x), ...(centre ? [centre.x] : [])])
  const fCentre = centre ? reach[points.length] : 1
  // The phone drawing, with the same reach for its points and its centre (half way down).
  const n = Math.min(steps.length, points.length)
  const tall = portrait(n, !!endCircle)
  const reachV = reachFor(tall.d, [...tall.ys, ...(centre ? [tall.h / 2] : [])], 1, tall.h)
  return (
    <div className={`st-wave ${className}`} data-reveal style={vars({ '--i': 1 })}>
      <svg className="st-wave__line" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
        <path d={d} pathLength={1} />
      </svg>
      <svg className="st-wave__vline" viewBox={`0 0 ${V_W} ${tall.h}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={tall.d} pathLength={1} />
      </svg>
      {centre ? (
        <span
          className="st-wave__centre"
          style={vars({ '--x': `${centre.x / 10}%`, '--y': `${centre.y / 4}%`, '--fd': fCentre, '--fv': reachV[n] })}
        >
          <span>
            {centre.label}
          </span>
        </span>
      ) : null}
      {endCircle ? (
        <span className="st-wave__end" style={vars({ '--x': `${endCircle.x / 10}%`, '--y': `${endCircle.y / 4}%`, '--fd': 1, '--fv': 1 })} aria-hidden="true">
          <ArrowRight size={22} strokeWidth={1.5} />
        </span>
      ) : null}
      <ol className="st-wave__steps">
        {/* The curve is drawn for exactly `points.length` steps; tests/unit/site.test.ts fails if the
            content ever has more, so this guard only keeps a mismatch from breaking the page. */}
        {steps.slice(0, points.length).map((s, k) => {
          const p = points[k]
          return (
            <li
              key={s.title}
              className={`st-step ${p.up ? 'st-step--up' : 'st-step--down'} st-c-${tone(k)}`}
              style={vars({ '--x': `${p.x / 10}%`, '--y': `${p.y / 4}%`, '--k': k, '--fd': reach[k], '--fv': reachV[k] })}
            >
              <span className="st-step__dot" aria-hidden="true" />
              <span className="st-step__stem" aria-hidden="true" />
              <span className="st-step__num" aria-hidden="true">
                {num(k)}
              </span>
              <div className="st-step__text">
                <h3 className="st-step__t">
                  {s.title}
                </h3>
                <span className="st-step__bar" aria-hidden="true" />
                <p className="st-step__p">
                  {s.text}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const WORK_POINTS: Point[] = [
  { x: 30, y: 150, up: true },
  { x: 250, y: 222, up: false },
  { x: 540, y: 150, up: true },
  { x: 800, y: 240, up: false },
]
const WORK_PATH =
  'M30 150 C 110 150, 180 222, 250 222 C 320 222, 370 188, 420 182 C 470 176, 500 150, 540 150 C 650 150, 720 240, 800 240 C 860 240, 895 185, 935 158'

const PATH_POINTS: Point[] = [
  { x: 150, y: 248, up: true },
  { x: 430, y: 300, up: true },
  { x: 700, y: 240, up: true },
]
const PATH_PATH =
  'M0 190 C 60 190, 100 232, 150 248 C 230 272, 350 252, 430 300 C 520 336, 610 250, 700 240 C 780 230, 830 275, 880 266 C 900 262, 912 254, 922 250'

export function Work() {
  return (
    <Section id="work" className="st-work">
      <div className="st-head">
        <Side n="02" label={L?.work} id="work-h" heading={page.work.heading} end="coral" />
        <p className="st-intro" data-reveal style={vars({ '--i': 1 })}>
          <F f={page.work.intro} />
        </p>
      </div>
      <Wave
        className="st-wave--work"
        steps={v(page.work.steps) ?? []}
        points={WORK_POINTS}
        d={WORK_PATH}
        centre={{ x: 420, y: 182, label: v(page.work.centre) }}
      />
    </Section>
  )
}

export function Journey() {
  return (
    <Section id="path" className="st-path">
      <div className="st-head">
        <Side n="03" label={L?.path} id="path-h" heading={page.path.heading} end="indigo" />
        <p className="st-intro" data-reveal style={vars({ '--i': 1 })}>
          <F f={page.path.intro} />
        </p>
      </div>
      <Wave className="st-wave--path" steps={v(page.path.items) ?? []} points={PATH_POINTS} d={PATH_PATH} endCircle={{ x: 960, y: 246 }} />
    </Section>
  )
}

// ── 04 Ventures ────────────────────────────────────────────────────────────────────────

/** The verified ventures, with the client's wording around them (recorded as final): the intro line and
 *  the four things he looks for (content/site.ts, ventures.body and ventures.inputs). */
export function Ventures() {
  const looks = v(site.ventures.inputs) ?? []
  return (
    <Section id="ventures">
      <div className="st-grid">
        <Side n="04" label={L?.ventures} id="ventures-h" heading={page.ventures.heading} end="indigo" sub={site.ventures.body} />
        <div className="st-ventures__main">
        <Deck label={L?.ventures ?? 'Ventures'} unit="venture">
          <ul className="st-ventures">
            {ventures.map((x, k) => (
              <li key={x.id} className={`st-venture st-c-${k === 0 ? 'coral' : 'indigo'}`} data-reveal style={vars({ '--i': k + 1 })}>
                <h3 className="st-venture__name">{x.name}</h3>
                <p className="st-venture__role">
                  <F f={x.role} />
                </p>
                <p className="st-venture__line">
                  <F f={x.line} />
                </p>
                {x.sourceUrl ? (
                  <a className="st-venture__link" href={x.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {L?.viewRecord}
                    <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                    <span className="sk-bar__sr"> (opens in a new tab)</span>
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </Deck>
        {looks.length ? (
          <div className="st-looks" data-reveal style={vars({ '--i': 3 })}>
            <p className="st-kicker">
              {L?.lookFor}
            </p>
            <ul className="st-looks__list">
              {looks.map((l, k) => (
                <li key={l.label} className={`st-c-${tone(k)}`}>
                  <span className="st-looks__t">
                    {l.label}
                  </span>
                  <span className="st-looks__p">
                    {l.lines.map((x) => (
                      <span key={x}>
                        {x}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        </div>
      </div>
    </Section>
  )
}

// ── 05 Experience ──────────────────────────────────────────────────────────────────────

const year = (s?: string) => s?.match(/\d{4}/)?.[0]
/** The years only, from the verified period: "2022 - 2023", "2021", or nothing. */
const years = (r: Role) => {
  const a = year(r.from)
  const b = year(r.to)
  return a && b && a !== b ? `${a} - ${b}` : (a ?? b ?? '')
}
const XP_TONES: Tone[] = ['indigo', 'indigo', 'coral', 'teal', 'blue', 'grey']

/** Every verified role, newest first: period as given, title, organisation, place, draft tags,
 *  and Sai's own verified note (or, only where none exists, the draft description). */
export function Experience() {
  const details = v(page.experience.roles) ?? {}
  const career = [...roles].reverse()
  return (
    <Section id="experience" className="st-experience">
      <div className="st-grid">
        <Side n="05" label={L?.experience} id="experience-h" heading={page.experience.heading} end="indigo" sub={page.experience.sub} />
        <Deck label={L?.experience ?? 'Experience'} unit="role">
          <ol className="st-xp">
            {career.map((r, k) => {
              const note = noteFor(r)
              const own = note && !note.draft ? note.text : undefined
              const extra = details[r.title]
              const now = r.to === 'Present'
              const y = years(r)
              const p = period(r)
              return (
                <li key={`${r.title}-${r.org}`} className={`st-xp__row st-c-${XP_TONES[k] ?? 'grey'}`} data-reveal style={vars({ '--i': k })}>
                  <div className="st-xp__when">
                    {now ? (
                      <span className="st-xp__big st-xp__big--now">
                        {L?.present}
                      </span>
                    ) : (
                      <span className="st-xp__big">{y}</span>
                    )}
                    {!now && p && p !== y ? <span className="st-xp__small">{p}</span> : null}
                  </div>
                  <div className="st-xp__role">
                    <h3 className="st-xp__t">{r.title}</h3>
                    <p className="st-xp__org">{r.org}</p>
                    {r.place ? <p className="st-xp__place">{r.place}</p> : null}
                    {extra?.tags.length ? (
                      <ul className="st-tags">
                        {extra.tags.map((t) => (
                          <li key={t}>
                            {t}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <p className="st-xp__desc">{own ?? (extra?.text ?? null)}</p>
                </li>
              )
            })}
          </ol>
        </Deck>
      </div>
    </Section>
  )
}

// ── 06 Education ───────────────────────────────────────────────────────────────────────

/** Decorative orbits under the Education heading (they encode nothing). */
function Orbits() {
  return (
    <span className="st-orbits" aria-hidden="true">
      <svg viewBox="0 0 400 300">
        <circle cx="70" cy="300" r="150" />
        <circle cx="70" cy="300" r="210" />
        <circle cx="70" cy="300" r="290" />
      </svg>
      <i className="st-orbits__a" />
      <i className="st-orbits__b" />
      <i className="st-orbits__c" />
    </span>
  )
}

export function Education() {
  const items = v(page.education.items) ?? {}
  return (
    <Section id="education" className="st-education">
      <div className="st-grid">
        <Side n="06" label={L?.education} id="education-h" heading={page.education.heading} end="indigo" sub={page.education.sub}>
          <Orbits />
        </Side>
        <ol className="st-edu">
          {[...education].reverse().map((e, k) => {
            const extra = items[e.qualification]
            return (
              <li key={e.qualification} className={`st-edu__item${k === 0 ? ' is-now' : ''}`} data-reveal style={vars({ '--i': k + 1 })}>
                <article className="st-edu__card">
                  <span className="st-edu__icon" aria-hidden="true">
                    <GraduationCap size={30} strokeWidth={1.5} />
                  </span>
                  <div className="st-edu__body">
                    <p className="st-edu__when">
                      {e.from} - {e.to}
                    </p>
                    <h3 className="st-edu__t">{e.qualification}</h3>
                    <p className="st-edu__org">{e.institution}</p>
                    {extra?.tags.length ? (
                      <ul className="st-tags">
                        {extra.tags.map((t) => (
                          <li key={t}>
                            {t}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {extra?.text ? (
                    <p className="st-edu__desc">
                      {extra.text}
                    </p>
                  ) : null}
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}

// ── 07 Let's connect, footer ───────────────────────────────────────────────────────────

/** Decorative orbit lines behind the Let's connect heading (they encode nothing). */
function ConnectOrbits() {
  return (
    <span className="st-corbits" aria-hidden="true">
      <svg viewBox="0 0 300 300">
        <circle cx="40" cy="240" r="170" />
        <circle cx="40" cy="240" r="250" />
      </svg>
      <i />
    </span>
  )
}

/** One contact route. Without a confirmed link it is shown, but it is not a link. */
function Channel({
  tone,
  icon,
  title,
  text,
  href,
  external,
  extra,
}: {
  tone: Tone
  icon: ReactNode
  title?: string
  text?: string
  href?: string
  external?: boolean
  extra?: ReactNode
}) {
  const inner = (
    <>
      <span className="st-channel__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="st-channel__body">
        <span className="st-channel__t">
          {title}
        </span>
        <span className="st-channel__p">{text}</span>
      </span>
      {href ? (
        <span className="st-channel__go" aria-hidden="true">
          <ArrowRight size={16} strokeWidth={1.75} />
        </span>
      ) : null}
    </>
  )
  return (
    <li className={`st-c-${tone}`}>
      {href ? (
        <a
          className="st-channel"
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {inner}
          {external ? <span className="sk-bar__sr"> (opens in a new tab)</span> : null}
        </a>
      ) : (
        <div className="st-channel st-channel--off" aria-disabled="true">
          {inner}
        </div>
      )}
      {extra}
    </li>
  )
}

export function Connect() {
  const email = v(profile.email)
  const linkedin = v(profile.linkedin)
  const booking = v(profile.booking)
  const ch = v(page.connect.channels)
  const card = v(page.connect.card)
  const [h1, h2, h3 = ''] = v(page.connect.heading) ?? []
  const [c1, c2, c3 = ''] = card?.heading ?? []
  return (
    <Section id="connect" className="st-connect">
      <div className="st-connect__grid">
        <div className="st-side st-connect__side" data-reveal>
          <Label n="07" text={L?.connect} />
          <h2 id="connect-h" className="st-h st-connect__h">
            <Line i={0}>{h1}</Line> <Line i={1}>{h2}</Line>{' '}
            <Line i={2}>
              <span className="st-grad">
                {h3.replace(/\.$/, '')}
                <span className="st-h__dot">.</span>
              </span>
            </Line>
          </h2>
          <span className="st-rule" aria-hidden="true" />
          <p className="st-sub st-sub--lg">
            <F f={page.connect.body} />
          </p>
          {/* The page's closing point: the hero's line and point again, drawn as Contact arrives. */}
          <span className="st-bookend" aria-hidden="true">
            <i />
          </span>
          <ConnectOrbits />
        </div>

        <ul className="st-channels" aria-label={L?.connect} data-reveal style={vars({ '--i': 1 })}>
          <Channel
            tone="indigo"
            icon={<Mail size={26} strokeWidth={2} />}
            title={ch?.email}
            text={email}
            href={email ? `mailto:${email}` : undefined}
            extra={email ? <CopyEmail email={email} /> : null}
          />
          <Channel
            tone="coral"
            icon={<span className="st-channel__in">in</span>}
            title={ch?.linkedin}
            text={linkedin ? linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : ch?.linkedinSoon}
            href={linkedin}
            external
          />
          {/* Shown only once a booking link exists: an inert "coming soon" row is a dead end. */}
          {booking ? (
            <Channel
              tone="teal"
              icon={<CalendarDays size={26} strokeWidth={1.75} />}
              title={ch?.call}
              text={ch?.callText}
              href={booking}
              external
            />
          ) : null}
        </ul>

        {/* A div, not an aside: a complementary landmark may not sit inside <main> (axe). */}
        <div className="st-build" data-reveal style={vars({ '--i': 3 })}>
          <p className="st-build__kicker">
            {card?.kicker}
          </p>
          <p id="build-h" className="st-build__h">
            <span>{c1}</span> <span>{c2}</span>{' '}
            <span className="st-grad st-grad--light">{c3}</span>
          </p>
          <span className="st-rule" aria-hidden="true" />
          {email ? (
            <a className="st-build__btn" href={`mailto:${email}`}>
              {card?.button}
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export function Footer() {
  const links = [
    { href: '#work', label: L?.work },
    { href: '#path', label: L?.path },
    { href: '#ventures', label: L?.ventures },
    { href: '#experience', label: L?.experience },
    { href: '#education', label: L?.education },
  ]
  return (
    <footer className="st-foot">
      <div className="st-wrap st-foot__row">
        <span className="st-foot__name">{name}</span>
        <nav aria-label="Footer">
          <ul className="st-foot__links">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <span className="st-foot__dot" aria-hidden="true" />
      </div>
    </footer>
  )
}
