import type { NextConfig } from 'next'
import { PUBLIC_BUILD } from './lib/deploy.ts'

// Security headers for every route. The site loads nothing from other origins (fonts are
// self-hosted by next/font; the share image is rendered on the server), so the policy only allows
// its own origin. Scripts and styles must allow 'unsafe-inline': Next.js inlines the page data and
// the boot script, and the CSS is inlined (below); per-request nonces would make the page dynamic.
// The policy is for production only: the development server needs eval for Fast Refresh, and Vercel
// preview deployments (where Sai reviews the site) load Vercel's toolbar and comments from vercel.live.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const strict = PUBLIC_BUILD

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  // Only honoured over HTTPS; harmless on localhost.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  ...(strict
    ? [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: csp },
      ]
    : []),
]

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // The site is one page seen mostly by first-time visitors, and its CSS is small (about 17 KB
  // gzipped): inlining it removes the render-blocking stylesheet requests before first paint.
  experimental: { inlineCss: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
