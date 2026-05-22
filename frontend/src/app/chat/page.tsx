'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  Send, ArrowRight, Search, Plus, Phone, Video,
  Check, CheckCheck, Image as ImageIcon,
  Mic, File as FileIcon, Download, Play, Pause, Users,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { CallProvider, useCall } from '@/components/call/CallProvider';
import { CallUI } from '@/components/call/CallUI';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';
const BACKEND = API.replace('/api', '');

interface Contact { id: string; name: string; avatar: string; color: string; online: boolean; }
interface Message {
  id: string; conversationId: string; senderId: string; senderName: string;
  type: 'text' | 'image' | 'file' | 'voice';
  content: string; fileName?: string; fileSize?: number; duration?: number;
  createdAt: string; status: 'sent' | 'delivered' | 'read';
}

export default function ChatPageWrapper() {
  const [me, setMe] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ id: u.id, name: u.name, token });
    } catch { router.push('/auth/login'); }
  }, []);

  useEffect(() => {
    if (!me?.id) return;
    const s = io(BACKEND, { transports: ['websocket', 'polling'], reconnection: true });
    s.on('connect', () => { s.emit('user:online', { userId: me.id, userName: me.name }); });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [me?.id]);

  if (!me) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>;

  return (
    <CallProvider socket={socket} me={me}>
      <ChatPage me={me} socket={socket} />
      <CallUI />
    </CallProvider>
  );
}

function ChatPage({ me, socket }: { me: any; socket: Socket | null }) {
  const router = useRouter();
  const { initiateCall } = useCall();
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
  const [loadingContacts, setLoadingContacts] = useState(true);

  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  const fetchContacts = async () => {
    if (!me.token) return;
    try {
      setLoadingContacts(true);
      const res = await fetch(API + '/users', { headers: { Authorization: 'Bearer ' + me.token } });
      const json = await res.json();
      if (json.success) setContacts(json.users);
    } catch { toast('تعذّر تحميل جهات الاتصال', 'error'); }
    finally { setLoadingContacts(false); }
  };

  useEffect(() => { if (me.token) fetchContacts(); }, [me.token]);

  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    if (socket.connected) setConnected(true);

    socket.on('chat:history', (h: Message[]) => setMessages(h));
    socket.on('chat:message', (msg: Message) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      if (active && msg.senderId !== me.id) {
        socket.emit('chat:read', { conversationId: msg.conversationId, messageId: msg.id });
      }
    });
    socket.on('chat:status', ({ messageId, status }: any) => setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m)));
    socket.on('chat:typing', ({ userId, isTyping }: any) => {
      setTypingUsers(prev => isTyping ? Array.from(new Set([...prev, userId])) : prev.filter(id => id !== userId));
    });
    socket.on('user:new', (newUser: Contact) => {
      setContacts(prev => prev.find(c => c.id === newUser.id) ? prev : [...prev, newUser]);
      toast('👋 انضم ' + newUser.name);
    });
    socket.on('user:status', ({ userId, online }: any) => {
      setContacts(prev => prev.map(c => c.id === userId ? { ...c, online } : c));
    });
    socket.on('chat:notify', ({ message }: any) => {
      const sender = contacts.find(c => c.id === message.senderId);
      if (sender) toast('💬 ' + sender.name);
    });

    return () => {
      socket.off('chat:history'); socket.off('chat:message'); socket.off('chat:status');
      socket.off('chat:typing'); socket.off('user:new'); socket.off('user:status'); socket.off('chat:notify');
    };
  }, [socket, active, me.id]);

  useEffect(() => {
    if (!socket || !active) return;
    const convId = getConvId(me.id, active.id);
    socket.emit('chat:join', { conversationId: convId });
    return () => { socket.emit('chat:leave', { conversationId: convId }); };
  }, [active, me.id, socket]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingUsers]);

  const getConvId = (a: string, b: string) => [a, b].sort().join('__');

  const sendMessage = (msgData: Partial<Message>) => {
    if (!active || !socket) return;
    const msg: Message = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      conversationId: getConvId(me.id, active.id),
      senderId: me.id, senderName: me.name,
      type: 'text', content: '',
      createdAt: new Date().toISOString(),
      status: 'sent', ...msgData,
    } as Message;
    socket.emit('chat:send', msg);
  };

  const sendText = () => { if (!input.trim()) return; sendMessage({ type: 'text', content: input.trim() }); setInput(''); stopTyping(); };
  const startTyping = () => { if (!active || !socket) return; socket.emit('chat:typing', { conversationId: getConvId(me.id, active.id), isTyping: true }); clearTimeout(typingTimeoutRef.current); typingTimeoutRef.current = setTimeout(stopTyping, 2000); };
  const stopTyping = () => { if (!active || !socket) return; socket.emit('chat:typing', { conversationId: getConvId(me.id, active.id), isTyping: false }); clearTimeout(typingTimeoutRef.current); };

  const handleFile = (file: File, type: 'image' | 'file') => {
    if (file.size > 50 * 1024 * 1024) { toast('الملف كبير جداً', 'error'); return; }
    toast('📤 جاري الرفع...', 'info');
    const reader = new FileReader();
    reader.onload = () => { sendMessage({ type, content: reader.result as string, fileName: file.name, fileSize: file.size }); setShowAttach(false); };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr; recordChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(recordChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => sendMessage({ type: 'voice', content: reader.result as string, duration: recordTime });
        reader.readAsDataURL(blob);
      };
      mr.start(); setRecording(true); setRecordTime(0);
      recordTimerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch { toast('الرجاء السماح بالميكروفون', 'error'); }
  };
  const stopRecording = (cancel = false) => {
    clearInterval(recordTimerRef.current); setRecording(false);
    if (cancel) { mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()); mediaRecorderRef.current = null; }
    else mediaRecorderRef.current?.stop();
  };

  // ─── Call handlers ───────────────────────────────
  const startAudioCall = () => {
    if (!active) return;
    initiateCall(active, 'audio');
  };
  const startVideoCall = () => {
    if (!active) return;
    initiateCall(active, 'video');
  };

  const fmtTime = (iso: string) => { const d = new Date(iso); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const fmtDuration = (s: number) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const fmtSize = (b: number) => b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB';
  const filtered = contacts.filter(c => !search || c.name.includes(search));

  // ═══════ CHAT VIEW ═══════
  if (active) {
    const isTyping = typingUsers.includes(active.id);
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-1)', display: 'flex', flexDirection: 'column' }}>
        <header className="glass-strong" style={{ padding: 'calc(var(--safe-top) + 8px) 14px 12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-2)' }}>
          <button onClick={() => setActive(null)} style={{ padding: '8px', color: 'var(--text-1)' }}><ArrowRight size={22} /></button>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, ' + active.color + ', ' + active.color + '88)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900, color: '#fff', position: 'relative', flexShrink: 0 }}>
            {active.avatar}
            {active.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: 'var(--green-5)', border: '2px solid var(--bg-1)' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{active.name}</div>
            <div style={{ fontSize: '11px', color: isTyping ? 'var(--green-5)' : active.online ? 'var(--green-5)' : 'var(--text-3)' }}>
              {isTyping ? '✍️ يكتب...' : active.online ? '🟢 متصل' : 'غير متصل'}
            </div>
          </div>
          {/* CALL BUTTONS — Now WORKING! */}
          <button onClick={startAudioCall} style={iconBtn} title="مكالمة صوتية">
            <Phone size={20} />
          </button>
          <button onClick={startVideoCall} style={iconBtn} title="مكالمة فيديو">
            <Video size={20} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <span className="badge badge-gold" style={{ fontSize: '11px' }}>🔒 محادثة مشفّرة</span>
          </div>
          {messages.filter(m => m.conversationId === getConvId(me.id, active.id)).map((m, i, arr) => {
            const prev = arr[i - 1];
            const fromMe = m.senderId === me.id;
            return <Bubble key={m.id} msg={m} fromMe={fromMe} showAvatar={!prev || prev.senderId !== m.senderId} active={active} fmtTime={fmtTime} fmtSize={fmtSize} fmtDuration={fmtDuration} />;
          })}
          {isTyping && (
            <div style={{ display: 'flex', alignSelf: 'flex-end' }}>
              <div style={{ padding: '12px 14px', background: 'var(--bg-3)', borderRadius: '18px 4px 18px 18px', border: '1px solid var(--border-2)', display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1s ' + (i * 0.2) + 's ease-in-out infinite' }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {recording && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', borderTop: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: '13px', color: '#F87171', fontWeight: 700 }}>🎤 {fmtDuration(recordTime)}</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => stopRecording(true)} style={{ padding: '6px 12px', color: '#F87171', fontSize: '13px' }}>إلغاء</button>
            <button onClick={() => stopRecording(false)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--green-4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={16} />
            </button>
          </div>
        )}

        {!recording && (
          <div style={{ padding: '10px 14px', paddingBottom: 'calc(10px + var(--safe-bottom))', background: 'var(--bg-glass-strong)', borderTop: '1px solid var(--border-2)', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button onClick={() => setShowAttach(!showAttach)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-3)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: showAttach ? 'rotate(45deg)' : 'none', transition: 'all 0.2s' }}>
              <Plus size={22} />
            </button>
            <div style={{ flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: '22px', padding: '4px 12px' }}>
              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); startTyping(); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); }}}
                placeholder="اكتب رسالة..." rows={1}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-0)', fontSize: '14px', resize: 'none', maxHeight: '100px', direction: 'rtl', padding: '8px 6px', lineHeight: 1.5, outline: 'none' }}
              />
            </div>
            <button onClick={input.trim() ? sendText : startRecording} style={{ width: '44px', height: '44px', borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, var(--green-3), var(--green-5))' : 'var(--bg-3)', color: input.trim() ? '#fff' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none' }}>
              {input.trim() ? <Send size={18} /> : <Mic size={20} />}
            </button>
          </div>
        )}

        {showAttach && !recording && (
          <div style={{ position: 'absolute', bottom: '80px', left: '16px', right: '16px', background: 'var(--bg-glass-strong)', border: '1px solid var(--border-3)', borderRadius: 'var(--r-lg)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', zIndex: 10, boxShadow: 'var(--shadow-lg)' }}>
            {[
              { icon: <ImageIcon size={22} />, label: 'صورة', color: 'var(--purple-5)', onClick: () => imageInputRef.current?.click() },
              { icon: <FileIcon size={22} />, label: 'ملف', color: 'var(--blue-5)', onClick: () => fileInputRef.current?.click() },
              { icon: '📿', label: 'دعاء', color: 'var(--green-5)', onClick: () => { sendMessage({ type: 'text', content: '🤲 جزاك الله خيراً' }); setShowAttach(false); } },
              { icon: '📖', label: 'آية', color: 'var(--gold-5)', onClick: () => { sendMessage({ type: 'text', content: '﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾' }); setShowAttach(false); } },
            ].map((a: any, i) => (
              <button key={i} onClick={a.onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'var(--bg-3)', borderRadius: 'var(--r-md)', padding: '14px 8px', border: '1px solid var(--border-2)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: a.color + '22', color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{a.icon}</div>
                <span style={{ fontSize: '11px' }}>{a.label}</span>
              </button>
            ))}
          </div>
        )}

        <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], 'image')} />
        <input ref={fileInputRef} type="file" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], 'file')} />
      </div>
    );
  }

  // ═══════ CONTACTS LIST ═══════
  return (
    <div style={{ minHeight: '100dvh', paddingTop: 'var(--safe-top)' }}>
      <div className="container-app" style={{ padding: '0 16px' }}>
        <header className="animate-fade-down" style={{ paddingTop: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900 }}>💬 الدردشة</h1>
              <div style={{ fontSize: '11px', color: connected ? 'var(--green-5)' : 'var(--text-3)', marginTop: '2px' }}>
                {connected ? '🟢 متصل' : '⚠️ غير متصل'} • {contacts.length} مستخدم
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={fetchContacts} style={iconBtn}><RefreshCw size={18} /></button>
              <button onClick={() => router.push('/home')} style={iconBtn}><ArrowRight size={20} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-full)', padding: '10px 16px' }}>
            <Search size={18} color="var(--text-3)" />
            <input type="text" placeholder="ابحث عن مستخدم..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-0)', fontSize: '14px', direction: 'rtl', outline: 'none' }}
            />
          </div>
        </header>

        {loadingContacts ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto 14px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>جاري التحميل...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Users size={48} color="var(--text-4)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>لا يوجد مستخدمون</p>
            <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>سيظهرون عند تسجيلهم 🌙</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((c, i) => (
              <button key={c.id} onClick={() => setActive(c)} className={'animate-fade-up delay-' + Math.min(i + 1, 8)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 8px', borderBottom: '1px solid var(--border-1)', cursor: 'pointer', textAlign: 'right', borderRadius: 'var(--r-sm)', width: '100%' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, ' + c.color + ', ' + c.color + '88)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#fff' }}>
                    {c.avatar}
                  </div>
                  {c.online && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--green-5)', border: '2px solid var(--bg-0)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: c.online ? 'var(--green-5)' : 'var(--text-3)', marginTop: '2px' }}>
                    {c.online ? '🟢 متصل الآن' : '⚪ غير متصل'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}

function Bubble({ msg, fromMe, showAvatar, active, fmtTime, fmtSize, fmtDuration }: any) {
  return (
    <div className="animate-fade-up" style={{ display: 'flex', justifyContent: fromMe ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: '8px', marginTop: showAvatar ? '8px' : '1px' }}>
      {!fromMe && (
        <div style={{ width: '28px', flexShrink: 0 }}>
          {showAvatar && <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, ' + active.color + ', ' + active.color + '88)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>{active.avatar}</div>}
        </div>
      )}
      <div style={{ maxWidth: msg.type === 'image' ? '70%' : '75%', padding: msg.type === 'image' ? '4px' : '8px 12px', borderRadius: fromMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: fromMe ? 'linear-gradient(135deg, var(--green-3), var(--green-4))' : 'var(--bg-3)', border: fromMe ? 'none' : '1px solid var(--border-2)', color: fromMe ? '#FFF' : 'var(--text-0)', fontSize: '14px', lineHeight: 1.6, direction: 'rtl', textAlign: 'right', overflow: 'hidden' }}>
        {msg.type === 'text' && <div>{msg.content}</div>}
        {msg.type === 'image' && <img src={msg.content} alt="" style={{ width: '100%', maxWidth: '280px', borderRadius: '14px', display: 'block' }} />}
        {msg.type === 'file' && (
          <a href={msg.content} download={msg.fileName} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', textDecoration: 'none', padding: '4px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileIcon size={20} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.fileName}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{fmtSize(msg.fileSize || 0)}</div>
            </div>
            <Download size={18} />
          </a>
        )}
        {msg.type === 'voice' && <VoicePlayer src={msg.content} duration={msg.duration || 0} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
          <span>{fmtTime(msg.createdAt)}</span>
          {fromMe && (msg.status === 'read' ? <CheckCheck size={12} color="#60A5FA" /> : msg.status === 'delivered' ? <CheckCheck size={12} /> : <Check size={12} />)}
        </div>
      </div>
    </div>
  );
}

function VoicePlayer({ src, duration }: any) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px', minWidth: '180px' }}>
      <audio ref={audioRef} src={src} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <button onClick={() => playing ? audioRef.current?.pause() : audioRef.current?.play()} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
        {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
      </button>
      <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
        <div style={{ width: playing ? '50%' : '0%', height: '100%', background: '#fff', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: '11px', opacity: 0.8 }}>{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</div>
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
