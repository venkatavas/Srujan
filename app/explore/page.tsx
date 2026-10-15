import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Frame } from '@/components/explore/Frame.tsx'
import { SCREENS, SKETCHES, type SketchId } from '@/components/explore/sketch/index.ts'
import { QUESTIONS, STRUCTURES, type StructureId, Wire } from '@/components/explore/Wire.tsx'
import { SHOW_PENDING } from '@/content/schema.ts'
import { FACTS_TO_CONFIRM } from '@/lib/content/review.ts'
import { contentMap, type MapRow, type MapStatus } from '@/lib/content/map.ts'

const DEVICES = [
  { label: 'Desktop, 1440 × 900', width: 1440, height: 900, scale: 0.28 },
  { label: 'Phone, 390 × 844', width: 390, height: 844, scale: 0.5 },
] as const

const IDS = Object.keys(STRUCTURES) as StructureId[]

const SCORES = [
  'Calm',
  'Welcoming',
  'Distinctive (would it still work with someone else’s name on it? If yes, it is not)',
  'Clear in 10 seconds: who he is and what he does now',
  'Feels like Sai: would he send it to a hospital CIO and to a founder?',
  'The brief story is easy to follow',
  'Works on a phone',
]

const STATUS: Record<MapStatus, string> = {
  verified: 'Verified',
  draft: 'Draft',
  unwrapped: 'Not yet tracked',
  pending: 'Needed',
}

function group(rows: MapRow[]) {
  const out = new Map<string, MapRow[]>()
  for (const r of rows) out.set(r.s8, [...(out.get(r.s8) ?? []), r])
  return [...out]
}

/** Stage 1 of the redesign exploration: structure and content, before any visual design. */
export default function Explore() {
  if (!SHOW_PENDING) notFound()
  const rows = contentMap()
  const count = (s: MapStatus) => rows.filter((r) => r.status === s).length
  return (
    <main className="ex">
      <header className="ex-intro">
        <p className="ex-kicker">Redesign exploration</p>
        <h1 className="ex-h1">Finding the right direction for Sai&apos;s site</h1>
        <p>
          Start with the colour sketches (Stage 3). Further down, the grey wireframes (Stage 1) are deliberately plain: they
          compare structure and content only, not the look of the site.
        </p>
        <dl className="ex-legend">
          <div>
            <dt>
              <span className="wf-d">Dotted underline</span>
            </dt>
            <dd>Draft copy, awaiting Sai&apos;s approval</dd>
          </div>
          <div>
            <dt>
              <span className="wf-need">Needed</span>
            </dt>
            <dd>Content that does not exist yet</dd>
          </div>
          <div>
            <dt>
              <span className="wf-box__label">Grey box</span>
            </dt>
            <dd>A diagram or interaction, described rather than designed</dd>
          </div>
        </dl>
      </header>

      <section className="ex-section" id="sketches" aria-labelledby="ex-sketches">
        <p className="ex-kicker">Stage 3</p>
        <h2 id="ex-sketches" className="ex-h2">
          Direction sketches, in colour
        </h2>
        <p className="ex-lede">
          Three genuinely different directions, plus the current site lit as a control. Each uses a light page with several
          confident accent colours, and each shows the same five screens with the same real content. They are labelled by
          letter so they can be judged on how they feel, not on a concept name. Sketches are shown at rest; the review bar
          on each page lists the intended motion and can highlight draft copy.
        </p>
        <ul className="ex-sketches">
          {(Object.keys(SKETCHES) as SketchId[]).map((id) => (
            <li key={id}>
              <a href={`/explore/sketch/${id}`} className="ex-sketch">
                <span className="ex-sketch__name">{SKETCHES[id].label}</span>
                <span className="ex-muted">{SCREENS.length} screens: {SCREENS.map((x) => x.label).join(' · ')}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="ex-lede">
          <strong>Chosen: Sketch Y.</strong> Phase 1 refinement: <Link href="/explore/sketch/y2">Sketch Y, refined</Link> (approved
          positioning, open &ldquo;How I work&rdquo;, verified facts only), and{' '}
          <Link href="/explore/sketch/colours">its three heroes and four colour sets side by side</Link>. The review bar on the page
          switches hero, colour and type, and lists the facts still to confirm.
        </p>
        <h3 className="ex-h3 ex-gap">Facts to confirm with Sai ({FACTS_TO_CONFIRM.length})</h3>
        <p className="ex-lede">Review only. None of these appear on the page until Sai answers; nothing is guessed.</p>
        <div className="ex-table-wrap">
          <table className="ex-table ex-score">
            <thead>
              <tr>
                <th scope="col">Area</th>
                <th scope="col">Kind</th>
                <th scope="col">Question</th>
              </tr>
            </thead>
            <tbody>
              {FACTS_TO_CONFIRM.map((f) => (
                <tr key={f.item}>
                  <td>{f.area}</td>
                  <td>{f.kind}</td>
                  <td>{f.item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="ex-h3 ex-gap">Scorecard</h3>
        <p className="ex-lede">Score each sketch from 1 (not at all) to 5 (completely). Then one question: would you send this link today?</p>
        <div className="ex-table-wrap">
          <table className="ex-table ex-score">
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                <th scope="col">X</th>
                <th scope="col">Y</th>
                <th scope="col">Z</th>
                <th scope="col">Control</th>
              </tr>
            </thead>
            <tbody>
              {[...SCORES, 'Would you send this link today? (yes or no)'].map((c) => (
                <tr key={c}>
                  <th scope="row">{c}</th>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ex-section" aria-labelledby="ex-structures">
        <p className="ex-kicker">Stage 1, structure only (grey on purpose)</p>
        <h2 id="ex-structures" className="ex-h2">
          Three structures
        </h2>
        <p className="ex-lede">
          Shown side by side at the same scale, so their length can be compared directly. The ticks under each frame are
          measured live: they show which of the five ten-second answers appear before the first screen ends (the dashed
          line).
        </p>
        <ul className="ex-blurbs">
          {IDS.map((id) => (
            <li key={id}>
              <h3 className="ex-h3">{STRUCTURES[id].name}</h3>
              <p>{STRUCTURES[id].blurb}</p>
              <a href={`/explore/wire/${id}`}>Open at full size</a>
            </li>
          ))}
        </ul>
        {DEVICES.map((d) => (
          <div key={d.width} className="ex-device">
            <h3 className="ex-h3">{d.label}</h3>
            <div className="ex-frames">
              {IDS.map((id) => (
                <Frame
                  key={id}
                  width={d.width}
                  height={d.height}
                  scale={d.scale}
                  label={STRUCTURES[id].name}
                  href={`/explore/wire/${id}`}
                  questions={QUESTIONS}
                >
                  <Wire id={id} />
                </Frame>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="ex-section" aria-labelledby="ex-ten">
        <h2 id="ex-ten" className="ex-h2">
          The ten-second test
        </h2>
        <p className="ex-lede">
          Recruiters, founders, investors and enterprise clients each decide quickly whether to keep reading. The first
          screen, with the navigation, should answer:
        </p>
        <ol className="ex-ol">
          {QUESTIONS.map((q) => (
            <li key={q.q}>{q.label}</li>
          ))}
        </ol>
      </section>

      <section className="ex-section" aria-labelledby="ex-findings">
        <h2 id="ex-findings" className="ex-h2">
          What the map shows
        </h2>
        <ul className="ex-ul">
          <li>
            The current first screen names Sai and his three roles, but not where he holds them or where he worked before.
            The person-first intro can say both using verified facts only.
          </li>
          <li>
            A person-first intro needs one positioning line in Sai&apos;s own words. It does not exist yet, and we will not
            write it for him.
          </li>
          <li>
            {count('unwrapped')} strings are plain text in the code and not yet tracked as facts: the three readers&apos;
            points, the decision line, section captions, the journey stops and the requirement labels. They need wrapping
            as drafts so Sai can approve them.
          </li>
          <li>Email, LinkedIn and the booking link are still needed. Until the email exists, sending stays off.</li>
          <li>
            The &ldquo;Upcoming&rdquo; venture card (shown here marked &ldquo;to confirm&rdquo;) and &ldquo;Open to
            opportunities&rdquo; need Sai to confirm them before either goes live.
          </li>
        </ul>
      </section>

      <section className="ex-section" aria-labelledby="ex-map">
        <h2 id="ex-map" className="ex-h2">
          Content map
        </h2>
        <p className="ex-lede">
          Every string in the content model: {rows.length} in total. {count('verified')} verified, {count('draft')} draft,{' '}
          {count('unwrapped')} not yet tracked, {count('pending')} needed. Grouped by the current section, with where each
          lands in the five-section structure.
        </p>
        {group(rows).map(([section, list]) => (
          <details key={section} className="ex-details">
            <summary>
              {section} <span className="ex-muted">({list.length})</span>
            </summary>
            <div className="ex-table-wrap">
              <table className="ex-table">
                <thead>
                  <tr>
                    <th scope="col">Text</th>
                    <th scope="col">Status</th>
                    <th scope="col">In Structure 5</th>
                    <th scope="col">Source or note</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.path} data-status={r.status}>
                      <td>
                        {r.text || <span className="ex-muted">(nothing yet)</span>}
                        <code className="ex-path">{r.path}</code>
                      </td>
                      <td>{STATUS[r.status]}</td>
                      <td>{r.s5}</td>
                      <td className="ex-muted">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </section>
    </main>
  )
}
