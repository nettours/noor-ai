'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Bot, Phone, Video, Clock, Heart, Sparkles,
  ChevronLeft, ArrowDown, Shield, Zap, Globe, Star,
  Mic, Image as ImageIcon, Send, CheckCheck
} from 'lucide-react';

// ─── Hook لتتبع الـ scroll ────────────────────────
function useScrollProgress() {
  // const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(window.scrollY / max);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

// ─── Hook لتفعيل عناصر عند ظهورها ─────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const user = localStorage.getItem('noor_user');
      if (token && user) { router.push('/home'); return; }
    } catch {}
    setIsLoaded(true);

    const onMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: '#030712',
      }}>
        <div className="hero-spinner" />
      </div>
    );
  }

  return (
    <div style={{ background: '#030712', color: '#fff', overflow: 'hidden' }}>

      {/* Progress bar at top */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '3px', zIndex: 999,
        background: 'linear-gradient(90deg, #10B981, #FBBF24)',
        transform: `scaleX(${scrollProgress})`,
        transformOrigin: 'right',
        transition: 'transform 0.1s',
      }} />

      {/* Floating Nav (appears on scroll) */}
      <nav style={{
        position: 'fixed',
        top: scrollProgress > 0.05 ? '16px' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        padding: '12px 20px',
        background: 'rgba(3,7,18,0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <span style={{ fontSize: '20px' }}>☪️</span>
        <span style={{ fontSize: '14px', fontWeight: 700 }}>نور AI</span>
        <Link href="/auth/register" style={{
          padding: '8px 18px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 700,
          color: '#fff',
          textDecoration: 'none',
        }}>
          ابدأ مجاناً
        </Link>
      </nav>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO ANIMÉ */}
      {/* ═══════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100dvh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        overflow: 'hidden',
      }}>

        {/* Animated background orbs */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '20%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: 'transform 1s ease-out',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%', right: '20%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`,
          transition: 'transform 1s ease-out',
        }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }} />

        {/* Floating stars */}
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            fontSize: `${8 + Math.random() * 12}px`,
            opacity: 0.3 + Math.random() * 0.4,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}>
            {['✦', '✧', '⋆', '⋄', '·'][Math.floor(Math.random() * 5)]}
          </div>
        ))}

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: '900px' }}>

          {/* Badge */}
          <div className="hero-badge" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px',
            fontSize: '12px',
            marginBottom: '32px',
            color: '#D1D5DB',
            animation: 'slideDown 0.8s ease-out',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 12px #10B981',
              animation: 'pulse 2s infinite',
            }} />
            ✨ الإصدار الجديد متاح الآن
          </div>

          {/* Logo */}
          <div style={{
            width: '110px', height: '110px',
            margin: '0 auto 28px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '56px',
            boxShadow: '0 30px 80px rgba(16,185,129,0.5)',
            position: 'relative',
            animation: 'logoFloat 4s ease-in-out infinite',
          }}>
            ☪️
            <div style={{
              position: 'absolute', inset: '-12px',
              borderRadius: '36px',
              border: '2px solid rgba(16,185,129,0.3)',
              animation: 'pulse 3s infinite',
            }} />
          </div>

          {/* Massive title */}
          <h1 style={{
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(56px, 14vw, 130px)',
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: '24px',
            background: 'linear-gradient(180deg, #fff 30%, #6B7280 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-2px',
          }} className="hero-title">
            نور
            <span style={{
              background: 'linear-gradient(135deg, #10B981, #FBBF24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginInlineStart: '20px',
            }}>
              AI
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 3vw, 28px)',
            color: '#D1D5DB',
            marginBottom: '14px',
            fontWeight: 500,
          }} className="hero-subtitle">
            رفيقك في طريق الإيمان 🌙
          </p>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: '#9CA3AF',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.8,
          }} className="hero-desc">
            تطبيق إسلامي شامل بأحدث التقنيات. قرآن، مساعد ذكاء اصطناعي،
            مكالمات صوتية ومرئية، ومجتمع رائع — كل ما تحتاجه في تطبيق واحد.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '60px',
          }} className="hero-ctas">
            <Link href="/auth/register" className="cta-main" style={{
              padding: '18px 36px',
              fontSize: '16px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff',
              borderRadius: '16px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 16px 48px rgba(16,185,129,0.4)',
              transition: 'all 0.3s',
            }}>
              ابدأ رحلتك مجاناً
              <ChevronLeft size={20} />
            </Link>

            <Link href="/auth/login" style={{
              padding: '18px 36px',
              fontSize: '16px',
              fontWeight: 700,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              borderRadius: '16px',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              لدي حساب →
            </Link>
          </div>

          {/* Scroll hint */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: '#6B7280',
            fontSize: '12px',
            animation: 'bounce 2s infinite',
          }}>
            <span>اسحب لاكتشاف المزيد</span>
            <ArrowDown size={16} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 2 — البطاقات المتحركة */}
      {/* ═══════════════════════════════════════════════ */}
      <FeaturesSection />

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 3 — مكالمات WebRTC (Mockup) */}
      {/* ═══════════════════════════════════════════════ */}
      <CallsShowcase />

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 4 — Chat Mockup */}
      {/* ═══════════════════════════════════════════════ */}
      <ChatShowcase />

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 5 — الإحصائيات الكبيرة */}
      {/* ═══════════════════════════════════════════════ */}
      <StatsSection />

      {/* ═══════════════════════════════════════════════ */}
      {/* SECTION 6 — Final CTA */}
      {/* ═══════════════════════════════════════════════ */}
      <FinalCTA />

      <footer style={{
        padding: '40px 20px 30px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6B7280',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p style={{ marginBottom: '6px' }}>صُنع بحبّ 💚 لخدمة المسلمين</p>
        <p>نور AI © 2025 • SnetProDz</p>
      </footer>

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { background: #030712; color: #fff; margin: 0; }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .hero-title { animation: fadeUp 1s 0.2s both; }
        .hero-subtitle { animation: fadeUp 1s 0.4s both; }
        .hero-desc { animation: fadeUp 1s 0.6s both; }
        .hero-ctas { animation: fadeUp 1s 0.8s both; }
        
        .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        
        .hero-spinner {
          width: 50px; height: 50px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #10B981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .cta-main:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 24px 60px rgba(16,185,129,0.6);
        }
        
        .feature-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(16,185,129,0.4) !important;
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// SECTION 2 — Features
// ═══════════════════════════════════════════════════
function FeaturesSection() {
  const [ref, inView] = useInView();
  const features = [
    { icon: BookOpen, title: 'القرآن الكريم', desc: '114 سورة بصوت 6 قراء مشاهير', color: '#10B981' },
    { icon: Bot, title: 'مساعد AI ذكي', desc: 'مدعوم بـ Claude — أجوبة فقهية وتفسير', color: '#67E8F9' },
    { icon: Phone, title: 'مكالمات صوتية', desc: 'WebRTC P2P — مجاني تماماً', color: '#FBBF24' },
    { icon: Video, title: 'مكالمات فيديو', desc: 'HD بدون تأخير', color: '#F87171' },
    { icon: Clock, title: 'مواقيت الصلاة', desc: 'GPS دقيق + بوصلة قبلة', color: '#60A5FA' },
    { icon: Heart, title: 'الأذكار', desc: 'حصن المسلم كاملاً', color: '#EC4899' },
  ];

  return (
    <section ref={ref} style={{
      padding: '120px 20px',
      maxWidth: '1280px',
      margin: '0 auto',
      position: 'relative',
    }}>
      <div className={`reveal ${inView ? 'in-view' : ''}`} style={{
        textAlign: 'center', marginBottom: '70px',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          background: 'rgba(217,119,6,0.15)',
          border: '1px solid rgba(217,119,6,0.3)',
          borderRadius: '999px',
          fontSize: '11px',
          color: '#FBBF24',
          fontWeight: 700,
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          ✨ ميزات حصرية
        </div>
        <h2 style={{
          fontSize: 'clamp(36px, 7vw, 64px)',
          fontWeight: 900,
          marginBottom: '16px',
          lineHeight: 1.1,
        }}>
          كل ما تحتاجه
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #10B981, #FBBF24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            في تطبيق واحد
          </span>
        </h2>
        <p style={{ fontSize: '17px', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto' }}>
          تجربة إسلامية متكاملة لا تشبه أي تطبيق آخر — صُممت بعناية لتكون رفيقك اليومي
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        {features.map((f, i) => (
          <div
            key={i}
            className={`feature-card reveal ${inView ? 'in-view' : ''}`}
            style={{
              transitionDelay: `${i * 0.08}s`,
              padding: '32px 28px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-40px', right: '-40px',
              width: '160px', height: '160px',
              borderRadius: '50%',
              background: f.color,
              opacity: 0.1,
              filter: 'blur(30px)',
            }} />
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '18px',
              background: `${f.color}22`,
              border: `1px solid ${f.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: f.color,
              marginBottom: '20px',
              position: 'relative',
            }}>
              <f.icon size={28} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: 1.7 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// SECTION 3 — Calls Showcase
// ═══════════════════════════════════════════════════
function CallsShowcase() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{
      padding: '120px 20px',
      background: 'linear-gradient(180deg, transparent, rgba(16,185,129,0.05), transparent)',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '60px',
        alignItems: 'center',
      }}>
        <div className={`reveal ${inView ? 'in-view' : ''}`}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '999px',
            fontSize: '11px',
            color: '#10B981',
            fontWeight: 700,
            marginBottom: '20px',
          }}>
            📞 مكالمات WebRTC
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 900,
            marginBottom: '20px',
            lineHeight: 1.2,
          }}>
            تواصل مع إخوانك
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #10B981, #34D399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              مكالمات HD مجاناً
            </span>
          </h2>
          <p style={{ fontSize: '16px', color: '#D1D5DB', lineHeight: 1.8, marginBottom: '28px' }}>
            مكالمات صوتية ومرئية بجودة عالية باستخدام تقنية WebRTC P2P.
            الصوت يمرّ مباشرة بينك وبين الطرف الآخر — أسرع وأكثر أماناً.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '🔒', text: 'تشفير طرف لطرف' },
              { icon: '⚡', text: 'بدون تأخير' },
              { icon: '🌍', text: 'يعمل عالمياً' },
              { icon: '💰', text: 'مجاني تماماً' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '15px',
                color: '#D1D5DB',
              }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Call mockup */}
        <div className={`reveal ${inView ? 'in-view' : ''}`} style={{ transitionDelay: '0.2s' }}>
          <div style={{
            width: '100%',
            maxWidth: '320px',
            margin: '0 auto',
            aspectRatio: '9/16',
            background: 'linear-gradient(180deg, #1F2937, #0F172A)',
            borderRadius: '40px',
            border: '8px solid #111',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(16,185,129,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
          }}>
            {/* Mock notch */}
            <div style={{
              position: 'absolute',
              top: '10px', left: '50%',
              transform: 'translateX(-50%)',
              width: '90px', height: '24px',
              background: '#000',
              borderRadius: '20px',
              zIndex: 2,
            }} />

            {/* Call UI */}
            <div style={{
              padding: '60px 24px 20px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'linear-gradient(180deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
            }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                📹 مكالمة فيديو
              </p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                🟢 02:34
              </p>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '120px', height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 900,
                  color: '#fff',
                  boxShadow: '0 0 60px rgba(16,185,129,0.6)',
                  animation: 'pulse 2s infinite',
                }}>
                  أ
                </div>
              </div>

              <p style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
                أحمد محمد
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>
                مكالمة فيديو
              </p>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '48px', height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mic size={20} color="#fff" />
                </div>
                <div style={{
                  width: '48px', height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Video size={20} color="#fff" />
                </div>
                <div style={{
                  width: '56px', height: '56px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(239,68,68,0.5)',
                }}>
                  <Phone size={22} color="#fff" style={{ transform: 'rotate(135deg)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// SECTION 4 — Chat Showcase
// ═══════════════════════════════════════════════════
function ChatShowcase() {
  const [ref, inView] = useInView();
  const messages = [
    { from: 'them', text: 'السلام عليكم 🌙', time: '10:30' },
    { from: 'me', text: 'وعليكم السلام ورحمة الله 🤗', time: '10:31' },
    { from: 'them', text: 'كيف حالك أخي الكريم؟', time: '10:32' },
    { from: 'me', text: 'الحمد لله بخير', time: '10:33' },
    { from: 'them', text: '﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴾', time: '10:35' },
  ];

  return (
    <section ref={ref} style={{
      padding: '120px 20px',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '60px',
        alignItems: 'center',
        direction: 'ltr',
      }}>
        {/* Chat mockup */}
        <div className={`reveal ${inView ? 'in-view' : ''}`}>
          <div style={{
            maxWidth: '320px',
            margin: '0 auto',
            background: 'linear-gradient(180deg, #0F172A, #1F2937)',
            borderRadius: '40px',
            border: '8px solid #111',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(217,119,6,0.3)',
            aspectRatio: '9/16',
            display: 'flex',
            flexDirection: 'column',
            direction: 'rtl',
          }}>
            {/* Header */}
            <div style={{
              padding: '50px 16px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '38px', height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 900,
                position: 'relative',
              }}>
                ف
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '10px', height: '10px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '2px solid #0F172A',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>فاطمة الزهراء</div>
                <div style={{ fontSize: '10px', color: '#10B981' }}>🟢 متصلة</div>
              </div>
              <Phone size={16} color="#9CA3AF" />
              <Video size={16} color="#9CA3AF" />
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflow: 'hidden',
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.from === 'me' ? 'flex-start' : 'flex-end',
                  maxWidth: '75%',
                  padding: '6px 10px',
                  borderRadius: m.from === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.from === 'me'
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : 'rgba(255,255,255,0.08)',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  animation: `slideRight 0.5s ${i * 0.15}s both`,
                }}>
                  {m.text}
                  <div style={{
                    fontSize: '8px',
                    opacity: 0.6,
                    marginTop: '2px',
                    textAlign: 'left',
                  }}>
                    {m.time} {m.from === 'me' && '✓✓'}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{
              padding: '8px 12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '999px',
                padding: '7px 12px',
                fontSize: '10px',
                color: '#6B7280',
              }}>
                اكتب رسالة...
              </div>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Send size={12} color="#fff" />
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className={`reveal ${inView ? 'in-view' : ''}`} style={{ transitionDelay: '0.2s', direction: 'rtl' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(217,119,6,0.15)',
            border: '1px solid rgba(217,119,6,0.3)',
            borderRadius: '999px',
            fontSize: '11px',
            color: '#FBBF24',
            fontWeight: 700,
            marginBottom: '20px',
          }}>
            💬 دردشة احترافية
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 900,
            marginBottom: '20px',
            lineHeight: 1.2,
          }}>
            دردشة فورية
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #FBBF24, #D97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              مع كل الميزات
            </span>
          </h2>
          <p style={{ fontSize: '16px', color: '#D1D5DB', lineHeight: 1.8, marginBottom: '24px' }}>
            رسائل فورية، علامات قراءة، مؤشر الكتابة، إرسال صور وملفات،
            رسائل صوتية — كل ما تتوقعه من تطبيق دردشة احترافي.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
          }}>
            {[
              { icon: '✓✓', text: 'علامات قراءة' },
              { icon: '✍️', text: 'مؤشر الكتابة' },
              { icon: '📸', text: 'إرسال صور' },
              { icon: '🎤', text: 'رسائل صوتية' },
              { icon: '📎', text: 'ملفات', },
              { icon: '🔔', text: 'إشعارات' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#D1D5DB',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// SECTION 5 — Stats
// ═══════════════════════════════════════════════════
function StatsSection() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ padding: '100px 20px' }}>
      <div className={`reveal ${inView ? 'in-view' : ''}`} style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '60px 30px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(217,119,6,0.05))',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-100px', right: '-100px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: '#10B981',
          opacity: 0.1,
          filter: 'blur(80px)',
        }} />
        <h2 style={{
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 900,
          marginBottom: '40px',
          position: 'relative',
        }}>
          تطبيق يثق به
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #10B981, #FBBF24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            آلاف المسلمين
          </span>
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '24px',
          position: 'relative',
        }}>
          {[
            { num: '114', label: 'سورة' },
            { num: '6', label: 'قراء' },
            { num: '25', label: 'نبي' },
            { num: '∞', label: 'محادثات' },
          ].map((s, i) => (
            <div key={i} style={{ animation: inView ? `scaleIn 0.6s ${i * 0.1}s both` : 'none' }}>
              <div style={{
                fontSize: 'clamp(40px, 8vw, 70px)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #10B981, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}>
                {s.num}
              </div>
              <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════
// SECTION 6 — Final CTA
// ═══════════════════════════════════════════════════
function FinalCTA() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} style={{ padding: '120px 20px 80px' }}>
      <div className={`reveal ${inView ? 'in-view' : ''}`} style={{
        maxWidth: '720px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '70px 30px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(217,119,6,0.1))',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-100px', left: '-100px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.3), transparent)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px', right: '-100px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.3), transparent)',
          filter: 'blur(40px)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            width: '80px', height: '80px',
            margin: '0 auto 24px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 20px 60px rgba(16,185,129,0.5)',
            animation: 'logoFloat 4s ease-in-out infinite',
          }}>
            🌙
          </div>

          <h2 style={{
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: 900,
            marginBottom: '16px',
            lineHeight: 1.1,
          }}>
            ابدأ رحلتك الإيمانية
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #FBBF24, #D97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              الآن
            </span>
          </h2>

          <p style={{ fontSize: '15px', color: '#D1D5DB', marginBottom: '32px', lineHeight: 1.8 }}>
            انضم لآلاف المسلمين حول العالم
            <br />
            مجاني • بدون إعلانات • بدون بطاقة ائتمان
          </p>

          <Link href="/auth/register" className="cta-main" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '20px 44px',
            fontSize: '18px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#fff',
            borderRadius: '20px',
            textDecoration: 'none',
            boxShadow: '0 20px 50px rgba(16,185,129,0.5)',
          }}>
            🚀 إنشاء حساب مجاني
            <ChevronLeft size={22} />
          </Link>
        </div>
      </div>
    </section>
  );
}
