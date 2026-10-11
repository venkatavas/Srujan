import { brief } from '@/content/brief.ts'

/** The brief, set in fixed lines (the three-line set by default), with an optional resting caret. */
export function BriefSentence({ caret = false, lines = brief.lines }: { caret?: boolean; lines?: readonly string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i}>
          {l}
          {i < lines.length - 1 && (
            <>
              {' '}
              <br />
            </>
          )}
        </span>
      ))}
      {caret && <span className="caret" aria-hidden="true" />}
    </>
  )
}
