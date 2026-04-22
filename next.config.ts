import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 1. Libera a trava de 1MB das Server Actions
    serverActions: {
      bodySizeLimit: '45mb', 
    },
    // 2. Libera a trava de 10MB do Proxy/Turbopack do servidor
    proxyClientMaxBodySize: '45mb',
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, 
    ],
  },
};

export default nextConfig;