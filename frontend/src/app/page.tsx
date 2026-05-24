'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles, BookOpen, Clock, Compass, Heart, Bot,
  MessageSquare, ChevronLeft, Send, Stars, Zap,
  ArrowDown, Globe, Shield, Mic, Volume2, Brain
} from 'lucide-react';

// ════════════════════════════════════════════════════════
// أسئلة AI مقترحة
// ════════════════════════════════════════════════════════
const AI_SUGGESTIONS = [
  '🤲 ما فضل قراءة سورة الكهف يوم الجمعة؟',
  '📖 فسّر لي آية الكرسي بأسلوب مبسط',
  '🕌 ما هي شروط صحة الصلاة؟',
  '✨ أعطني خطة لقراءة القرآن في رمضان',
];

// ════════════════════════════════════════════════════════
// الخدمات
// ════════════════════════════════════════════════════════
const SERVICES = [
  { icon: BookOpen, title: 'القرآن الكريم', desc: '114 سورة بـ 6 قراء', color: '#10B981', delay: 0 },
  { icon: Bot, title: 'AI Tafsir', desc: 'تفسير ذكي مدعوم بـ AI', color: '#67E8F9', delay: 0.05 },
  { icon: Clock, title: 'مواقيت الصلاة', desc: 'بدقة GPS عالية', color: '#FBBF24', delay: 0.1 },
  { icon: Compass, title: 'القبلة', desc: 'بوصلة دقيقة', color: '#F87171', delay: 0.15 },
  { icon: Heart, title: 'الأذكار', desc: 'حصن المسلم كاملاً', color: '#EC4899', delay: 0.2 },
  { icon: MessageSquare, title: 'القصص', desc: '25 نبي وقصصهم', color: '#A855F7', delay: 0.25 },
  { icon: Sparkles, title: 'التسبيح الذكي', desc: 'مع تتبع الإحصائيات', color: '#FB923C', delay: 0.3 },
  { icon: Brain, title: 'مساعدك اليومي', desc: 'AI يفهمك ويوجهك', color: '#60A5FA', delay: 0.35 },
];

export default function PremiumLanding() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  // Auth check + setup
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

    const onMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [router]);

  // AI typing effect
  useEffect(() => {
    if (!isLoaded) return;
    const fullText = 'كيف يمكنني مساعدتك في رحلتك الإيمانية اليوم؟';
    let i = 0;
    setTypedText('');
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    // Cursor blink
    const cursorInterval = setInterval(() => setShowCursor(c => !c), 500);

    // Suggestion rotation
    const suggestInterval = setInterval(() => {
      setActiveSuggestion(p => (p + 1) % AI_SUGGESTIONS.length);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
      clearInterval(suggestInterval);
    };
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#000',
      }}>
        <div style={{
          width: 60, height: 60,
          border: '2px solid rgba(16,185,129,0.2)',
          borderTopColor: '#10B981',
          borderRadius: '50%',
          animation: 'noorSpin 0.8s linear infinite',
        }} />
        <style>{`@keyframes noorSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#000',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ═══════════════════════════════════════════ */}
      {/* CINEMATIC BACKGROUND */}
      {/* ═══════════════════════════════════════════ */}

      {/* Animated gradient mesh */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.15) 0%, transparent 50%),
          radial-gradient(at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(251,191,36,0.08) 0%, transparent 50%),
          radial-gradient(at 50% 100%, rgba(168,85,247,0.06) 0%, transparent 60%),
          #000000
        `,
        transition: 'background 0.5s',
      }} />

      {/* Geometric Islamic pattern - subtle */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%2310B981' stroke-width='0.5'%3E%3Cpath d='M40 0L80 40L40 80L0 40Z'/%3E%3Cpath d='M40 15L65 40L40 65L15 40Z'/%3E%3Cpath d='M40 25L55 40L40 55L25 40Z'/%3E%3Ccircle cx='40' cy='40' r='5'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => {
        const size = 1 + Math.random() * 3;
        return (
          <div key={i} style={{
            position: 'fixed',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: i % 3 === 0 ? '#10B981' : i % 3 === 1 ? '#FBBF24' : '#fff',
            opacity: 0.4,
            animation: `floatUp ${15 + Math.random() * 20}s linear infinite`,
            animationDelay: `${Math.random() * 20}s`,
            zIndex: 1,
            pointerEvents: 'none',
            boxShadow: `0 0 ${size * 4}px currentColor`,
          }} />
        );
      })}

      {/* ═══════════════════════════════════════════ */}
      {/* NAVIGATION */}
      {/* ═══════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        padding: '12px 24px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 4px 16px rgba(16,185,129,0.5)',
          }}>
            ☪
          </div>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '17px', fontWeight: 700 }}>
            نور <span style={{
              background: 'linear-gradient(135deg, #FBBF24, #D97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>AI</span>
          </div>
        </div>
        <Link href="/auth/login" style={{
          fontSize: '13px',
          color: '#9CA3AF',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }} className="nav-link">دخول</Link>
        <Link href="/auth/register" style={{
          padding: '8px 18px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#fff',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
        }}>
          ابدأ مجاناً
        </Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 1 — CINEMATIC HERO */}
        {/* ═══════════════════════════════════════════ */}
        <section style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 20px 60px',
          position: 'relative',
        }}>

          {/* Mega glow behind logo */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 60%)',
            filter: 'blur(60px)',
            animation: 'megaGlow 6s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          <div style={{
            textAlign: 'center',
            position: 'relative',
            maxWidth: '900px',
            width: '100%',
          }}>

            {/* AI Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px',
              fontSize: '11px',
              color: '#D1D5DB',
              marginBottom: '30px',
              animation: 'slideDown 1s 0.2s both',
            }}>
              <Sparkles size={12} color="#FBBF24" />
              <span>مدعوم بـ Claude AI من Anthropic</span>
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 8px #10B981',
                animation: 'pulse 2s infinite',
              }} />
            </div>

            {/* Premium logo */}
            <div style={{
              width: 'clamp(100px, 16vw, 130px)',
              height: 'clamp(100px, 16vw, 130px)',
              margin: '0 auto 32px',
              position: 'relative',
              animation: 'fadeIn 1s 0.3s both',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(50px, 8vw, 64px)',
                boxShadow: '0 20px 80px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                animation: 'logoFloat 4s ease-in-out infinite',
              }}>
                ☪️
              </div>
              {/* Orbiting dots */}
              {[0, 120, 240].map((deg, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  inset: '-20px',
                  borderRadius: '50%',
                  animation: `orbit 8s linear infinite`,
                  animationDelay: `${i * -2.67}s`,
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-4px', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    background: ['#FBBF24', '#10B981', '#67E8F9'][i],
                    boxShadow: `0 0 12px currentColor`,
                  }} />
                </div>
              ))}
            </div>

            {/* MEGA TITLE */}
            <h1 style={{
              fontSize: 'clamp(40px, 8vw, 84px)',
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: '16px',
              letterSpacing: '-2px',
              animation: 'fadeUp 1s 0.5s both',
            }}>
              <span style={{
                background: 'linear-gradient(180deg, #fff 0%, #888 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                رفيقك الإسلامي
              </span>
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #10B981 0%, #FBBF24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 10px 30px rgba(16,185,129,0.4))',
              }}>
                المدعوم بـ AI
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2.5vw, 19px)',
              color: '#9CA3AF',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: 1.7,
              animation: 'fadeUp 1s 0.7s both',
            }}>
              منصة إسلامية ذكية تجمع القرآن الكريم، الصلاة، الأذكار،
              والذكاء الاصطناعي في تجربة عالمية مبهرة 🌙
            </p>

            {/* Premium CTAs */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '60px',
              animation: 'fadeUp 1s 0.9s both',
            }}>
              <Link href="/auth/register" className="cta-primary" style={{
                padding: '16px 32px',
                fontSize: '15px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                borderRadius: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 16px 48px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s',
              }}>
                <Sparkles size={18} />
                ابدأ رحلتك
              </Link>

              <a href="#ai-section" className="cta-secondary" style={{
                padding: '16px 32px',
                fontSize: '15px',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                color: '#fff',
                borderRadius: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }}>
                <Bot size={18} />
                اسأل نور AI
              </a>

              <Link href="/quran" style={{
                padding: '16px 32px',
                fontSize: '15px',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                color: '#fff',
                borderRadius: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }} className="cta-secondary">
                <BookOpen size={18} />
                اقرأ القرآن
              </Link>
            </div>

            {/* Trust signals */}
            <div style={{
              display: 'flex',
              gap: '32px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '12px',
              color: '#6B7280',
              animation: 'fadeUp 1s 1.1s both',
            }}>
              {[
                { icon: Shield, text: 'آمن ومشفّر' },
                { icon: Zap, text: 'سريع جداً' },
                { icon: Globe, text: 'متاح عالمياً' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <t.icon size={14} color="#10B981" />
                  {t.text}
                </div>
              ))}
            </div>

            {/* Scroll hint */}
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#6B7280',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              animation: 'bounce 2s infinite',
            }}>
              <span>اكتشف نور AI</span>
              <ArrowDown size={14} />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 2 — AI ASSISTANT SHOWCASE */}
        {/* ═══════════════════════════════════════════ */}
        <section id="ai-section" style={{
          padding: '120px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(103,232,249,0.1)',
              border: '1px solid rgba(103,232,249,0.3)',
              borderRadius: '999px',
              fontSize: '11px',
              color: '#67E8F9',
              fontWeight: 700,
              marginBottom: '20px',
            }}>
              <Bot size={12} />
              مساعد AI
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '16px',
              letterSpacing: '-1px',
            }}>
              تحدث مع
              <span style={{
                background: 'linear-gradient(135deg, #67E8F9, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginInlineStart: '14px',
              }}>
                نور AI
              </span>
            </h2>
            <p style={{ fontSize: '16px', color: '#9CA3AF', maxWidth: '500px', margin: '0 auto' }}>
              مساعد إسلامي ذكي يجيب على أسئلتك بأدب وبأدلة من القرآن والسنة
            </p>
          </div>

          {/* Premium chat mockup */}
          <div style={{
            maxWidth: '720px',
            margin: '0 auto',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 40px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            backdropFilter: 'blur(40px)',
          }}>
            {/* Chat header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                position: 'relative',
                boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
              }}>
                <Bot size={18} color="#fff" />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px', right: '-2px',
                  width: '12px', height: '12px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '2px solid #111',
                  boxShadow: '0 0 8px #10B981',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>نور AI</div>
                <div style={{ fontSize: '11px', color: '#10B981' }}>
                  ● مستعد للإجابة
                </div>
              </div>
              <div style={{
                padding: '4px 10px',
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: '999px',
                fontSize: '10px',
                color: '#FBBF24',
              }}>
                ✨ AI
              </div>
            </div>

            {/* Messages */}
            <div style={{
              padding: '24px',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {/* AI message - greeting */}
              <div style={{
                alignSelf: 'flex-start',
                maxWidth: '85%',
                padding: '14px 18px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '20px 20px 20px 6px',
                fontSize: '14px',
                color: '#E5E7EB',
                lineHeight: 1.7,
              }}>
                السلام عليكم ورحمة الله وبركاته 🌙
                <br />
                {typedText}
                {showCursor && (
                  <span style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '14px',
                    background: '#10B981',
                    marginInlineStart: '2px',
                    verticalAlign: 'middle',
                  }} />
                )}
              </div>

              {/* Suggested questions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '8px',
              }}>
                <div style={{ fontSize: '11px', color: '#6B7280', paddingInlineStart: '4px' }}>
                  ✨ اقتراحات للبداية:
                </div>
                {AI_SUGGESTIONS.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      background: i === activeSuggestion
                        ? 'rgba(103,232,249,0.1)'
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${i === activeSuggestion ? 'rgba(103,232,249,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '14px',
                      fontSize: '13px',
                      color: i === activeSuggestion ? '#fff' : '#9CA3AF',
                      cursor: 'pointer',
                      transition: 'all 0.4s',
                      transform: i === activeSuggestion ? 'translateX(-4px)' : 'translateX(0)',
                    }}
                  >
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Input bar */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}>
              <div style={{
                flex: 1,
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                fontSize: '13px',
                color: '#6B7280',
              }}>
                اكتب سؤالك...
              </div>
              <button style={{
                width: '40px', height: '40px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Mic size={16} />
              </button>
              <button style={{
                width: '40px', height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
              }}>
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* CTA to try */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/auth/register" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #67E8F9, #06B6D4)',
              color: '#000',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 12px 32px rgba(103,232,249,0.4)',
            }} className="cta-primary">
              <Sparkles size={16} />
              جرّب نور AI الآن
              <ChevronLeft size={16} />
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 3 — SERVICES GRID */}
        {/* ═══════════════════════════════════════════ */}
        <section style={{
          padding: '120px 20px',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '70px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '999px',
              fontSize: '11px',
              color: '#FBBF24',
              fontWeight: 700,
              marginBottom: '20px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              ✨ خدمات شاملة
            </div>
            <h2 style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '16px',
              letterSpacing: '-1px',
            }}>
              كل ما تحتاجه
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #10B981, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                في منصة واحدة
              </span>
            </h2>
            <p style={{ fontSize: '16px', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto' }}>
              تجربة إسلامية متكاملة بتقنيات حديثة، صُممت بعناية لتكون رفيقك اليومي
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {SERVICES.map((s, i) => (
              <div
                key={i}
                className="service-card"
                style={{
                  padding: '28px 24px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Glow background */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `radial-gradient(circle at top right, ${s.color}22 0%, transparent 50%)`,
                  pointerEvents: 'none',
                  opacity: 0.6,
                }} />

                {/* Icon */}
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  marginBottom: '18px',
                  position: 'relative',
                  boxShadow: `0 12px 32px ${s.color}55`,
                }}>
                  <s.icon size={24} strokeWidth={1.8} />
                </div>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '6px',
                  position: 'relative',
                }}>
                  {s.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#9CA3AF',
                  lineHeight: 1.6,
                  position: 'relative',
                }}>
                  {s.desc}
                </p>

                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  insetInlineEnd: '20px',
                  opacity: 0.3,
                  transition: 'all 0.4s',
                }} className="service-arrow">
                  <ChevronLeft size={18} color={s.color} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* PRE-FOOTER CTA */}
        {/* ═══════════════════════════════════════════ */}
        <section style={{ padding: '60px 20px 100px' }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: 'clamp(40px, 8vw, 80px) clamp(24px, 5vw, 60px)',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(251,191,36,0.05))',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
          }}>
            {/* Glow effects */}
            <div style={{
              position: 'absolute',
              top: '-100px', right: '-100px',
              width: '400px', height: '400px',
              borderRadius: '50%',
              background: '#10B981',
              opacity: 0.15,
              filter: 'blur(80px)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-100px', left: '-100px',
              width: '400px', height: '400px',
              borderRadius: '50%',
              background: '#FBBF24',
              opacity: 0.1,
              filter: 'blur(80px)',
            }} />

            <div style={{ position: 'relative' }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px',
                filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.5))',
              }}>
                🌙
              </div>
              <h2 style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 800,
                marginBottom: '14px',
                letterSpacing: '-1px',
                lineHeight: 1.2,
              }}>
                ابدأ رحلتك الإيمانية
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #10B981, #FBBF24)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  مع نور AI
                </span>
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#D1D5DB',
                marginBottom: '32px',
                lineHeight: 1.7,
              }}>
                انضم لآلاف المسلمين الذين يستخدمون نور AI يومياً
                <br />
                <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
                  ✨ مجاني تماماً • بدون إعلانات • لا يحتاج بطاقة ائتمان
                </span>
              </p>
              <Link href="/auth/register" className="cta-primary" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 40px',
                fontSize: '16px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                borderRadius: '16px',
                textDecoration: 'none',
                boxShadow: '0 20px 60px rgba(16,185,129,0.5)',
                transition: 'all 0.3s',
              }}>
                <Sparkles size={18} />
                إنشاء حساب مجاني
                <ChevronLeft size={18} />
              </Link>
            </div>
          </div>
        </section>

        <footer style={{
          padding: '40px 20px 30px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6B7280',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <p style={{ marginBottom: '8px' }}>
            صُنع بحبّ 💚 لخدمة المسلمين
          </p>
          <p>نور AI © 2025 • SnetProDz</p>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes megaGlow {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        
        .nav-link:hover { color: #fff !important; }
        
        .cta-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 24px 60px rgba(16,185,129,0.6) !important;
        }
        .cta-secondary:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        
        .service-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,255,255,0.15) !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) !important;
        }
        .service-card:hover .service-arrow {
          opacity: 1 !important;
          transform: translateX(-4px);
        }
      `}</style>
    </div>
  );
}
