'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';

const STEPS = [
  { emoji: '🌙', title: 'أهلاً بك في نور AI', desc: 'رفيقك في طريق الإيمان — تعلّم، تواصل، وتقرّب إلى الله في مكان واحد.' },
  { emoji: '🧠', title: 'مساعد ذكي', desc: 'اسأل نور AI عن الفقه والتفسير والأحاديث، يجيبك فوراً بالأدلة.' },
  { emoji: '💬', title: 'مجتمع مؤمن', desc: 'انضم للغرف، تناقش مع الإخوة، وشارك في مكالمات جماعية.' },
  { emoji: '🔥', title: 'تأمّلات نور', desc: 'محتوى يلمس القلب يومياً — اقرأ، استمع، وشارك الخير.' },
];

export function WelcomeTour() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem('noor_tour_done')) setShow(true); } catch {}
  }, []);

  const finish = () => {
    try { localStorage.setItem('noor_tour_done', '1'); } catch {}
    setShow(false);
  };

  if (!show) return null;
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(3,7,18,0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      animation: 'fadeDown 0.3s ease',
    }}>
      <div className="glass-strong" style={{
        width: '100%', maxWidth: '380px',
        borderRadius: '28px', padding: '32px 24px', textAlign: 'center',
        position: 'relative',
      }}>
        <button onClick={finish} style={{
          position: 'absolute', top: '16px', left: '16px',
          width: '32px', height: '32px', borderRadius: 'var(--r-full)',
          background: 'var(--bg-glass)', border: '1px solid var(--border-3)', color: 'var(--text-4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={16} />
        </button>

        <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'tourFloat 3s ease-in-out infinite' }}>
          {s.emoji}
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>{s.title}</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-3)', lineHeight: 1.8, marginBottom: '28px' }}>{s.desc}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '24px' : '8px', height: '8px', borderRadius: 'var(--r-full)',
              background: i === step ? 'var(--gold-5)' : 'var(--border-3)', transition: 'all 0.3s',
            }} />
          ))}
        </div>

        <button onClick={() => isLast ? finish() : setStep(step + 1)} className="btn-gold" style={{
          width: '100%', padding: '16px', borderRadius: '16px',
          border: 'none', color: '#000', fontSize: '16px', fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: 'linear-gradient(135deg, var(--gold-5), var(--gold-4))',
        }}>
          {isLast ? 'ابدأ الآن 🚀' : 'التالي'}
          {!isLast && <ChevronLeft size={18} />}
        </button>

        {!isLast && (
          <button onClick={finish} style={{
            background: 'none', border: 'none', color: 'var(--text-4)',
            fontSize: '13px', cursor: 'pointer', marginTop: '14px',
          }}>تخطّي</button>
        )}
      </div>

      <style>{`
        @keyframes tourFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}
