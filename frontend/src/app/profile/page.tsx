'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit2, MapPin, Key, Download, Share2, LogOut, Bell,
  ChevronLeft, Star, Flame, Trophy, Moon, Globe, Heart,
  MessageCircle, Sun, Volume2, VolumeX
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'أخي الكريم', email: '', points: 0, streak: 0, level: 'مبتدئ', longest: 0 });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'ar' | 'en' | 'fr'>('ar');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      setUser(prev => ({ ...prev, ...u }));
      setTheme((localStorage.getItem('noor_theme') as any) || 'dark');
      setLang((localStorage.getItem('noor_lang') as any) || 'ar');
      setNotifEnabled(localStorage.getItem('noor_notif') === '1');
      setSoundEnabled(localStorage.getItem('noor_sound') !== '0');
    } catch {}
  }, []);

  // ─── ACTIONS ──────────────────────────────────────────
  const editName = () => {
    const n = prompt('ما اسمك الكريم؟', user.name);
    if (n && n.trim()) {
      const updated = { ...user, name: n.trim() };
      setUser(updated);
      localStorage.setItem('noor_user', JSON.stringify(updated));
      toast('✅ تم تحديث الاسم');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('noor_theme', next);
    toast(next === 'dark' ? '🌙 الوضع الليلي' : '☀️ الوضع النهاري — قريباً!');
  };

  const changeLanguage = () => {
    const langs = ['ar', 'en', 'fr'];
    const next = langs[(langs.indexOf(lang) + 1) % langs.length] as 'ar' | 'en' | 'fr';
    setLang(next);
    localStorage.setItem('noor_lang', next);
    const names = { ar: 'العربية', en: 'English', fr: 'Français' };
    toast('🌍 ' + names[next] + ' — قريباً!');
  };

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast('متصفحك لا يدعم الإشعارات', 'error');
      return;
    }
    if (Notification.permission === 'denied') {
      toast('الإشعارات محظورة — فعّلها من إعدادات المتصفح', 'error');
      return;
    }
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission();
      if (p === 'granted') {
        setNotifEnabled(true);
        localStorage.setItem('noor_notif', '1');
        toast('🔔 تم تفعيل الإشعارات');
        new Notification('نور AI 🌙', { body: 'سنذكرك بأوقات الصلاة والأذكار' });
      }
      return;
    }
    const next = !notifEnabled;
    setNotifEnabled(next);
    localStorage.setItem('noor_notif', next ? '1' : '0');
    toast(next ? '🔔 الإشعارات مفعّلة' : '🔕 الإشعارات معطّلة');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('noor_sound', next ? '1' : '0');
    toast(next ? '🔊 الصوت مفعّل' : '🔇 الصوت معطّل');
  };

  const updateLocation = () => {
    if (!navigator.geolocation) {
      toast('متصفحك لا يدعم تحديد الموقع', 'error');
      return;
    }
    toast('📍 جاري تحديد موقعك...');
    navigator.geolocation.getCurrentPosition(
      p => {
        localStorage.setItem('noor_location', JSON.stringify({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          city: 'موقعك الحالي',
        }));
        toast('✅ تم تحديث الموقع');
      },
      () => toast('تعذّر تحديد الموقع', 'error')
    );
  };

  const installApp = () => {
    // PWA install prompt
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
      toast('📲 ثبّت التطبيق');
    } else {
      toast('💡 في Chrome: ⋮ → "إضافة للشاشة الرئيسية"', 'info');
    }
  };

  const shareApp = () => {
    const text = 'نور AI 🌙\nتطبيق إسلامي شامل: قرآن، صلاة، أذكار، AI ومجتمع';
    if (navigator.share) {
      navigator.share({ title: 'نور AI', text, url: window.location.origin });
    } else {
      navigator.clipboard?.writeText(text + '\n' + window.location.origin);
      toast('📋 تم نسخ الرابط');
    }
  };

  const logout = () => {
    if (!confirm('هل تريد تسجيل الخروج؟')) return;
    localStorage.removeItem('noor_token');
    localStorage.removeItem('noor_user');
    router.push('/auth/login');
  };

  const goToAI = () => {
    router.push('/ai');
  };

  // ─── LEVELS ──────────────────────────────────────────
  const levels = [
    { min: 0, name: 'مبتدئ', icon: '🌱' },
    { min: 500, name: 'ملتزم', icon: '🌿' },
    { min: 1500, name: 'متقدم', icon: '🌳' },
    { min: 3500, name: 'قريب من الله', icon: '⭐' },
    { min: 7000, name: 'قدوة', icon: '🌟' },
  ];
  const currentLv = levels.filter(l => user.points >= l.min).pop() || levels[0];
  const nextLv = levels.find(l => l.min > user.points);
  const lvProgress = nextLv ? ((user.points - currentLv.min) / (nextLv.min - currentLv.min)) * 100 : 100;

  return (
    <div className="pt-safe pb-nav">
      <div className="container-app">

        {/* Hero */}
        <div className="animate-fade-down" style={{
          background: 'linear-gradient(180deg, rgba(16,185,129,0.12) 0%, transparent 100%)',
          padding: '24px 24px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '100px', height: '100px',
            margin: '0 auto 14px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold-3), var(--gold-5))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', fontWeight: 900,
            color: 'var(--bg-0)',
            boxShadow: 'var(--shadow-gold)',
            position: 'relative',
            cursor: 'pointer',
          }} className="animate-glow" onClick={editName}>
            {user.name[0] || '☪️'}
            <div style={{
              position: 'absolute',
              bottom: 0, right: 0,
              width: '32px', height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-3)',
              border: '2px solid var(--bg-0)',
              color: 'var(--gold-5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Edit2 size={14} />
            </div>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 900 }}>{user.name}</h1>
          {user.email && (
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>
              {user.email}
            </p>
          )}
          <div className="badge badge-gold" style={{ marginTop: '12px', padding: '6px 18px', fontSize: '13px' }}>
            {currentLv.icon} {currentLv.name}
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>
          {/* Stats */}
          <div className="animate-fade-up delay-1" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '14px',
          }}>
            <StatBox icon={<Star size={18} />} value={user.points.toLocaleString('ar')} label="النقاط" color="var(--gold-5)" />
            <StatBox icon={<Flame size={18} />} value={String(user.streak)} label="ستريك 🔥" color="#FB923C" />
            <StatBox icon={<Trophy size={18} />} value={String(user.longest)} label="الأطول" color="var(--green-5)" />
          </div>

          {/* Level */}
          <div className="glass-card animate-fade-up delay-2" style={{ padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>
                {currentLv.icon} {currentLv.name}
              </span>
              {nextLv && (
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                  {user.points} / {nextLv.min}
                </span>
              )}
            </div>
            <div style={{ height: '8px', background: 'var(--bg-4)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: lvProgress + '%',
                height: '100%',
                background: 'linear-gradient(90deg, var(--green-4), var(--gold-5))',
                borderRadius: '4px',
                transition: 'width 0.6s',
              }} />
            </div>
            {nextLv && (
              <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px', textAlign: 'center' }}>
                {nextLv.min - user.points} نقطة للوصول إلى {nextLv.icon} {nextLv.name}
              </p>
            )}
          </div>

          {/* Account */}
          <Section title="الحساب">
            <Row icon={<Edit2 size={18} />} title="تعديل الاسم" sub="غيّر اسمك" onClick={editName} color="var(--green-5)" />
            <Row icon={<Key size={18} />} title="مفتاح AI" sub="تفعيل المساعد الذكي" onClick={goToAI} color="#67E8F9" />
            <Row icon={<MapPin size={18} />} title="الموقع" sub="لأوقات صلاة دقيقة" onClick={updateLocation} color="var(--blue-5)" />
          </Section>

          {/* App */}
          <Section title="التطبيق">
            <Row icon={<Bell size={18} />} title="الإشعارات" sub={notifEnabled ? '🟢 مفعّلة' : '⚪ معطّلة'} onClick={toggleNotifications} color="var(--purple-5)" toggle={notifEnabled} />
            <Row icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />} title="الصوت" sub={soundEnabled ? '🔊 مفعّل' : '🔇 معطّل'} onClick={toggleSound} color="var(--gold-5)" toggle={soundEnabled} />
            <Row icon={theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} title="المظهر" sub={theme === 'dark' ? '🌙 ليلي' : '☀️ نهاري'} onClick={toggleTheme} color="#FB923C" />
            <Row icon={<Globe size={18} />} title="اللغة" sub={lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'Français'} onClick={changeLanguage} color="var(--green-5)" />
            <Row icon={<Download size={18} />} title="تثبيت التطبيق" sub="على الشاشة الرئيسية" onClick={installApp} color="#A855F7" />
          </Section>

          {/* Community */}
          <Section title="المجتمع">
            <Row icon={<MessageCircle size={18} />} title="الدردشة" sub="مع الإخوة" onClick={() => router.push('/chat')} color="var(--green-5)" />
            <Row icon={<Heart size={18} />} title="منشوراتي" sub="عرض ما شاركت" onClick={() => router.push('/community')} color="#F87171" />
            <Row icon={<Share2 size={18} />} title="مشاركة التطبيق" sub="أهدِ لأحبابك" onClick={shareApp} color="var(--blue-5)" />
          </Section>

          {/* Logout */}
          <Section title="">
            <Row icon={<LogOut size={18} />} title="تسجيل الخروج" sub="" onClick={logout} color="#F87171" danger />
          </Section>

          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-4)', padding: '20px 0', lineHeight: 1.8 }}>
            نور AI v1.0 • صُنع بحب 💚<br />
            رفيقك في طريق الإيمان 🌙
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, value, label, color }: any) {
  return (
    <div className="glass-card" style={{ padding: '14px 8px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -15, right: -15, width: '60px', height: '60px', borderRadius: '50%', background: color, opacity: 0.08 }} />
      <div style={{ color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="animate-fade-up" style={{ marginBottom: '16px' }}>
      {title && (
        <h3 style={{
          fontSize: '11px',
          color: 'var(--text-4)',
          fontWeight: 700,
          letterSpacing: '0.5px',
          padding: '0 8px 6px',
          textTransform: 'uppercase',
        }}>
          {title}
        </h3>
      )}
      <div className="glass-card" style={{ padding: '4px 16px' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ icon, title, sub, onClick, color, danger, toggle }: any) {
  return (
    <button onClick={onClick} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '13px 0',
      borderBottom: '1px solid var(--border-1)',
      width: '100%',
      textAlign: 'right',
      cursor: 'pointer',
      transition: 'background 0.15s',
    }}>
      <div style={{
        width: '38px', height: '38px',
        borderRadius: '12px',
        background: color + '22',
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: danger ? '#F87171' : 'var(--text-0)' }}>{title}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{sub}</div>}
      </div>
      {toggle !== undefined ? (
        <div style={{
          width: '36px', height: '20px',
          borderRadius: '12px',
          background: toggle ? 'var(--green-5)' : 'var(--bg-4)',
          position: 'relative',
          transition: 'all 0.2s',
        }}>
          <div style={{
            position: 'absolute',
            top: '2px',
            [toggle ? 'left' : 'right']: '2px',
            width: '16px', height: '16px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'all 0.2s',
          }} />
        </div>
      ) : (
        <ChevronLeft size={16} color="var(--text-4)" />
      )}
    </button>
  );
}
