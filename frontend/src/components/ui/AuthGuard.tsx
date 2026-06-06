'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/onboarding', '/post'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));

    try {
      const token = localStorage.getItem('noor_token');
      const user = localStorage.getItem('noor_user');
      const isAuthed = !!(token && user);

      if (!isAuthed && !isPublic) {
        // غير مسجل ويحاول دخول صفحة محمية → اذهب للـ landing
        router.replace('/');
        return;
      }

      if (isAuthed && pathname === '/') {
        // مسجل وفي landing → اذهب للرئيسية
        router.replace('/home');
        return;
      }

      setChecked(true);
    } catch {
      setChecked(true);
    }
  }, [pathname]);

  if (!checked && !PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#10B981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
