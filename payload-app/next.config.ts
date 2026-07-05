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
}

export default withPayload(nextConfig)
