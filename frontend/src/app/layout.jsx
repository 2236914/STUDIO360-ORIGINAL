import 'src/global.css';

import 'src/utils/debug-info-fix';

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { ThemeProvider } from 'src/theme/theme-provider';
import { getInitColorSchemeScript } from 'src/theme/color-scheme-script';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import { React19Compatibility } from 'src/components/react19-compat';
import { defaultSettings, SettingsProvider } from 'src/components/settings';

import { CheckoutProvider } from 'src/sections/checkout/context';

import { AuthProvider } from 'src/auth/context/jwt';
import { Snackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'),
  title: {
    default: 'STUDIO360 - AI-Powered Bookkeeping',
    template: '%s | STUDIO360',
  },
  description: 'Professional bookkeeping system with AI automation',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'STUDIO360',
    title: 'STUDIO360 - AI-Powered Bookkeeping',
    description: 'Professional bookkeeping system with AI automation',
    url: '/',
    images: [
      { url: '/og-default.jpg', width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {getInitColorSchemeScript}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Apply _debugInfo fix immediately - must run before any React/Next code
              (function() {
                if (typeof window === 'undefined') return;
                if (window.__debugInfoFixed) return;
                
                const originalDefineProperty = Object.defineProperty;
                Object.defineProperty = function(obj, prop, descriptor) {
                  if (prop === '_debugInfo') {
                    const existing = Object.getOwnPropertyDescriptor(obj, prop);
                    if (existing && !existing.configurable) return obj;
                    if (existing && existing.configurable) delete obj[prop];
                    
                    try {
                      return originalDefineProperty(obj, prop, {...descriptor, configurable: true});
                    } catch(e) {
                      return obj;
                    }
                  }
                  return originalDefineProperty(obj, prop, descriptor);
                };
                window.__debugInfoFixed = true;
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <React19Compatibility />
        <AuthProvider>
          <SettingsProvider
            settings={settings}
            caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
          >
            <ThemeProvider>
              <MotionLazy>
                <ProgressBar />
                <Snackbar />
                <CheckoutProvider>
                  {children}
                </CheckoutProvider>
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
