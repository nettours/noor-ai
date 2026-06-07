'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronDown, Check } from 'lucide-react';

/**
 * درس اليوم — a daily authentic ayah + its tafsir, fetched live (same sources
 * as Noor Scholar's RAG). Changes every day → a reason to return. Funnels to
 * the Scholar (the app's unique asset) and builds a "knowledge streak".
 */

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0).getTime();
  return Math.floor((now.getTime() - start) / 86400000);
}
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DailyLesson() {
  const [ayah, setAyah] = useState<{ text: string; ref: string; surah: number; num: number } | null>(null);
  const [tafsir, setTafsir] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [readToday, setReadToday] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      setReadToday(localStorage.getItem('noor_lesson_last') === todayKey());
      setStreak(parseInt(localStorage.getItem('noor_lesson_streak') || '0', 10));
    } catch {}

    const n = ((dayOfYear() * 7) % 6236) + 1; // deterministic daily ayah
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`https://api.alquran.cloud/v1/ayah/${n}/quran-uthmani`);
        const d = await r.json();
        const a = d?.data;
        if (alive && a?.text) {
          setAyah({
            text: a.text,
            ref: `${(a.surah?.name || '').replace('سُورَةُ ', 'سورة ')} — الآية ${a.numberInSurah}`,
            surah: a.surah?.number,
            num: a.numberInSurah,
          });
          // Tafsir (التفسير الميسّر) for the same ayah.
          fetch(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-muyassar/${a.surah?.number}/${a.numberInSurah}.json`)
            .then(t => t.json()).then(t => { if (alive && t?.text) setTafsir(String(t.text).trim()); }).catch(() => {});
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const markRead = () => {
    if (readToday) return;
    try {
      const last = localStorage.getItem('noor_lesson_last');
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yKey = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      const prev = parseInt(localStorage.getItem('noor_lesson_streak') || '0', 10);
      const next = last === yKey ? prev + 1 : 1;
      localStorage.setItem('noor_lesson_streak', String(next));
      localStorage.setItem('noor_lesson_last', todayKey());
      const pts = parseInt(localStorage.getItem('noor_pts') || '0', 10);
      localStorage.setItem('noor_pts', String(pts + 15));
      setStreak(next);
      setReadToday(true);
    } catch {}
  };

  if (!ayah) {
    return (
      <div className="glass-card" style={{ padding: 20, minHeight: 120 }}>
        <div style={{ fontSize: 12, color: '#FBBF24', fontWeight: 700, marginBottom: 10 }}>✨ درس اليوم</div>
        <div style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
        <div style={{ height: 14, width: '70%', borderRadius: 6, background: 'rgba(255,255,255,0.06)' }} />
      </div>
    );
  }

  const askHref = `/ai?q=${encodeURIComponent(`اشرح لي معنى وتفسير هذه الآية بالتفصيل: ${ayah.text} (${ayah.ref})`)}`;

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(16,185,129,0.08), rgba(217,119,6,0.05))',
      border: '1px solid rgba(52,211,153,0.18)', borderRadius: 24, padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#FCD34D', display: 'flex', alignItems: 'center', gap: 6 }}>
          ✨ درس اليوم
        </div>
        {streak > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#34D399' }}>🔥 {streak} يوم معرفة</span>
        )}
      </div>

      <p className="font-quran" style={{
        fontSize: 21, lineHeight: 2.1, textAlign: 'center', color: '#6EE7B7',
        direction: 'rtl', margin: '0 0 10px',
      }}>
        ﴿ {ayah.text} ﴾
      </p>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', textAlign: 'center', marginBottom: 16 }}>
        📖 {ayah.ref}
      </div>

      {tafsir && (
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#60A5FA', background: 'transparent', cursor: 'pointer',
          }}>
            <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            {open ? 'إخفاء التفسير' : 'اقرأ التفسير الميسّر'}
          </button>
          {open && (
            <p style={{
              marginTop: 10, fontSize: 13.5, lineHeight: 1.9, color: '#D4D8DD',
              direction: 'rtl', textAlign: 'right',
              background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(96,165,250,0.18)',
              borderRadius: 14, padding: '12px 14px',
            }}>
              {tafsir}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={askHref} style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '12px', borderRadius: 14, fontSize: 13.5, fontWeight: 800, color: '#fff',
          backgroundImage: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
        }}>
          <Sparkles size={16} /> اسأل نور Scholar
        </Link>
        <button onClick={markRead} disabled={readToday} style={{
          padding: '12px 16px', borderRadius: 14, fontSize: 13.5, fontWeight: 800,
          cursor: readToday ? 'default' : 'pointer',
          color: readToday ? '#34D399' : '#E5E7EB',
          background: readToday ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${readToday ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Check size={16} /> {readToday ? 'تم' : 'قرأته'}
        </button>
      </div>
    </div>
  );
}
