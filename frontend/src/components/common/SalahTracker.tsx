'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * رحلة نور — Salah streak + "مصباح نور" habit loop.
 * The strongest daily-habit engine: 5 natural daily touchpoints. Fully
 * client-side (localStorage) so it ships without backend. Also writes
 * noor_streak / noor_pts so the home StreakCard stays in sync.
 */

const PRAYERS = [
  { k: 'fajr', label: 'الفجر', icon: '🌅' },
  { k: 'dhuhr', label: 'الظهر', icon: '🌤️' },
  { k: 'asr', label: 'العصر', icon: '🌇' },
  { k: 'maghrib', label: 'المغرب', icon: '🌆' },
  { k: 'isha', label: 'العشاء', icon: '🌙' },
] as const;

const PER_PRAYER_POINTS = 20;
const LOG_KEY = 'noor_salah_log';

type Log = Record<string, string[]>;

function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function readLog(): Log {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '{}'); } catch { return {}; }
}
function isComplete(arr?: string[]): boolean {
  return !!arr && arr.length >= PRAYERS.length;
}
function computeStreak(log: Log): number {
  let streak = 0;
  let d = new Date();
  // Today still counts as "in progress" — don't break the streak before midnight.
  if (!isComplete(log[dayKey(d)])) d = addDays(d, -1);
  while (isComplete(log[dayKey(d)])) { streak++; d = addDays(d, -1); }
  return streak;
}

export function SalahTracker() {
  const [today, setToday] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const log = readLog();
    setToday(log[dayKey()] || []);
    setStreak(computeStreak(log));
  }, []);

  const toggle = useCallback((k: string) => {
    const log = readLog();
    const key = dayKey();
    const set = new Set(log[key] || []);
    const wasOn = set.has(k);
    if (wasOn) set.delete(k); else set.add(k);
    log[key] = Array.from(set);
    localStorage.setItem(LOG_KEY, JSON.stringify(log));

    // Keep gamification points + streak in sync with the rest of the app.
    try {
      const cur = parseInt(localStorage.getItem('noor_pts') || '0', 10);
      localStorage.setItem('noor_pts', String(Math.max(0, cur + (wasOn ? -PER_PRAYER_POINTS : PER_PRAYER_POINTS))));
    } catch {}
    const newStreak = computeStreak(log);
    try { localStorage.setItem('noor_streak', String(newStreak)); } catch {}

    setToday(log[key]);
    setStreak(newStreak);
  }, []);

  const done = today.length;
  const total = PRAYERS.length;
  const ratio = done / total;
  const full = done === total;

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(217,119,6,0.10), rgba(16,185,129,0.06))',
      border: '1px solid rgba(251,191,36,0.18)',
      borderRadius: 24, padding: '22px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          🕌 رحلة نور اليومية
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
          background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)',
          fontSize: 13, fontWeight: 800, color: '#FB923C',
        }}>
          🔥 {streak} {streak === 1 ? 'يوم' : 'يوم متتالٍ'}
        </div>
      </div>

      {/* Noor Lantern — brightens with today's progress */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 52, position: 'relative',
          background: `radial-gradient(circle, rgba(251,191,36,${0.12 + ratio * 0.5}) 0%, rgba(251,191,36,0.04) 70%, transparent 100%)`,
          boxShadow: `0 0 ${12 + ratio * 55}px rgba(251,191,36,${0.15 + ratio * 0.6})`,
          filter: `brightness(${0.65 + ratio * 0.6})`,
          transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
          🏮
        </div>
        <div style={{ marginTop: 12, fontSize: 15, fontWeight: 800, color: full ? '#FCD34D' : '#E5E7EB' }}>
          {full ? '✨ اكتمل نور يومك — بارك الله فيك' : `${done} / ${total} صلوات اليوم`}
        </div>
      </div>

      {/* Prayer check-ins */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {PRAYERS.map(p => {
          const on = today.includes(p.k);
          return (
            <button
              key={p.k}
              onClick={() => toggle(p.k)}
              aria-pressed={on}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '12px 4px', borderRadius: 16, cursor: 'pointer',
                background: on ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${on ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s', position: 'relative',
              }}
            >
              <span style={{ fontSize: 20, filter: on ? 'none' : 'grayscale(0.5) opacity(0.7)' }}>{p.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: on ? '#6EE7B7' : '#9CA3AF' }}>{p.label}</span>
              {on && (
                <span style={{
                  position: 'absolute', top: 5, insetInlineEnd: 5, fontSize: 10, color: '#34D399',
                }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      <p style={{ marginTop: 12, fontSize: 11, color: '#6B7280', textAlign: 'center' }}>
        سجّل صلواتك يوميًا — أكمل اليوم لتُبقي سلسلتك مشتعلة 🔥
      </p>
    </div>
  );
}
