/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` },
      { source: '/ws/:path*',  destination: `${process.env.NEXT_PUBLIC_API_URL}/ws/:path*` },
      { source: '/graphql',    destination: `${process.env.NEXT_PUBLIC_API_URL}/graphql` },
    ];
  },
};

export default nextConfig;
