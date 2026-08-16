import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Brain, ClipboardList, ShieldCheck, BarChart3, Users, Languages, Lock, 
  ArrowLeft, ChevronLeft, GraduationCap, User, Sparkles, Download, MessageSquare, Gauge, LayoutDashboard, GitCompareArrows } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useAppSelector } from '@/hooks/useAppStore'

const stats = [
  { value: '۴۱', label: 'اختلال DSM-5' },
  { value: '۱۰', label: 'ماژول تشخیصی' },
  { value: '۳۳۹', label: 'سؤال بالینی' },
  { value: '۲۹۰+', label: 'قانون انشعاب هوشمند' },
]

const features = [
  {
    icon: ClipboardList,
    title: 'مصاحبه بالینی ساختاریافته',
    desc: 'پیاده‌سازی کامل SCID-5-CV برای تشخیص اختلالات محور I بر اساس DSM-5 با پرسش‌های گام‌به‌گام و پیشرفت هوشمند مصاحبه',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/50',
  },
  {
    icon: Users,
    title: 'مدیریت بیماران',
    desc: 'ثبت، ویرایش و پیگیری اطلاعات بیماران با کد یکتا، تاریخچه جلسات و یادداشت‌های بالینی',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/50',
  },
  {
    icon: BarChart3,
    title: 'نتایج تشخیصی لحظه‌ای',
    desc: 'محاسبه خودکار الگوریتم‌های تشخیصی و نمایش شدت اختلال، معیارهای met، سازگاری با تشخیص از پیش موجود و گزارش تفصیلی',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/50',
  },
  {
    icon: Sparkles,
    title: 'تفسیر هوشمند با هوش مصنوعی',
    desc: 'تولید خودکار تفسیر جامع و روایی از نتایج مصاحبه، قابل ویرایش و ذخیره‌سازی برای هر جلسه',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/50',
  },
  {
    icon: Download,
    title: 'گزارش و خروجی PDF',
    desc: 'دریافت گزارش کامل مصاحبه همراه با تفسیر هوشمند در قالب PDF و برنامه‌نویسی برای هر بیمار',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/50',
  },
  {
    icon: Gauge,
    title: 'پیشرفت و هدایت مصاحبه',
    desc: 'نمایش زنده موقعیت شما در مصاحبه، پرش هوشمند بین ماژول‌ها و هدایت پرسش بر اساس پاسخ‌های قبلی',
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/50',
  },
  {
    icon: MessageSquare,
    title: 'بازخورد و پشتیبانی',
    desc: 'ارسال بازخورد، پیشنهاد یا گزارش مشکل به‌همراه نتایج جلسه؛ مدیریت و بررسی دقیق توسط پنل اداری برای بهبود سامانه',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/50',
  },
  {
    icon: GitCompareArrows,
    title: 'سازگاری با تشخیص قبلی',
    desc: 'ثبت تشخیص‌های از پیش موجود توسط درمانگر و محاسبه خودکار درصد توافق (Agreement) با نتایج سامانه برای اعتبارسنجی بالینی',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-900/50',
  },
  {
    icon: ShieldCheck,
    title: 'احراز صلاحیت حرفه‌ای',
    desc: 'تأیید پروانه نظام روانشناسی و نظام پزشکی با اتصال مستقیم به سامانه‌های PCO و IRIMC',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-900/50',
  },
  {
    icon: Languages,
    title: 'رابط دوزبانه',
    desc: 'پشتیبانی کامل از زبان‌های فارسی و انگلیسی با قابلیت تغییر در لحظه و راست‌چین خودکار',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/50',
  },
  {
    icon: LayoutDashboard,
    title: 'پنل مدیریتی جامع',
    desc: 'داشبورد اداری با مرور مصاحبه‌های کاربران، بازخوردها، تحلیل جمعیت‌شناختی و فعالیت سامانه',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/50',
  },
  {
    icon: Lock,
    title: 'امن و محرمانه',
    desc: 'رمزنگاری اطلاعات حساس بیماران (کد ملی، تلفن، آدرس) در دیتابیس با AES-256، احراز هویت با JWT و رعایت استانداردهای حریم خصوصی',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800/60',
  },
]

const steps = [
  {
    number: '۱',
    title: 'ثبت‌نام و احراز هویت',
    desc: 'با شماره تماس یا گوگل ثبت‌نام کنید و هویت حرفه‌ای خود را تأیید نمایید',
    icon: GraduationCap,
  },
  {
    number: '۲',
    title: 'ثبت بیمار جدید',
    desc: 'اطلاعات دموگرافیک بیمار را وارد کنید، ماژول‌های لازم را انتخاب و پرونده بالینی تشکیل دهید',
    icon: Users,
  },
  {
    number: '۳',
    title: 'انجام مصاحبه',
    desc: 'مصاحبه ساختاریافته را گام‌به‌گام با هدایت هوشمند سامانه و ردیابی پیشرفت انجام دهید',
    icon: Brain,
  },
  {
    number: '۴',
    title: 'بررسی نتایج و گزارش',
    desc: 'نتایج تشخیصی، تفسیر هوشمند و گزارش PDF را دریافت و در صورت تمایل بازخورد خود را ثبت کنید',
    icon: Sparkles,
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const isRtl = i18n.language === 'fa'

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-[var(--glass-border)] sticky top-0 bg-[var(--glass-bg)] backdrop-blur-xl z-50 shadow-[var(--glass-shadow)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2.5 text-start">
            <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-1.5">
              <Brain className="h-6 w-6 text-[hsl(var(--primary))]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold">SCID-5-CV</span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] hidden sm:block">Smart Clinical Interview</span>
            </div>
          </button>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/structured-interview')} className="hidden md:inline-flex">
              راهنمای سامانه
            </Button>
            <Button variant="ghost" onClick={() => navigate('/about')} className="hidden md:inline-flex">
              درباره ما
            </Button>
            <div className="hidden md:block h-5 w-px bg-[hsl(var(--border))] mx-0.5" />
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} className="px-3 sm:px-4">
                <User className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} h-4 w-4`} />
                {user?.first_name || user?.phone_number || 'پروفایل'}
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')} className="px-3 sm:px-4">
                شروع کنید
                <ArrowLeft className={`${isRtl ? 'mr-1.5' : 'ml-1.5'} h-4 w-4`} />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="relative w-full aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/7]">
          <img
            src="/hero-illustration.webp"
            alt="سامانه هوشمند مصاحبه بالینی SCID-5-CV"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />
          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="rounded-2xl bg-white/10 p-3 sm:p-4 backdrop-blur-md ring-1 ring-white/20">
                  <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow">
                سامانه هوشمند مصاحبه بالینی
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mt-2 sm:mt-3 font-medium">
                Smart Clinical Interview System
              </p>
              <p className="hidden sm:block text-base text-white/85 mt-4 sm:mt-6 max-w-2xl mx-auto leading-relaxed drop-shadow">
                سامانه SCID-5-CV یک ابزار دیجیتال برای انجام مصاحبه‌های بالینی ساختاریافته
                بر اساس معیارهای DSM-5 است. این سیستم به روانشناسان و روانپزشکان کمک می‌کند
                تا فرآیند تشخیص را با دقت و سرعت بیشتری انجام دهند.
              </p>
              <p className="sm:hidden text-sm text-white/85 mt-3 max-w-xs mx-auto leading-relaxed drop-shadow">
                ابزار دیجیتال مصاحبه بالینی ساختاریافته بر اساس معیارهای DSM-5
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-10">
                <Button size="lg" className="liquid-glass-on-image w-full sm:w-auto" onClick={() => navigate('/login')}>
                  شروع کنید
                  <ArrowLeft className={`${isRtl ? 'mr-2' : 'ml-2'} h-5 w-5`} />
                </Button>
                <Button variant="outline" size="lg" className="liquid-glass-on-image w-full sm:w-auto" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  اطلاعات بیشتر
                  <ChevronLeft className={`${isRtl ? 'mr-2' : 'ml-2'} h-4 w-4`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-violet-200/80 bg-white/70 px-4 py-6 text-center shadow-[inset_0_1px_0_hsl(0_0%_100%/0.8),0_4px_16px_hsl(262_45%_55%/0.08)] dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)] dark:backdrop-blur-sm transition-shadow hover:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.9),0_6px_20px_hsl(262_45%_55%/0.14)]"
              >
                <div className="text-3xl md:text-4xl font-bold text-[hsl(var(--primary))]">{stat.value}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">ویژگی‌های سامانه</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-2 text-base">
              ابزارهای حرفه‌ای برای تشخیص بالینی دقیق
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`rounded-xl p-3 ${feature.bg} inline-flex mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">چطور کار می‌کند</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-2 text-base">
              در چهار گام ساده، مصاحبه بالینی خود را انجام دهید
            </p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-8 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px border-t-2 border-dashed border-[hsl(var(--border))]" />
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full bg-[var(--glass-bg)] backdrop-blur-md mb-4 shadow-[var(--glass-shadow)]">
                  <div className="absolute inset-0 rounded-full bg-[hsl(var(--primary))]/10" />
                  <step.icon className="h-7 w-7 text-[hsl(var(--primary))]" />
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 md:static md:translate-x-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold mt-4">{step.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--glass-bg)] backdrop-blur-sm" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            آماده شروع هستید؟
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-base mb-8 max-w-xl mx-auto">
            همین حالا ثبت‌نام کنید و از ابزارهای حرفه‌ای سامانه برای تشخیص دقیق‌تر بهره‌مند شوید
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/login')}>
              ثبت‌نام / ورود
              <ArrowLeft className={`${isRtl ? 'mr-2' : 'ml-2'} h-5 w-5`} />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/login')}>
              شروع رایگان
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>Smart SCID-5-CV &copy; {new Date().getFullYear()} &mdash; سامانه هوشمند مصاحبه بالینی</p>
        </div>
      </footer>
    </div>
  )
}
