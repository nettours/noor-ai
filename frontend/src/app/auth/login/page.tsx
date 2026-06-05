'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft,
  Sparkles, UserCircle2
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      if (token) { router.push('/home'); return; }
      // Open the "create account" tab when arriving from /auth/register or a CTA.
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'register') setMode('register');
    } catch {}
  }, []);

  const saveAndGo = (data: any) => {
    localStorage.setItem('noor_token', data.token);
    localStorage.setItem('noor_user', JSON.stringify(data.user));
    router.push('/home');
  };

  const submit = async () => {
    setError('');
    if (mode === 'register' && !name.trim()) { setError('أدخل اسمك'); return; }
    if (!email.trim()) { setError('أدخل بريدك الإلكتروني'); return; }
    if (!password || password.length < 6) { setError('كلمة المرور 6 أحرف على الأقل'); return; }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const body = mode === 'register'
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };
      const resp = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (json.success && json.data) {
        saveAndGo(json.data);
      } else {
        setError(json.error || 'حدث خطأ، حاول مجدداً');
        setLoading(false);
      }
    } catch {
      setError('فشل الاتصال بالخادم');
      setLoading(false);
    }
  };

  const guestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const resp = await fetch(API + '/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await resp.json();
      if (json.success && json.data) saveAndGo(json.data);
      else { setError('فشل الدخول كضيف'); setLoading(false); }
    } catch { setError('فشل الاتصال'); setLoading(false); }
  };

  const googleLogin = () => {
    // OAuth الحقيقي يحتاج إعداد Google Cloud (مرحلة قادمة)
    setError('تسجيل Google قريباً إن شاء الله — استخدم البريد أو ادخل كضيف');
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#000', color: '#fff',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* خلفية متحرّكة */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 50% at 30% 0%, rgba(16,185,129,0.18) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 100%, rgba(103,232,249,0.12) 0%, transparent 50%),
          #000
        `,
      }} />
      <div style={{
        position: 'absolute', top: '10%', right: '-10%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'rgba(16,185,129,0.15)', filter: 'blur(80px)',
        animation: 'float1 8s ease-in-out infinite', zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 2, flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 24px calc(env(safe-area-inset-bottom, 0px) + 24px)',
        maxWidth: '440px', margin: '0 auto', width: '100%',
      }}>
        {/* الشعار */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '88px', height: '88px', margin: '0 auto 20px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '46px',
            boxShadow: '0 20px 60px rgba(16,185,129,0.5)',
            animation: 'float2 4s ease-in-out infinite',
          }}>🌙</div>
          <h1 style={{
            fontSize: '34px', fontWeight: 900, marginBottom: '8px',
            background: 'linear-gradient(135deg, #fff, #9CA3AF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>نور AI</h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#FBBF24" />
            رفيقك الإسلامي الذكي
          </p>
        </div>

        {/* تبديل تسجيل/دخول */}
        <div style={{
          display: 'flex', gap: '4px', padding: '4px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '14px',
          marginBottom: '24px',
        }}>
          {[
            { k: 'login', label: 'تسجيل الدخول' },
            { k: 'register', label: 'حساب جديد' },
          ].map(t => (
            <button key={t.k} onClick={() => { setMode(t.k as any); setError(''); }} style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              background: mode === t.k ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontSize: '14px', fontWeight: 700,
              transition: 'all 0.3s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* الحقول */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {mode === 'register' && (
            <Field icon={<User size={18} />}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الكامل"
                style={inputStyle} />
            </Field>
          )}
          <Field icon={<Mail size={18} />}>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="البريد الإلكتروني"
              style={inputStyle} />
          </Field>
          <Field icon={<Lock size={18} />}>
            <input value={password} onChange={e => setPassword(e.target.value)}
              type={showPass ? 'text' : 'password'} placeholder="كلمة المرور"
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={inputStyle} />
            <button onClick={() => setShowPass(!showPass)} style={{
              background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px',
            }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </Field>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#FCA5A5', fontSize: '13px', textAlign: 'center',
          }}>{error}</div>
        )}

        {/* زر رئيسي */}
        <button onClick={submit} disabled={loading} style={{
          width: '100%', padding: '16px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          border: 'none', color: '#fff', fontSize: '16px', fontWeight: 800,
          cursor: loading ? 'wait' : 'pointer', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
        }}>
          {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {mode === 'register' ? 'إنشاء الحساب' : 'دخول'}
        </button>

        {/* فاصل */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '12px', color: '#6B7280' }}>أو</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Google */}
        <button onClick={googleLogin} disabled={loading} style={{
          width: '100%', padding: '14px', borderRadius: '14px',
          background: '#fff', border: 'none', color: '#1F2937',
          fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          المتابعة مع Google
        </button>

        {/* دخول كضيف */}
        <button onClick={guestLogin} disabled={loading} style={{
          width: '100%', padding: '14px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <UserCircle2 size={20} />
          الدخول كضيف (تجربة سريعة)
        </button>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#6B7280', marginTop: '24px', lineHeight: 1.6 }}>
          بالمتابعة، أنت توافق على استخدام التطبيق
          <br />لخدمة المسلمين 🌙
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float1 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        @keyframes float2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        input::placeholder { color: #6B7280; }
      `}</style>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '4px 16px', borderRadius: '14px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <span style={{ color: '#6B7280', flexShrink: 0 }}>{icon}</span>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1, background: 'transparent', border: 'none', color: '#fff',
  fontSize: '15px', padding: '14px 0', outline: 'none', direction: 'rtl',
  fontFamily: 'inherit',
};
