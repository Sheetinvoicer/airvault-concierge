import { withPayload } from '@payloadcms//withPayload'
import type { Config } from ''
import path from 'path'

const Config: Config = {
  output: 'standalone',

  // 👇 Add this to fix the root detection
  turbopack: {
    root: path.resolve(__dirname),
  },

  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: `${process.env._PUBLIC_API_URL ?? ''}/ws/:path*`,
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

export default withPayload(Config)