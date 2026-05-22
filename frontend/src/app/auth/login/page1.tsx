'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [data, setData] = useState({ email: '', password: '' });

  const submit = async () => {
    setErr('');
    if (!data.email.includes('@')) return setErr('بريد إلكتروني غير صحيح');
    if (!data.password) return setErr('أدخل كلمة المرور');

    setLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('noor_token', json.data.token);
        localStorage.setItem('noor_user', JSON.stringify(json.data.user));
        router.push('/home');
      } else {
        setErr(json.error || 'بيانات غير صحيحة');
      }
    } catch {
      setErr('تعذّر الاتصال — تحقق من السيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
      <div className="container-app" style={{ padding: '24px' }}>
        <div className="animate-fade-down" style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{
            width: '90px', height: '90px',
            margin: '0 auto 16px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, var(--green-3), var(--green-5))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '42px',
            boxShadow: 'var(--shadow-green)',
          }} className="animate-glow">
            ☪️
          </div>
          <h1 className="text-gradient-gold" style={{ fontFamily: 'Amiri', fontSize: '42px', fontWeight: 700 }}>
            مرحباً بعودتك
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
            سعداء برؤيتك مرة أخرى 🌙
          </p>
        </div>

        <div className="glass-card animate-fade-up" style={{ padding: '24px' }}>
          <Field icon={<Mail size={18} />} placeholder="البريد الإلكتروني" type="email" value={data.email} onChange={v => setData({ ...data, email: v })} />
          <Field
            icon={<Lock size={18} />}
            placeholder="كلمة المرور"
            type={show ? 'text' : 'password'}
            value={data.password}
            onChange={v => setData({ ...data, password: v })}
            right={<button onClick={() => setShow(!show)} style={{ color: 'var(--text-3)' }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          />

          {err && (
            <div className="animate-fade-in" style={{
              padding: '10px 14px',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 'var(--r-md)',
              color: '#F87171', fontSize: '13px',
              marginBottom: '12px', textAlign: 'center',
            }}>⚠️ {err}</div>
          )}

          <button onClick={submit} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '15px' }}>
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : (<><LogIn size={20} />تسجيل الدخول</>)}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)', marginTop: '20px' }}>
            ليس لديك حساب؟{' '}
            <Link href="/auth/register" style={{ color: 'var(--gold-5)', fontWeight: 700 }}>
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = 'text', right }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(22,37,64,0.6)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)', marginBottom: '12px' }}>
      <span style={{ color: 'var(--text-3)' }}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-0)', fontSize: '14px', direction: 'rtl' }} />
      {right}
    </div>
  );
}
