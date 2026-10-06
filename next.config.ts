import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
}

export default nextConfig
