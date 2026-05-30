'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, MapPin, Bell, BellOff, Volume2, Pause,
  Sunrise, Sun, Sunset, Moon, CloudSun, Loader2
} from 'lucide-react';

// أوقات الصلاة عبر Aladhan API (مجاني، دقيق)
const PRAYER_API = 'https://api.aladhan.com/v1/timings';

interface Timings {
  Fajr: string; Sunrise: string; Dhuhr: string;
  Asr: string; Maghrib: string; Isha: string;
}

const PRAYERS = [
  { key: 'Fajr', name: 'الفجر', icon: Sunrise, color: '#67E8F9' },
  { key: 'Dhuhr', name: 'الظهر', icon: Sun, color: '#FBBF24' },
  { key: 'Asr', name: 'العصر', icon: CloudSun, color: '#FB923C' },
  { key: 'Maghrib', name: 'المغرب', icon: Sunset, color: '#F87171' },
  { key: 'Isha', name: 'العشاء', icon: Moon, color: '#A855F7' },
];

export default function PrayerPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [timings, setTimings] = useState<Timings | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());
  const [next, setNext] = useState<{ name: string; key: string; time: string; remaining: string } | null>(null);
  const [notify, setNotify] = useState(false);
  const [playingAdhan, setPlayingAdhan] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastFiredRef = useRef<string>('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe(u);
      setNotify(localStorage.getItem('noor_prayer_notify') === '1');
    } catch { router.push('/auth/login'); }

    // الموقع عبر GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => { setError('تعذّر تحديد موقعك - نعرض توقيت مكة'); fetchTimes(21.4225, 39.8262); },
        { timeout: 10000 }
      );
    } else {
      fetchTimes(21.4225, 39.8262);
    }

    const t = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(t); audioRef.current?.pause(); };
  }, []);

  const fetchTimes = async (lat: number, lng: number) => {
    try {
      const r = await fetch(`${PRAYER_API}?latitude=${lat}&longitude=${lng}&method=4`);
      const d = await r.json();
      if (d.data?.timings) {
        setTimings(d.data.timings);
        setCity(d.data.meta?.timezone || '');
      } else setError('تعذّر جلب الأوقات');
    } catch { setError('تعذّر الاتصال'); }
    finally { setLoading(false); }
  };

  // حساب الصلاة القادمة + العدّاد + إطلاق الأذان
  useEffect(() => {
    if (!timings) return;
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const cur = now.getHours() * 60 + now.getMinutes();
    const list = PRAYERS.map(p => ({ ...p, time: timings[p.key as keyof Timings], min: toMin(timings[p.key as keyof Timings]) }));

    let upcoming = list.find(p => p.min > cur);
    if (!upcoming) upcoming = { ...list[0], min: list[0].min + 1440 }; // فجر الغد

    const diff = upcoming.min - cur;
    const h = Math.floor(diff / 60), m = diff % 60;
    const sec = 59 - now.getSeconds();
    setNext({
      name: upcoming.name, key: upcoming.key, time: upcoming.time,
      remaining: `${h > 0 ? h + ' س ' : ''}${m} د ${sec} ث`,
    });

    // إطلاق الأذان عند دخول الوقت بالضبط
    const nowKey = `${now.getHours()}:${now.getMinutes()}`;
    list.forEach(p => {
      if (p.time === nowKey && now.getSeconds() === 0 && lastFiredRef.current !== nowKey + p.key) {
        lastFiredRef.current = nowKey + p.key;
        if (notify) {
          playAdhan();
          showNotification(p.name);
        }
      }
    });
  }, [now, timings, notify]);

  const playAdhan = () => {
    if (!audioRef.current) {
      // أذان من مصدر مجاني
      audioRef.current = new Audio('https://cdn.islamic.network/adhan/audio/128/ar.mp3');
    }
    audioRef.current.play().then(() => setPlayingAdhan(true)).catch(() => {});
    audioRef.current.onended = () => setPlayingAdhan(false);
  };

  const stopAdhan = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlayingAdhan(false);
  };

  const showNotification = (name: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🕌 حان وقت ' + name, { body: 'الله أكبر الله أكبر — حيّ على الصلاة', icon: '/icon.png' });
    }
  };

  const toggleNotify = async () => {
    if (!notify) {
      // اطلب إذن الإشعارات
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setError('لتفعيل الإشعارات، اسمح بها من إعدادات المتصفح');
          return;
        }
      }
      setNotify(true);
      localStorage.setItem('noor_prayer_notify', '1');
    } else {
      setNotify(false);
      localStorage.setItem('noor_prayer_notify', '0');
    }
  };

  if (!me || loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', zIndex: 9999 }}>
        <Loader2 size={40} color="#10B981" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#9CA3AF', fontSize: '13px' }}>جاري تحديد موقعك وأوقات الصلاة...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const fmtNow = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ minHeight: '100dvh', background: '#000', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 55%), #000' }} />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => router.push('/home')} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900 }}>🕌 أوقات الصلاة</h1>
            {city && <p style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} /> {city}</p>}
          </div>
          <button onClick={toggleNotify} style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: notify ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
            border: notify ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
            color: notify ? '#10B981' : '#9CA3AF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            {notify ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </header>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#FBBF24', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* بطاقة الصلاة القادمة (عدّاد) */}
        {next && (
          <div style={{
            padding: '28px 22px', borderRadius: '24px', marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(168,85,247,0.1))',
            border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: '#10B981', opacity: 0.12, filter: 'blur(50px)' }} />
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '6px' }}>الصلاة القادمة</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', marginBottom: '4px' }}>{next.name}</div>
            <div style={{ fontSize: '15px', color: '#fff', marginBottom: '14px' }}>{next.time}</div>
            <div style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '999px', background: 'rgba(0,0,0,0.3)', fontSize: '18px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '1px' }}>
              ⏳ {next.remaining}
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '12px' }}>🕐 الآن: {fmtNow}</div>
          </div>
        )}

        {/* تشغيل الأذان يدوياً */}
        <button onClick={playingAdhan ? stopAdhan : playAdhan} style={{
          width: '100%', padding: '14px', borderRadius: '16px', marginBottom: '20px',
          background: playingAdhan ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)',
          border: playingAdhan ? '1px solid #EF4444' : '1px solid rgba(16,185,129,0.3)',
          color: playingAdhan ? '#FCA5A5' : '#10B981',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          {playingAdhan ? <Pause size={18} /> : <Volume2 size={18} />}
          {playingAdhan ? 'إيقاف الأذان' : '🔊 استمع للأذان'}
        </button>

        {/* قائمة الأوقات */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PRAYERS.map(p => {
            const Icon = p.icon;
            const isNext = next?.key === p.key;
            const t = timings?.[p.key as keyof Timings] || '--:--';
            return (
              <div key={p.key} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 18px', borderRadius: '16px',
                background: isNext ? `${p.color}1a` : 'rgba(255,255,255,0.04)',
                border: isNext ? `1px solid ${p.color}66` : '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${p.color}22`, border: `1px solid ${p.color}44`, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 800 }}>{p.name}</div>
                  {isNext && <div style={{ fontSize: '10px', color: p.color, fontWeight: 700 }}>● القادمة</div>}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: isNext ? p.color : '#fff' }}>{t}</div>
              </div>
            );
          })}
        </div>

        {/* ملاحظة الإشعارات */}
        <div style={{ marginTop: '20px', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: 1.7, textAlign: 'center' }}>
            {notify ? '🔔 الإشعارات مفعّلة — سيؤذّن التطبيق عند دخول الوقت (والتطبيق مفتوح)' : '🔕 فعّل الجرس بالأعلى ليؤذّن التطبيق عند كل صلاة'}
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
