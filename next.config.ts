import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipMiddlewareUrlNormalize: true,
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://88.99.241.139:5000/api/:path*", // HTTP backend
      },
    ];
  },
};

export default nextConfig;
