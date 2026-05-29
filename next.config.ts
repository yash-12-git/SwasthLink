import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    emotion: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
