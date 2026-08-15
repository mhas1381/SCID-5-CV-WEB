import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Button } from './Button'
import { apiUrl } from '@/config'
import { selectDataSource } from '@/store/slices/dataSourceSlice'
import { useAppSelector } from '@/hooks/useAppStore'

interface ExportButtonProps {
  /** Relative API path, e.g. "v1/admin/export/interviews/" (query params included). */
  url: string
  /** Suggested download filename, e.g. "admin-interviews.csv". */
  filename: string
  className?: string
}

/**
 * Downloads the admin analytics CSV export (Excel-friendly, UTF-8 BOM).
 *
 * A plain <a href> would skip the Authorization header, so we fetch the CSV
 * with the token, then trigger a blob download. The global data-source
 * selection ("real" | "test" | "all") is merged into the URL so exports match
 * the filters shown on the page.
 */
export function ExportButton({ url, filename, className }: ExportButtonProps) {
  const { t } = useTranslation()
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const testData = useAppSelector(selectDataSource)
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }
      const separator = url.includes('?') ? '&' : '?'
      const exportUrl = `${url}${separator}test_data=${encodeURIComponent(testData)}`
      const response = await fetch(apiUrl(exportUrl), { headers })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)

      toast.success(t('admin.export.success'))
    } catch {
      toast.error(t('admin.export.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className={className}
      title={t('admin.export.label')}
    >
      <Download className="h-4 w-4" />
      {loading ? t('admin.export.loading') : t('admin.export.label')}
    </Button>
  )
}
