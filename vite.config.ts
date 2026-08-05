import { defineConfig, type Plugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/** Cloud backend (Vercel) used automatically for production builds.
 * Must include the "/api" prefix so the app calls /api/v1/... (kept in
 * sync with src/config.ts). Only the origin is used for the CSP.
 */
const PRODUCTION_API_URL = 'https://smart-scid-5-cv.vercel.app/api'

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
    plugins: [react(), tailwindcss(), securityHeadersPlugin(apiBase)],
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