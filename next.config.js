/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // اجازه دسترسی به پوشه uploads
  async redirects() {
    return [];
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: '/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
