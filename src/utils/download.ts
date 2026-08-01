export async function downloadSessionPdf(
  sessionId: number,
  fallbackName?: string,
): Promise<void> {
  const token = localStorage.getItem('access_token')
  const resp = await fetch(`/api/v1/interviews/sessions/${sessionId}/pdf/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!resp.ok) {
    const body = await resp.json().catch(() => null)
    throw new Error(body?.detail || `Failed to download PDF (${resp.status})`)
  }

  const blob = await resp.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url

  const disposition = resp.headers.get('Content-Disposition')
  const filenameMatch = disposition?.match(/filename="?([^";]+)"?/)
  anchor.download =
    filenameMatch?.[1] || fallbackName || `SCID5_Report_${sessionId}.pdf`

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
