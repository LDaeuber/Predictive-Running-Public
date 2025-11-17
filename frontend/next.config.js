/** @type {import('next').NextConfig} */

module.exports = {
  devIndicators: false,

  reactStrictMode: false,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: (process.env.BACKEND_URL ?? 'http://localhost:8000') + '/:path*',
      },
    ];
  },
};