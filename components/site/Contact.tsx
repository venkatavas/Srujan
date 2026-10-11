import { profile } from '@/content/profile.ts'
import { type Fact, valueOf } from '@/content/schema.ts'
import * as site from '@/content/site.ts'
import { BriefForm } from './BriefForm.tsx'
import { Outro, Rings, Stages } from './Chrome.tsx'
import { Lead, Tile } from './Tile.tsx'

const v = valueOf
/** A link is only ever made from a verified fact: a draft or pending address is never a target. */
const linkOf = (f: Fact<string>) => (f.status === 'verified' ? f.value : undefined)

/* ── 08 CONTACT — your brief ───────────────────────────────────────────────
   From the client's reference image (1672×941), in % of the section: the copy column from the
   page margin to ~35% (headline from 37.5%, the "+" list 64–75%), the brief panel 41.3–95% ×
   32.7–74.8%. Behind them, faint rings centred on the section with their axis at x 50% from 19%
   to 82%: a vermilion point at 22.8% above the panel, a light streak at 79–81% below it, a dotted
   level at 25.5% with three small crosses, and a lone "+" by the copy (positions in contact.css).

   The ring box is the axis: 63svh tall, so the outer ring (0.45 of the viewport height) is 0.714
   of the box. The marks are positioned in % of the section, not of the box.

   Draw-in (motion/chapters/draw.ts): rings and the level 0 · the panel and the journey row 1 ·
   the list 2–5 with the closing line · the point and crosses 3 · the streak 5. The headline, the
   body and the section head are enter.ts's and carry no step. */

export function Contact() {
  const c = site.contact
  const focus = v(c.focus) ?? []
  return (
    <Tile id="contact" n="08" title="Contact" caption={c.caption}>
      <div className="ct-decor" aria-hidden="true">
        <div data-step={0} className="ct-decor__rings">
          <Rings className="ct-rings" radii={[0.714, 0.59]} dotted={[0.5]} />
        </div>
        <span className="ct-level" data-step={0}>
          <i style={{ left: '29%' }} />
          <i style={{ left: '58%' }} />
          <i style={{ left: '71%' }} />
        </span>
        <span className="ct-point" data-step={3} />
        <span className="ct-plus" data-step={3} />
        <span className="ct-streak" data-step={5} />
      </div>

      <div className="split ct">
        <div className="split__copy ct__copy">
          <Lead body={v(c.body)}>{v(c.headline)}</Lead>
          {focus.length > 0 && (
            <ul className="ct__focus" aria-label="Conversations I’m open to">
              {focus.map((t, i) => (
                <li key={t} data-step={2 + i}>
                  <i aria-hidden="true">+</i>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        <BriefForm
          email={linkOf(profile.email)}
          placeholder={c.placeholder}
          topics={v(c.topics) ?? []}
          linkedin={linkOf(profile.linkedin)}
          booking={linkOf(profile.booking)}
        />
      </div>

      <Stages active="Contact" extra={['Experience', 'Contact']} />
      <Outro lines={c.outro} />
    </Tile>
  )
}
