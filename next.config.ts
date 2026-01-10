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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app.roofr.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'litespeedconstruction.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sundownexteriors.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'safeharborinspections.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pmsilicone.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.billraganroofing.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'colonyroofers.com',
        pathname: '/**',
      },
    ],
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
