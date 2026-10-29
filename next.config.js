/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const nextConfig = {
  reactStrictMode: true,
  // Allow both image qualities used by the app.
  images: { qualities: [75, 100] },
  // Trace the optional bundled dataset read through fs by lib/data/providers.ts.
  outputFileTracingIncludes: { '/**': ['./data/**'] },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

module.exports = nextConfig
