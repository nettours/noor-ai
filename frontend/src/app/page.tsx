'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Bot, Phone, Video, Clock, Heart,
  ChevronLeft, ChevronRight, Mic, Send
} from 'lucide-react';

// ════════════════════════════════════════════════════════
// شرائح الـ Slider - كل شريحة قسم
// ════════════════════════════════════════════════════════
const SLIDES = [
  {
    badge: '📖 القرآن الكريم',
    title: 'استمع للقرآن',
    subtitle: 'بصوت أعظم القراء',
    desc: '114 سورة كاملة بأصوات 6 قراء مشاهير: العفاسي، السديس، المنشاوي، الحصري، الحذيفي، عبدالباسط',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    icon: BookOpen,
    visual: 'quran',
  },
  {
    badge: '🤖 مساعد ذكي',
    title: 'مساعد AI إسلامي',
    subtitle: 'مدعوم بـ Claude',
    desc: 'اسأل عن التفسير، الأحاديث، الفقه، الأدعية. مساعد ذكي يفهم العربية الفصحى ويُجيبك بأدب',
    color: '#67E8F9',
    gradient: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)',
    icon: Bot,
    visual: 'ai',
  },
  {
    badge: '📞 مكالمات HD',
    title: 'تواصل مع إخوانك',
    subtitle: 'مكالمات صوت وفيديو مجانية',
    desc: 'WebRTC P2P — الصوت يمر مباشرة بينكما. تشفير من طرف لطرف، بدون تأخير، بدون تكلفة',
    color: '#FBBF24',
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
    icon: Phone,
    visual: 'call',
  },
  {
    badge: '💬 دردشة احترافية',
    title: 'تشارك الخير',
    subtitle: 'دردشة فورية مع المؤمنين',
    desc: 'رسائل فورية، علامات قراءة، رسائل صوتية، صور، ملفات. كل ما تتوقعه من تطبيق دردشة محترف',
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
    icon: Send,
    visual: 'chat',
  },
  {
    badge: '🕌 أوقات الصلاة',
    title: 'لا تفوتك صلاة',
    subtitle: 'مواقيت دقيقة بحسب موقعك',
    desc: 'أوقات صلاة دقيقة، بوصلة قبلة، أذكار يومية، تقويم هجري — كل ما يحتاجه المسلم في يومه',
    color: '#F87171',
    gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
    icon: Clock,
    visual: 'prayer',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auth check
  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const user = localStorage.getItem('noor_user');
      if (token && user) {
        router.push('/home');
        return;
      }
    } catch {}
    setIsLoaded(true);
  }, [router]);

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: '#030712',
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
    setTimeout(() => setIsPaused(false), 8000);
  };

  const goNext = () => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#030712',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Top Nav */}
      <nav style={{
        padding: 'calc(var(--safe-top, 0px) + 16px) 24px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
          }}>
            ☪️
          </div>
          <div>
            <div style={{
              fontFamily: 'Amiri, serif',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: 1,
            }}>
              نور <span style={{ color: '#FBBF24' }}>AI</span>
            </div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
              رفيقك الإيماني
            </div>
          </div>
        </div>

        <Link href="/auth/login" style={{
          padding: '8px 18px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '999px',
          fontSize: '13px',
          color: '#fff',
          textDecoration: 'none',
        }}>
          دخول
        </Link>
      </nav>

      {/* ═══════════════════════════════════════════ */}
      {/* SLIDER SECTION - يأخذ معظم الشاشة */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: '70vh',
        padding: '20px',
      }}>

        {/* Animated background — changes with slide */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${slide.color}33 0%, transparent 60%)`,
          transition: 'background 1s ease',
        }} />

        {/* Floating orb */}
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: slide.color,
          opacity: 0.15,
          filter: 'blur(80px)',
          transition: 'background 1s ease',
          animation: 'noorFloat 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: '250px', height: '250px',
          borderRadius: '50%',
          background: slide.color,
          opacity: 0.1,
          filter: 'blur(60px)',
          transition: 'background 1s ease',
          animation: 'noorFloat 5s ease-in-out infinite 1s',
        }} />

        {/* Slide content */}
        <div
          key={currentSlide}
          className="slide-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px',
            position: 'relative',
            zIndex: 2,
            animation: 'slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Big icon */}
          <div style={{
            width: 'clamp(100px, 20vw, 140px)',
            height: 'clamp(100px, 20vw, 140px)',
            borderRadius: '32px',
            background: slide.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
            boxShadow: `0 30px 80px ${slide.color}66`,
            position: 'relative',
          }}>
            <Icon size={64} color="#fff" strokeWidth={1.5} />
            <div style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '40px',
              border: `2px solid ${slide.color}44`,
              animation: 'noorPulse 3s infinite',
            }} />
          </div>

          {/* Badge */}
          <div style={{
            padding: '6px 16px',
            background: `${slide.color}22`,
            border: `1px solid ${slide.color}44`,
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            color: slide.color,
            marginBottom: '20px',
          }}>
            {slide.badge}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '12px',
            maxWidth: '600px',
          }}>
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(16px, 3vw, 22px)',
            color: '#D1D5DB',
            marginBottom: '20px',
            fontWeight: 500,
            maxWidth: '500px',
          }}>
            {slide.subtitle}
          </p>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(13px, 2vw, 16px)',
            color: '#9CA3AF',
            lineHeight: 1.8,
            maxWidth: '600px',
            marginBottom: '0',
          }}>
            {slide.desc}
          </p>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px', height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            transition: 'all 0.2s',
          }}
          className="nav-arrow"
        >
          <ChevronLeft size={22} style={{ transform: 'scaleX(-1)' }} />
        </button>

        <button
          onClick={goNext}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px', height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            transition: 'all 0.2s',
          }}
          className="nav-arrow"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Dots indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          paddingBottom: '20px',
          position: 'relative',
          zIndex: 5,
        }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentSlide(i);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 8000);
              }}
              style={{
                width: i === currentSlide ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === currentSlide
                  ? slide.gradient
                  : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s',
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* BOTTOM: CTA + Quick Features */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{
        padding: '32px 24px calc(var(--safe-bottom, 0px) + 32px)',
        background: 'linear-gradient(0deg, rgba(255,255,255,0.02), transparent)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 5,
      }}>
        {/* Mini features icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: BookOpen, label: 'قرآن', color: '#10B981' },
            { icon: Bot, label: 'AI', color: '#67E8F9' },
            { icon: Phone, label: 'مكالمات', color: '#FBBF24' },
            { icon: Send, label: 'دردشة', color: '#A855F7' },
            { icon: Clock, label: 'صلاة', color: '#F87171' },
            { icon: Heart, label: 'أذكار', color: '#EC4899' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              opacity: 0.7,
              transition: 'opacity 0.3s',
            }} className="mini-feature">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: `${f.color}22`,
                border: `1px solid ${f.color}33`,
                color: f.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <f.icon size={18} />
              </div>
              <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Big CTA */}
        <Link href="/auth/register" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '18px 32px',
          fontSize: '16px',
          fontWeight: 700,
          background: slide.gradient,
          color: '#fff',
          borderRadius: '20px',
          textDecoration: 'none',
          boxShadow: `0 20px 50px ${slide.color}66`,
          transition: 'all 0.4s',
        }} className="main-cta">
          🚀 ابدأ مجاناً — أنشئ حسابك
          <ChevronLeft size={20} />
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
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes noorFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        .nav-arrow:hover {
          background: rgba(255,255,255,0.15) !important;
          transform: translateY(-50%) scale(1.1) !important;
        }
        .mini-feature:hover {
          opacity: 1 !important;
        }
        .main-cta:hover {
          transform: translateY(-2px) scale(1.02);
        }
      `}</style>
    </div>
  );
}
