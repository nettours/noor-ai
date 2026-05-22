'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, Bookmark, ChevronLeft, Sparkles } from 'lucide-react';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const POPULAR = [1, 2, 18, 36, 55, 56, 67, 78, 112, 113, 114];

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'popular' | 'last'>('all');
  const [lastRead, setLastRead] = useState<{ surah: number; ayah: number; name: string } | null>(null);

  useEffect(() => {
    const cache = localStorage.getItem('noor_surahs_v1');
    if (cache) {
      try {
        setSurahs(JSON.parse(cache));
        setLoading(false);
      } catch {}
    }
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(d => {
        setSurahs(d.data);
        localStorage.setItem('noor_surahs_v1', JSON.stringify(d.data));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    try {
      const last = JSON.parse(localStorage.getItem('noor_last_read') || 'null');
      if (last) setLastRead(last);
    } catch {}
  }, []);

  const filtered = surahs.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      return s.name.includes(search) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.number).includes(search);
    }
    if (tab === 'popular') return POPULAR.includes(s.number);
    return true;
  });

  return (
    <div className="pt-safe pb-nav">
      <div className="container-app" style={{ padding: '0 16px' }}>

        {/* Header */}
        <div className="animate-fade-down" style={{ paddingTop: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900 }} className="text-gradient-gold">
                📖 القرآن الكريم
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>
                114 سورة • 6236 آية
              </p>
            </div>
            <Link href="/quran/bookmarks" className="btn-icon glass" style={{ width: '40px', height: '40px' }}>
              <Bookmark size={18} color="var(--gold-5)" />
            </Link>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            borderRadius: 'var(--r-md)', padding: '12px 16px',
          }}>
            <Search size={18} color="var(--text-3)" />
            <input
              type="text"
              placeholder="ابحث عن سورة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: 'var(--text-0)', fontSize: '14px', direction: 'rtl',
              }}
            />
          </div>

          {/* Last read */}
          {lastRead && !search && (
            <Link href={`/quran/${lastRead.surah}?ayah=${lastRead.ayah}`}>
              <div className="animate-fade-up glass-card" style={{
                marginTop: '14px',
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '14px',
                borderColor: 'rgba(16,185,129,0.3)',
                background: 'rgba(16,185,129,0.06)',
              }}>
                <div style={{
                  width: '44px', height: '44px',
                  borderRadius: '14px',
                  background: 'rgba(16,185,129,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Clock size={20} color="var(--green-5)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--green-5)', fontWeight: 700 }}>
                    متابعة القراءة
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                    {lastRead.name} — الآية {lastRead.ayah}
                  </div>
                </div>
                <ChevronLeft size={18} color="var(--text-3)" />
              </div>
            </Link>
          )}

          {/* Tabs */}
          {!search && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              {[
                { id: 'all', label: '🌟 الكل', count: 114 },
                { id: 'popular', label: '⭐ المشهورة', count: POPULAR.length },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: tab === t.id ? 'rgba(217,119,6,0.18)' : 'var(--bg-3)',
                    border: `1px solid ${tab === t.id ? 'var(--gold-4)' : 'var(--border-2)'}`,
                    color: tab === t.id ? 'var(--gold-5)' : 'var(--text-3)',
                    cursor: 'pointer',
                  }}
                >
                  {t.label} <span style={{ opacity: 0.6 }}>({t.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <SurahSkeleton />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((s, i) => (
              <Link key={s.number} href={`/quran/${s.number}`} className={`animate-fade-up delay-${Math.min(i % 8, 8)}`}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: '46px', height: '46px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                    border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '14px',
                    color: 'var(--green-5)',
                    flexShrink: 0,
                  }}>
                    {s.number}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{s.englishName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                      {s.numberOfAyahs} آية • {s.revelationType === 'Meccan' ? 'مكية 🕋' : 'مدنية 🌿'}
                    </div>
                  </div>
                  <div className="font-quran" style={{
                    fontSize: '22px',
                    color: 'var(--gold-5)',
                    textAlign: 'left',
                  }}>
                    {s.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ height: '20px' }} />
      </div>
    </div>
  );
}

function SurahSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '76px' }} />
      ))}
    </div>
  );
}
