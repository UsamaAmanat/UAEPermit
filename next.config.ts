import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async redirects() {
    return [
      {
        source: "/country/not-every-website-is-legit-on-google-ads-for-dubai-visa",
        destination: "/blog/not-every-website-is-legit-on-google-for-dubai-visa",
        permanent: true, // ✅ 301
      },
    ];
  },

  images: {
    // 🔑 Important: disable Next image optimization so Firebase URLs are used directly
    unoptimized: true,

    // Keep this so dev doesn’t complain and any future optimization still knows the domain
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
  },
};

export default nextConfig;
