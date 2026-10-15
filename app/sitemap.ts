import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url.ts'

// One public page. Without a known site address there is nothing absolute to list.
export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_URL ? [{ url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 }] : []
}
