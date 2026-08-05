/** Cloud backend (Vercel) used automatically for production builds.
 * Must include the "/api" prefix: endpoint paths start with "/v1/..." so
 * apiUrl() produces https://smart-scid-5-cv.vercel.app/api/v1/...
 */
const PRODUCTION_API_URL = 'https://smart-scid-5-cv.vercel.app/api'

function resolveApiBase(): string {
  const envApiBase = import.meta.env.VITE_API_URL as string | undefined
  if (envApiBase) return envApiBase
  // Local development: same-origin "/api" is proxied by the Vite dev server
  // to the local Django backend (see vite.config.ts).
  if (import.meta.env.DEV) return '/api'
  // Production build: talk to the deployed cloud backend.
  return PRODUCTION_API_URL
}

export const API_BASE_URL = resolveApiBase().replace(/\/+$/, '')

export function apiUrl(path: string): string {
  // Ensure exactly one slash between the base (e.g. "/api") and the path
  // so "v1/admin/..." and "/v1/admin/..." both work (fixes /apiv1/... 404s).
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}
