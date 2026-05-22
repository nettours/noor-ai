'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  Send, ArrowRight, Search, Plus, Smile, Paperclip,
  Phone, Video, MoreVertical, Check, CheckCheck,
  Image as ImageIcon, Mic, Square, X, File as FileIcon,
  Download, Play, Pause, Users, Bell, Settings
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  color: string;
  online: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image' | 'file' | 'voice';
  content: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export default function ChatPage() {
  const router = useRouter();
  const [me, setMe] = useState({ id: '', name: '', avatar: '', color: 'var(--green-5)' });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [active, setActive] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  // ── Init user ────────────────────────────────────────
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      const myId = u.email || u.name || 'user_' + Date.now();
      setMe({
        id: myId,
        name: u.name || 'مستخدم',
        avatar: (u.name || 'م')[0],
        color: 'var(--green-5)',
      });
    } catch {}

    // Fetch contacts
    fetch(BACKEND_URL + '/api/users')
      .then(r => r.json())
      .then(d => setContacts(d.users || []))
      .catch(() => {
        // Fallback mock data
        setContacts([
          { id: 'u1', name: 'أحمد محمد', avatar: 'أ', color: '#10B981', online: true },
          { id: 'u2', name: 'فاطمة الزهراء', avatar: 'ف', color: '#F59E0B', online: true },
          { id: 'u3', name: 'يوسف بن خالد', avatar: 'ي', color: '#3B82F6', online: false },
          { id: 'u4', name: 'مريم العزيز', avatar: 'م', color: '#EC4899', online: false },
        ]);
      });
  }, []);

  // ── Connect Socket.io ─────────────────────────────────
  useEffect(() => {
    if (!me.id) return;

    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('user:online', { userId: me.id, userName: me.name });
      console.log('💬 Connected to chat server');
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('chat:history', (history: Message[]) => {
      setMessages(history);
    });

    socket.on('chat:message', (msg: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Auto-mark as read if I'm viewing this conversation
      if (active && msg.conversationId === getConvId(me.id, active.id) && msg.senderId !== me.id) {
        socket.emit('chat:read', { conversationId: msg.conversationId, messageId: msg.id });
      }
    });

    socket.on('chat:status', ({ messageId, status }: any) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m));
    });

    socket.on('chat:typing', ({ userId, isTyping }: any) => {
      setTypingUsers(prev => isTyping
        ? Array.from(new Set([...prev, userId]))
        : prev.filter(id => id !== userId)
      );
    });

    socket.on('chat:deleted', ({ messageId }: any) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    return () => { socket.disconnect(); };
  }, [me.id, me.name]);

  // ── Join/leave conversation ───────────────────────────
  useEffect(() => {
    if (!socketRef.current || !active) return;
    const convId = getConvId(me.id, active.id);
    socketRef.current.emit('chat:join', { conversationId: convId });
    return () => {
      socketRef.current?.emit('chat:leave', { conversationId: convId });
    };
  }, [active, me.id]);

  // ── Auto-scroll ───────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // ── Helpers ───────────────────────────────────────────
  const getConvId = (a: string, b: string) => [a, b].sort().join('__');

  const sendMessage = (msgData: Partial<Message>) => {
    if (!active || !socketRef.current) return;
    const msg: Message = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      conversationId: getConvId(me.id, active.id),
      senderId: me.id,
      senderName: me.name,
      type: 'text',
      content: '',
      createdAt: new Date().toISOString(),
      status: 'sent',
      ...msgData,
    } as Message;
    socketRef.current.emit('chat:send', msg);
  };

  const sendText = () => {
    if (!input.trim()) return;
    sendMessage({ type: 'text', content: input.trim() });
    setInput('');
    stopTyping();
  };

  // ── Typing ────────────────────────────────────────────
  const startTyping = () => {
    if (!active || !socketRef.current) return;
    socketRef.current.emit('chat:typing', {
      conversationId: getConvId(me.id, active.id),
      isTyping: true,
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (!active || !socketRef.current) return;
    socketRef.current.emit('chat:typing', {
      conversationId: getConvId(me.id, active.id),
      isTyping: false,
    });
    clearTimeout(typingTimeoutRef.current);
  };

  // ── File handling ─────────────────────────────────────
  const handleFile = async (file: File, type: 'image' | 'file') => {
    if (file.size > 50 * 1024 * 1024) {
      toast('الملف كبير جداً (أقصى 50MB)', 'error');
      return;
    }
    toast('📤 جاري الرفع...', 'info');
    const reader = new FileReader();
    reader.onload = () => {
      sendMessage({
        type,
        content: reader.result as string,
        fileName: file.name,
        fileSize: file.size,
      });
      setShowAttach(false);
    };
    reader.readAsDataURL(file);
  };

  // ── Voice recording ───────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      recordChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(recordChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          sendMessage({
            type: 'voice',
            content: reader.result as string,
            duration: recordTime,
          });
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      setRecording(true);
      setRecordTime(0);
      recordTimerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch (err) {
      toast('الرجاء السماح بالميكروفون', 'error');
    }
  };

  const stopRecording = (cancel = false) => {
    clearInterval(recordTimerRef.current);
    setRecording(false);
    if (cancel) {
      mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    } else {
      mediaRecorderRef.current?.stop();
    }
  };

  // ── UI helpers ────────────────────────────────────────
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  const fmtDuration = (s: number) => {
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  const fmtSize = (b: number) => {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(1) + ' MB';
  };

  const filtered = contacts.filter(c => !search || c.name.includes(search));

  // ════════════════════════════════════════════════════
  // CHAT VIEW
  // ════════════════════════════════════════════════════
  if (active) {
    const isTyping = typingUsers.includes(active.id);
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--bg-1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <header className="glass-strong" style={{
          padding: 'calc(var(--safe-top) + 8px) 14px 12px',
          display: 'flex', alignItems: 'center', gap: '12px',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <button onClick={() => setActive(null)} style={{ padding: '8px', color: 'var(--text-1)' }}>
            <ArrowRight size={22} />
          </button>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'linear-gradient(135deg, ' + active.color + ', ' + active.color + '88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 900,
            color: '#fff',
            position: 'relative',
            flexShrink: 0,
          }}>
            {active.avatar}
            {active.online && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '12px', height: '12px', borderRadius: '50%',
                background: 'var(--green-5)',
                border: '2px solid var(--bg-1)',
              }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{active.name}</div>
            <div style={{ fontSize: '11px', color: isTyping ? 'var(--green-5)' : active.online ? 'var(--green-5)' : 'var(--text-3)' }}>
              {isTyping ? '✍️ يكتب...' : active.online ? '🟢 متصل' : 'غير متصل'}
              {!connected && ' • ⚠️ غير متصل بالسيرفر'}
            </div>
          </div>
          <button style={iconBtn} onClick={() => toast('🚧 المكالمات قريباً')}><Phone size={20} /></button>
          <button style={iconBtn} onClick={() => toast('🚧 الفيديو قريباً')}><Video size={20} /></button>
        </header>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <span className="badge badge-gold" style={{ fontSize: '11px' }}>
              🔒 محادثة مشفّرة
            </span>
          </div>

          {messages.filter(m => m.conversationId === getConvId(me.id, active.id)).map((m, i, arr) => {
            const prev = arr[i - 1];
            const fromMe = m.senderId === me.id;
            const showAvatar = !prev || prev.senderId !== m.senderId;
            return (
              <MessageBubble
                key={m.id}
                msg={m}
                fromMe={fromMe}
                showAvatar={showAvatar}
                avatar={active.avatar}
                color={active.color}
                fmtTime={fmtTime}
                fmtSize={fmtSize}
                fmtDuration={fmtDuration}
              />
            );
          })}

          {isTyping && (
            <div className="animate-fade-in" style={{ display: 'flex', alignSelf: 'flex-end' }}>
              <div style={{
                padding: '12px 14px',
                background: 'var(--bg-3)',
                borderRadius: '18px 4px 18px 18px',
                border: '1px solid var(--border-2)',
                display: 'flex', gap: '4px',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--text-3)',
                    animation: 'pulse 1s ' + (i * 0.2) + 's ease-in-out infinite',
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Recording UI */}
        {recording && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.1)',
            borderTop: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: '#EF4444',
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '13px', color: '#F87171', fontWeight: 700 }}>
              🎤 جاري التسجيل... {fmtDuration(recordTime)}
            </span>
            <div style={{ flex: 1 }} />
            <button onClick={() => stopRecording(true)} style={{ padding: '6px 12px', color: '#F87171', fontSize: '13px' }}>
              إلغاء
            </button>
            <button onClick={() => stopRecording(false)} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--green-4)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Send size={16} />
            </button>
          </div>
        )}

        {/* Input */}
        {!recording && (
          <div style={{
            padding: '10px 14px',
            paddingBottom: 'calc(10px + var(--safe-bottom))',
            background: 'var(--bg-glass-strong)',
            borderTop: '1px solid var(--border-2)',
            display: 'flex', alignItems: 'flex-end', gap: '8px',
          }}>
            <button
              onClick={() => setShowAttach(!showAttach)}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--bg-3)', color: 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transform: showAttach ? 'rotate(45deg)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Plus size={22} />
            </button>

            <div style={{
              flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border-2)',
              borderRadius: '22px', padding: '4px 12px',
              display: 'flex', alignItems: 'flex-end',
            }}>
              <textarea
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  startTyping();
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); }}}
                placeholder="اكتب رسالة..."
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: 'var(--text-0)', fontSize: '14px',
                  resize: 'none', maxHeight: '100px',
                  direction: 'rtl', padding: '8px 6px',
                  lineHeight: 1.5, outline: 'none',
                }}
              />
            </div>

            <button
              onClick={input.trim() ? sendText : startRecording}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: input.trim()
                  ? 'linear-gradient(135deg, var(--green-3), var(--green-5))'
                  : 'var(--bg-3)',
                color: input.trim() ? '#fff' : 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, border: 'none', cursor: 'pointer',
                boxShadow: input.trim() ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {input.trim() ? <Send size={18} /> : <Mic size={20} />}
            </button>
          </div>
        )}

        {/* Attach panel */}
        {showAttach && !recording && (
          <div style={{
            position: 'absolute',
            bottom: '80px', left: '16px', right: '16px',
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border-3)',
            borderRadius: 'var(--r-lg)',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            zIndex: 10,
            boxShadow: 'var(--shadow-lg)',
          }}>
            {[
              { icon: <ImageIcon size={22} />, label: 'صورة', color: 'var(--purple-5)', onClick: () => imageInputRef.current?.click() },
              { icon: <FileIcon size={22} />, label: 'ملف', color: 'var(--blue-5)', onClick: () => fileInputRef.current?.click() },
              { icon: '📿', label: 'دعاء', color: 'var(--green-5)', onClick: () => { sendMessage({ type: 'text', content: '🤲 جزاك الله خيراً' }); setShowAttach(false); } },
              { icon: '📖', label: 'آية', color: 'var(--gold-5)', onClick: () => { sendMessage({ type: 'text', content: '﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾' }); setShowAttach(false); } },
            ].map((a: any, i) => (
              <button key={i} onClick={a.onClick} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '6px',
                background: 'var(--bg-3)', borderRadius: 'var(--r-md)',
                padding: '14px 8px',
                border: '1px solid var(--border-2)',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: a.color + '22', color: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  {a.icon}
                </div>
                <span style={{ fontSize: '11px' }}>{a.label}</span>
              </button>
            ))}
          </div>
        )}

        <input ref={imageInputRef} type="file" accept="image/*" hidden
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], 'image')} />
        <input ref={fileInputRef} type="file" hidden
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], 'file')} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // CONTACTS LIST
  // ════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100dvh', paddingTop: 'var(--safe-top)' }}>
      <div className="container-app" style={{ padding: '0 16px' }}>
        <header className="animate-fade-down" style={{ paddingTop: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900 }}>💬 الدردشة</h1>
              <div style={{ fontSize: '11px', color: connected ? 'var(--green-5)' : 'var(--text-3)', marginTop: '2px' }}>
                {connected ? '🟢 متصل بالسيرفر' : '⚠️ غير متصل'}
              </div>
            </div>
            <button onClick={() => router.push('/home')} style={iconBtn}><ArrowRight size={20} /></button>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            borderRadius: 'var(--r-full)', padding: '10px 16px',
          }}>
            <Search size={18} color="var(--text-3)" />
            <input
              type="text"
              placeholder="ابحث عن جهة اتصال..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: 'var(--text-0)', fontSize: '14px', direction: 'rtl',
                outline: 'none',
              }}
            />
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={'animate-fade-up delay-' + Math.min(i + 1, 8)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 8px',
                borderBottom: '1px solid var(--border-1)',
                cursor: 'pointer', textAlign: 'right',
                borderRadius: 'var(--r-sm)',
                width: '100%',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, ' + c.color + ', ' + c.color + '88)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 900, color: '#fff',
                }}>
                  {c.avatar}
                </div>
                {c.online && (
                  <div style={{
                    position: 'absolute', bottom: '2px', right: '2px',
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: 'var(--green-5)',
                    border: '2px solid var(--bg-0)',
                    boxShadow: '0 0 8px var(--green-5)',
                  }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: '12px', color: c.online ? 'var(--green-5)' : 'var(--text-3)', marginTop: '2px' }}>
                  {c.online ? '🟢 متصل الآن' : 'غير متصل'}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}

// ── Message Bubble Component ─────────────────────────────
function MessageBubble({ msg, fromMe, showAvatar, avatar, color, fmtTime, fmtSize, fmtDuration }: any) {
  return (
    <div className="animate-fade-up" style={{
      display: 'flex',
      justifyContent: fromMe ? 'flex-start' : 'flex-end',
      alignItems: 'flex-end',
      gap: '8px',
      marginTop: showAvatar ? '8px' : '1px',
    }}>
      {!fromMe && (
        <div style={{ width: '28px', flexShrink: 0 }}>
          {showAvatar && (
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, ' + color + ', ' + color + '88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 900,
            }}>{avatar}</div>
          )}
        </div>
      )}

      <div style={{
        maxWidth: msg.type === 'image' ? '70%' : '75%',
        padding: msg.type === 'image' ? '4px' : '8px 12px',
        borderRadius: fromMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: fromMe
          ? 'linear-gradient(135deg, var(--green-3), var(--green-4))'
          : 'var(--bg-3)',
        border: fromMe ? 'none' : '1px solid var(--border-2)',
        color: fromMe ? '#FFF' : 'var(--text-0)',
        fontSize: '14px', lineHeight: 1.6,
        direction: 'rtl', textAlign: 'right',
        boxShadow: fromMe ? '0 2px 8px rgba(16,185,129,0.2)' : 'none',
        overflow: 'hidden',
      }}>
        {msg.type === 'text' && <div>{msg.content}</div>}

        {msg.type === 'image' && (
          <div>
            <img src={msg.content} alt="image" style={{ width: '100%', maxWidth: '280px', borderRadius: '14px', display: 'block' }} />
          </div>
        )}

        {msg.type === 'file' && (
          <a href={msg.content} download={msg.fileName} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            color: 'inherit', textDecoration: 'none', padding: '4px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileIcon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {msg.fileName}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{fmtSize(msg.fileSize || 0)}</div>
            </div>
            <Download size={18} />
          </a>
        )}

        {msg.type === 'voice' && <VoicePlayer src={msg.content} duration={msg.duration || 0} fromMe={fromMe} />}

        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          justifyContent: 'flex-end', fontSize: '10px',
          marginTop: '4px', opacity: 0.7,
          paddingRight: msg.type === 'image' ? '8px' : 0,
          paddingBottom: msg.type === 'image' ? '4px' : 0,
        }}>
          <span>{fmtTime(msg.createdAt)}</span>
          {fromMe && (
            msg.status === 'read' ? <CheckCheck size={12} color="#60A5FA" /> :
            msg.status === 'delivered' ? <CheckCheck size={12} /> :
            <Check size={12} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Voice Player ────────────────────────────────────────
function VoicePlayer({ src, duration, fromMe }: any) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '4px',
      minWidth: '180px',
    }}>
      <audio ref={audioRef} src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button onClick={toggle} style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        color: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer',
      }}>
        {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
      </button>
      <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
        <div style={{ width: playing ? '50%' : '0%', height: '100%', background: '#fff', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: '11px', opacity: 0.8 }}>
        {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: '40px', height: '40px', borderRadius: '50%',
  background: 'var(--bg-3)', border: '1px solid var(--border-2)',
  color: 'var(--text-2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};
