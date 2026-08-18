import { APP_VERSION } from '../config'

export function AppFooter() {
  return (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        <p>Smart SCID-5-CV &copy; {new Date().getFullYear()} &mdash; سامانه هوشمند مصاحبه بالینی</p>
        <p className="mt-1 text-xs">{APP_VERSION}</p>
      </div>
    </footer>
  )
}
