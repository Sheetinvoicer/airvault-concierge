/** @type {import('').Config} */
const Config = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env._PUBLIC_API_URL}/api/:path*` },
      { source: '/ws/:path*',  destination: `${process.env._PUBLIC_API_URL}/ws/:path*` },
      { source: '/graphql',    destination: `${process.env._PUBLIC_API_URL}/graphql` },
    ];
  },
};

export default Config;
