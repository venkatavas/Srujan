import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url.ts'

// Everything public may be indexed; the preview-only pages may not (they are also 404 in
// production builds and carry noindex).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/review'] },
    ...(SITE_URL ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}),
  }
}
