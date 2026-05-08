import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.yimg.jp" },
      { protocol: "https", hostname: "**.yahoo.co.jp" },
      { protocol: "https", hostname: "**.jmty.jp" },
      { protocol: "https", hostname: "img.jmty.jp" },
    ],
  },
};

export default nextConfig;
