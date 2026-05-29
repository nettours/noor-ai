'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Send, ArrowRight, Users, Video, X, Mic, Phone } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';
const BACKEND = API.replace('/api', '');

interface Message {
  id: string; senderId: string; senderName: string;
  senderAvatar?: string; senderColor?: string;
  type: string; content: string; createdAt: string;
  _pending?: boolean;
}

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [me, setMe] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [callMode, setCallMode] = useState<'join' | 'live'>('join');
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ id: u.id, name: u.name, token, avatar: u.avatar || u.name?.[0] || '?', color: u.color || '#10B981' });
    } catch { router.push('/auth/login'); }
  }, []);

  useEffect(() => {
    if (!me?.token || !roomId) return;
    fetch(API + '/rooms/' + roomId, { headers: { Authorization: 'Bearer ' + me.token } })
      .then(r => r.json())
      .then(json => { if (json.success) setRoom(json.room); else router.push('/rooms'); })
      .catch(() => router.push('/rooms'));
  }, [me?.token, roomId]);

  useEffect(() => {
    if (!me?.id || !roomId) return;
    const s = io(BACKEND, { transports: ['websocket', 'polling'] });
    socketRef.current = s;

    const goOnline = () => {
      s.emit('user:online', { userId: me.id, userName: me.name });
      s.emit('room:join', { roomId });
    };

    s.on('connect', goOnline);
    s.on('reconnect', goOnline);

    s.on('room:history', (msgs: Message[]) => setMessages(msgs || []));

    s.on('room:message', (msg: Message) => {
      setMessages(prev => {
        // استبدل النسخة المعلّقة (pending) من نفس المستخدم بنفس المحتوى
        const pendingIdx = prev.findIndex(m => m._pending && m.senderId === msg.senderId && m.content === msg.content);
        if (pendingIdx !== -1) {
          const updated = [...prev];
          updated[pendingIdx] = msg;
          return updated;
        }
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    s.on('room:typing', ({ userName, isTyping }: any) => {
      if (!userName || userName === me.name) return;
      setTypingNames(prev => isTyping
        ? Array.from(new Set([...prev, userName]))
        : prev.filter(n => n !== userName));
    });

    return () => {
      s.emit('room:leave', { roomId });
      s.disconnect();
    };
  }, [me?.id, roomId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingNames]);

  const send = () => {
    const content = input.trim();
    const s = socketRef.current;
    if (!content || !s || !me) return;

    const tempId = 'tmp_' + Date.now();

    // Optimistic: أظهر الرسالة فوراً
    const optimistic: Message = {
      id: tempId,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      senderColor: me.color,
      type: 'text',
      content,
      createdAt: new Date().toISOString(),
      _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);

    // أرسل مع بيانات المرسل (sender) لضمان قبول الـ Backend
    s.emit('room:send', {
      roomId,
      message: { id: tempId, type: 'text', content },
      sender: { id: me.id, name: me.name, avatar: me.avatar, color: me.color },
    });

    setInput('');
    s.emit('room:typing', { roomId, isTyping: false });
  };

  const onTyping = () => {
    const s = socketRef.current;
    if (!s) return;
    s.emit('room:typing', { roomId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      s.emit('room:typing', { roomId, isTyping: false });
    }, 2000);
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  if (!room) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (showCall) {
    // شاشة الانضمام الأنيقة
    if (callMode === 'join') {
      return (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: `linear-gradient(160deg, ${room.color}, #000)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '60%', height: '40%', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(80px)' }} />

          <button onClick={() => setShowCall(false)} style={{
            position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: '16px',
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X size={22} />
          </button>

          <div style={{
            width: '110px', height: '110px', borderRadius: '32px',
            background: `linear-gradient(135deg, ${room.color}, ${room.color}aa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '54px', marginBottom: '24px',
            boxShadow: `0 20px 60px ${room.color}88`,
            animation: 'callPulse 2s infinite',
          }}>{room.icon}</div>

          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '6px', textAlign: 'center' }}>
            {room.name}
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
            مكالمة جماعية
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '999px',
            background: 'rgba(0,0,0,0.25)', marginBottom: '40px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
              {room.members?.filter((m: any) => m.online).length || 0} متصل في الغرفة
            </span>
          </div>

          {/* اختيار النوع */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '32px', width: '100%', maxWidth: '320px' }}>
            <button onClick={() => setCallType('video')} style={{
              flex: 1, padding: '20px', borderRadius: '20px',
              background: callType === 'video' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
              border: callType === 'video' ? '2px solid #fff' : '2px solid transparent',
              color: '#fff', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}>
              <Video size={28} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>بالفيديو</span>
            </button>
            <button onClick={() => setCallType('audio')} style={{
              flex: 1, padding: '20px', borderRadius: '20px',
              background: callType === 'audio' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
              border: callType === 'audio' ? '2px solid #fff' : '2px solid transparent',
              color: '#fff', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}>
              <Mic size={28} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>صوت فقط</span>
            </button>
          </div>

          {/* زر الانضمام */}
          <button onClick={() => {
            // أعلِم الغرفة ببدء المكالمة
            socketRef.current?.emit('room:send', {
              roomId,
              message: { id: 'call_' + Date.now(), type: 'text', content: `📹 بدأتُ مكالمة جماعية ${callType === 'video' ? 'بالفيديو' : 'صوتية'} — انضموا إلينا!` },
              sender: { id: me.id, name: me.name, avatar: me.avatar, color: me.color },
            });
            setCallMode('live');
          }} style={{
            width: '100%', maxWidth: '320px', padding: '18px', borderRadius: '18px',
            background: '#10B981', border: 'none', color: '#fff',
            fontSize: '17px', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 12px 32px rgba(16,185,129,0.5)',
          }}>
            <Video size={22} /> انضمّ الآن
          </button>

          <style>{`@keyframes callPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
        </div>
      );
    }

    // المكالمة الجارية (Jitsi)
    const config = callType === 'audio'
      ? '&config.startWithVideoMuted=true'
      : '';
    const jitsiUrl = `https://meet.jit.si/noor-ai-${roomId}#userInfo.displayName="${encodeURIComponent(me.name)}"&config.prejoinPageEnabled=false${config}`;
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px', background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => { setShowCall(false); setCallMode('join'); }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
              {callType === 'video' ? '📹' : '🎙️'} {room.name}
            </div>
            <div style={{ fontSize: '11px', color: '#10B981' }}>● مكالمة جارية</div>
          </div>
        </div>
        <iframe src={jitsiUrl} style={{ flex: 1, width: '100%', border: 'none' }} allow="camera; microphone; fullscreen; display-capture; autoplay" />
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9999 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '300px', background: `radial-gradient(ellipse at top, ${room.color}22, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 10 }}>
        <button onClick={() => router.push('/rooms')} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowRight size={20} />
        </button>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${room.color}, ${room.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{room.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800 }}>{room.name}</h2>
          <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{room.memberCount} عضو • {room.members?.filter((m: any) => m.online).length || 0} متصل</p>
        </div>
        <button onClick={() => { setCallMode('join'); setShowCall(true); }} style={{ padding: '8px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
          <Video size={16} /> مكالمة
        </button>
        <button onClick={() => setShowMembers(true)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Users size={18} />
        </button>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', position: 'relative', zIndex: 2 }}>
        {/* بانر مكالمة جارية */}
        {(() => {
          const recent = messages.slice(-12);
          const callMsg = [...recent].reverse().find(m => m.content?.includes('📹 بدأتُ مكالمة') || m.content?.includes('بدأ مكالمة'));
          if (!callMsg || showCall) return null;
          // أظهر البانر فقط إذا المكالمة "حديثة" (آخر 12 رسالة)
          return (
            <div style={{
              position: 'sticky', top: 0, zIndex: 20,
              marginBottom: '12px',
              padding: '12px 16px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
              animation: 'callBannerIn 0.4s ease-out',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'callRing 1.5s infinite',
              }}>
                <Video size={20} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>مكالمة جماعية جارية</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>اضغط للانضمام الآن</div>
              </div>
              <button onClick={() => { setCallMode('join'); setShowCall(true); }} style={{
                padding: '8px 18px', borderRadius: '999px',
                background: '#fff', border: 'none', color: '#059669',
                fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Phone size={14} /> انضمّ
              </button>
            </div>
          );
        })()}

        <div style={{ textAlign: 'center', padding: '20px', marginBottom: '12px' }}>
          <div style={{ width: '64px', height: '64px', margin: '0 auto 10px', borderRadius: '18px', background: `linear-gradient(135deg, ${room.color}, ${room.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>{room.icon}</div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{room.name}</h3>
          <p style={{ fontSize: '12px', color: '#6B7280' }}>{room.description}</p>
        </div>

        {messages.map((m, i) => {
          const fromMe = m.senderId === me?.id;
          const prev = messages[i - 1];
          const showAvatar = !prev || prev.senderId !== m.senderId;
          const senderColor = m.senderColor || '#10B981';
          const senderAvatar = m.senderAvatar || m.senderName?.[0] || '?';

          return (
            <div key={m.id} className="msg-bubble" style={{ display: 'flex', justifyContent: fromMe ? 'flex-start' : 'flex-end', marginBottom: showAvatar ? '12px' : '2px', alignItems: 'flex-end', gap: '8px', opacity: m._pending ? 0.7 : 1 }}>
              {!fromMe && (
                <div style={{ width: '32px', flexShrink: 0 }}>
                  {showAvatar && (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${senderColor}, ${senderColor}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>{senderAvatar}</div>
                  )}
                </div>
              )}
              <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: fromMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: fromMe ? `linear-gradient(135deg, ${room.color}, ${room.color}cc)` : 'rgba(255,255,255,0.06)', border: fromMe ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                {!fromMe && showAvatar && (
                  <div style={{ fontSize: '11px', fontWeight: 800, color: senderColor, marginBottom: '4px' }}>{m.senderName}</div>
                )}
                <div style={{ fontSize: '14px', lineHeight: 1.5, color: fromMe ? '#fff' : '#E5E7EB', direction: 'rtl', wordBreak: 'break-word' }}>{m.content}</div>
                <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: 'left' }}>{fmtTime(m.createdAt)} {m._pending && '⏳'}</div>
              </div>
            </div>
          );
        })}

        {typingNames.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px', fontSize: '11px', color: '#9CA3AF' }}>
              {typingNames.join(', ')} يكتب...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 100px)', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-end', gap: '8px', position: 'relative', zIndex: 100 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '4px 14px', display: 'flex', alignItems: 'center' }}>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); onTyping(); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="اكتب رسالة..."
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', resize: 'none', maxHeight: '100px', direction: 'rtl', padding: '10px 0', lineHeight: 1.5, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <button onClick={send} disabled={!input.trim()} style={{ width: '44px', height: '44px', borderRadius: '50%', background: input.trim() ? `linear-gradient(135deg, ${room.color}, ${room.color}cc)` : 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'all 0.3s' }}>
          <Send size={18} />
        </button>
      </div>

      {/* Members */}
      {showMembers && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowMembers(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '70vh', background: 'linear-gradient(180deg, #111827, #000)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', overflowY: 'auto' }}>
            <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', marginBottom: '4px' }}>الأعضاء ({room.memberCount})</h3>
            <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginBottom: '20px' }}>{room.members?.filter((m: any) => m.online).length || 0} متصل الآن</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {room.members?.map((member: any) => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${member.color}, ${member.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900 }}>{member.avatar}</div>
                    {member.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: '#10B981', border: '2px solid #000' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>
                      {member.name}
                      {member.isOwner && <span style={{ fontSize: '10px', color: '#FBBF24', marginInlineStart: '6px' }}>👑</span>}
                      {member.isBot && <span style={{ fontSize: '10px', color: '#67E8F9', marginInlineStart: '6px' }}>🤖</span>}
                    </div>
                    {member.bio && <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{member.bio}</div>}
                    <div style={{ fontSize: '10px', color: member.online ? '#10B981' : '#6B7280', marginTop: '2px' }}>{member.online ? '🟢 متصل' : '⚪ غير متصل'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .msg-bubble { animation: msgIn 0.3s ease-out; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes callBannerIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes callRing { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
      `}</style>
    </div>
  );
}
