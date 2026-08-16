import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Brain, ArrowLeft, GraduationCap, HeartHandshake, Target, ScrollText, Stethoscope, Briefcase, type LucideIcon } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

import asnavandiPic from '@/assets/Asnavandi.png'
import khazaeiPic from '@/assets/Khazaei.png'
import khuLogo from '@/assets/khu-logo.png'
import uscLogo from '@/assets/usc-logo.png'
import sbuLogo from '@/assets/sbu-logo.svg'

const team = [
  {
    name: 'محمدحسین اسناوندی',
    role: 'طراح و توسعه‌دهنده سامانه',
    image: asnavandiPic,
    accent: 'from-blue-600 to-cyan-500',
    chip: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    bio: 'کارشناسی مهندسی کامپیوتر از دانشگاه خوارزمی و دانشجوی کارشناسی ارشد روان‌شناسی بالینی دانشگاه علم و فرهنگ. ترکیب دانش مهندسی و روان‌شناسی بالینی را در طراحی این سامانه به‌کار برده است.',
    education: [
      { label: 'کارشناسی مهندسی کامپیوتر', university: 'دانشگاه خوارزمی', logo: khuLogo },
      { label: 'کارشناسی ارشد روان‌شناسی بالینی', university: 'دانشگاه علم و فرهنگ', logo: uscLogo },
    ],
    details: [
      {
        id: 'education',
        title: 'تحصیلات',
        icon: GraduationCap,
        items: [
          { title: 'کارشناسی مهندسی کامپیوتر', desc: 'دانشجوی مهندسی کامپیوتر دانشگاه خوارزمی از سال ۱۳۹۹ تا ۱۴۰۳.' },
          { title: 'کارشناسی ارشد روان‌شناسی بالینی', desc: 'ادامه تحصیل در مقطع کارشناسی ارشد روان‌شناسی بالینی در دانشگاه علم و فرهنگ.' },
        ],
      },
      {
        id: 'career',
        title: 'سوابق کاری',
        icon: Briefcase,
        items: [
          { title: 'دوآپس فناوری‌های ارتباطات سینا', desc: 'فعالیت به‌عنوان دوآپس (DevOps) از دی ۱۴۰۳ تا اردیبهشت ۱۴۰۴.' },
          { title: 'برنامه‌نویس بک‌اند ترجمان گام دوم', desc: 'فعالیت به‌عنوان برنامه‌نویس بک‌اند از خرداد ۱۴۰۴ تاکنون.' },
        ],
      },
    ],
  },
  {
    name: 'دکتر محمود خزائی',
    role: 'مشاور علمی و بالینی',
    image: khazaeiPic,
    accent: 'from-emerald-600 to-teal-500',
    chip: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    bio: 'دکتری تخصصی روان‌شناسی بالینی از دانشگاه شهید بهشتی و عضو هیئت علمی دانشگاه علم و فرهنگ. از سال ۱۳۹۳ در زمینه زوج‌درمانی با رویکرد شناختی-رفتاری فعالیت دارد و نظارت علمی و بالینی بر محتوای مصاحبه‌های SCID-5-CV این سامانه بر عهده ایشان بوده است.',
    education: [
      { label: 'دکتری تخصصی روان‌شناسی بالینی', university: 'دانشگاه شهید بهشتی', logo: sbuLogo },
      { label: 'عضو هیئت علمی', university: 'دانشگاه علم و فرهنگ', logo: uscLogo },
    ],
    details: [
      {
        id: 'education',
        title: 'سوابق تحصیلی و کاری',
        icon: GraduationCap,
        items: [
          { title: 'تحصیلات', desc: 'دکترای تخصصی روان‌شناسی بالینی از دانشگاه شهید بهشتی؛ کارشناسی ارشد روان‌شناسی بالینی و کارشناسی روان‌شناسی عمومی از دانشگاه علامه طباطبایی.' },
          { title: 'سابقه حرفه‌ای', desc: 'از سال ۱۳۸۵ وارد حوزه روان‌شناسی بالینی شده و از سال ۱۳۹۳ به‌عنوان زوج‌درمانگر با رویکرد شناختی-رفتاری فعالیت می‌کند.' },
          { title: 'سوابق بالینی', desc: 'کلینیک خانواده و کودک دانشگاه شهید بهشتی، مرکز مشاوره شماره ۲ دانشگاه شهید بهشتی (بلوار کشاورز) و کلینیک صبح صادق.' },
          { title: 'سوابق آموزشی', desc: 'تدریس به‌عنوان استاد مدعو در دانشگاه پیام نور و دستیاری آموزشی در آموزش‌های مجازی و حضوری دانشکده روان‌شناسی و علوم تربیتی دانشگاه شهید بهشتی.' },
          { title: 'کارورزی بالینی', desc: 'تکمیل دوره کارورزی مقطع دکتری تخصصی در بیمارستان روزبه و بیمارستان امام خمینی.' },
        ],
      },
      {
        id: 'research',
        title: 'پژوهش و تألیف',
        icon: ScrollText,
        items: [
          { title: 'رساله دکتری تخصصی', desc: 'رساله دکتری در زمینه بخشودگی خیانت زناشویی انجام شده است.' },
          { title: 'مقالات', desc: 'ارائه مقالات متعدد در حوزه زوج‌درمانی.' },
          { title: 'حوزه‌های پژوهشی مورد علاقه', desc: 'زوج‌درمانی شناختی-رفتاری، بخشودگی خیانت زناشویی، اصول عملکرد حرفه‌ای و فلسفه دیالوگ.' },
        ],
      },
      {
        id: 'professional',
        title: 'فعالیت‌های حرفه‌ای',
        icon: Stethoscope,
        items: [
          { title: 'داوری علمی', desc: 'داور مجله خانواده پژوهی.' },
          { title: 'مشاوره پژوهشی', desc: 'فعالیت در زمینه مشاوره‌های پژوهشی.' },
          { title: 'خدمات بالینی', desc: 'ارائه خدمات بالینی به‌عنوان زوج‌درمانگر، مشاور پیش از ازدواج و مداخلات در حوزه روابط بین فردی.' },
        ],
      },
    ],
  },
]

type DetailSection = {
  id: string
  title: string
  icon: LucideIcon
  items: { title: string; desc: string }[]
}

function MemberDetails({ sections }: { sections: DetailSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')
  const activeSection = sections.find((s) => s.id === active) ?? sections[0]

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="جزئیات" className="flex flex-wrap gap-2 justify-center lg:justify-start">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`member-tab-${s.id}`}
            aria-selected={active === s.id}
            aria-controls={`member-panel-${s.id}`}
            onClick={() => setActive(s.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              active === s.id
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/50 hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <s.icon className="h-4 w-4" />
            {s.title}
          </button>
        ))}
      </div>
      {activeSection && (
        <div
          role="tabpanel"
          id={`member-panel-${activeSection.id}`}
          aria-labelledby={`member-tab-${activeSection.id}`}
          className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[var(--glass-bg)] p-5 md:p-6 text-right"
        >
          <div className="flex items-center gap-2 mb-4">
            <activeSection.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h4 className="font-bold">{activeSection.title}</h4>
          </div>
          <ul className="space-y-4">
            {activeSection.items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                <div className="min-w-0">
                  <span className="font-semibold text-sm md:text-base">{item.title}</span>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

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
        <div className="relative w-full aspect-[16/7]">
          <img
            src="/hero-illustration.webp"
            alt="سامانه هوشمند مصاحبه بالینی SCID-5-CV"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />
          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md ring-1 ring-white/20">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white drop-shadow">درباره ما</h1>
              <p className="text-base text-white/90 mt-2 font-medium">About Us</p>
              <p className="text-sm sm:text-base text-white/85 mt-4 max-w-2xl mx-auto leading-relaxed drop-shadow">
                سامانه هوشمند مصاحبه بالینی SCID-5-CV با ترکیب دانش روان‌شناسی بالینی و فناوری
                مهندسی نرم‌افزار طراحی شده است تا ابزاری دقیق و در دسترس برای انجام مصاحبه‌های
                ساختاریافته بر اساس معیارهای DSM-5 در اختیار درمانگران قرار دهد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-14 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold">تیم سامانه</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-3 text-base md:text-lg">
              ترکیب دانش فنی و تخصص بالینی در ساخت این پروژه
            </p>
          </div>
          <div className="space-y-10 md:space-y-16">
            {team.map((member, idx) => (
              <Card key={member.name} className="overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${member.accent}`} />
                <CardContent className="p-6 md:p-10 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-14">
                  <div className={`relative shrink-0 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${member.accent} opacity-30 blur-xl`} />
                    <img
                      src={member.image}
                      alt={member.name}
                      className="relative h-48 w-48 md:h-64 md:w-64 rounded-3xl object-cover border-4 border-[hsl(var(--card))] shadow-2xl"
                    />
                  </div>
                  <div className={`flex-1 text-center lg:text-right ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <h3 className="text-2xl md:text-3xl font-bold">{member.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium mt-3 ${member.chip}`}>
                      {member.role}
                    </span>
                    <p className="text-base md:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mt-5">
                      {member.bio}
                    </p>
                    <ul className="mt-7 space-y-3 text-base md:text-lg">
                      {member.education.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[var(--glass-bg)] px-4 py-3 text-right"
                        >
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-[hsl(var(--border))] p-1.5 shadow-sm">
                            <img src={item.logo} alt={item.university} className="h-full w-full object-contain" />
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold">{item.label}</span>
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">{item.university}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {member.details && <MemberDetails sections={member.details} />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-8">
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
