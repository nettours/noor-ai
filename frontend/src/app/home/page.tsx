'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Bot, Clock, Compass, Heart, Users, Sparkles,
  MessageCircle, Star, ChevronLeft, LogOut, Volume2, Pause, GraduationCap
} from 'lucide-react';
import { useI18n } from '@/components/ui/I18nProvider';
import { NextPrayerCard, StreakCard, DailyChallenges, HijriDate } from '@/components/common';
import { SalahTracker } from '@/components/common/SalahTracker';
import { PrayerNotifyButton } from '@/components/common/PrayerNotifyButton';
import { DailyLesson } from '@/components/common/DailyLesson';
import { HabitWall } from '@/components/common/HabitWall';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';
const PRAYER_API = 'https://api.aladhan.com/v1/timings';

export default function HomePage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [me, setMe] = useState<any>(null);
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [daily, setDaily] = useState<any>(null);
  const [tab, setTab] = useState<'verse' | 'hadith' | 'wisdom'>('verse');
  const [speaking, setSpeaking] = useState(false);

  // Prayer widget + gamification stats
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [prayerLoading, setPrayerLoading] = useState(true);
  const [city, setCity] = useState('');
  const [stats, setStats] = useState({ points: 0, streak: 1, level: 'BEGINNER' });

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

    // Prayer times (public API, no backend needed) via geolocation → fallback Mecca.
    const fetchTimes = async (lat: number, lng: number) => {
      try {
        const r = await fetch(`${PRAYER_API}?latitude=${lat}&longitude=${lng}&method=4`);
        const d = await r.json();
        if (d.data?.timings) {
          setPrayerTimes(d.data.timings);
          setCity((d.data.meta?.timezone || '').split('/').pop()?.replace(/_/g, ' ') || '');
        }
      } catch {}
      finally { setPrayerLoading(false); }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => { setCity('مكة المكرمة'); fetchTimes(21.4225, 39.8262); },
        { timeout: 10000 }
      );
    } else { setCity('مكة المكرمة'); fetchTimes(21.4225, 39.8262); }

    // Gamification stats from localStorage (points written by DailyChallenges).
    try {
      const points = parseInt(localStorage.getItem('noor_pts') || '0', 10);
      const streak = parseInt(localStorage.getItem('noor_streak') || '1', 10);
      const level = points >= 2000 ? 'ADVANCED' : points >= 500 ? 'INTERMEDIATE' : 'BEGINNER';
      setStats({ points, streak, level });
    } catch {}

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

  // 8 ميزات = صفّان متوازنان (3+3+2) - مرتّبة منطقياً
  const primary = [
    { href: '/ai', icon: Bot, title: t('home.feature.ai'), color: '#67E8F9' },
    { href: '/quran', icon: BookOpen, title: t('home.feature.quran'), color: '#10B981' },
    { href: '/tajweed', icon: GraduationCap, title: t('home.feature.tajweed'), color: '#34D399' },
    { href: '/adhkar', icon: Heart, title: t('home.feature.adhkar'), color: '#F472B6' },
    { href: '/prayer', icon: Clock, title: t('home.feature.prayer'), color: '#F87171' },
    { href: '/stories', icon: Star, title: t('home.feature.stories'), color: '#FB923C' },
    { href: '/qibla', icon: Compass, title: t('home.feature.qibla'), color: '#FBBF24' },
    { href: '/dua', icon: Heart, title: 'بطاقة دعاء', color: '#EC4899' },
  ];

  const dailyText = tab === 'verse' ? daily?.verse?.text : tab === 'hadith' ? daily?.hadith?.text : daily?.wisdom?.text;

  return (
    <div style={{ minHeight: '100dvh', background: '#030712', color: '#fff' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 20px 110px', maxWidth: '680px', margin: '0 auto' }}>

        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>{greeting} 🌙</div>
            <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>{me.name}</div>
            <HijriDate />
          </div>
          <button onClick={logout} style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <LogOut size={18} />
          </button>
        </header>

        {/* Next prayer countdown — highest-value glanceable widget */}
        <div style={{ marginBottom: '16px' }}>
          <NextPrayerCard prayerTimes={prayerTimes} isLoading={prayerLoading} city={city} />
        </div>

        {/* رحلة نور — daily salah streak + lantern (core habit loop) */}
        <div style={{ marginBottom: '16px' }}>
          <SalahTracker />
        </div>

        {/* Prayer-time push notifications (retention backbone) */}
        <div style={{ marginBottom: '16px' }}>
          <PrayerNotifyButton prayerTimes={prayerTimes} />
        </div>

        {/* Gamification stats */}
        <div style={{ marginBottom: '16px' }}>
          <StreakCard streak={stats.streak} points={stats.points} level={stats.level} />
        </div>

        {/* Live community habit wall (social proof) */}
        <div style={{ marginBottom: '28px' }}>
          <HabitWall />
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', overflow: 'hidden', marginBottom: '36px',
        }}>
          <div style={{ display: 'flex', padding: '6px', gap: '4px', background: 'rgba(255,255,255,0.02)' }}>
            {[
              { k: 'verse', label: '📖 ' + t('home.tab.verse') },
              { k: 'hadith', label: '📜 ' + t('home.tab.hadith') },
              { k: 'wisdom', label: '💡 ' + t('home.tab.wisdom') },
            ].map(tb => (
              <button key={tb.k} onClick={() => { setTab(tb.k as any); window.speechSynthesis?.cancel(); setSpeaking(false); }} style={{
                flex: 1, padding: '10px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: tab === tb.k ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: tab === tb.k ? '#10B981' : '#9CA3AF',
                fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
              }}>{tb.label}</button>
            ))}
          </div>

          <div style={{ padding: '28px 24px' }}>
            <p style={{
              fontFamily: 'Amiri, serif', fontSize: tab === 'hadith' ? '18px' : '22px',
              lineHeight: 1.9, textAlign: 'center', color: '#fff',
              fontWeight: tab === 'hadith' ? 600 : 700, fontStyle: tab === 'hadith' ? 'italic' : 'normal',
              marginBottom: '16px', minHeight: '60px',
            }}>
              {dailyText || '...'}
            </p>

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

        {/* درس اليوم — daily ayah + tafsir, funnels to Noor Scholar */}
        <div style={{ marginBottom: '20px' }}>
          <DailyLesson />
        </div>

        {/* Daily challenges — drives engagement & feeds the points/streak above */}
        <div style={{ marginBottom: '28px' }}>
          <DailyChallenges />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#9CA3AF', marginBottom: '16px', paddingRight: '4px' }}>
            {t('home.section.community')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/rooms" className="wide-tile" style={{
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
