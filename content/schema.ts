// Every client-facing fact carries its provenance.
// verified — confirmed by the client or a cited public source
// draft    — wording composed from verified facts; needs client sign-off
// pending  — CONTENT REQUIRED; rendered only outside production
import { PUBLIC_BUILD } from '../lib/deploy.ts'

export type Source = { label: string; url?: string; accessed?: string }

export type Fact<T> =
  | { status: 'verified'; value: T; source: Source }
  | { status: 'draft'; value: T; note: string }
  | { status: 'pending'; note: string; requiredForLaunch?: boolean }

export const verified = <T>(value: T, source: Source): Fact<T> => ({ status: 'verified', value, source })
export const draft = <T>(value: T, note: string): Fact<T> => ({ status: 'draft', value, note })
export const pending = <T = string>(note: string, requiredForLaunch = false): Fact<T> => ({
  status: 'pending',
  note,
  requiredForLaunch,
})

const has = <T>(f: Fact<T>): f is Extract<Fact<T>, { value: T }> => f.status !== 'pending'
export const valueOf = <T>(f: Fact<T>): T | undefined => (has(f) ? f.value : undefined)

// Placeholders and the preview-only /review page are visible in development and on
// Vercel preview deployments, never in a public production build, wherever it is hosted.
export const SHOW_PENDING = !PUBLIC_BUILD

export const SRC = {
  client: { label: 'Provided by Sai Srujan Pasala' },
  linkedin: { label: 'LinkedIn experience, provided by the client', accessed: '2026-10-07' },
  cv: { label: 'CV (PDF), provided by the client', accessed: '2026-10-12' },
  // The client's reference images: the site's wording, confirmed by the client as final (2026-10-13).
  reference: { label: 'Client reference images, provided by the client', accessed: '2026-10-12' },
  tracxnFloryn: {
    label: 'Tracxn — Floryn Health Private Limited',
    url: 'https://tracxn.com/d/legal-entities/india/floryn-health-private-limited/__c_-cUH3K8okPUoWQOz93WnVG1G7Hyq0dfcNWcBD6QPI',
    accessed: '2026-10-06',
  },
  playFeedec: {
    label: 'Google Play — Feedec',
    url: 'https://play.google.com/store/apps/details?id=co.feedec.app&hl=en_US',
    accessed: '2026-10-06',
  },
} satisfies Record<string, Source>
