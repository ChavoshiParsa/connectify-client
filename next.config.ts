import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  basePath,
  output: 'standalone',
  experimental: {
    typedEnv: true,
  },
  reactCompiler: true,
  typedRoutes: true,
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: `${basePath || ''}/`,
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
