// The review sketch's in-page nav (Sketch Y, refined). Its labels are proposed microcopy (drafts).
import { COPY, name } from '@/components/explore/data.ts'
import { D } from '@/components/marks.tsx'

/** The review sketch's small in-page pill nav; the live site uses the floating nav instead. */
export function PillNav() {
  const links = [
    { href: '#now', label: COPY.now },
    { href: '#brief', label: COPY.howIWork },
    { href: '#path', label: COPY.path },
    { href: '#contact', label: COPY.contactLink },
  ]
  return (
    <nav className="y2-nav" aria-label="Sections">
      <a className="y2-nav__name" href="#top">
        {name}
      </a>
      <ul className="y2-nav__links">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href}>
              <D>{l.label}</D>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
