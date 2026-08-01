const apiBase = import.meta.env.VITE_API_URL as string | undefined

export const API_BASE_URL = (apiBase || '/api').replace(/\/+$/, '')

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
