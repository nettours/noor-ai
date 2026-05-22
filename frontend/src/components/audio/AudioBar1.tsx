'use client';
import { useEffect, useState } from 'react';
import { Play, Pause, X, Loader2 } from 'lucide-react';

type AudioState = {
  surahNum: number;
  surahName: string;
  reciterName: string;
  reciterId: string;
};

// خوادم متعددة بـ CORS صحيح - نجرّبهم بالترتيب
const RECITERS: Record<string, { name: string; sources: string[] }> = {
  alafasy: {
    name: 'مشاري العفاسي',
    sources: [
      'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/',
      'https://server8.mp3quran.net/afs/',
      'https://everyayah.com/data/Alafasy_128kbps/',
    ],
  },
  sudais: {
    name: 'عبدالرحمن السديس',
    sources: [
      'https://download.quranicaudio.com/quran/abdulrahmaan_as-sudays/',
      'https://server11.mp3quran.net/sds/',
    ],
  },
  husary: {
    name: 'محمود الحصري',
    sources: [
      'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree_-_muratal/',
      'https://server13.mp3quran.net/husr/',
    ],
  },
  minshawi: {
    name: 'محمد المنشاوي',
    sources: [
      'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/',
      'https://server10.mp3quran.net/minsh/',
    ],
  },
  basit: {
    name: 'عبدالباسط عبدالصمد',
    sources: [
      'https://download.quranicaudio.com/quran/abdul-baasit_abdus-samad_-_mujawwad/',
      'https://server7.mp3quran.net/basit/',
    ],
  },
  hudhaifi: {
    name: 'علي الحذيفي',
    sources: [
      'https://download.quranicaudio.com/quran/alee_bin_abdurrahman_al-huthayfee/',
      'https://server7.mp3quran.net/hthfi/',
    ],
  },
};

export const RECITER_INFO: Record<string, string> = Object.fromEntries(
  Object.entries(RECITERS).map(([k, v]) => [k, v.name])
);

export function getSurahUrl(surahNum: number, reciter = 'alafasy', sourceIdx = 0): string {
  const rec = RECITERS[reciter] || RECITERS.alafasy;
  const base = rec.sources[sourceIdx] || rec.sources[0];
  return base + String(surahNum).padStart(3, '0') + '.mp3';
}

let _audio: HTMLAudioElement | null = null;
const _listeners = new Set<any>();
let _state: AudioState | null = null;
let _playing = false;
let _loading = false;
let _time = 0;
let _dur = 0;
let _error = '';
let _sourceIdx = 0;

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
  _audio.addEventListener('ended', () => { _playing = false; emit(); });
  _audio.addEventListener('error', () => {
    if (!_state) { _loading = false; _playing = false; emit(); return; }
    const rec = RECITERS[_state.reciterId];
    if (rec && _sourceIdx + 1 < rec.sources.length) {
      _sourceIdx++;
      _error = '🔄 جاري تجربة خادم آخر...';
      emit();
      const nextUrl = getSurahUrl(_state.surahNum, _state.reciterId, _sourceIdx);
      console.log('🔄 Trying source', _sourceIdx, ':', nextUrl);
      if (_audio) {
        _audio.src = nextUrl;
        _audio.load();
        _audio.play().catch(() => {});
      }
      return;
    }
    _error = 'تعذّر التشغيل — جرّب قارئاً آخر';
    _loading = false; _playing = false; emit();
  });
  return _audio;
}

export const audioPlayer = {
  play(state: AudioState) {
    const a = setupAudio();
    _state = state;
    _sourceIdx = 0;
    _loading = true;
    _error = '';
    emit();
    const url = getSurahUrl(state.surahNum, state.reciterId, 0);
    console.log('▶️ Playing:', url);
    a.src = url;
    a.load();
    const p = a.play();
    if (p && typeof p.then === 'function') {
      p.catch((err: any) => {
        if (err?.name === 'NotAllowedError') {
          _error = 'اضغط مرة أخرى';
          _loading = false; _playing = false; emit();
        }
        // Otherwise the error event will handle fallback
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
    _sourceIdx = 0;
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
              {state.surahName}
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
