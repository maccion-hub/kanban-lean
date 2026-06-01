import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@kanban/ui'],
  output: 'standalone',
};

export default nextConfig;
