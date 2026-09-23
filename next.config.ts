import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Product photos are uploaded through server actions. They are resized in the browser first,
    // so this only needs headroom; Vercel caps request bodies at 4.5MB anyway.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
