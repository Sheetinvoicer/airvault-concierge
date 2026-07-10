import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',

  async headers() {
    return [
      {
        // Static auth screens — safe to cache at the CDN/browser for 1 hour.
        // must-revalidate ensures stale copies are not served after expiry.
        source: '/(login|signup)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ]
  },

  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? ''}/ws/:path*`,
      },
    ]
  },

  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'monaco-editor': false,
      }
    }
    return config
  },
}

export default withPayload(nextConfig)
