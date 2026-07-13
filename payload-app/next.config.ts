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

    // Split heavy, non-critical vendor libraries into separate async chunks so
    // the login/signup LCP is not blocked by code that is only needed post-login.
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...(config.optimization?.splitChunks?.cacheGroups ?? {}),
            // Keep Stripe, PDF, Kafka, Redis, and WS in their own deferred chunks
            // so the critical login path is not blocked by their initialisation code.
            heavyVendors: {
              test: /[\\/]node_modules[\\/](stripe|pdf-lib|kafkajs|ioredis|ws)[\\/]/,
              name: 'heavy-vendors',
              chunks: 'async',
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }

    return config
  },
}

export default withPayload(nextConfig)
