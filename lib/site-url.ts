// The site's public address, used wherever an absolute URL is required: the share image,
// the canonical link, robots.txt, the sitemap and the structured data.
// Set NEXT_PUBLIC_SITE_URL for production (e.g. https://example.com). On Vercel, the project's
// production domain is used when it is not set. Without either, or if the value is not a valid
// http(s) address, absolute-URL features are left out rather than pointing at a wrong host (and a
// typo in the setting can never break the build or a page).
function normalise(value: string | undefined): string | undefined {
  const v = value?.trim()
  if (!v) return undefined
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(v) ? v : `https://${v}`)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    return url.origin + url.pathname.replace(/\/+$/, '')
  } catch {
    return undefined
  }
}

export const SITE_URL: string | undefined =
  normalise(process.env.NEXT_PUBLIC_SITE_URL) ?? normalise(process.env.VERCEL_PROJECT_PRODUCTION_URL)
