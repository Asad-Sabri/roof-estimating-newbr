/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://88.99.241.139:5000/api/:path*", // HTTP backend
      },
    ];
  },
};

module.exports = nextConfig;
