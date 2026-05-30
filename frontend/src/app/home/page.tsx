'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Bot, Clock, Compass, Heart, Users, Sparkles,
  MessageCircle, Star, ChevronLeft, LogOut, Volume2, Pause
} from 'lucide-react';
import { useI18n } from '@/components/ui/I18nProvider';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

export default function HomePage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [me, setMe] = useState<any>(null);
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [daily, setDaily] = useState<any>(null);
  const [tab, setTab] = useState<'verse' | 'hadith' | 'wisdom'>('verse');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe(u);
    } catch { router.push('/auth/login'); }

    const update = () => {
      const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
      try {
        setTime(new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', calendar: 'islamic-umalqura' } as any));
      } catch { setTime(new Date().toLocaleDateString(locale)); }
      const h = new Date().getHours();
      const key = h < 5 ? 'home.greeting.dawn' : h < 12 ? 'home.greeting.morning' : h < 17 ? 'home.greeting.afternoon' : h < 20 ? 'home.greeting.evening' : 'home.greeting.night';
      setGreeting(t(key));
    };
    update();
    const timer = setInterval(update, 60000);
    fetch(API + '/daily').then(r => r.json()).then(d => { if (d.success) setDaily(d); }).catch(() => {});
    return () => { clearInterval(timer); window.speechSynthesis?.cancel(); };
  }, [lang]);

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    synth.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA'; u.rate = 0.82;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true); synth.speak(u);
    }, 100);
  };

  const logout = () => {
    localStorage.removeItem('noor_token');
    localStorage.removeItem('noor_user');
    router.push('/');
  };

  if (!me) {
    return (
      <div style={{ minHeight: '100dvh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // الميزات الأساسية (6 فقط للوضوح) + الباقي في "المزيد"
  const primary = [
    { href: '/ai', icon: Bot, title: t('home.feature.ai'), color: '#67E8F9' },
    { href: '/quran', icon: BookOpen, title: t('home.feature.quran'), color: '#10B981' },
    { href: '/prayer', icon: Clock, title: t('home.feature.prayer'), color: '#F87171' },
    { href: '/adhkar', icon: Heart, title: t('home.feature.adhkar'), color: '#34D399' },
    { href: '/stories', icon: Star, title: t('home.feature.stories'), color: '#FB923C' },
    { href: '/qibla', icon: Compass, title: t('home.feature.qibla'), color: '#FBBF24' },
    { href: '/tajweed', icon: BookOpen, title: 'تعلّم التجويد', color: '#34D399' },
  ];

  const dailyData = daily?.[tab];
  const dailyText = tab === 'verse' ? daily?.verse?.text : tab === 'hadith' ? daily?.hadith?.text : daily?.wisdom?.text;

  return (
    <div style={{ minHeight: '100dvh', background: '#030712', color: '#fff' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 20px 110px', maxWidth: '680px', margin: '0 auto' }}>

        {/* ═══ Header ═══ */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '2px' }}>{greeting} 🌙</div>
            <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>{me.name}</div>
          </div>
          <button onClick={logout} style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <LogOut size={18} />
          </button>
        </header>

        {/* ═══ التاريخ ═══ */}
        <div style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', marginBottom: '20px', fontWeight: 500 }}>
          🕌 {time}
        </div>

        {/* ═══ بطاقة اليوم الموحّدة (تبويبات) ═══ */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', overflow: 'hidden', marginBottom: '36px',
        }}>
          {/* تبويبات */}
          <div style={{ display: 'flex', padding: '6px', gap: '4px', background: 'rgba(255,255,255,0.02)' }}>
            {[
              { k: 'verse', label: '📖 ' + t('home.tab.verse') },
              { k: 'hadith', label: '📜 ' + t('home.tab.hadith') },
              { k: 'wisdom', label: '💡 ' + t('home.tab.wisdom') },
            ].map(t => (
              <button key={t.k} onClick={() => { setTab(t.k as any); window.speechSynthesis?.cancel(); setSpeaking(false); }} style={{
                flex: 1, padding: '10px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: tab === t.k ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: tab === t.k ? '#10B981' : '#9CA3AF',
                fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* المحتوى */}
          <div style={{ padding: '28px 24px' }}>
            <p style={{
              fontFamily: 'Amiri, serif',
              fontSize: tab === 'hadith' ? '18px' : '22px',
              lineHeight: 1.9, textAlign: 'center', color: '#fff',
              fontWeight: tab === 'hadith' ? 600 : 700, fontStyle: tab === 'hadith' ? 'italic' : 'normal',
              marginBottom: '16px', minHeight: '60px',
            }}>
              {dailyText || '...'}
            </p>

            {/* المصدر + زر الصوت */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                {tab === 'verse' && daily?.verse && `سورة ${daily.verse.surah} • ${daily.verse.ayah}`}
                {tab === 'hadith' && daily?.hadith && `رواه ${daily.hadith.narrator}`}
                {tab === 'wisdom' && daily?.wisdom && `— ${daily.wisdom.author}`}
              </span>
              {dailyText && (
                <button onClick={() => speak(dailyText)} style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: speaking ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                  border: 'none', color: speaking ? '#10B981' : '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  {speaking ? <Pause size={15} /> : <Volume2 size={15} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ الميزات الأساسية ═══ */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#9CA3AF', marginBottom: '16px', paddingRight: '4px' }}>
            {t('home.section.basics')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {primary.map((f, i) => (
              <Link key={i} href={f.href} className="tile" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                padding: '22px 12px', borderRadius: '20px', textDecoration: 'none', color: '#fff',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.25s',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '15px',
                  background: `${f.color}1a`, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={24} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>{f.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ المجتمع (بطاقتان كبيرتان) ═══ */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#9CA3AF', marginBottom: '16px', paddingRight: '4px' }}>
            {t('home.section.community')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/community" className="wide-tile" style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
              borderRadius: '20px', textDecoration: 'none', color: '#fff',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,58,237,0.08))',
              border: '1px solid rgba(168,85,247,0.2)', transition: 'all 0.25s',
            }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(168,85,247,0.2)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '2px' }}>{t('home.rooms.title')}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('home.rooms.desc')} 📹</div>
              </div>
              <ChevronLeft size={20} color="#6B7280" />
            </Link>

            <Link href="/feed" className="wide-tile" style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
              borderRadius: '20px', textDecoration: 'none', color: '#fff',
              background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(190,24,93,0.08))',
              border: '1px solid rgba(236,72,153,0.2)', transition: 'all 0.25s',
            }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(236,72,153,0.2)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '2px' }}>{t('home.feed.title')}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('home.feed.desc')} 🔥</div>
              </div>
              <ChevronLeft size={20} color="#6B7280" />
            </Link>

            <Link href="/chat" className="wide-tile" style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
              borderRadius: '20px', textDecoration: 'none', color: '#fff',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.25s',
            }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(96,165,250,0.15)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageCircle size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '2px' }}>{t('home.chat.title')}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('home.chat.desc')}</div>
              </div>
              <ChevronLeft size={20} color="#6B7280" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .tile:active { transform: scale(0.96); background: rgba(255,255,255,0.06) !important; }
        .wide-tile:active { transform: scale(0.98); }
        @media (hover: hover) {
          .tile:hover { background: rgba(255,255,255,0.06) !important; transform: translateY(-2px); }
          .wide-tile:hover { transform: translateY(-2px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
