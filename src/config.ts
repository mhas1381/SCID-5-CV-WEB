const apiBase = import.meta.env.VITE_API_URL as string | undefined

export const API_BASE_URL = (apiBase || '/api').replace(/\/+$/, '')

export function apiUrl(path: string): string {
  // Ensure exactly one slash between the base (e.g. "/api") and the path
  // so "v1/admin/..." and "/v1/admin/..." both work (fixes /apiv1/... 404s).
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}
