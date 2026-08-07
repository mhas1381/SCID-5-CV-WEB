import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Brain,
  ArrowLeft,
  ClipboardList,
  GitBranch,
  Scale,
  Siren,
  ShieldCheck,
  Users,
  CheckCircle2,
  GraduationCap,
  History,
} from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const modules = [
  { code: 'A', name_fa: 'اپیزودهای خلقی', name_en: 'Mood Episodes', questions: 91, disorders: 'افسردگی اساسی، دوقطبی I و II، افسردگی پایدار' },
  { code: 'B', name_fa: 'علائم روان‌پریشی', name_en: 'Psychotic Symptoms', questions: 25, disorders: 'هذیان، توهم، رفتار بی‌نظم و علائم منفی طیف اسکیزوفرنی' },
  { code: 'C', name_fa: 'تشخیص افتراقی اختلالات روان‌پریشی', name_en: 'Psychotic Disorders', questions: 31, disorders: 'اسکیزوفرنی، اسکیزوفرنفورم، اسکیزوافکتیو، هذیانی و سایر' },
  { code: 'D', name_fa: 'تشخیص افتراقی اختلالات خلقی', name_en: 'Mood Disorders', questions: 26, disorders: 'دوقطبی I و II، افسردگی اساسی و سایر اختلالات خلقی' },
  { code: 'E', name_fa: 'اختلالات مصرف مواد', name_en: 'Substance Use', questions: 45, disorders: 'الکل و ۸ نوع غیرالکل (کشیدنی‌ها، مواد افیونی، محرک‌ها و …)' },
  { code: 'F', name_fa: 'اختلالات اضطرابی', name_en: 'Anxiety Disorders', questions: 54, disorders: 'پانیک، آگورافوبیا، اضطراب اجتماعی و اضطراب فراگیر' },
  { code: 'G', name_fa: 'وسواس جبری و PTSD', name_en: 'OCD & PTSD', questions: 19, disorders: 'اختلال وسواسی-جبری و اختلال استرس پس از سانحه' },
  { code: 'H', name_fa: 'اختلال بیش‌فعالی بزرگ‌سالان', name_en: 'Adult ADHD', questions: 27, disorders: 'ترکیبی، کم‌توجهی و تکانشگری-بیش‌فعالی' },
  { code: 'I', name_fa: 'غربالگری سایر اختلالات', name_en: 'Screening', questions: 17, disorders: 'فقط غربالگری بدون معیار تشخیصی' },
  { code: 'J', name_fa: 'اختلال سازگاری', name_en: 'Adjustment Disorder', questions: 4, disorders: 'اختلال سازگاری (F43.2)' },
]

const howItWorks = [
  { icon: GraduationCap, step: '۱', title: 'ثبت‌نام و احراز هویت', desc: 'با شماره تماس یا گوگل وارد شوید و صلاحیت حرفه‌ای خود را تأیید کنید' },
  { icon: Users, step: '۲', title: 'ثبت بیمار جدید', desc: 'پرونده بالینی با اطلاعات دموگرافیک و سابقه پزشکی بیمار ایجاد کنید' },
  { icon: Brain, step: '۳', title: 'انجام مصاحبه', desc: 'مصاحبه در دو فاز Overview و تشخیصی گام‌به‌گام با راهنمایی سامانه پیش می‌رود' },
  { icon: CheckCircle2, step: '۴', title: 'مشاهده نتایج', desc: 'الگوریتم تشخیصی معیارها را شمارش و نتیجه را با جزئیات کامل نمایش می‌دهد' },
]

const advantages = [
  {
    icon: ClipboardList,
    title: 'یکسان‌سازی ارزیابی',
    desc: 'پرسش‌های استاندارد با ترتیب ثابت، توالی یکنواخت را برای همه بیماران تضمین می‌کند و مقایسه نتایج را ساده‌تر می‌سازد.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  {
    icon: GitBranch,
    title: 'انشعاب هوشمند',
    desc: 'بنا بر پاسخ‌ها، پرسش‌های غیرمرتبط کنار گذاشته شده و مصاحبه به مسیر مرتبط با الگوی علائم هدایت می‌شود.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  {
    icon: Scale,
    title: 'الگوریتم تشخیصی',
    desc: 'شمارش خودکار معیارها، پایش علائم اصلی و اعمال قواعد رد (exclusion) مطابق DSM-5 انجام می‌شود.',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/50',
  },
  {
    icon: Siren,
    title: 'آگاهی از خطر',
    desc: 'سنجش نظام‌مند خطر خودکشی در بخش Overview و هشدار موقعیت‌های پرخطر به درمانگر.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/50',
  },
]

const algorithmPoints = [
  'پایش علائم اصلی (core symptoms) برای تشخیص‌هایی که نیازمند علامت الزامی هستند',
  'شمارش معیارهای مثبت هر اختلال و مقایسه با آستانه مورد نیاز',
  'اعمال قواعد رد متقابل (exclusion) میان اختلالات هم‌پوشانی‌دار',
  'تعیین شدت، وضعیت (فعلی/گذشته) و ثبت جزئیات پاسخ هر معیار',
  'محاسبه توافق تشخیص سامانه با تشخیص بالینی درمانگر',
]

export function StructuredInterviewPage() {
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
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] hidden sm:block">Structured Clinical Interview</span>
            </div>
          </button>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="outline" onClick={() => navigate('/')}>
              بازگشت
              <ArrowLeft className={`${isRtl ? 'mr-1.5' : 'ml-1.5'} h-4 w-4`} />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-3">
              <History className="h-10 w-10 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">راهنمای سامانه</h1>
          <p className="text-base text-[hsl(var(--muted-foreground))] mt-2 font-medium">مصاحبه بالینی ساختاریافته</p>
          <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mt-4 max-w-2xl mx-auto leading-relaxed">
            آشنایی با SCID-5-CV و نحوه کارکرد سامانه هوشمند مصاحبه بالینی — از معرفی علمی تا گام‌های عملی ارزیابی و تشخیص.
          </p>
        </div>
      </section>

      {/* ── Scientific Intro ── */}
      <section className="border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h2 className="text-2xl md:text-4xl font-bold">مصاحبه ساختاریافته چیست؟</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-3 text-base md:text-lg leading-relaxed">
              مصاحبه بالینی ساختاریافته، روشی نظام‌مند برای جمع‌آوری نشانه‌ها و علائم روان‌پزشکی است که در آن
              ترتیب پرسش‌ها، عبارت‌های دقیق سؤالات و معیارهای داوری از‌پیش مشخص شده است. این روش خطای
              تصمیم‌گیری نامتعارف را کاهش می‌دهد و پایایی تشخیص را در مقایسه با مصاحبه کاملاً آزاد بهبود می‌بخشد.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advantages.map((a) => (
              <Card key={a.title} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`rounded-xl p-3 ${a.bg} inline-flex mb-4`}>
                    <a.icon className={`h-6 w-6 ${a.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{a.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCID-5-CV Intro ── */}
      <section>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">SCID-5-CV چیست؟</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-3 text-base md:text-lg max-w-2xl mx-auto">
              SCID مخفف Structured Clinical Interview for DSM است؛ SCID-5-CV نسخه بالینی آن برای
              ارزیابی اختلالات کلیدی بر اساس معیارهای DSM-5.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="rounded-xl p-3 bg-indigo-100 dark:bg-indigo-900/50 inline-flex mb-4">
                  <History className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold mb-2">مبنای علمی</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  طراحی‌شده مطابق دسته‌بندی DSM-5 برای ارزیابی اختلالات محور اصلی روان‌پزشکی.
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="rounded-xl p-3 bg-emerald-100 dark:bg-emerald-900/50 inline-flex mb-4">
                  <Siren className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2">رایج‌ترین ابزار</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  یکی از پرکاربردترین ابزارهای ارزیابی ساختاریافته در پژوهش و کلینیک.
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="rounded-xl p-3 bg-orange-100 dark:bg-orange-900/50 inline-flex mb-4">
                  <ShieldCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold mb-2">سیستم پرش شرطی</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  فقط سؤالات مرتبط با الگوی علائم بیمار پرسیده می‌شود؛ بهبود زمان ارزیابی و تمرکز.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section className="border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">ساختار سامانه؛ ماژول‌ها</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-3 text-base md:text-lg">
              سامانه از ۱۰ ماژول تشخیصی تشکیل شده که هر کدام گروهی از اختلالات را ارزیابی می‌کنند
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <th className="py-3 pr-4 font-medium">ماژول</th>
                  <th className="py-3 font-medium">نام</th>
                  <th className="py-3 font-medium">تعداد سؤال</th>
                  <th className="py-3 pl-4 font-medium">اختلالات</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.code} className="border-b border-[hsl(var(--border))] last:border-0">
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[hsl(var(--primary))]/10 font-bold text-[hsl(var(--primary))]">
                        {m.code}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="font-medium">{m.name_fa}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">{m.name_en}</div>
                    </td>
                    <td className="py-3">{m.questions}</td>
                    <td className="py-3 pl-4 text-[hsl(var(--muted-foreground))]">{m.disorders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">سامانه چطور کار می‌کند؟</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-3 text-base md:text-lg">
              در چهار گام ساده، مصاحبه بالینی را شروع و تکمیل کنید
            </p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-8 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px border-t-2 border-dashed border-[hsl(var(--border))]" />
            {howItWorks.map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full bg-[var(--glass-bg)] backdrop-blur-md mb-4 shadow-[var(--glass-shadow)]">
                  <div className="absolute inset-0 rounded-full bg-[hsl(var(--primary))]/10" />
                  <step.icon className="h-7 w-7 text-[hsl(var(--primary))]" />
                </div>
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))] mb-3">
                  {step.step}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Algorithm ── */}
      <section className="border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">الگوریتم تشخیصی</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-3 text-base md:text-lg">
              نتیجه تشخیصی به‌صورت خودکار و بر مبنای منطق DSM-5 محاسبه می‌شود
            </p>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="rounded-xl bg-[hsl(var(--primary))]/10 p-3 shrink-0">
                  <Scale className="h-6 w-6 text-[hsl(var(--primary))]" />
                </div>
                <p className="text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
                  سامانه برای هر اختلال، پاسخ‌های مثبت را با هم جمع می‌کند، علائم الزامی را بررسی می‌کند و
                  تنها در صورت تأیید همه‌مواقع تشخیص را ثبت می‌کند.
                </p>
              </div>
              <ul className="space-y-3">
                {algorithmPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <span className="text-[hsl(var(--muted-foreground))] leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--glass-bg)] backdrop-blur-sm" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">آماده شروع هستید؟</h2>
          <p className="text-[hsl(var(--muted-foreground))] text-base md:text-lg mb-8 max-w-xl mx-auto">
            همین حالا وارد شوید و نخستین مصاحبه ساختاریافته خود را آغاز کنید
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
