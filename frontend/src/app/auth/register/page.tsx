'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

export default function RegisterPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [data, setData] = useState({ name: '', email: '', password: '', confirm: '' });

  const submit = async () => {
    setErr('');
    if (!data.name.trim()) return setErr('أدخل اسمك');
    if (!data.email.includes('@')) return setErr('بريد إلكتروني غير صحيح');
    if (data.password.length < 6) return setErr('كلمة المرور 6 أحرف على الأقل');
    if (data.password !== data.confirm) return setErr('كلمتا المرور غير متطابقتين');

    setLoading(true);
    try {
      const res = await fetch(API + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('noor_token', json.data.token);
        localStorage.setItem('noor_user', JSON.stringify(json.data.user));
        router.push('/home');
      } else {
        setErr(json.error || 'فشل التسجيل');
      }
    } catch (e: any) {
      setErr('تعذّر الاتصال بالسيرفر — تأكد أن Backend يعمل على port 4000');
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
          <h1 className="text-gradient-gold" style={{ fontFamily: 'Amiri', fontSize: '40px', fontWeight: 700 }}>
            انضم لنور AI
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
            ابدأ رحلتك الإيمانية اليوم 🌙
          </p>
        </div>

        <div className="glass-card animate-fade-up" style={{ padding: '24px' }}>
          <Field icon={<User size={18} />} placeholder="الاسم الكامل" value={data.name} onChange={(v: string) => setData({ ...data, name: v })} />
          <Field icon={<Mail size={18} />} placeholder="البريد الإلكتروني" type="email" value={data.email} onChange={(v: string) => setData({ ...data, email: v })} />
          <Field
            icon={<Lock size={18} />}
            placeholder="كلمة المرور"
            type={show ? 'text' : 'password'}
            value={data.password}
            onChange={(v: string) => setData({ ...data, password: v })}
            right={<button onClick={() => setShow(!show)} style={{ color: 'var(--text-3)' }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          />
          <Field icon={<Lock size={18} />} placeholder="تأكيد كلمة المرور" type={show ? 'text' : 'password'} value={data.confirm} onChange={(v: string) => setData({ ...data, confirm: v })} />

          {err && (
            <div className="animate-fade-in" style={{
              padding: '10px 14px', background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--r-md)',
              color: '#F87171', fontSize: '13px', marginBottom: '12px', textAlign: 'center',
            }}>⚠️ {err}</div>
          )}

          <button onClick={submit} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : (<><UserPlus size={20} />إنشاء الحساب</>)}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)', marginTop: '20px' }}>
            لديك حساب؟{' '}
            <Link href="/auth/login" style={{ color: 'var(--gold-5)', fontWeight: 700 }}>
              تسجيل الدخول
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-4)', marginTop: '20px', lineHeight: 1.8 }}>
          🔒 بياناتك محفوظة بأمان<br />
          عند إنشاء الحساب، سيراك إخوانك المسلمون ويمكنهم مراسلتك
        </p>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = 'text', right }: any) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 16px', background: 'rgba(22,37,64,0.6)',
      border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)',
      marginBottom: '12px',
    }}>
      <span style={{ color: 'var(--text-3)' }}>{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1, background: 'transparent', border: 'none',
          color: 'var(--text-0)', fontSize: '14px', direction: 'rtl', outline: 'none',
        }}
      />
      {right}
    </div>
  );
}
