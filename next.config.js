/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Build ke dauran ESLint ignore karega
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://88.99.241.139:5000/api/:path*", // ✅ apna backend URL
      },
    ];
  },
};

module.exports = nextConfig;
