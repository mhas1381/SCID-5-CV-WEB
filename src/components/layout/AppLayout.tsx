import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'
import { cn } from '@/utils/cn'

export function AppLayout() {
  const { i18n } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isRtl = i18n.language === 'fa'

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={cn(
        'flex-1 p-4 md:p-8 transition-all duration-300',
        isRtl ? 'md:mr-64' : 'md:ml-64'
      )}>
        <button
          className="mb-4 md:hidden rounded-lg p-2 hover:bg-[hsl(var(--accent))]"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <Outlet />
      </main>
    </div>
  )
}