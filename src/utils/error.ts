export function getErrorMessage(err: any, fallback: string): string {
  const data = err?.data
  if (!data) return fallback

  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (data.non_field_errors?.length) return String(data.non_field_errors[0])
  if (data.error) return data.error

  for (const key of Object.keys(data)) {
    const value = data[key]
    if (Array.isArray(value) && value.length > 0) return String(value[0])
    if (typeof value === 'string') return value
  }

  return fallback
}
