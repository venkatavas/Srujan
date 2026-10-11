import { brief, spec, type SpecKey } from '@/content/brief.ts'
import { profile } from '@/content/profile.ts'
import { valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { Lead } from './Tile.tsx'

const v = valueOf
const edu = () => (profile.education.status === 'verified' ? profile.education.value : [])

/* ── 02 TECHNOLOGY — the brief, read into a specification ──────────────── */

// The sentence is split into the spec's own phrases (outermost first, so the measure sits
// inside the need) and the words left over. Nothing is typed twice: every phrase is found
// in brief.lines, and every slot value is spec[i].value.
type Run = { text: string; key?: SpecKey; inner: Run[] }

function runs(text: string, items = spec): Run[] {
  const found = items.map((s) => ({ key: s.key, at: text.indexOf(s.value), len: s.value.length })).filter((f) => f.at >= 0)
  const outer = found
    .filter((f) => !found.some((g) => g.len > f.len && g.at <= f.at && g.at + g.len >= f.at + f.len))
    .sort((a, b) => a.at - b.at)
  const out: Run[] = []
  let i = 0
  for (const f of outer) {
    if (f.at > i) out.push({ text: text.slice(i, f.at), inner: [] })
    const t = text.slice(f.at, f.at + f.len)
    out.push({ text: t, key: f.key, inner: runs(t, items.filter((s) => s.key !== f.key)) })
    i = f.at + f.len
  }
  if (i < text.length) out.push({ text: text.slice(i), inner: [] })
  return out
}

function Phrases({ list, top = false }: { list: Run[]; top?: boolean }) {
  return (
    <>
      {list.map((r, i) =>
        r.key ? (
          <span key={i} className="ph" data-ph={r.key}>
            <Phrases list={r.inner} />
          </span>
        ) : top ? (
          <span key={i} className="tech__rest">
            {r.text}
          </span>
        ) : (
          r.text
        ),
      )}
    </>
  )
}

export function Technology() {
  const bt = edu()[0]
  return (
    <section id="technology" className="tile tile--technology" data-tile data-scene aria-labelledby="technology-t">
      <div className="tech__stage">
        <header className="tile__head">
          <h2 id="technology-t" className="tile__title">
            <span className="tile__n">02</span>
            Technology
          </h2>
          <p className="tile__caption">{site.technology.caption}</p>
        </header>

        <div className="tech__grid">
          <div className="tech__copy">
            <Lead body={v(site.technology.body)}>{v(site.technology.headline)}</Lead>
            {bt && (
              <dl className="credential">
                <dt>Credential</dt>
                <dd>
                  B.Tech CSE
                  <br />
                  {bt.institution}
                  <br />
                  {bt.from} — {bt.to}
                </dd>
              </dl>
            )}
          </div>

          <div className="tech__brief">
            <p className="tech__label">The brief</p>
            <p className="tech__sentence">
              {brief.lines.map((l, i) => (
                <span key={i} className="tech__line">
                  <Phrases list={runs(l)} top />
                  {i < brief.lines.length - 1 && ' '}
                </span>
              ))}
              <span className="tech__scan" aria-hidden="true" />
            </p>
            <p className="tech__caption">{v(site.technology.resolved)}</p>
          </div>

          <div className="tech__spec">
            <p className="tech__label tech__count">
              <span>
                <b data-tech-count>{spec.length}</b>/{spec.length}
              </span>
              requirements
            </p>
            <ol className="tech__slots">
              {spec.map((s, i) => (
                <li key={s.key} className="slot" data-slot={s.key}>
                  <span className="slot__id">R{i + 1}</span>
                  <span className="slot__label">{s.label}</span>
                  <span className="slot__val">
                    <span className="slot__text">{s.value}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="tech__fly" aria-hidden="true" />
      </div>
    </section>
  )
}
