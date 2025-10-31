const isStaticExport = 'false';

const nextConfig = {
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  // Turbopack config (Next.js 16 uses Turbopack by default in dev)
  // Using empty config to silence warnings since we have a webpack config
  turbopack: {},
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
    // Disable React DevTools to prevent _debugInfo errors
    DISABLE_REACT_DEVTOOLS: process.env.NODE_ENV === 'development' ? 'true' : 'false',
  },
  // Enable subdomain routing
  async rewrites() {
    const backend = process.env.INTERNAL_API_URL || 'http://localhost:3001';
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${backend}/api/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  reactStrictMode: false,
  // Critical: Disable hydration warnings in development for CSS-in-JS
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    // Optimize hydration
    optimizeCss: true,
    // React 19 compatibility
    forceSwcTransforms: true,
    // Disable problematic development features that cause _debugInfo errors
    // Note: In Next.js 16, turbo flag is deprecated
    // Turbopack is only enabled when running with --turbo flag
    serverSourceMaps: false,
  },
  // Do not fail production builds because of ESLint/TypeScript errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  webpack(config, { dev, isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Handle _debugInfo errors in development
    if (dev && !isServer) {
      // Disable React DevTools to prevent _debugInfo conflicts
      const definePlugin = config.plugins.find(
        plugin => plugin.constructor.name === 'DefinePlugin'
      );
      
      if (definePlugin) {
        definePlugin.definitions = {
          ...definePlugin.definitions,
          '__REACT_DEVTOOLS_GLOBAL_HOOK__': JSON.stringify(undefined),
        };
      }
    }

    return config;
  },
  ...(isStaticExport === 'true' && {
    output: 'export',
  }),
};

export default nextConfig;
