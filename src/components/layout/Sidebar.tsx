import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Users,
  History,
  LogOut,
  Brain,
  User,
  Settings,
} from 'lucide-react'
import { Button, VerifiedBadge } from '@/components/ui'
import { useAppDispatch } from '@/hooks/useAppStore'
import { useGetMeQuery } from '@/store/api/authApi'
import { useGetProfileQuery } from '@/store/api/profileApi'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { logout } from '@/store/slices/authSlice'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const { data: me } = useGetMeQuery()
  const { data: profile } = useGetProfileQuery()
  const isRtl = i18n.language === 'fa'

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/patients', icon: Users, label: t('nav.patients') },
    { to: '/interview', icon: Brain, label: t('nav.interviews') },
    { to: '/sessions', icon: History, label: t('nav.sessions') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  const profileImage = me?.profile_image
  const [cacheBuster] = useState(Date.now())
  const profileImageSrc = useMemo(() => {
    return profileImage ? `${profileImage}?t=${cacheBuster}` : null
  }, [profileImage, cacheBuster])

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
          <Brain className="h-6 w-6 text-[hsl(var(--primary))]" />
          <span className="text-lg font-bold">SCID-5-CV</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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
        <NavLink
          to="/profile"
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
          {profileImageSrc ? (
            <img src={profileImageSrc} alt="" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="flex-1">{t('nav.profile')}</span>
          {profile?.verification_status === 'verified' && (
            <VerifiedBadge status="verified" />
          )}
        </NavLink>
        <Button
          variant="ghost"
          className="w-full justify-start text-[hsl(var(--muted-foreground))]"
          onClick={() => dispatch(logout())}
        >
          <LogOut className="rtl:ml-2 ltr:mr-2 h-4 w-4" />
          {t('nav.logout')}
        </Button>
      </div>
    </aside>
  )
}