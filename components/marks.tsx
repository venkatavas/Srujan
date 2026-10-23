// Honesty markers for content awaiting approval. A draft renders as normal copy (wrapped, so it
// can be found); missing content is always visible.
import type { ReactNode } from 'react'
import type { Fact } from '@/content/schema.ts'

/** Copy awaiting Sai's approval: mockup drafts, plain strings not yet tracked, and new microcopy. */
export function D({ children }: { children: ReactNode }) {
  return <span className="sk-d">{children}</span>
}

/** Content that does not exist yet. Always visible; never filled in for Sai. */
export function Need({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`sk-need ${className}`}>
      <span className="sk-need__tag">Needed</span> {children}
    </span>
  )
}

/** A fact: verified text plain, draft text marked, pending shown as Needed. */
export function F({ f }: { f: Fact<string> }) {
  if (f.status === 'pending') return <Need>{f.note}</Need>
  return f.status === 'draft' ? <D>{f.value}</D> : <>{f.value}</>
}
