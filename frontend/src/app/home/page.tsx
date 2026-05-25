'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Bot, Phone, Clock, Compass, Heart,
  Users, Sparkles, MessageCircle, Star, ChevronLeft,
  LogOut, Send, Sun, Moon, Volume2
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [time, setTime] = useState('');
  const [daily, setDaily] = useState<any>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe(u);
    } catch { router.push('/auth/login'); }

    const updateTime = () => {
      try {
        setTime(new Date().toLocaleDateString('ar-SA', {
          weekday: 'long', day: 'numeric', month: 'long', calendar: 'islamic-umalqura'
        } as any));
      } catch { setTime(new Date().toLocaleDateString('ar')); }
    };
    updateTime();
    const t = setInterval(updateTime, 60000);

    // Fetch daily content
    fetch(API + '/daily')
      .then(r => r.json())
      .then(d => { if (d.success) setDaily(d); })
      .catch(() => {});

    return () => clearInterval(t);
  }, []);

  const logout = () => {
    localStorage.removeItem('noor_token');
    localStorage.removeItem('noor_user');
    router.push('/');
  };

  if (!me) {
    return (
      <div style={{ minHeight: '100dvh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const features = [
    { href: '/rooms', icon: Users, title: 'غرف الدردشة', desc: 'موضوعية + مكالمات جماعية', color: '#A855F7', badge: 'جديد ⭐' },
    { href: '/chat', icon: MessageCircle, title: 'الدردشة الخاصة', desc: 'رسائل مع المؤمنين', color: '#EC4899' },
    { href: '/quran', icon: BookOpen, title: 'القرآن الكريم', desc: '114 سورة بـ 6 قراء', color: '#10B981' },
    { href: '/ai', icon: Bot, title: 'مساعد AI', desc: 'فقه وتفسير', color: '#67E8F9' },
    { href: '/prayer', icon: Clock, title: 'أوقات الصلاة', desc: 'دقيقة بحسب موقعك', color: '#F87171' },
    { href: '/qibla', icon: Compass, title: 'بوصلة القبلة', desc: 'GPS عالي الدقة', color: '#FBBF24' },
    { href: '/adhkar', icon: Heart, title: 'الأذكار', desc: 'حصن المسلم', color: '#34D399' },
    { href: '/tasbih', icon: Sparkles, title: 'التسبيح', desc: 'سبحة رقمية', color: '#60A5FA' },
    { href: '/stories', icon: Star, title: 'قصص الأنبياء', desc: '25 قصة بالصوت 🔊', color: '#FB923C', badge: 'صوت 🎙️' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: '#000', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,0.08) 0%, transparent 50%),
          #000
        `,
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 16px 100px',
        maxWidth: '1200px', margin: '0 auto',
      }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '50px', height: '50px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${me.color || '#10B981'}, ${(me.color || '#10B981')}aa)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 900,
              boxShadow: `0 8px 24px ${me.color || '#10B981'}66`,
            }}>
              {me.avatar || me.name?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>السلام عليكم 🌙</div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{me.name}</div>
            </div>
          </div>

          <button onClick={logout} style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <LogOut size={18} />
          </button>
        </header>

        {/* Hijri date */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(217,119,6,0.05))',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '16px',
          marginBottom: '18px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>🕌 اليوم</div>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '17px', fontWeight: 700, color: '#FBBF24' }}>{time}</div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* آية اليوم - DAILY VERSE */}
        {/* ═══════════════════════════════════════ */}
        {daily?.verse && (
          <div style={{
            padding: '22px 20px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '20px',
            marginBottom: '14px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '150px', height: '150px',
              borderRadius: '50%', background: '#10B981',
              opacity: 0.1, filter: 'blur(40px)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', position: 'relative' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>📖</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#10B981' }}>آية اليوم</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>تأمّل في كلام الله</div>
              </div>
            </div>

            <p style={{
              fontFamily: 'Amiri, serif',
              fontSize: '22px',
              lineHeight: 1.8,
              textAlign: 'center',
              color: '#fff',
              marginBottom: '10px',
              fontWeight: 700,
            }}>
              {daily.verse.text}
            </p>

            <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>
              📍 سورة {daily.verse.surah} • الآية {daily.verse.ayah}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* حديث اليوم - DAILY HADITH */}
        {/* ═══════════════════════════════════════ */}
        {daily?.hadith && (
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: '20px',
            marginBottom: '14px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30px', left: '-30px',
              width: '150px', height: '150px',
              borderRadius: '50%', background: '#FBBF24',
              opacity: 0.1, filter: 'blur(40px)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', position: 'relative' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #FBBF24, #D97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>📜</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FBBF24' }}>حديث اليوم</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>من السنة النبوية</div>
              </div>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: 1.8,
              color: '#fff',
              marginBottom: '12px',
              fontWeight: 600,
              fontStyle: 'italic',
            }}>
              "{daily.hadith.text}"
            </p>

            <div style={{
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(251,191,36,0.2)',
              marginBottom: '10px',
            }}>
              <p style={{ fontSize: '12px', color: '#D1D5DB', lineHeight: 1.6 }}>
                💡 {daily.hadith.explanation}
              </p>
            </div>

            <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'left' }}>
              📖 رواه {daily.hadith.narrator}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* حكمة اليوم - DAILY WISDOM */}
        {/* ═══════════════════════════════════════ */}
        {daily?.wisdom && (
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04))',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '20px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '150px', height: '150px',
              borderRadius: '50%', background: '#A855F7',
              opacity: 0.1, filter: 'blur(40px)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', position: 'relative' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>💡</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#A855F7' }}>حكمة اليوم</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>كلمات نافعة</div>
              </div>
            </div>

            <p style={{
              fontFamily: 'Amiri, serif',
              fontSize: '20px',
              lineHeight: 1.7,
              textAlign: 'center',
              color: '#fff',
              marginBottom: '10px',
              fontWeight: 600,
            }}>
              ❝ {daily.wisdom.text} ❞
            </p>

            <p style={{ fontSize: '12px', color: '#A855F7', textAlign: 'center', fontWeight: 700 }}>
              — {daily.wisdom.author}
            </p>
          </div>
        )}

        {/* ROOMS BIG CTA */}
        <Link href="/rooms" style={{
          display: 'block',
          padding: '22px',
          background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
          borderRadius: '20px',
          marginBottom: '24px',
          textDecoration: 'none',
          color: '#fff',
          boxShadow: '0 16px 40px rgba(168,85,247,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }} className="rooms-banner">
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '180px', height: '180px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
            filter: 'blur(40px)',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            <div style={{
              width: '56px', height: '56px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={26} color="#fff" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>غرف الدردشة الجماعية</h3>
                <span style={{
                  padding: '3px 8px',
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: '999px',
                  fontSize: '9px', fontWeight: 700,
                }}>جديد + مكالمات 📹</span>
              </div>
              <p style={{ fontSize: '11px', opacity: 0.9 }}>
                8 غرف موضوعية + مكالمات جماعية بالفيديو
              </p>
            </div>

            <ChevronLeft size={22} color="#fff" />
          </div>
        </Link>

        {/* Section title */}
        <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px' }}>
          ✨ كل الميزات
        </h2>

        {/* Features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}>
          {features.map((f, i) => (
            <Link key={i} href={f.href} className="feature-tile" style={{
              padding: '18px 14px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              textDecoration: 'none',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s',
            }}>
              {f.badge && (
                <div style={{
                  position: 'absolute', top: '10px', left: '10px',
                  padding: '3px 7px',
                  background: `${f.color}33`,
                  border: `1px solid ${f.color}66`,
                  borderRadius: '999px',
                  fontSize: '8px', color: f.color, fontWeight: 700,
                }}>{f.badge}</div>
              )}

              <div style={{
                width: '42px', height: '42px',
                borderRadius: '12px',
                background: `${f.color}22`,
                border: `1px solid ${f.color}44`,
                color: f.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <f.icon size={20} />
              </div>

              <h3 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '3px' }}>{f.title}</h3>
              <p style={{ fontSize: '10px', color: '#9CA3AF', lineHeight: 1.4 }}>{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .feature-tile:hover {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.15) !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) !important;
        }
        .rooms-banner:hover {
          transform: translateY(-2px) scale(1.01);
        }
      `}</style>
    </div>
  );
}
