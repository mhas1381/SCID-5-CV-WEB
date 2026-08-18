/** Cloud backend (Vercel) used automatically for production builds.
 * Vercel rewrites "/api/*" and "/media/*" on this same origin to the backend
 * (see vercel.json), so the backend hostname is never exposed to the browser.
 * Must include the "/api" prefix: endpoint paths start with "/v1/..." so
 * apiUrl() produces /api/v1/... (same-origin, proxied).
 */
const PRODUCTION_API_URL = '/api'

function resolveApiBase(): string {
  const envApiBase = import.meta.env.VITE_API_URL as string | undefined
  if (envApiBase) return envApiBase
  // Local development: same-origin "/api" is proxied by the Vite dev server
  // to the local Django backend (see vite.config.ts).
  if (import.meta.env.DEV) return '/api'
  // Production build: same-origin "/api" is proxied by Vercel to the backend.
  return PRODUCTION_API_URL
}

export const API_BASE_URL = resolveApiBase().replace(/\/+$/, '')

/** Shown in the app footer so users can identify the deployed build. */
export const APP_VERSION = 'v1.2.0'

export function apiUrl(path: string): string {
  // Ensure exactly one slash between the base (e.g. "/api") and the path
  // so "v1/admin/..." and "/v1/admin/..." both work (fixes /apiv1/... 404s).
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}
