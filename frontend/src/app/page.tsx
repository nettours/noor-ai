'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Clock, Compass, Heart, Bot, Sparkles,
  MessageCircle, Star, ChevronLeft, Phone, Video,
  Shield, Zap, Globe, Users, Check, ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Auto-redirect if already logged in
    try {
      const token = localStorage.getItem('noor_token');
      const user = localStorage.getItem('noor_user');
      if (token && user) {
        router.push('/home');
        return;
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>

      {/* Animated background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(16,185,129,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(217,119,6,0.12) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(147,51,234,0.08) 0%, transparent 60%),
          #030712
        `,
      }} />

      {/* Decorative islamic pattern overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%2310B981' stroke-width='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z'/%3E%3Cpath d='M30 10L50 30L30 50L10 30Z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ═══════════════════════════════════ */}
        {/* HERO SECTION */}
        {/* ═══════════════════════════════════ */}
        <section style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 20px',
          position: 'relative',
        }}>

          {/* Floating decorations */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              fontSize: '20px',
              opacity: 0.15,
              animation: `float ${5 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}>
              {['🌙', '⭐', '✨', '🌟', '☪️', '💫'][i]}
            </div>
          ))}

          <div className="animate-fade-down" style={{ maxWidth: '700px', width: '100%' }}>

            {/* Logo */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 24px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '60px',
              boxShadow: '0 20px 60px rgba(16,185,129,0.4)',
              position: 'relative',
            }} className="animate-glow">
              ☪️
              <div style={{
                position: 'absolute', inset: '-8px',
                borderRadius: '36px',
                border: '2px solid rgba(16,185,129,0.3)',
                animation: 'pulse 3s ease-in-out infinite',
              }} />
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'Amiri, serif',
              fontSize: 'clamp(48px, 10vw, 80px)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 20px rgba(217,119,6,0.3))',
            }}>
              نور <span style={{
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>AI</span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 3vw, 22px)',
              color: '#E5E7EB',
              marginBottom: '12px',
              fontWeight: 600,
            }}>
              رفيقك الذكي في طريق الإيمان 🌙
            </p>

            <p style={{
              fontSize: 'clamp(13px, 2.5vw, 16px)',
              color: '#9CA3AF',
              lineHeight: 1.8,
              maxWidth: '500px',
              margin: '0 auto 36px',
            }}>
              تطبيق إسلامي شامل بأحدث التقنيات: قرآن كريم بـ 6 قراء،
              مساعد ذكاء اصطناعي، مكالمات صوتية ومرئية بين المؤمنين،
              ومجتمع رائع
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '40px',
            }}>
              <Link href="/auth/register" style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                borderRadius: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 12px 32px rgba(16,185,129,0.4)',
                transition: 'all 0.3s',
                border: 'none',
              }} className="cta-primary">
                ابدأ مجاناً الآن
                <ChevronLeft size={20} />
              </Link>

              <Link href="/auth/login" style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 700,
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                borderRadius: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
              }}>
                لدي حساب
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: '#9CA3AF',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color="#10B981" /> آمن 100%
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#FBBF24" /> سريع جداً
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} color="#60A5FA" /> مجاني للأبد
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#9CA3AF',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            animation: 'bounce 2s ease-in-out infinite',
          }}>
            <span>اكتشف المزيد</span>
            <span style={{ fontSize: '20px' }}>↓</span>
          </div>
        </section>

        {/* ═══════════════════════════════════ */}
        {/* FEATURES SECTION */}
        {/* ═══════════════════════════════════ */}
        <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge-gold" style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(217,119,6,0.15)',
              border: '1px solid rgba(217,119,6,0.3)',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#FBBF24',
              fontWeight: 700,
              marginBottom: '16px',
            }}>
              ✨ ميزات فريدة
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 6vw, 48px)',
              fontWeight: 900,
              marginBottom: '12px',
              color: '#fff',
            }}>
              كل ما تحتاجه في{' '}
              <span style={{
                background: 'linear-gradient(135deg, #10B981, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                تطبيق واحد
              </span>
            </h2>
            <p style={{ fontSize: '15px', color: '#9CA3AF' }}>
              تجربة إسلامية متكاملة لا تشبه أي تطبيق آخر
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: BookOpen, title: 'القرآن الكريم', desc: '114 سورة بأصوات 6 قراء مشاهير', color: '#10B981' },
              { icon: Bot, title: 'مساعد AI ذكي', desc: 'أجوبة فقهية وتفسير القرآن', color: '#67E8F9' },
              { icon: Phone, title: 'مكالمات صوتية', desc: 'تواصل مع إخوانك مجاناً', color: '#FBBF24' },
              { icon: Video, title: 'مكالمات فيديو', desc: 'مرئية عالية الجودة بـ WebRTC', color: '#F87171' },
              { icon: Clock, title: 'مواقيت الصلاة', desc: 'حسب موقعك بدقة عالية', color: '#60A5FA' },
              { icon: Compass, title: 'بوصلة القبلة', desc: 'اتجاه دقيق للقبلة', color: '#FB923C' },
              { icon: Heart, title: 'الأذكار', desc: 'حصن المسلم كاملاً', color: '#EC4899' },
              { icon: Sparkles, title: 'منبر الإمام', desc: 'إنشاء خطب الجمعة بـ AI', color: '#A855F7' },
              { icon: MessageCircle, title: 'مجتمع المؤمنين', desc: 'تشارك الخير مع الإخوة', color: '#34D399' },
            ].map((f, i) => (
              <div
                key={i}
                className="feature-card animate-fade-up"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  padding: '24px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-30px', right: '-30px',
                  width: '120px', height: '120px',
                  borderRadius: '50%',
                  background: f.color,
                  opacity: 0.08,
                  filter: 'blur(20px)',
                }} />
                <div style={{
                  width: '56px', height: '56px',
                  borderRadius: '16px',
                  background: `${f.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: f.color,
                  marginBottom: '16px',
                  position: 'relative',
                }}>
                  <f.icon size={26} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px', color: '#fff' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════ */}
        {/* STATS SECTION */}
        {/* ═══════════════════════════════════ */}
        <section style={{
          padding: '80px 20px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(217,119,6,0.05))',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '24px',
            padding: '40px 24px',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontSize: 'clamp(22px, 4vw, 32px)',
              fontWeight: 900,
              marginBottom: '32px',
              color: '#fff',
            }}>
              تطبيق يثق به آلاف المسلمين
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '24px',
            }}>
              {[
                { num: '114', label: 'سورة كاملة' },
                { num: '6', label: 'قراء مشاهير' },
                { num: '25', label: 'قصة نبي' },
                { num: '∞', label: 'محادثات' },
              ].map((s, i) => (
                <div key={i} className="animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div style={{
                    fontSize: 'clamp(32px, 6vw, 48px)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #10B981, #FBBF24)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}>
                    {s.num}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════ */}
        {/* BENEFITS SECTION */}
        {/* ═══════════════════════════════════ */}
        <section style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 900,
            textAlign: 'center',
            marginBottom: '40px',
            color: '#fff',
          }}>
            لماذا{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FBBF24, #D97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              نور AI؟
            </span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '🎯', title: 'مجاني تماماً', desc: 'كل الميزات بدون أي اشتراك أو إعلانات' },
              { icon: '🔒', title: 'خصوصية كاملة', desc: 'بياناتك مشفّرة وآمنة، لا نبيع أي معلومات' },
              { icon: '⚡', title: 'سريع وخفيف', desc: 'يعمل على أي جهاز وبأبطأ إنترنت' },
              { icon: '🌙', title: 'محتوى موثوق', desc: 'مصادر علمية إسلامية معتمدة' },
              { icon: '🤝', title: 'مجتمع متفاعل', desc: 'تواصل مع إخوانك من حول العالم' },
              { icon: '🎨', title: 'تصميم فاخر', desc: 'واجهة جميلة بتجربة استخدام مبهرة' },
            ].map((b, i) => (
              <div key={i} className="animate-fade-up" style={{
                animationDelay: `${i * 0.05}s`,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '18px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
              }}>
                <div style={{ fontSize: '32px', flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                    {b.desc}
                  </div>
                </div>
                <Check size={20} color="#10B981" style={{ marginInlineStart: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════ */}
        {/* FINAL CTA */}
        {/* ═══════════════════════════════════ */}
        <section style={{ padding: '80px 20px 60px', textAlign: 'center' }}>
          <div className="animate-fade-up" style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '50px 30px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(217,119,6,0.08))',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-50px', right: '-50px',
              width: '200px', height: '200px', borderRadius: '50%',
              background: '#10B981', opacity: 0.15, filter: 'blur(40px)',
            }} />
            <div style={{
              position: 'absolute', bottom: '-50px', left: '-50px',
              width: '200px', height: '200px', borderRadius: '50%',
              background: '#FBBF24', opacity: 0.15, filter: 'blur(40px)',
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                width: '70px', height: '70px',
                margin: '0 auto 20px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px',
                boxShadow: '0 12px 40px rgba(16,185,129,0.5)',
              }}>
                🌙
              </div>

              <h2 style={{
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: 900,
                marginBottom: '12px',
                color: '#fff',
              }}>
                ابدأ رحلتك الإيمانية الآن
              </h2>

              <p style={{
                fontSize: '14px',
                color: '#D1D5DB',
                marginBottom: '28px',
                lineHeight: 1.7,
              }}>
                انضم لآلاف المسلمين الذين يستخدمون نور AI يومياً
                <br />
                التسجيل مجاني، ولا تحتاج بطاقة ائتمان
              </p>

              <Link href="/auth/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 40px',
                fontSize: '17px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FBBF24, #D97706)',
                color: '#000',
                borderRadius: '20px',
                textDecoration: 'none',
                boxShadow: '0 12px 40px rgba(217,119,6,0.5)',
                transition: 'all 0.3s',
              }} className="cta-final">
                🚀 إنشاء حسابي المجاني
                <ChevronLeft size={22} />
              </Link>

              <p style={{
                fontSize: '11px',
                color: '#9CA3AF',
                marginTop: '20px',
              }}>
                ✨ بالتسجيل، توافق على شروط الاستخدام
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '30px 20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6B7280',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <p>صُنع بحبّ 💚 لخدمة المسلمين</p>
          <p style={{ marginTop: '6px' }}>نور AI © 2025 • SnetProDz</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(16,185,129,0.3) !important;
          background: rgba(255,255,255,0.05) !important;
        }
        .cta-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 16px 40px rgba(16,185,129,0.5);
        }
        .cta-final:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 16px 48px rgba(217,119,6,0.6);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #10B981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
