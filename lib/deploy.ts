// Where this build is going, decided once for every check that depends on it: the content gate
// (scripts/check-content.ts), the preview-only placeholders and pages (content/schema.ts) and the
// strict security policy (next.config.ts).
const preview = process.env.VERCEL_ENV === 'preview'

/** A production build the public can reach: any production build except a Vercel preview (where
 *  Sai reviews the site, with placeholders shown and Vercel's toolbar allowed). */
export const PUBLIC_BUILD = process.env.NODE_ENV === 'production' && !preview

/** Whether the prebuild gate blocks a build that still has unapproved drafts or missing
 *  launch-required content: on Vercel production deployments, and on any build run with
 *  CONTENT_GATE=1 (for a release built elsewhere). A plain local `npm run build` only reports. */
export const GATE_CONTENT = process.env.VERCEL_ENV === 'production' || process.env.CONTENT_GATE === '1'
