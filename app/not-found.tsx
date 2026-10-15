import type { Metadata } from 'next'
import Link from 'next/link'
import { fonts } from '@/components/home/fonts.ts'
import '@/components/home/tokens.css'
import './not-found.css'

export const metadata: Metadata = { title: 'Page not found · Sai Srujan Pasala', robots: { index: false } }

// A missing page, in the site's own look: the hero's line and point, one sentence, one way back.
export default function NotFound() {
  return (
    <main className={`sy sy2 nf ${fonts}`}>
      <div className="nf__core">
        <p className="nf__code">404</p>
        <h1 className="nf__h">Page not found</h1>
        <div className="nf__rule" aria-hidden="true">
          <span />
        </div>
        <p className="nf__p">The page you’re looking for doesn’t exist or has moved.</p>
        <Link className="nf__link" href="/">
          Go to the home page
        </Link>
      </div>
    </main>
  )
}
