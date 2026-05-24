'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  Send, ArrowRight, Users, Smile, Image as ImageIcon,
  Mic, X, Plus, MoreVertical, Lock, Globe
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';
const BACKEND = API.replace('/api', '');

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderColor?: string;
  type: 'text' | 'image' | 'voice';
  content: string;
  duration?: number;
  createdAt: string;
}

interface RoomDetail {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPublic: boolean;
  memberCount: number;
  isMember: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  createdByName: string;
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    color: string;
    online: boolean;
    isAdmin: boolean;
    isOwner: boolean;
  }>;
}

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [me, setMe] = useState<any>(null);
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ id: u.id, name: u.name, token, avatar: u.avatar, color: u.color });
    } catch { router.push('/auth/login'); }
  }, []);

  // Fetch room
  useEffect(() => {
    if (!me?.token || !roomId) return;
    fetch(API + '/rooms/' + roomId, { headers: { Authorization: 'Bearer ' + me.token } })
      .then(r => r.json())
      .then(json => { if (json.success) setRoom(json.room); else router.push('/rooms'); })
      .catch(() => router.push('/rooms'));
  }, [me?.token, roomId]);

  // Socket connection
  useEffect(() => {
    if (!me?.id || !roomId) return;

    const s = io(BACKEND, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      s.emit('user:online', { userId: me.id, userName: me.name });
      s.emit('room:join', { roomId });
    });

    s.on('room:history', (msgs: Message[]) => setMessages(msgs));

    s.on('room:message', (msg: Message) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
    });

    s.on('room:typing', ({ userName, isTyping }: any) => {
      setTypingNames(prev => {
        if (isTyping) return Array.from(new Set([...prev, userName]));
        return prev.filter(n => n !== userName);
      });
    });

    s.on('room:member-joined', ({ member }: any) => {
      setRoom(r => r ? {
        ...r,
        memberCount: r.memberCount + 1,
        members: [...r.members, { ...member, isAdmin: false, isOwner: false }],
      } : r);
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
    if (!input.trim() || !socket) return;
    socket.emit('room:send', {
      roomId,
      message: { type: 'text', content: input.trim() },
    });
    setInput('');
    socket.emit('room:typing', { roomId, isTyping: false });
  };

  const onTyping = () => {
    if (!socket) return;
    socket.emit('room:typing', { roomId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('room:typing', { roomId, isTyping: false });
    }, 2000);
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  if (!room) {
    return (
      <div style={{
        minHeight: '100dvh', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#10B981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Decorative glow background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '300px',
        background: `radial-gradient(ellipse at top, ${room.color}22, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        padding: 'calc(env(safe-area-inset-top) + 12px) 16px 12px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
        zIndex: 10,
      }}>
        <button onClick={() => router.push('/rooms')} style={{
          width: '36px', height: '36px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <ArrowRight size={20} />
        </button>

        <div style={{
          width: '40px', height: '40px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${room.color}, ${room.color}aa)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
          boxShadow: `0 4px 16px ${room.color}66`,
          flexShrink: 0,
        }}>
          {room.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>
              {room.name}
            </h2>
            {!room.isPublic && <Lock size={12} color="#FBBF24" />}
          </div>
          <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
            {room.memberCount} عضو • {room.members.filter(m => m.online).length} متصل
          </p>
        </div>

        <button onClick={() => setShowMembers(true)} style={{
          width: '36px', height: '36px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Users size={18} />
        </button>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Welcome message */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '70px', height: '70px',
            margin: '0 auto 12px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${room.color}, ${room.color}aa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
            boxShadow: `0 12px 32px ${room.color}55`,
          }}>
            {room.icon}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
            مرحباً بك في {room.name}
          </h3>
          <p style={{ fontSize: '12px', color: '#6B7280', maxWidth: '400px', margin: '0 auto' }}>
            {room.description || 'ابدأ المحادثة مع الأعضاء'}
          </p>
        </div>

        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', fontSize: '12px' }}>
            لا توجد رسائل بعد. كن أول من يكتب! 👋
          </div>
        )}

        {messages.map((m, i) => {
          const fromMe = m.senderId === me?.id;
          const prev = messages[i - 1];
          const showAvatar = !prev || prev.senderId !== m.senderId;
          const senderColor = m.senderColor || '#10B981';
          const senderAvatar = m.senderAvatar || m.senderName[0];

          return (
            <div
              key={m.id}
              className="msg-bubble"
              style={{
                display: 'flex',
                justifyContent: fromMe ? 'flex-start' : 'flex-end',
                marginBottom: showAvatar ? '12px' : '2px',
                alignItems: 'flex-end',
                gap: '8px',
              }}
            >
              {!fromMe && (
                <div style={{ width: '32px', flexShrink: 0 }}>
                  {showAvatar && (
                    <div style={{
                      width: '32px', height: '32px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${senderColor}, ${senderColor}aa)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 900,
                    }}>
                      {senderAvatar}
                    </div>
                  )}
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: fromMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: fromMe
                  ? `linear-gradient(135deg, ${room.color}, ${room.color}cc)`
                  : 'rgba(255,255,255,0.06)',
                border: fromMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
                {!fromMe && showAvatar && (
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: senderColor,
                    marginBottom: '4px',
                  }}>
                    {m.senderName}
                  </div>
                )}
                <div style={{
                  fontSize: '14px',
                  lineHeight: 1.5,
                  color: fromMe ? '#fff' : '#E5E7EB',
                  direction: 'rtl',
                  wordBreak: 'break-word',
                }}>
                  {m.content}
                </div>
                <div style={{
                  fontSize: '9px',
                  opacity: 0.6,
                  marginTop: '4px',
                  textAlign: 'left',
                }}>
                  {fmtTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        {typingNames.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '8px',
          }}>
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px 16px 16px 4px',
              fontSize: '11px',
              color: '#9CA3AF',
            }}>
              {typingNames.join(', ')} يكتب...
              <span style={{ marginInlineStart: '4px' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    display: 'inline-block',
                    width: '4px', height: '4px',
                    borderRadius: '50%',
                    background: room.color,
                    margin: '0 1px',
                    animation: `pulse 1s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 16px calc(env(safe-area-inset-bottom) + 12px)',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <textarea
            value={input}
            onChange={e => {
              setInput(e.target.value);
              onTyping();
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="اكتب رسالة..."
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '14px',
              resize: 'none',
              maxHeight: '100px',
              direction: 'rtl',
              padding: '10px 0',
              lineHeight: 1.5,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            width: '44px', height: '44px',
            borderRadius: '50%',
            background: input.trim()
              ? `linear-gradient(135deg, ${room.color}, ${room.color}cc)`
              : 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            boxShadow: input.trim() ? `0 8px 20px ${room.color}66` : 'none',
            transition: 'all 0.3s',
          }}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Members panel */}
      {showMembers && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
        }} onClick={() => setShowMembers(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%',
            maxHeight: '70vh',
            background: 'linear-gradient(180deg, #111827, #000)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px',
            overflowY: 'auto',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255,255,255,0.2)',
              margin: '0 auto 20px',
            }} />

            <h3 style={{
              fontSize: '18px',
              fontWeight: 800,
              marginBottom: '4px',
              textAlign: 'center',
            }}>
              الأعضاء ({room.memberCount})
            </h3>
            <p style={{
              fontSize: '11px',
              color: '#9CA3AF',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              {room.members.filter(m => m.online).length} متصل الآن
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {room.members.map(member => (
                <div key={member.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '40px', height: '40px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${member.color}, ${member.color}aa)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 900,
                    }}>
                      {member.avatar}
                    </div>
                    {member.online && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0, right: 0,
                        width: '12px', height: '12px',
                        borderRadius: '50%',
                        background: '#10B981',
                        border: '2px solid #000',
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>
                      {member.name}
                      {member.isOwner && <span style={{ fontSize: '10px', color: '#FBBF24', marginInlineStart: '6px' }}>👑 المنشئ</span>}
                      {member.isAdmin && !member.isOwner && <span style={{ fontSize: '10px', color: '#67E8F9', marginInlineStart: '6px' }}>⭐ مشرف</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: member.online ? '#10B981' : '#6B7280' }}>
                      {member.online ? 'متصل الآن' : 'غير متصل'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .msg-bubble {
          animation: msgIn 0.3s ease-out;
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
