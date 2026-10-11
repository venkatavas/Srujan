import { verified } from './schema.ts'

// The brief is Sai's own problem statement — confirmed by the client on 2026-10-06.
// Every value in the specification below is a verbatim fragment of it: nothing is added.
export const brief = {
  text: verified('Reduce onboarding time for enterprise clients without adding headcount.', {
    label: 'Provided by Sai Srujan Pasala',
    accessed: '2026-10-06',
  }),
  // Set in the same three lines wherever it appears.
  lines: ['Reduce onboarding time for', 'enterprise clients', 'without adding headcount.'],
  // The hero sets it in two centred lines (the client's reference image).
  heroLines: ['Reduce onboarding time for enterprise clients', 'without adding headcount.'],
}

export type SpecKey = 'actor' | 'need' | 'constraint' | 'measure'

export const spec: { key: SpecKey; label: string; value: string }[] = [
  { key: 'actor', label: 'Actor', value: 'enterprise clients' },
  { key: 'need', label: 'Need', value: 'Reduce onboarding time' },
  { key: 'constraint', label: 'Constraint', value: 'without adding headcount' },
  { key: 'measure', label: 'Measure', value: 'onboarding time' },
]
