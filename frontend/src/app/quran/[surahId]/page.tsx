'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Play, Bookmark, BookmarkCheck, Copy, Share2,
  ArrowRight, Settings2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { audioPlayer, RECITER_INFO } from '@/components/audio/AudioBar';
import { toast } from '@/components/ui/Toast';
import { shareContent, SITE_URL } from '@/lib/share';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

export default function SurahPage() {
  const params = useParams();
  const router = useRouter();
  const surahId = parseInt(params.surahId as string);

  const [surah, setSurah] = useState<any>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [reciter, setReciter] = useState('alafasy');
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    const r = localStorage.getItem('noor_reciter');
    if (r && RECITER_INFO[r]) setReciter(r);

    try {
      const b = JSON.parse(localStorage.getItem('noor_bookmarks_' + surahId) || '[]');
      setBookmarks(b);
    } catch {}

    fetch('https://api.alquran.cloud/v1/surah/' + surahId)
      .then(r => r.json())
      .then(d => {
        setSurah(d.data);
        setAyahs(d.data.ayahs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [surahId]);

  const playSurah = () => {
    if (!surah) return;
    audioPlayer.play({
      surahNum: surahId,
      surahName: surah.name,
      reciterName: RECITER_INFO[reciter],
      reciterId: reciter,
    });
    toast('🎵 جاري التشغيل...');

    localStorage.setItem('noor_last_read', JSON.stringify({
      surah: surahId,
      ayah: 1,
      name: surah.name,
    }));
  };

  const changeReciter = (r: string) => {
    setReciter(r);
    localStorage.setItem('noor_reciter', r);
    toast('🎙️ ' + RECITER_INFO[r]);
  };

  const toggleBookmark = (n: number) => {
    let next: number[];
    if (bookmarks.includes(n)) {
      next = bookmarks.filter(b => b !== n);
      toast('تمت الإزالة');
    } else {
      next = [...bookmarks, n];
      toast('🔖 تمت الإضافة');
    }
    setBookmarks(next);
    localStorage.setItem('noor_bookmarks_' + surahId, JSON.stringify(next));
  };

  const copyAyah = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('📋 تم النسخ');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('📋 تم النسخ');
    }
  };

  const shareAyah = async (text: string, n: number) => {
    const t = text + '\n\n📖 ' + (surah?.name || '') + ' — الآية ' + n + '\nنور AI 🌙';
    // Deep link straight to this specific ayah.
    const url = `${SITE_URL}/quran/${surahId}#ayah-${n}`;
    if ((navigator as any).share) { await shareContent({ text: t, title: surah?.name, url }); return; }
    try {
      await navigator.clipboard.writeText(t + '\n' + url);
      toast('📋 تم النسخ');
    } catch {
      toast('تعذّر النسخ', 'error');
    }
  };

  if (loading) {
    return (
      <div className="pt-safe pb-nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="pt-safe pb-nav" style={{ paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom) + 100px)' }}>
      <div className="container-app">

        <div className="glass-strong" style={{
          position: 'sticky', top: 0, zIndex: 40,
          padding: '12px 16px',
          borderRadius: '0 0 var(--r-lg) var(--r-lg)',
          marginBottom: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <button onClick={() => router.back()} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--bg-3)', border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ArrowRight size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 className="font-quran" style={{ fontSize: '22px', color: 'var(--gold-5)' }}>
                {surah.name}
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                {surah.englishName} • {surah.numberOfAyahs} آية • {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
              </p>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--bg-3)', border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Settings2 size={18} />
            </button>
          </div>

          <button onClick={playSurah} className="btn btn-primary" style={{
            width: '100%', padding: '14px', fontSize: '14px',
          }}>
            <Play size={20} fill="currentColor" />
            استمع للسورة كاملة • {RECITER_INFO[reciter]}
          </button>

          {showSettings && (
            <div className="animate-fade-down" style={{
              marginTop: '14px', padding: '14px',
              background: 'var(--bg-4)', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border-2)',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '8px', fontWeight: 700 }}>
                🎙️ اختر القارئ
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Object.entries(RECITER_INFO).map(([id, name]) => (
                  <button
                    key={id}
                    onClick={() => changeReciter(id)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: reciter === id ? 'rgba(16,185,129,0.2)' : 'var(--bg-3)',
                      border: '1px solid ' + (reciter === id ? 'var(--green-4)' : 'var(--border-2)'),
                      color: reciter === id ? 'var(--green-5)' : 'var(--text-2)',
                      textAlign: 'right',
                      cursor: 'pointer',
                    }}
                  >
                    🎙️ {name}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '14px', marginBottom: '8px', fontWeight: 700 }}>
                حجم الخط: {fontSize}px
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setFontSize(Math.max(18, fontSize - 2))} className="btn btn-ghost" style={{ flex: 1, padding: '8px' }}>أ-</button>
                <button onClick={() => setFontSize(Math.min(36, fontSize + 2))} className="btn btn-ghost" style={{ flex: 1, padding: '8px' }}>أ+</button>
              </div>
            </div>
          )}
        </div>

        {surahId !== 9 && surahId !== 1 && (
          <div style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div className="font-quran" style={{ fontSize: '26px', color: 'var(--gold-5)' }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          </div>
        )}

        <div style={{ padding: '0 16px' }}>
          {ayahs.map(ayah => (
            <div key={ayah.number} id={'ayah-' + ayah.numberInSurah} style={{
              padding: '16px',
              marginBottom: '10px',
              background: 'var(--bg-3)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--r-md)',
              scrollMarginTop: '80px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(217,119,6,0.15)',
                  border: '1px solid rgba(217,119,6,0.25)',
                  color: 'var(--gold-5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                }}>
                  {ayah.numberInSurah}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => toggleBookmark(ayah.numberInSurah)} style={actBtn}>
                    {bookmarks.includes(ayah.numberInSurah) ? <BookmarkCheck size={14} color="var(--gold-5)" /> : <Bookmark size={14} />}
                  </button>
                  <button onClick={() => copyAyah(ayah.text)} style={actBtn}><Copy size={14} /></button>
                  <button onClick={() => shareAyah(ayah.text, ayah.numberInSurah)} style={actBtn}><Share2 size={14} /></button>
                </div>
              </div>

              <div className="font-quran" style={{
                fontSize: fontSize + 'px',
                textAlign: 'right',
                direction: 'rtl',
                lineHeight: 2.2,
                color: 'var(--text-0)',
              }}>
                {ayah.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px', display: 'flex', gap: '10px' }}>
          {surahId > 1 ? (
            <button onClick={() => router.push('/quran/' + (surahId - 1))} className="btn btn-ghost" style={{ flex: 1, padding: '12px' }}>
              <ChevronRight size={18} /> السابقة
            </button>
          ) : <div style={{ flex: 1 }} />}
          {surahId < 114 && (
            <button onClick={() => router.push('/quran/' + (surahId + 1))} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
              التالية <ChevronLeft size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const actBtn: React.CSSProperties = {
  width: '32px', height: '32px',
  borderRadius: '50%',
  background: 'var(--bg-4)',
  border: '1px solid var(--border-2)',
  color: 'var(--text-2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};
