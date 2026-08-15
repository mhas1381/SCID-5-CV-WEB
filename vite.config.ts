import { defineConfig, type Plugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

/** Cloud backend (Vercel) used automatically for production builds.
 * Vercel rewrites "/api/*" on this same origin to the backend
 * (see vercel.json), so requests stay same-origin and the CSP only needs
 * "self". Kept in sync with src/config.ts.
 */
const PRODUCTION_API_URL = '/api'

/** Base Content-Security-Policy injected into the built HTML. */
function securityHeadersPlugin(apiBase?: string): Plugin {
  return {
    name: 'inject-security-meta',
    apply: 'build',
    transformIndexHtml(html) {
      let apiOrigin = ''
      try {
        apiOrigin = apiBase ? new URL(apiBase).origin : ''
      } catch {
        apiOrigin = ''
      }
      const connectSrc = ["'self'", 'https://accounts.google.com', apiOrigin]
        .filter(Boolean)
        .join(' ')
      const csp = [
        "default-src 'self'",
        "script-src 'self' https://accounts.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://lh3.googleusercontent.com",
        `connect-src ${connectSrc}`,
        'frame-src https://accounts.google.com',
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join('; ')
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: csp,
            },
            injectTo: 'head-prepend',
          },
        ],
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Same resolution as src/config.ts: explicit env var wins, otherwise
  // production builds fall back to the cloud backend (so the CSP
  // connect-src allows cross-origin API calls without extra setup).
  const apiBase =
    (env.VITE_API_URL as string | undefined) ||
    (mode === 'production' ? PRODUCTION_API_URL : '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      securityHeadersPlugin(apiBase),
      VitePWA({
        registerType: 'autoUpdate',
        // External registerSW.js (same-origin) so the injected script stays
        // allowed by the strict `script-src 'self'` CSP in index.html.
        injectRegister: 'script',
        includeAssets: [
          'favicon.svg',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'apple-touch-icon.png',
        ],
        manifest: {
          name: 'SCID-5-CV',
          short_name: 'SCID-5',
          id: '/',
          description: 'مصاحبه ساختاریافته SCID-5-CV',
          lang: 'fa',
          dir: 'rtl',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#4f14e8',
          background_color: '#ffffff',
          icons: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallback: '/index.html',
          // Never cache API/media responses (clinical data) in the SW.
          navigateFallbackDenylist: [/^\/api\//, /^\/media\//],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/media': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: true,
          manualChunks(id: string) {
            if (id.includes('node_modules/lucide-react')) return 'ui'
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor'
            if (id.includes('node_modules/react-router')) return 'vendor'
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) return 'i18n'
            if (id.includes('node_modules/zod') || id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) return 'forms'
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'anim'
            if (id.includes('node_modules/sonner')) return 'ui'
            if (id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/redux') || id.includes('node_modules/reselect')) return 'redux'
          },
        },
      },
      chunkSizeWarningLimit: 400,
    },
  }
})