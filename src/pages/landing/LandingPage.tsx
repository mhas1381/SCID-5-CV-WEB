import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Brain, ClipboardList, ShieldCheck, BarChart3, Users, Languages, Lock, ArrowLeft, ChevronLeft, GraduationCap } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

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
    desc: 'پیاده‌سازی کامل SCID-5-CV برای تشخیص اختلالات محور I بر اساس DSM-5 با پرسش‌های گام‌به‌گام',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
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
    desc: 'محاسبه خودکار الگوریتم‌های تشخیصی و نمایش شدت اختلال، معیارهای met و گزارش تفصیلی',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/50',
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
    icon: Lock,
    title: 'امن و محرمانه',
    desc: 'رمزنگاری اطلاعات حساس بیماران (کد ملی، تلفن، آدرس) در دیتابیس با AES-256، احراز هویت با JWT و رعایت استانداردهای حریم خصوصی',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/50',
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
    desc: 'اطلاعات دموگرافیک بیمار را وارد کنید و پرونده بالینی تشکیل دهید',
    icon: Users,
  },
  {
    number: '۳',
    title: 'انجام مصاحبه',
    desc: 'مصاحبه ساختاریافته را گام‌به‌گام با راهنمایی سامانه انجام دهید',
    icon: Brain,
  },
  {
    number: '۴',
    title: 'مشاهده نتایج',
    desc: 'نتایج تشخیصی را به‌صورت لحظه‌ای با جزئیات کامل دریافت کنید',
    icon: BarChart3,
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'fa'

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--background))/80] backdrop-blur-md z-50 shadow-[0_1px_3px_0_hsl(var(--border)/0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-1.5">
              <Brain className="h-6 w-6 text-[hsl(var(--primary))]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold">SCID-5-CV</span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] hidden sm:block">Smart Clinical Interview</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="h-5 w-px bg-[hsl(var(--border))] mx-0.5" />
            <Button onClick={() => navigate('/login')}>
              شروع کنید
              <ArrowLeft className={`${isRtl ? 'mr-1.5' : 'ml-1.5'} h-4 w-4`} />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-4">
                <Brain className="h-16 w-16 text-[hsl(var(--primary))]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              سامانه هوشمند مصاحبه بالینی
            </h1>
            <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] mt-3 font-medium">
              Smart Clinical Interview System
            </p>
            <p className="text-base text-[hsl(var(--muted-foreground))] mt-6 max-w-2xl mx-auto leading-relaxed">
              سامانه SCID-5-CV یک ابزار دیجیتال برای انجام مصاحبه‌های بالینی ساختاریافته
              بر اساس معیارهای DSM-5 است. این سیستم به روانشناسان و روانپزشکان کمک می‌کند
              تا فرآیند تشخیص را با دقت و سرعت بیشتری انجام دهند.
            </p>
            <div className="flex items-center justify-center gap-4 mt-10">
              <Button size="lg" onClick={() => navigate('/login')}>
                شروع کنید
                <ArrowLeft className={`${isRtl ? 'mr-2' : 'ml-2'} h-5 w-5`} />
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                اطلاعات بیشتر
                <ChevronLeft className={`${isRtl ? 'mr-2' : 'ml-2'} h-4 w-4`} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
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
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">چطور کار می‌کند</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-2 text-base">
              در چهار گام ساده، مصاحبه بالینی خود را انجام دهید
            </p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-8 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px border-t-2 border-dashed border-[hsl(var(--border))]" />
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full bg-[hsl(var(--card))] mb-4 shadow-sm">
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
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--primary))]/10" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            آماده شروع هستید؟
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-base mb-8 max-w-xl mx-auto">
            همین حالا ثبت‌نام کنید و از ابزارهای حرفه‌ای سامانه برای تشخیص دقیق‌تر بهره‌مند شوید
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')}>
              ثبت‌نام / ورود
              <ArrowLeft className={`${isRtl ? 'mr-2' : 'ml-2'} h-5 w-5`} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
              شروع رایگان
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[hsl(var(--border))] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>Smart SCID-5-CV &copy; {new Date().getFullYear()} &mdash; سامانه هوشمند مصاحبه بالینی</p>
        </div>
      </footer>
    </div>
  )
}
