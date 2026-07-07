import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Users,
  History,
  FileText,
  LogOut,
  Brain,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { useAppDispatch } from '@/hooks/useAppStore'
import { LanguageSwitcher } from './LanguageSwitcher'
import { logout } from '@/store/slices/authSlice'

export function Sidebar() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/patients', icon: Users, label: t('nav.patients') },
    { to: '/interview', icon: Brain, label: t('nav.interviews') },
    { to: '/sessions', icon: History, label: t('nav.sessions') },
    { to: '/reports', icon: FileText, label: t('nav.reports') },
  ]

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-screen w-64 flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-[hsl(var(--primary))]" />
          <span className="text-lg font-bold">SCID-5-CV</span>
        </div>
        <LanguageSwitcher />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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

      <div className="border-t border-[hsl(var(--border))] p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-[hsl(var(--muted-foreground))]"
          onClick={() => dispatch(logout())}
        >
          <LogOut className="ml-2 h-4 w-4" />
          {t('nav.logout')}
        </Button>
      </div>
    </aside>
  )
}