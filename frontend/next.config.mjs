const isStaticExport = 'false';

const nextConfig = {
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
    // Disable React DevTools to prevent _debugInfo errors
    DISABLE_REACT_DEVTOOLS: process.env.NODE_ENV === 'development' ? 'true' : 'false',
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
    // Improve hydration stability
    serverComponentsHmrCache: false,
    // Disable problematic development features that cause _debugInfo errors
    turbo: false,
    // Disable server components debugging features that cause conflicts
    serverSourceMaps: false,
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
