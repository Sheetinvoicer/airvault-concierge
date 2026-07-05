import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
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
      // Monaco Editor is browser-only; stub it out on the server to prevent
      // SSR crashes ("window is not defined", worker errors) during build/deploy.
      config.resolve.alias = {
        ...config.resolve.alias,
        'monaco-editor': false,
      }
    }
    return config
  },
}

export default withPayload(nextConfig)
