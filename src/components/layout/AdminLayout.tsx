import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, LayoutDashboard, BarChart3, GitCompareArrows, Users, UserCog, Activity, MessageSquare, ArrowLeft, ArrowRight, LogOut, ShieldCheck } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAppDispatch } from '@/hooks/useAppStore'
import { useGetMeQuery } from '@/store/api/authApi'
import { logout } from '@/store/slices/authSlice'
import { Button } from '@/components/ui'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

const ROLE_KEY: Record<string, string> = {
  admin: 'admin.users.role_admin',
  clinician: 'admin.users.role_clinician',
  researcher: 'admin.users.role_researcher',
}

function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { data: me } = useGetMeQuery()
  const isRtl = i18n.language === 'fa'

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.nav.dashboard'), end: true },
    { to: '/admin/interviews', icon: BarChart3, label: t('admin.nav.interviews') },
    { to: '/admin/agreement', icon: GitCompareArrows, label: t('admin.nav.agreement') },
    { to: '/admin/demographics', icon: Users, label: t('admin.nav.demographics') },
    { to: '/admin/users', icon: UserCog, label: t('admin.nav.users') },
    { to: '/admin/activity', icon: Activity, label: t('admin.nav.activity') },
    { to: '/admin/feedback', icon: MessageSquare, label: t('admin.nav.feedback') },
  ]

  return (
    <aside
      data-darkreader-skip
      className={cn(
        'fixed top-0 z-40 flex h-screen w-64 flex-col border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl shadow-[var(--glass-shadow)] transition-transform duration-300 [color-scheme:only_normal]',
        isRtl ? 'right-0 border-l' : 'left-0 border-r',
        'md:translate-x-0',
        open ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')
      )}
    >
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[hsl(var(--primary))]" />
          <div>
            <span className="block text-sm font-bold leading-tight">SCID-5-CV</span>
            <span className="block text-[10px] text-[hsl(var(--muted-foreground))]">
              {t('admin.title')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[hsl(var(--border))] p-4 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-[hsl(var(--muted-foreground))]"
          onClick={() => navigate('/dashboard')}
        >
          {isRtl
            ? <ArrowRight className="rtl:ml-2 ltr:mr-2 h-4 w-4" />
            : <ArrowLeft className="rtl:ml-2 ltr:mr-2 h-4 w-4" />}
          {t('admin.nav.backToApp')}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-[hsl(var(--muted-foreground))]"
          onClick={() => dispatch(logout())}
        >
          <LogOut className="rtl:ml-2 ltr:mr-2 h-4 w-4" />
          {t('nav.logout')}
        </Button>
        {me && (
          <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5">
            {me.profile_image ? (
              <img
                src={me.profile_image}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[hsl(var(--border))]"
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-sm font-bold text-[hsl(var(--accent-foreground))]">
                {(me.first_name || '؟').charAt(0)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {me.first_name} {me.last_name}
              </span>
              <span className="block truncate text-xs text-[hsl(var(--muted-foreground))]">
                {t(ROLE_KEY[me.role] ?? 'admin.users.role_clinician')}
              </span>
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}

export function AdminLayout() {
  const { i18n } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isRtl = i18n.language === 'fa'

  return (
    <div className="flex min-h-screen relative">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
