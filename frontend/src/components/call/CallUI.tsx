'use client';
import { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';
import { useCall } from './CallProvider';

const formatDuration = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  return m + ':' + String(sec).padStart(2, '0');
};

export function CallUI() {
  const {
    state, callInfo, localStream, remoteStream,
    isMuted, isVideoOff, callDuration,
    acceptCall, rejectCall, endCall, toggleMute, toggleVideo,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Attach streams to media elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (callInfo?.type === 'video' && remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    } else if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callInfo?.type]);

  if (state === 'idle' || !callInfo) return null;

  // ═══════════════════════════════════════════════
  // INCOMING CALL - Ringer Modal
  // ═══════════════════════════════════════════════
  if (state === 'incoming') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.96)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '60px 24px 40px',
      }}>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-3)', marginBottom: '8px' }}>
            {callInfo.type === 'video' ? '📹 مكالمة فيديو واردة' : '📞 مكالمة صوتية واردة'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-4)' }}>نور AI 🌙</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="animate-pulse-slow" style={{
            width: '160px', height: '160px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, ' + callInfo.remoteUserColor + ', ' + callInfo.remoteUserColor + '88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '64px', fontWeight: 900, color: '#fff',
            margin: '0 auto 24px',
            boxShadow: '0 0 80px ' + callInfo.remoteUserColor + '88',
          }}>
            {callInfo.remoteUserAvatar}
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '6px' }}>
            {callInfo.remoteUserName}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-3)' }}>
            يتصل بك...
          </p>
        </div>

        <div style={{ display: 'flex', gap: '60px', alignItems: 'center', marginBottom: '20px' }}>
          {/* Reject */}
          <div style={{ textAlign: 'center' }}>
            <button onClick={rejectCall} style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: '#EF4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(239,68,68,0.5)',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              <PhoneOff size={32} color="#fff" />
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '10px' }}>رفض</p>
          </div>

          {/* Accept */}
          <div style={{ textAlign: 'center' }}>
            <button onClick={acceptCall} style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: '#10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16,185,129,0.5)',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              <Phone size={32} color="#fff" />
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '10px' }}>قبول</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // OUTGOING / CONNECTING / IN-CALL
  // ═══════════════════════════════════════════════
  const isVideo = callInfo.type === 'video';
  const stateLabel = state === 'outgoing' ? '🔄 يرن...' : state === 'connecting' ? '⏳ جاري الاتصال...' : '🟢 ' + formatDuration(callDuration);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Audio (hidden) for audio-only calls */}
      {!isVideo && <audio ref={remoteAudioRef} autoPlay />}

      {/* Remote video (full screen) */}
      {isVideo && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            background: '#1a1a1a',
          }}
        />
      )}

      {/* Audio-only background */}
      {!isVideo && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, ' + callInfo.remoteUserColor + '33 0%, #000 60%)',
        }} />
      )}

      {/* Header overlay */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(var(--safe-top) + 20px) 20px 12px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7), transparent)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
          {isVideo ? '📹 مكالمة فيديو' : '📞 مكالمة صوتية'}
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
          {stateLabel}
        </p>
      </div>

      {/* Remote user info (centered for audio, top for video) */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: isVideo ? 0 : 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: isVideo ? 'flex-start' : 'center',
        padding: isVideo ? '20px 20px 0' : '0 20px',
        gap: '20px',
      }}>
        {!isVideo && (
          <>
            <div style={{
              width: '180px', height: '180px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, ' + callInfo.remoteUserColor + ', ' + callInfo.remoteUserColor + '88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '76px', fontWeight: 900, color: '#fff',
              boxShadow: '0 0 80px ' + callInfo.remoteUserColor + '66',
              animation: state === 'in-call' ? 'none' : 'pulse 2s ease-in-out infinite',
            }}>
              {callInfo.remoteUserAvatar}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>
                {callInfo.remoteUserName}
              </h2>
            </div>
          </>
        )}

        {isVideo && (
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '10px 20px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
          }}>
            {callInfo.remoteUserName}
          </div>
        )}
      </div>

      {/* Local video (small preview, only when video call) */}
      {isVideo && localStream && (
        <div style={{
          position: 'absolute',
          top: 'calc(var(--safe-top) + 80px)',
          left: '16px',
          width: '110px', height: '160px',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          background: '#1a1a1a',
          zIndex: 3,
        }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // mirror
            }}
          />
          {isVideoOff && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <VideoOff size={28} color="#fff" />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '24px 24px calc(var(--safe-bottom) + 32px)',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.85), transparent)',
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
      }}>
        {/* Mute */}
        <ControlButton onClick={toggleMute} active={!isMuted} label={isMuted ? 'مكتوم' : ''} color={isMuted ? '#EF4444' : 'rgba(255,255,255,0.2)'}>
          {isMuted ? <MicOff size={26} color="#fff" /> : <Mic size={26} color="#fff" />}
        </ControlButton>

        {/* Video toggle (only for video calls) */}
        {isVideo && (
          <ControlButton onClick={toggleVideo} active={!isVideoOff} label={isVideoOff ? 'الكاميرا مغلقة' : ''} color={isVideoOff ? '#EF4444' : 'rgba(255,255,255,0.2)'}>
            {isVideoOff ? <VideoOff size={26} color="#fff" /> : <Video size={26} color="#fff" />}
          </ControlButton>
        )}

        {/* End call */}
        <ControlButton onClick={endCall} active label="إنهاء" color="#EF4444">
          <PhoneOff size={28} color="#fff" />
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({ children, onClick, color, label }: any) {
  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={onClick} style={{
        width: '64px', height: '64px',
        borderRadius: '50%',
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer',
        transition: 'all 0.2s',
        backdropFilter: 'blur(8px)',
        boxShadow: color === '#EF4444' ? '0 8px 24px rgba(239,68,68,0.5)' : '0 4px 12px rgba(0,0,0,0.3)',
      }}>
        {children}
      </button>
      {label && (
        <p style={{ fontSize: '11px', color: '#fff', marginTop: '6px', opacity: 0.9 }}>
          {label}
        </p>
      )}
    </div>
  );
}
