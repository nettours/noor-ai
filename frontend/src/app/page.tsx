'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot, ChevronRight, Send, Sparkles, Star,
  Facebook, Twitter, Instagram, Mail,
} from 'lucide-react';
import {
  SUGGESTED_Q, SERVICES, TESTIMONIALS, STATS, FEATURES,
} from '@/content/landing';
import { Hero } from '@/components/landing/Hero';
import { Reflections } from '@/components/landing/Reflections';

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function NoorAIPremium() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [aiTyping, setAiTyping] = useState('');
  const [activeQ, setActiveQ] = useState(0);
  const [stats, setStats] = useState([0, 0, 0, 0]);
  const [statsAnimated, setStatsAnimated] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const user = localStorage.getItem('noor_user');
      if (token && user) { router.push('/home'); return; }
    } catch {}
    setIsLoaded(true);
  }, [router]);

  // AI typing animation
  useEffect(() => {
    if (!isLoaded) return;
    const q = SUGGESTED_Q[activeQ];
    let i = 0;
    setAiTyping('');
    const typing = setInterval(() => {
      if (i < q.length) {
        setAiTyping(q.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
        setTimeout(() => setActiveQ(prev => (prev + 1) % SUGGESTED_Q.length), 2500);
      }
    }, 70);
    return () => clearInterval(typing);
  }, [activeQ, isLoaded]);

  // Stats counter animation
  useEffect(() => {
    if (!isLoaded || statsAnimated) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsAnimated(true);
          STATS.forEach((s, i) => {
            const duration = 2000;
            const steps = 60;
            const inc = s.num / steps;
            let curr = 0;
            const step = setInterval(() => {
              curr += inc;
              if (curr >= s.num) {
                curr = s.num;
                clearInterval(step);
              }
              setStats(prev => {
                const next = [...prev];
                next[i] = Math.floor(curr);
                return next;
              });
            }, duration / steps);
          });
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, [isLoaded, statsAnimated]);

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

  return (
    <div style={{
      background: '#000',
      color: '#fff',
      minHeight: '100dvh',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* GLOBAL GRADIENT BG */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 70%, rgba(217,119,6,0.08) 0%, transparent 50%),
          #000
        `,
      }} />

      {/* Islamic pattern */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        opacity: 0.02,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%2310B981' stroke-width='0.8'%3E%3Cpath d='M40 5L75 40L40 75L5 40Z'/%3E%3Cpath d='M40 15L65 40L40 65L15 40Z'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />

      {/* TOP NAV */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
          }}>☪️</div>
          <div>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: '19px', fontWeight: 700, lineHeight: 1 }}>
              نور <span style={{ color: '#FBBF24' }}>AI</span>
            </div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>رفيقك الإيماني</div>
          </div>
        </div>

        <Link href="/auth/login" style={{
          padding: '9px 18px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#fff',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
        }}>
          ابدأ الآن
        </Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ═══════════════════════════════════════ */}
        {/* SECTION 1: HERO */}
        {/* ═══════════════════════════════════════ */}
        <Hero />

        {/* ═══════════════════════════════════════ */}
        {/* SECTION 2: AI ASSISTANT SHOWCASE */}
        {/* ═══════════════════════════════════════ */}
        <section style={{
          padding: '100px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(103,232,249,0.1)',
              border: '1px solid rgba(103,232,249,0.3)',
              borderRadius: '999px',
              fontSize: '12px',
              color: '#67E8F9',
              fontWeight: 700,
              marginBottom: '20px',
            }}>
              <Bot size={12} style={{ display: 'inline', marginInlineEnd: '6px', verticalAlign: 'middle' }} />
              NOOR AI ASSISTANT
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              marginBottom: '14px',
              lineHeight: 1.1,
            }}>
              مساعدك الإسلامي
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                مدعوم بـ AI
              </span>
            </h2>
            <p style={{ fontSize: '15px', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto' }}>
              اسأل أي سؤال شرعي، فقهي، أو روحاني — يجيبك مساعد ذكي مدرّب على المصادر الإسلامية
            </p>
          </div>

          {/* AI Chat Mockup */}
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(103,232,249,0.15)',
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 22px',
              background: 'rgba(0,0,0,0.4)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '38px', height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #67E8F9, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(103,232,249,0.4)',
              }}>
                <Bot size={20} color="#000" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Noor AI</div>
                <div style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
                  متصل • جاهز للإجابة
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: '22px', minHeight: '240px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff',
                  borderRadius: '16px 16px 4px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  minHeight: '20px',
                }}>
                  {aiTyping || '...'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#D1D5DB',
                  borderRadius: '16px 16px 16px 4px',
                  fontSize: '14px',
                  lineHeight: 1.7,
                }}>
                  {aiTyping && aiTyping.length === SUGGESTED_Q[activeQ].length ? (
                    <span style={{ color: '#67E8F9' }}>✨ يكتب نور AI الإجابة...</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: '7px', height: '7px',
                          borderRadius: '50%',
                          background: '#67E8F9',
                          animation: `pulse 1s ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Suggested questions */}
            <div style={{
              padding: '0 22px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              {SUGGESTED_Q.map((q, i) => (
                <button
                  key={i}
                  onClick={() => router.push('/auth/login?tab=register')}
                  style={{
                    padding: '8px 14px',
                    background: i === activeQ ? 'rgba(103,232,249,0.15)' : 'rgba(255,255,255,0.03)',
                    border: i === activeQ ? '1px solid rgba(103,232,249,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '999px',
                    fontSize: '12px',
                    color: i === activeQ ? '#67E8F9' : '#9CA3AF',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontFamily: 'inherit',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{
              padding: '14px 22px',
              background: 'rgba(0,0,0,0.4)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '999px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#6B7280',
              }}>
                اسأل نور AI أي شيء...
              </div>
              <div style={{
                width: '38px', height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #67E8F9, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(103,232,249,0.4)',
              }}>
                <Send size={16} color="#000" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* SECTION 3: SERVICES GRID (8 cards) */}
        {/* ═══════════════════════════════════════ */}
        <section style={{
          padding: '80px 20px',
          maxWidth: '1280px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(217,119,6,0.1)',
              border: '1px solid rgba(217,119,6,0.3)',
              borderRadius: '999px',
              fontSize: '12px',
              color: '#FBBF24',
              fontWeight: 700,
              marginBottom: '20px',
            }}>
              ✨ خدمات شاملة
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              marginBottom: '14px',
              lineHeight: 1.1,
            }}>
              كل ما يحتاجه المسلم
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #10B981 0%, #FBBF24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                في مكان واحد
              </span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="service-card"
                  style={{
                    padding: '26px 22px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div className="card-glow" style={{
                    position: 'absolute',
                    top: '-50px', right: '-50px',
                    width: '180px', height: '180px',
                    borderRadius: '50%',
                    background: s.color,
                    opacity: 0.08,
                    filter: 'blur(40px)',
                    transition: 'opacity 0.4s',
                  }} />

                  <div className="card-icon" style={{
                    width: '54px', height: '54px',
                    borderRadius: '14px',
                    background: `${s.color}1a`,
                    border: `1px solid ${s.color}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: s.color,
                    marginBottom: '16px',
                    position: 'relative',
                    transition: 'all 0.4s',
                  }}>
                    <Icon size={26} />
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px', position: 'relative' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.6, position: 'relative' }}>
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* SECTION 3.5: تأملات نور (public reflections) */}
        {/* ═══════════════════════════════════════ */}
        <Reflections />

        {/* ═══════════════════════════════════════ */}
        {/* SECTION 4: STATS COUNTERS */}
        {/* ═══════════════════════════════════════ */}
        <section ref={statsRef} style={{ padding: '80px 20px' }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '50px 30px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(217,119,6,0.05))',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '28px',
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
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 900,
              marginBottom: '36px',
              position: 'relative',
            }}>
              نُحدث فرقاً
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #10B981, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                في حياة المسلمين
              </span>
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '20px',
              position: 'relative',
            }}>
              {STATS.map((s, i) => (
                <div key={i}>
                  <div style={{
                    fontSize: 'clamp(36px, 7vw, 60px)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #10B981, #FBBF24)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}>
                    {stats[i].toLocaleString()}{s.suffix}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* SECTION 5: FEATURES */}
        {/* ═══════════════════════════════════════ */}
        <section style={{
          padding: '80px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '999px',
              fontSize: '12px',
              color: '#10B981',
              fontWeight: 700,
              marginBottom: '20px',
            }}>
              ⚡ مميزات حصرية
            </div>
            <h2 style={{
              fontSize: 'clamp(30px, 5vw, 46px)',
              fontWeight: 900,
              marginBottom: '14px',
              lineHeight: 1.1,
            }}>
              لماذا نور AI؟
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '14px',
          }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: `${f.color}1a`,
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                      {f.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: 1.5 }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* SECTION 6: TESTIMONIALS */}
        {/* ═══════════════════════════════════════ */}
        <section style={{
          padding: '80px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '999px',
              fontSize: '12px',
              color: '#FBBF24',
              fontWeight: 700,
              marginBottom: '20px',
            }}>
              ⭐ شهادات المستخدمين
            </div>
            <h2 style={{
              fontSize: 'clamp(30px, 5vw, 46px)',
              fontWeight: 900,
              marginBottom: '14px',
              lineHeight: 1.1,
            }}>
              يحبه آلاف المسلمين
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: '26px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  position: 'relative',
                }}
              >
                <div style={{
                  fontSize: '40px',
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  color: t.color,
                  opacity: 0.3,
                }}>"</div>

                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {[0, 1, 2, 3, 4].map(s => (
                    <Star key={s} size={14} fill="#FBBF24" color="#FBBF24" />
                  ))}
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#D1D5DB',
                  lineHeight: 1.7,
                  marginBottom: '20px',
                  minHeight: '70px',
                }}>
                  {t.text}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.color}, ${t.color}aa)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 900,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* FINAL CTA */}
        {/* ═══════════════════════════════════════ */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '60px 30px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(217,119,6,0.1))',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-80px', left: '-80px',
              width: '280px', height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,0.3), transparent)',
              filter: 'blur(50px)',
            }} />

            <div style={{ position: 'relative' }}>
              <div style={{
                width: '80px', height: '80px',
                margin: '0 auto 24px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px',
                boxShadow: '0 24px 60px rgba(16,185,129,0.5)',
                animation: 'noorFloat 4s ease-in-out infinite',
              }}>🌙</div>

              <h2 style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '14px',
              }}>
                ابدأ رحلتك الإيمانية
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #FBBF24, #D97706)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>الآن</span>
              </h2>

              <p style={{ fontSize: '14px', color: '#D1D5DB', marginBottom: '28px', lineHeight: 1.7 }}>
                انضم لآلاف المسلمين حول العالم
                <br />
                مجاني تماماً • بدون إعلانات
              </p>

              <Link href="/auth/login?tab=register" className="hero-cta-main" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 40px',
                fontSize: '16px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                borderRadius: '18px',
                textDecoration: 'none',
                boxShadow: '0 20px 50px rgba(16,185,129,0.5)',
              }}>
                <Sparkles size={20} />
                إنشاء حساب مجاني
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════ */}
        <footer style={{
          padding: '60px 20px 30px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.4)',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '40px',
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>☪️</div>
                <span style={{ fontFamily: 'Amiri, serif', fontSize: '22px', fontWeight: 700 }}>
                  نور <span style={{ color: '#FBBF24' }}>AI</span>
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '16px' }}>
                منصة إسلامية ذكية شاملة لخدمة المسلمين حول العالم
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[Facebook, Twitter, Instagram, Mail].map((I, i) => (
                  <a key={i} href="#" style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#9CA3AF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }} className="social-icon">
                    <I size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: '#fff' }}>المنصة</h4>
              {['الميزات', 'القرآن', 'الصلاة', 'غرف الدردشة'].map(l => (
                <a key={l} href="#" style={{
                  display: 'block', fontSize: '13px', color: '#9CA3AF',
                  textDecoration: 'none', marginBottom: '10px',
                  transition: 'color 0.2s',
                }} className="footer-link">{l}</a>
              ))}
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: '#fff' }}>الشركة</h4>
              {['عن نور AI', 'تواصل معنا', 'الخصوصية', 'الشروط'].map(l => (
                <a key={l} href="#" style={{
                  display: 'block', fontSize: '13px', color: '#9CA3AF',
                  textDecoration: 'none', marginBottom: '10px',
                }} className="footer-link">{l}</a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: '#fff' }}>النشرة البريدية</h4>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' }}>
                اشترك للحصول على آخر التحديثات
              </p>
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#fff',
                    outline: 'none',
                    direction: 'rtl',
                    fontFamily: 'inherit',
                  }}
                />
                <button style={{
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}>اشترك</button>
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: '12px',
            color: '#6B7280',
          }}>
            <p style={{ marginBottom: '14px' }}>صُنع بإحسان 💚 لخدمة المسلمين حول العالم</p>

            {/* ── Brand identity / signature ── */}
            <div style={{
              display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center',
              justifyContent: 'center', gap: '8px 14px',
              padding: '14px 22px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ color: '#9CA3AF' }}>
                نور <span style={{ color: '#FBBF24', fontWeight: 700 }}>AI</span> © {new Date().getFullYear()}
              </span>

              <span style={{ color: '#374151' }}>•</span>

              <a
                href="https://www.snetprodz.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  textDecoration: 'none', color: '#9CA3AF',
                }}
              >
                <span style={{ color: '#6B7280' }}>منتج من</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 11px', borderRadius: '999px',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.14), rgba(217,119,6,0.10))',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontWeight: 800, fontSize: '12.5px', letterSpacing: '0.3px',
                  direction: 'ltr', unicodeBidi: 'isolate',
                }}>
                  <span style={{ color: '#F5F1E8' }}>SNet</span><span style={{ color: '#FBBF24' }}>Pro</span><span style={{ color: '#34D399' }}>Dz</span>
                </span>
              </a>
            </div>

            <p style={{ marginTop: '12px', color: '#6B7280' }}>
              تطوير وتصميم:{' '}
              <span style={{ color: '#D4D8DD', fontWeight: 600 }}>ساخي عبد الرحمن</span>
              <span style={{ color: '#4B5563' }}> · </span>
              <span style={{ color: '#9CA3AF', fontWeight: 600, direction: 'ltr', display: 'inline-block' }}>Sakhi Abderrahmane</span>
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes noorSpin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .nav-arrow:hover {
          background: rgba(255,255,255,0.15) !important;
          transform: translateY(-50%) scale(1.1) !important;
        }
        .hero-cta-main:hover {
          transform: translateY(-2px) scale(1.02);
        }
        .hero-cta-sec:hover {
          background: rgba(255,255,255,0.1) !important;
          transform: translateY(-2px);
        }
        .service-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,255,255,0.15) !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) !important;
        }
        .service-card:hover .card-glow {
          opacity: 0.25 !important;
        }
        .service-card:hover .card-icon {
          transform: scale(1.1) rotate(5deg);
        }
        .social-icon:hover {
          background: rgba(16,185,129,0.2) !important;
          color: #10B981 !important;
          transform: translateY(-2px);
        }
        .footer-link:hover {
          color: #10B981 !important;
        }
      `}</style>
    </div>
  );
}
