import { SHOW_PENDING, type Fact } from '@/content/schema.ts'

/** CONTENT REQUIRED marker — visible locally and on previews, never in production. */
export function Pending({ note, className }: { note: string; className?: string }) {
  if (!SHOW_PENDING) return null
  return (
    <span className={`pending ${className ?? ''}`} title={note}>
      <span className="pending__tag">Content required</span> {note}
    </span>
  )
}

/** Renders a fact's value, or its pending marker. */
export function FactText<T extends React.ReactNode>({ fact, className }: { fact: Fact<T>; className?: string }) {
  if (fact.status === 'pending') return <Pending note={fact.note} className={className} />
  return <span className={className}>{fact.value}</span>
}
