'use client';
import { useAudioStore } from '@/store';
import { audioEngine } from '@/services/audio';

export function AudioPlayerBar() {
  const { track, isPlaying, currentTime, duration } = useAudioStore();
  if (!track) return null;

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  return (
    <div style={{
      position: 'fixed', bottom: 64, left: 0, right: 0, zIndex: 90,
      background: 'rgba(16,30,52,0.98)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#22C55E', transition: 'width .5s' }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#EEE8DC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.title}
        </div>
        <div style={{ fontSize: 11, color: '#526070', marginTop: 2 }}>
          {track.artist} • {fmt(currentTime)} / {fmt(duration)}
        </div>
      </div>

      {/* Controls */}
      <button onClick={() => audioEngine.prev()} style={btnStyle}>⏮</button>
      <button onClick={() => isPlaying ? audioEngine.pause() : audioEngine.resume()}
        style={{ ...btnStyle, background: '#16A34A', width: 40, height: 40, borderRadius: '50%' }}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button onClick={() => audioEngine.next()} style={btnStyle}>⏭</button>
      <button onClick={() => audioEngine.close()} style={{ ...btnStyle, fontSize: 18, color: '#526070' }}>✕</button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', border: 'none',
  background: 'rgba(255,255,255,0.08)', color: '#EEE8DC',
  cursor: 'pointer', fontSize: 15, display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};
