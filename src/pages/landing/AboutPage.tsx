import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Brain, ArrowLeft, GraduationCap, HeartHandshake, Target, ScrollText } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

import asnavandiPic from '@/assets/Asnavandi.png'
import khazaeiPic from '@/assets/Khazaei.png'

const team = [
  {
    name: 'محمدحسین اسناوندی',
    role: 'طراح و توسعه‌دهنده سامانه',
    image: asnavandiPic,
    accent: 'from-blue-600 to-cyan-500',
    chip: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    bio: 'کارشناسی مهندسی کامپیوتر از دانشگاه خوارزمی و دانشجوی کارشناسی ارشد روان‌شناسی بالینی دانشگاه علم و فرهنگ. ترکیب دانش مهندسی و روان‌شناسی بالینی را در طراحی این سامانه به‌کار برده است.',
    education: [
      'کارشناسی مهندسی کامپیوتر — دانشگاه خوارزمی',
      'کارشناسی ارشد روان‌شناسی بالینی — دانشگاه علم و فرهنگ',
    ],
  },
  {
    name: 'دکتر خزائی',
    role: 'مشاور علمی و بالینی',
    image: khazaeiPic,
    accent: 'from-emerald-600 to-teal-500',
    chip: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    bio: 'دکتری روان‌شناسی بالینی از دانشگاه شهید بهشتی و عضو هیئت علمی دانشگاه علم و فرهنگ. نظارت علمی و بالینی بر محتوای مصاحبه‌های SCID-5-CV این سامانه بر عهده ایشان بوده است.',
    education: [
      'دکتری روان‌شناسی بالینی — دانشگاه شهید بهشتی',
      'عضو هیئت علمی — دانشگاه علم و فرهنگ',
    ],
  },
]

const values = [
  {
    icon: Target,
    title: 'دقت تشخیصی',
    desc: 'مبتنی بر پروتکل معتبر SCID-5-CV و معیارهای رسمی DSM-5',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  {
    icon: ScrollText,
    title: 'پشتوانه علمی',
    desc: 'با نظارت هیئت علمی دانشگاه علم و فرهنگ تدوین شده است',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  {
    icon: HeartHandshake,
    title: 'در خدمت درمانگر',
    desc: 'ابزاری برای تسهیل کار روان‌شناسان و روان‌پزشکان',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/50',
  },
]

export function AboutPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'fa'

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-[var(--glass-border)] sticky top-0 bg-[var(--glass-bg)] backdrop-blur-xl z-50 shadow-[var(--glass-shadow)]">
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
            <Button variant="outline" onClick={() => navigate('/')}>
              بازگشت
              <ArrowLeft className={`${isRtl ? 'mr-1.5' : 'ml-1.5'} h-4 w-4`} />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-4">
              <GraduationCap className="h-14 w-14 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">درباره ما</h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] mt-3 font-medium">About Us</p>
          <p className="text-base text-[hsl(var(--muted-foreground))] mt-6 max-w-2xl mx-auto leading-relaxed">
            سامانه هوشمند مصاحبه بالینی SCID-5-CV با ترکیب دانش روان‌شناسی بالینی و فناوری
            مهندسی نرم‌افزار طراحی شده است تا ابزاری دقیق و در دسترس برای انجام مصاحبه‌های
            ساختاریافته بر اساس معیارهای DSM-5 در اختیار درمانگران قرار دهد.
          </p>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">تیم سامانه</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-2 text-base">
              ترکیب دانش فنی و تخصص بالینی در ساخت این پروژه
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${member.accent}`} />
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r opacity-30 blur-md" />
                    <img
                      src={member.image}
                      alt={member.name}
                      className="relative h-32 w-32 rounded-full object-cover border-4 border-[hsl(var(--card))] shadow-lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold mt-4">{member.name}</h3>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mt-2 ${member.chip}`}>
                    {member.role}
                  </span>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mt-4">
                    {member.bio}
                  </p>
                  <ul className="w-full mt-5 space-y-2 text-sm">
                    {member.education.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[var(--glass-bg)] px-3 py-2 text-right"
                      >
                        <GraduationCap className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">ارزش‌های ما</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-2 text-base">
              آنچه در مسیر توسعه این سامانه به آن پایبند بوده‌ایم
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`rounded-xl p-3 ${value.bg} inline-flex mb-4`}>
                    <value.icon className={`h-6 w-6 ${value.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {value.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t border-[var(--glass-border)]">
        <div className="absolute inset-0 bg-[var(--glass-bg)] backdrop-blur-sm" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">با سامانه آشنا شدید؟</h2>
          <p className="text-[hsl(var(--muted-foreground))] text-base mb-8 max-w-xl mx-auto">
            همین حالا شروع کنید و از ابزارهای حرفه‌ای سامانه بهره‌مند شوید
          </p>
          <Button size="lg" onClick={() => navigate('/login')}>
            ثبت‌نام / ورود
            <ArrowLeft className={`${isRtl ? 'mr-2' : 'ml-2'} h-5 w-5`} />
          </Button>
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
