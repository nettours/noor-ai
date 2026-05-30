'use client';
import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Globe, Bell, Volume2, User, Info,
  LogOut, Check, ChevronLeft, Moon, Shield, Heart
} from 'lucide-react';
import { useI18n, Lang } from '@/components/ui/I18nProvider';

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { lang, setLang, t } = useI18n();
  const [me, setMe] = useState<any>(null);
  const [prayerNotify, setPrayerNotify] = useState(false);
  const [adhanSound, setAdhanSound] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe(u);
      setPrayerNotify(localStorage.getItem('noor_prayer_notify') === '1');
      setAdhanSound(localStorage.getItem('noor_adhan_sound') !== '0');
    } catch { router.push('/auth/login'); }
  }, []);

  const togglePrayer = async () => {
    if (!prayerNotify && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
    }
    const v = !prayerNotify;
    setPrayerNotify(v);
    localStorage.setItem('noor_prayer_notify', v ? '1' : '0');
  };

  const toggleAdhan = () => {
    const v = !adhanSound;
    setAdhanSound(v);
    localStorage.setItem('noor_adhan_sound', v ? '1' : '0');
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

  return (
    <div style={{ minHeight: '100dvh', background: '#030712', color: '#fff' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 20px 110px', maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <button onClick={() => router.push('/home')} style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowRight size={20} />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('settings.title')}</h1>
        </header>

        {/* بطاقة المستخدم */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
          borderRadius: '20px', marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: `linear-gradient(135deg, ${me.color || '#10B981'}, ${(me.color || '#10B981')}aa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 900,
          }}>{me.avatar || me.name?.[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{me.name}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{me.email || 'عضو في نور AI'}</div>
          </div>
        </div>

        {/* ═══ اللغة ═══ */}
        <Section icon={<Globe size={18} />} title={t('settings.language')} color="#67E8F9">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                borderRadius: '14px', cursor: 'pointer', width: '100%',
                background: lang === l.code ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                border: lang === l.code ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)',
                color: '#fff',
              }}>
                <span style={{ fontSize: '22px' }}>{l.flag}</span>
                <span style={{ flex: 1, textAlign: 'start', fontSize: '15px', fontWeight: 600 }}>{l.label}</span>
                {lang === l.code && <Check size={18} color="#10B981" />}
              </button>
            ))}
          </div>
        </Section>

        {/* ═══ الإشعارات ═══ */}
        <Section icon={<Bell size={18} />} title={t('settings.notifications')} color="#FBBF24">
          <Toggle label={t('settings.prayer_alerts')} value={prayerNotify} onChange={togglePrayer} />
        </Section>

        {/* ═══ الصوت ═══ */}
        <Section icon={<Volume2 size={18} />} title={t('settings.sound')} color="#A855F7">
          <Toggle label={t('settings.adhan')} value={adhanSound} onChange={toggleAdhan} />
        </Section>

        {/* ═══ روابط ═══ */}
        <Section icon={<Info size={18} />} title={t('settings.about')} color="#34D399">
          <LinkRow icon={<Shield size={18} />} label="الخصوصية والأمان" onClick={() => {}} />
          <LinkRow icon={<Heart size={18} />} label="قيّم التطبيق" onClick={() => {}} />
          <LinkRow icon={<Info size={18} />} label="نور AI — الإصدار 1.0" onClick={() => {}} />
        </Section>

        {/* تسجيل الخروج */}
        <button onClick={logout} style={{
          width: '100%', padding: '16px', borderRadius: '16px', marginTop: '12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#FCA5A5', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <LogOut size={18} />
          {t('settings.logout')}
        </button>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#4B5563', marginTop: '24px' }}>
          🌙 صُنع بحب لخدمة المسلمين
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Section({ icon, title, color, children }: { icon: ReactNode; title: string; color: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingRight: '4px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${color}1a`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#9CA3AF' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px', borderRadius: '14px', width: '100%', cursor: 'pointer',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff',
    }}>
      <span style={{ fontSize: '15px', fontWeight: 600 }}>{label}</span>
      <div style={{
        width: '48px', height: '28px', borderRadius: '999px', position: 'relative',
        background: value ? '#10B981' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s',
      }}>
        <div style={{
          position: 'absolute', top: '3px', width: '22px', height: '22px', borderRadius: '50%',
          background: '#fff', transition: 'all 0.3s',
          left: value ? '3px' : '23px',
        }} />
      </div>
    </button>
  );
}

function LinkRow({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
      borderRadius: '14px', width: '100%', cursor: 'pointer', marginBottom: '8px',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff',
    }}>
      <span style={{ color: '#9CA3AF' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'start', fontSize: '14px', fontWeight: 600 }}>{label}</span>
      <ChevronLeft size={18} color="#4B5563" />
    </button>
  );
}

