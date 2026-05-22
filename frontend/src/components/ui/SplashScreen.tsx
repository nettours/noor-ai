'use client';
import { useEffect, useState } from 'react';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2200);
    const t2 = setTimeout(onDone, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '24px',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.25) 0%, var(--bg-0) 60%)',
        opacity: out ? 0 : 1,
        transform: out ? 'scale(1.08)' : 'scale(1)',
        transition: 'opacity .8s, transform .8s',
        pointerEvents: out ? 'none' : 'auto',
      }}
    >
      {/* Animated background rings */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${i * 200}px`,
            height: `${i * 200}px`,
            borderRadius: '50%',
            border: `1px solid rgba(16, 185, 129, ${0.1 - i * 0.02})`,
            animation: `pulse 2.${i}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Logo */}
      <div style={{
        width: '120px', height: '120px',
        borderRadius: '32px',
        background: 'linear-gradient(135deg, var(--green-3), var(--green-5))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '60px',
        boxShadow: '0 0 80px rgba(16, 185, 129, 0.5), 0 8px 32px rgba(16, 185, 129, 0.3)',
        animation: 'splashBounce 2s ease-in-out infinite',
        position: 'relative', zIndex: 2,
      }}>
        ☪️
      </div>

      {/* Name */}
      <div style={{
        fontFamily: 'Amiri, serif',
        fontSize: '64px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, var(--gold-7), var(--gold-4))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        position: 'relative', zIndex: 2,
        letterSpacing: '2px',
      }}>
        نور AI
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: '14px',
        color: 'var(--text-3)',
        position: 'relative', zIndex: 2,
        marginTop: '-12px',
      }}>
        رفيقك في طريق الإيمان 🌙
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', position: 'relative', zIndex: 2 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '10px', height: '10px',
            borderRadius: '50%',
            background: ['var(--green-5)', 'var(--gold-5)', 'var(--blue-5)'][i],
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes splashBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
