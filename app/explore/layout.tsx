import type { Metadata } from 'next'
import { Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './explore.css'

// The exploration's own type (its wireframes, sketches and control use these).
const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--f-sans' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono' })

export const metadata: Metadata = {
  title: 'Redesign exploration',
  robots: { index: false, follow: false },
}

/** Preview-only workspace for the redesign exploration. The live site does not use it. */
export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${sans.variable} ${mono.variable} ex-fonts`}>{children}</div>
}
