'use client';
import { useEffect, useState } from 'react';
import { Play, Pause, X, Loader2 } from 'lucide-react';

type AudioState = {
  surahNum: number;
  surahName: string;
  reciterName: string;
  reciterId: string;
  ayahs?: any[];
  ayahIdx?: number;
};

// CDN موثوق بـ CORS مفتوح — يستخدم Islamic Network
// التشغيل آية بآية لكن متسلسل تلقائياً
const RECITERS: Record<string, { name: string; edition: string }> = {
  alafasy: { name: 'مشاري العفاسي', edition: 'ar.alafasy' },
  sudais: { name: 'عبدالرحمن السديس', edition: 'ar.abdurrahmaansudais' },
  husary: { name: 'محمود الحصري', edition: 'ar.husary' },
  minshawi: { name: 'محمد المنشاوي', edition: 'ar.minshawi' },
  basit: { name: 'عبدالباسط (مرتل)', edition: 'ar.abdulbasitmurattal' },
  hudhaifi: { name: 'علي الحذيفي', edition: 'ar.hudhaify' },
};

export const RECITER_INFO: Record<string, string> = Object.fromEntries(
  Object.entries(RECITERS).map(([k, v]) => [k, v.name])
);

// total ayah count per surah
const AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,14,12,11,8,3,5,6,3,5,4,7,3,6,3,5,4,5,6];

function getGlobalAyahNum(surah: number, ayah: number): number {
  let g = 0;
  for (let i = 0; i < surah - 1; i++) g += AYAH_COUNTS[i] || 0;
  return g + ayah;
}

function getAyahAudioUrl(globalNum: number, reciter: string): string {
  const rec = RECITERS[reciter] || RECITERS.alafasy;
  return 'https://cdn.islamic.network/quran/audio/128/' + rec.edition + '/' + globalNum + '.mp3';
}

let _audio: HTMLAudioElement | null = null;
const _listeners = new Set<any>();
let _state: AudioState | null = null;
let _playing = false;
let _loading = false;
let _time = 0;
let _dur = 0;
let _error = '';

function emit() {
  _listeners.forEach((fn: any) => fn(_state, _playing, _time, _dur, _loading, _error));
}

function setupAudio(): HTMLAudioElement {
  if (_audio) return _audio;
  _audio = new Audio();
  _audio.preload = 'auto';
  _audio.addEventListener('waiting', () => { _loading = true; _error = ''; emit(); });
  _audio.addEventListener('canplay', () => { _loading = false; emit(); });
  _audio.addEventListener('playing', () => { _playing = true; _loading = false; _error = ''; emit(); });
  _audio.addEventListener('pause', () => { _playing = false; emit(); });
  _audio.addEventListener('timeupdate', () => {
    if (!_audio) return;
    _time = _audio.currentTime || 0;
    _dur = _audio.duration || 0;
    emit();
  });
  // عند انتهاء الآية → شغّل التالية تلقائياً
  _audio.addEventListener('ended', () => {
    _playing = false;
    emit();
    if (!_state) return;
    const ayahCount = AYAH_COUNTS[_state.surahNum - 1] || 0;
    const nextIdx = (_state.ayahIdx || 0) + 1;
    if (nextIdx < ayahCount) {
      audioPlayer.playAyah(_state.surahNum, nextIdx);
    } else {
      _state = null;
      emit();
    }
  });
  _audio.addEventListener('error', () => {
    if (_audio?.src && _audio.src.startsWith('http')) {
      _error = 'تعذّر التشغيل — جرّب قارئاً آخر';
    }
    _loading = false; _playing = false; emit();
  });
  return _audio;
}

export const audioPlayer = {
  // شغّل من أول السورة
  play(state: AudioState) {
    this.playAyah(state.surahNum, 0, state.reciterId, state.surahName);
  },

  // شغّل آية معينة (من 0)
  playAyah(surahNum: number, ayahIdx: number, reciterId?: string, surahName?: string) {
    const a = setupAudio();
    const reciter = reciterId || _state?.reciterId || 'alafasy';
    _state = {
      surahNum,
      surahName: surahName || _state?.surahName || ('سورة ' + surahNum),
      reciterName: RECITER_INFO[reciter],
      reciterId: reciter,
      ayahIdx,
    };
    _loading = true;
    _error = '';
    emit();

    const globalNum = getGlobalAyahNum(surahNum, ayahIdx + 1);
    const url = getAyahAudioUrl(globalNum, reciter);
    console.log('▶️ Playing ayah', ayahIdx + 1, 'of surah', surahNum, ':', url);
    a.src = url;
    a.load();
    const p = a.play();
    if (p && typeof p.then === 'function') {
      p.catch((err: any) => {
        if (err?.name === 'NotAllowedError') {
          _error = 'اضغط مرة أخرى';
        } else if (err?.name === 'AbortError') {
          // ok, will retry
        } else {
          _error = 'فشل التحميل';
        }
        _loading = false; _playing = false; emit();
      });
    }
  },

  toggle() {
    if (!_audio || !_state) return;
    if (_playing) _audio.pause();
    else { const p = _audio.play(); if (p) p.catch(() => {}); }
  },

  seek(time: number) { if (_audio && isFinite(time)) _audio.currentTime = time; },

  close() {
    if (_audio) { _audio.pause(); _audio.removeAttribute('src'); }
    _state = null; _playing = false; _loading = false; _time = 0; _dur = 0; _error = '';
    emit();
  },

  subscribe(fn: any) {
    _listeners.add(fn);
    fn(_state, _playing, _time, _dur, _loading, _error);
    return () => _listeners.delete(fn);
  },
};

export function AudioBar() {
  const [state, setState] = useState<AudioState | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return audioPlayer.subscribe((s: any, p: any, t: any, d: any, l: any, e: any) => {
      setState(s); setPlaying(p); setTime(t); setDur(d); setLoading(l); setError(e || '');
    });
  }, []);

  if (!state) return null;

  const pct = dur > 0 ? (time / dur) * 100 : 0;
  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return '0:00';
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  };

  const ayahCount = AYAH_COUNTS[state.surahNum - 1] || 0;
  const currentAyah = (state.ayahIdx || 0) + 1;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--nav-h) + var(--safe-bottom))',
      left: 0, right: 0, zIndex: 80, paddingBottom: 4,
    }}>
      <div className="container-app glass-strong" style={{
        margin: '0 auto', padding: '14px 16px',
        borderRadius: '20px 20px 0 0', borderBottom: 'none',
        position: 'relative', overflow: 'hidden',
      }}>
        <div
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            audioPlayer.seek(((e.clientX - r.left) / r.width) * dur);
          }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
        >
          <div style={{
            width: pct + '%', height: '100%',
            background: 'linear-gradient(90deg, var(--green-4), var(--green-5))',
            transition: 'width 0.3s linear',
          }} />
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.15)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#F87171', fontSize: '11px',
            padding: '4px 10px', borderRadius: '8px',
            marginBottom: '8px', textAlign: 'center',
          }}>⚠️ {error}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--green-3), var(--green-5))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            animation: playing ? 'spin 8s linear infinite' : 'none',
          }}>📖</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state.surahName} • آية {currentAyah}/{ayahCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
              {state.reciterName} • <span dir="ltr" className="num-arabic">{fmt(time)} / {fmt(dur)}</span>
            </div>
          </div>

          <button onClick={() => audioPlayer.toggle()} style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-3), var(--green-5))',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
          }}>
            {loading ? <Loader2 size={20} /> : playing ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
          </button>

          <button onClick={() => audioPlayer.close()} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            color: 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'pointer',
          }}>
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
