import { useNavigate } from 'react-router-dom'
import { Brain, ClipboardList, Shield, BarChart3, Users, ArrowLeft } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'

const features = [
  {
    icon: ClipboardList,
    title: 'مصاحبه بالینی ساختاریافته',
    desc: 'پیاده‌سازی کامل SCID-5-CV برای تشخیص اختلالات محور I بر اساس DSM-5',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    icon: Users,
    title: 'مدیریت بیماران',
    desc: 'ثبت، ویرایش و پیگیری اطلاعات بیماران در یک داشبورد متمرکز',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    icon: BarChart3,
    title: 'نتایج تشخیصی لحظه‌ای',
    desc: 'محاسبه خودکار الگوریتم‌های تشخیصی و نمایش نتایج در لحظه',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    icon: Shield,
    title: 'امن و محرمانه',
    desc: 'رعایت استانداردهای حریم خصوصی و امنیت داده‌های پزشکی',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-[hsl(var(--primary))]" />
            <span className="text-lg font-bold">SCID-5-CV</span>
          </div>
           <div className="flex items-center gap-3">
             <Button size="lg" onClick={() => navigate('/login')}>
               شروع کنید
               <ArrowLeft className="mr-2 h-5 w-5" />
             </Button>
           </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-4">
                <Brain className="h-16 w-16 text-[hsl(var(--primary))]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              سامانه هوشمند مصاحبه بالینی
            </h1>
            <p className="text-xl text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
              Structured Clinical Interview for DSM-5 — Clinician Version
            </p>
            <p className="text-base text-[hsl(var(--muted-foreground))] mt-6 max-w-2xl mx-auto leading-relaxed">
              سامانه SCID-5-CV یک ابزار دیجیتال برای انجام مصاحبه‌های بالینی ساختاریافته
              بر اساس معیارهای DSM-5 است. این سیستم به روانشناسان و روانپزشکان کمک می‌کند
              تا فرآیند تشخیص را با دقت و سرعت بیشتری انجام دهند.
            </p>
             <div className="flex items-center justify-center mt-10">
               <Button size="lg" onClick={() => navigate('/login')}>
                 شروع کنید
                 <ArrowLeft className="mr-2 h-5 w-5" />
               </Button>
             </div>
          </div>
        </div>

        {/* ── Features ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">ویژگی‌های سامانه</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-2">
              ابزارهای حرفه‌ای برای تشخیص بالینی دقیق
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6 text-center">
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

      {/* ── Footer ── */}
      <footer className="border-t border-[hsl(var(--border))] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>Smart SCID-5-CV &copy; {new Date().getFullYear()} &mdash; سامانه هوشمند مصاحبه بالینی</p>
        </div>
      </footer>
    </div>
  )
}