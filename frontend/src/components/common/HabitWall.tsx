'use client';

import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

interface Live {
  online: number;
  totalUsers: number;
  today: { salah: number; lesson: number; scholar: number; dhikr: number; quran: number };
}

/** Live community habit wall — real anonymous numbers (social proof / retention). */
export function HabitWall() {
  const [live, setLive] = useState<Live | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const d = await fetch(`${API}/stats/live`).then(r => r.json());
        if (alive && d?.success) setLive(d);
      } catch {}
    };
    load();
    const t = setInterval(load, 25000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (!live) return null;

  const tiles = [
    { icon: '🟢', val: live.online, label: 'متصل الآن', color: '#34D399' },
    { icon: '👥', val: live.totalUsers, label: 'في رحلتهم', color: '#60A5FA' },
    { icon: '🕌', val: live.today.salah, label: 'صلاة اليوم', color: '#FBBF24' },
    { icon: '✨', val: live.today.lesson + live.today.scholar, label: 'تعلّموا اليوم', color: '#A855F7' },
  ];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 22, padding: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%', background: '#34D399',
            animation: 'noorPing 1.6s cubic-bezier(0,0,0.2,1) infinite',
          }} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>مجتمع نور الآن</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {tiles.map((t, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 14, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: t.color, fontVariantNumeric: 'tabular-nums' }}>
              <AnimatedNumber value={t.val} />
            </div>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{t.label}</div>
          </div>
        ))}
      </div>

      <style>{`@keyframes noorPing { 75%,100% { transform: scale(2.4); opacity: 0; } }`}</style>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const ref = useRef(value);
  useEffect(() => {
    const from = ref.current;
    const to = value;
    if (from === to) return;
    const steps = 16;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const v = Math.round(from + (to - from) * (i / steps));
      setShown(v);
      if (i >= steps) { clearInterval(id); ref.current = to; setShown(to); }
    }, 30);
    return () => clearInterval(id);
  }, [value]);
  return <>{shown.toLocaleString('ar-EG')}</>;
}
