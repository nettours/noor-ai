'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Bot, Phone, Video, Clock, Heart,
  Sparkles, Compass, MessageCircle, Users, Star, Shield,
  ChevronLeft, ChevronRight, Mic, Send, Globe, Zap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// 7 شرائح فاخرة - كل واحدة 7 ثواني
// ═══════════════════════════════════════════════════════
const SLIDES = [
  {
    badge: '📖 القرآن الكريم',
    title: 'استمع للقرآن',
    subtitle: 'بأصوات أعظم القراء',
    desc: '114 سورة كاملة بأصوات 6 قراء مشاهير: العفاسي، السديس، المنشاوي، الحصري، الحذيفي، عبدالباسط',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    icon: BookOpen,
  },
  {
    badge: '🤖 مساعد ذكي',
    title: 'مساعد AI إسلامي',
    subtitle: 'مدعوم بـ Claude AI',
    desc: 'اسأل عن التفسير، الأحاديث، الفقه، الأدعية. مساعد ذكي يفهم العربية الفصحى ويجيب بأدب وعلم',
    color: '#67E8F9',
    gradient: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)',
    icon: Bot,
  },
  {
    badge: '🏠 غرف الدردشة',
    title: 'انضم لغرف الإخوة',
    subtitle: 'مدارسة، فقه، علم، نقاش',
    desc: 'غرف موضوعية: مدارسة القرآن، الفقه والأحكام، طلاب العلم، شباب المسلمين، والأسرة المسلمة',
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
    icon: Users,
  },
  {
    badge: '📞 مكالمات HD',
    title: 'تواصل بصوت وفيديو',
    subtitle: 'مكالمات WebRTC مجانية',
    desc: 'مكالمات صوتية ومرئية مع إخوانك بجودة عالية. تشفير طرف لطرف، بدون تأخير، مجاناً تماماً',
    color: '#FBBF24',
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
    icon: Phone,
  },
  {
    badge: '💬 دردشة احترافية',
    title: 'تشارك الخير',
    subtitle: 'رسائل، صور، صوتية، ملفات',
    desc: 'دردشة فورية مع علامات قراءة، مؤشر الكتابة، رسائل صوتية، صور وملفات — كل ما تتوقعه من WhatsApp وأكثر',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    icon: Send,
  },
  {
    badge: '🕌 أوقات الصلاة',
    title: 'لا تفوتك صلاة',
    subtitle: 'مواقيت + قبلة + أذكار',
    desc: 'أوقات صلاة دقيقة حسب موقعك، بوصلة قبلة بـ GPS، أذكار يومية كاملة، تقويم هجري',
    color: '#F87171',
    gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
    icon: Clock,
  },
  {
    badge: '📿 التسبيح الذكي',
    title: 'سبحة رقمية متقدمة',
    subtitle: 'احصِ ذكرك في كل مكان',
    desc: 'عدّاد تسبيح بأنواع متعددة: سبحان الله، الحمد لله، الله أكبر. مع إحصائيات يومية وتذكير',
    color: '#34D399',
    gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    icon: Sparkles,
  },
];

export default function NoorPremiumLanding() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const user = localStorage.getItem('noor_user');
      if (token && user) { router.push('/home'); return; }
    } catch {}
    setIsLoaded(true);
  }, [router]);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: '#000',
      }}>
        <div style={{
          width: 50, height: 50,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#10B981',
          borderRadius: '50%',
          animation: 'noorSpin 1s linear infinite',
        }} />
        <style>{`@keyframes noorSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  const goPrev = () => {
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };
  const goNext = () => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Background changing with slide */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 50% at 50% 30%, ${slide.color}33 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 70%, ${slide.color}22 0%, transparent 50%),
          #000
        `,
        transition: 'background 1.5s ease',
      }} />

      {/* Islamic pattern overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%2310B981' stroke-width='0.8'%3E%3Cpath d='M40 5L75 40L40 75L5 40Z'/%3E%3Cpath d='M40 15L65 40L40 65L15 40Z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* TOP NAV */}
      <nav style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 24px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.5)',
          }}>☪️</div>
          <div>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>
              نور <span style={{ color: '#FBBF24' }}>AI</span>
            </div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>رفيقك الإيماني</div>
          </div>
        </div>

        <Link href="/auth/login" style={{
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '999px',
          fontSize: '13px',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
        }}>
          دخول
        </Link>
      </nav>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO SLIDER - يأخذ معظم الشاشة */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
        minHeight: '60vh',
      }}>

        {/* Floating orbs */}
        <div style={{
          position: 'absolute',
          top: '10%', right: '5%',
          width: '320px', height: '320px',
          borderRadius: '50%',
          background: slide.color,
          opacity: 0.2,
          filter: 'blur(80px)',
          transition: 'background 1.5s ease',
          animation: 'noorFloat 6s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%', left: '5%',
          width: '260px', height: '260px',
          borderRadius: '50%',
          background: slide.color,
          opacity: 0.12,
          filter: 'blur(60px)',
          transition: 'background 1.5s ease',
          animation: 'noorFloat 5s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }} />

        {/* SLIDE CONTENT */}
        <div
          key={currentSlide}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px 60px',
            animation: 'slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Mega Icon */}
          <div style={{
            width: 'clamp(110px, 22vw, 160px)',
            height: 'clamp(110px, 22vw, 160px)',
            borderRadius: '36px',
            background: slide.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
            boxShadow: `0 30px 100px ${slide.color}99`,
            position: 'relative',
          }}>
            <Icon size={72} color="#fff" strokeWidth={1.5} />
            {/* Orbital ring */}
            <div style={{
              position: 'absolute',
              inset: '-14px',
              borderRadius: '44px',
              border: `2px solid ${slide.color}55`,
              animation: 'noorPulse 3s infinite',
            }} />
            <div style={{
              position: 'absolute',
              inset: '-28px',
              borderRadius: '56px',
              border: `1px solid ${slide.color}22`,
              animation: 'noorPulse 3s 0.5s infinite',
            }} />
          </div>

          {/* Badge */}
          <div style={{
            padding: '8px 18px',
            background: `${slide.color}22`,
            border: `1px solid ${slide.color}55`,
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 700,
            color: slide.color,
            marginBottom: '20px',
            backdropFilter: 'blur(10px)',
          }}>
            {slide.badge}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(38px, 7vw, 72px)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '14px',
            maxWidth: '700px',
            background: 'linear-gradient(180deg, #fff 30%, #9CA3AF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(17px, 3vw, 24px)',
            color: '#E5E7EB',
            marginBottom: '20px',
            fontWeight: 600,
            maxWidth: '600px',
          }}>
            {slide.subtitle}
          </p>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(13px, 2vw, 16px)',
            color: '#9CA3AF',
            lineHeight: 1.8,
            maxWidth: '600px',
            marginBottom: 0,
          }}>
            {slide.desc}
          </p>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          className="nav-arrow"
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px', height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            transition: 'all 0.2s',
          }}
        >
          <ChevronRight size={22} />
        </button>

        <button
          onClick={goNext}
          className="nav-arrow"
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px', height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            transition: 'all 0.2s',
          }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Progress bars (dots) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          padding: '12px 20px 20px',
          position: 'relative',
          zIndex: 5,
        }}>
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentSlide(i);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 10000);
              }}
              style={{
                width: i === currentSlide ? '36px' : '8px',
                height: '6px',
                borderRadius: '3px',
                background: i === currentSlide ? slide.gradient : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.5s',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {i === currentSlide && !isPaused && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, bottom: 0,
                  background: 'rgba(255,255,255,0.4)',
                  animation: 'progressFill 7s linear',
                }} />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* BOTTOM - CTA + Mini Features */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{
        padding: '24px 20px calc(env(safe-area-inset-bottom, 0px) + 28px)',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.6), transparent)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 5,
      }}>

        {/* Mini icons grid */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '14px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: BookOpen, label: 'قرآن', color: '#10B981' },
            { icon: Bot, label: 'AI', color: '#67E8F9' },
            { icon: Users, label: 'غرف', color: '#A855F7' },
            { icon: Phone, label: 'مكالمات', color: '#FBBF24' },
            { icon: Send, label: 'دردشة', color: '#EC4899' },
            { icon: Clock, label: 'صلاة', color: '#F87171' },
            { icon: Sparkles, label: 'تسبيح', color: '#34D399' },
          ].map((f, i) => {
            const F = f.icon;
            return (
              <div key={i} className="mini-feature" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                opacity: 0.7,
                transition: 'opacity 0.3s',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: `${f.color}22`,
                  border: `1px solid ${f.color}44`,
                  color: f.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                }}>
                  <F size={20} />
                </div>
                <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 600 }}>
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Big CTA */}
        <Link href="/auth/register" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
          padding: '18px 36px',
          fontSize: '16px',
          fontWeight: 700,
          background: slide.gradient,
          color: '#fff',
          borderRadius: '20px',
          textDecoration: 'none',
          boxShadow: `0 20px 50px ${slide.color}88`,
          transition: 'all 0.4s',
        }} className="main-cta">
          <Sparkles size={20} />
          ابدأ مجاناً — أنشئ حسابك
          <ChevronRight size={20} />
        </Link>

        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#6B7280',
          marginTop: '14px',
        }}>
          ✨ مجاني • بدون إعلانات • بدون بطاقة ائتمان
        </p>
      </section>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes noorPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }
        @keyframes noorFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes progressFill {
          from { width: 0; }
          to { width: 100%; }
        }
        .nav-arrow:hover {
          background: rgba(255,255,255,0.15) !important;
          transform: translateY(-50%) scale(1.1) !important;
        }
        .mini-feature:hover {
          opacity: 1 !important;
        }
        .mini-feature:hover > div {
          transform: translateY(-2px);
        }
        .main-cta:hover {
          transform: translateY(-3px) scale(1.02);
        }
      `}</style>
    </div>
  );
}
