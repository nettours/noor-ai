'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Send, ArrowRight, Search, Plus, Smile, Paperclip, Phone,
  Video, MoreVertical, Check, CheckCheck, Image as ImgIcon,
  Mic, ArrowLeft, Users, Bell, Settings
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  typing?: boolean;
  isGroup?: boolean;
  members?: number;
  color: string;
}

interface Message {
  id: string;
  text: string;
  time: string;
  fromMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'ayah' | 'dua' | 'voice';
}

const CONTACTS: Contact[] = [
  { id: '1', name: 'أحمد محمد', avatar: 'أ', lastMsg: 'السلام عليكم، كيف حالك أخي؟', time: '10:42', unread: 2, online: true, color: 'var(--green-5)' },
  { id: '2', name: 'فاطمة الزهراء', avatar: 'ف', lastMsg: '🤲 جزاك الله خيراً', time: '09:15', unread: 0, online: true, typing: true, color: 'var(--gold-5)' },
  { id: '3', name: 'مجموعة طلاب العلم', avatar: '👥', lastMsg: 'يوسف: درس اليوم رائع', time: 'أمس', unread: 5, online: false, isGroup: true, members: 24, color: 'var(--purple-5)' },
  { id: '4', name: 'يوسف بن خالد', avatar: 'ي', lastMsg: 'بارك الله فيك', time: 'أمس', unread: 0, online: false, color: 'var(--blue-5)' },
  { id: '5', name: 'حلقة تحفيظ القرآن', avatar: '📖', lastMsg: 'الشيخ: درس البقرة غداً', time: '11:30', unread: 12, online: true, isGroup: true, members: 56, color: '#F472B6' },
  { id: '6', name: 'مريم العزيز', avatar: 'م', lastMsg: 'هل تعرف وقت الدرس؟', time: 'الإثنين', unread: 0, online: false, color: '#34D399' },
  { id: '7', name: 'عمر الفاروق', avatar: 'ع', lastMsg: '🤲 اللهم آمين', time: 'الأحد', unread: 0, online: false, color: '#FB923C' },
];

const QUICK_REPLIES = [
  '🤲 جزاك الله خيراً',
  '🌙 السلام عليكم',
  '💚 بارك الله فيك',
  '🤝 آمين',
  '✅ تمام',
  '🌟 ما شاء الله',
  '🕌 إن شاء الله',
];

const SAMPLE_MSGS: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'السلام عليكم ورحمة الله وبركاته 🌙', time: '10:30', fromMe: false },
    { id: '2', text: 'وعليكم السلام ورحمة الله وبركاته 🤗', time: '10:32', fromMe: true, status: 'read' },
    { id: '3', text: 'كيف حالك أخي الكريم؟', time: '10:40', fromMe: false },
    { id: '4', text: 'الحمد لله بخير، كيف حالك أنت؟', time: '10:42', fromMe: false },
  ],
  '2': [
    { id: '1', text: 'بارك الله فيك على المشاركة في الدرس', time: '09:00', fromMe: false },
    { id: '2', text: 'الله يبارك فيك أختي 🌷', time: '09:05', fromMe: true, status: 'read' },
    { id: '3', text: 'إن شاء الله نلتقي في الدرس القادم', time: '09:10', fromMe: false },
    { id: '4', text: '🤲 جزاك الله خيراً', time: '09:15', fromMe: false },
  ],
};

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChat) {
      const saved = localStorage.getItem(`noor_chat_${activeChat}`);
      setMessages(saved ? JSON.parse(saved) : (SAMPLE_MSGS[activeChat] || []));
    }
  }, [activeChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = () => {
    if (!input.trim() || !activeChat) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      fromMe: true,
      status: 'sent',
    };
    const newMsgs = [...messages, msg];
    setMessages(newMsgs);
    localStorage.setItem(`noor_chat_${activeChat}`, JSON.stringify(newMsgs));
    setInput('');

    // Status updates
    setTimeout(() => updateStatus(msg.id, 'delivered'), 800);
    setTimeout(() => updateStatus(msg.id, 'read'), 2200);

    // Typing indicator + reply
    setTimeout(() => setIsTyping(true), 1500);
    setTimeout(() => {
      setIsTyping(false);
      const replies = ['🤲 جزاك الله خيراً', 'بارك الله فيك أخي', '🌙 السلام عليكم', 'الله يحفظك ويرعاك'];
      const reply: Message = {
        id: Date.now().toString(),
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        fromMe: false,
      };
      setMessages(prev => {
        const updated = [...prev, reply];
        localStorage.setItem(`noor_chat_${activeChat}`, JSON.stringify(updated));
        return updated;
      });
    }, 3500);
  };

  const updateStatus = (id: string, status: 'delivered' | 'read') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const filtered = CONTACTS.filter(c => !search || c.name.includes(search));
  const activeContact = CONTACTS.find(c => c.id === activeChat);

  // ─── CHAT VIEW ──────────────────────────────
  if (activeChat && activeContact) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--bg-1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <header className="glass-strong" style={{
          padding: 'calc(var(--safe-top) + 8px) 14px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <button onClick={() => setActiveChat(null)} style={{ padding: '8px', color: 'var(--text-1)' }}>
            <ArrowRight size={22} />
          </button>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${activeContact.color}, ${activeContact.color}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 900,
            color: '#fff',
            position: 'relative',
            flexShrink: 0,
          }}>
            {activeContact.avatar}
            {activeContact.online && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '12px', height: '12px',
                borderRadius: '50%',
                background: 'var(--green-5)',
                border: '2px solid var(--bg-1)',
              }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeContact.name}
              {activeContact.isGroup && <span style={{ fontSize: '11px', color: 'var(--text-3)', marginRight: '6px' }}>· {activeContact.members} عضو</span>}
            </div>
            <div style={{ fontSize: '11px', color: isTyping ? 'var(--green-5)' : 'var(--text-3)' }}>
              {isTyping ? 'يكتب...' : activeContact.online ? '🟢 متصل الآن' : 'آخر ظهور قبل قليل'}
            </div>
          </div>
          <button style={{ padding: '8px', color: 'var(--text-2)' }}>
            <Phone size={20} />
          </button>
          <button style={{ padding: '8px', color: 'var(--text-2)' }}>
            <Video size={20} />
          </button>
          <button style={{ padding: '8px', color: 'var(--text-2)' }}>
            <MoreVertical size={20} />
          </button>
        </header>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(16,185,129,0.04) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(217,119,6,0.03) 0%, transparent 40%)
          `,
        }}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <span className="badge badge-gold" style={{ fontSize: '11px' }}>
              🔒 المحادثات محمية بتشفير طرف لطرف
            </span>
          </div>

          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const showAvatar = !prev || prev.fromMe !== m.fromMe;
            const isLast = i === messages.length - 1 || messages[i + 1]?.fromMe !== m.fromMe;
            return (
              <div
                key={m.id}
                className="animate-fade-up"
                style={{
                  display: 'flex',
                  justifyContent: m.fromMe ? 'flex-start' : 'flex-end',
                  alignItems: 'flex-end',
                  gap: '8px',
                  marginTop: showAvatar ? '8px' : '1px',
                }}
              >
                {!m.fromMe && (
                  <div style={{ width: '28px', flexShrink: 0 }}>
                    {showAvatar && (
                      <div style={{
                        width: '28px', height: '28px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${activeContact.color}, ${activeContact.color}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 900,
                      }}>
                        {activeContact.avatar}
                      </div>
                    )}
                  </div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '8px 12px',
                  borderRadius: m.fromMe
                    ? `${isLast ? '4px' : '18px'} 18px 18px 18px`
                    : `18px ${isLast ? '4px' : '18px'} 18px 18px`,
                  background: m.fromMe
                    ? 'linear-gradient(135deg, var(--green-3), var(--green-4))'
                    : 'var(--bg-3)',
                  border: m.fromMe ? 'none' : '1px solid var(--border-2)',
                  color: m.fromMe ? '#FFF' : 'var(--text-0)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  direction: 'rtl',
                  textAlign: 'right',
                  position: 'relative',
                  boxShadow: m.fromMe ? '0 2px 8px rgba(16,185,129,0.2)' : 'none',
                }}>
                  <div>{m.text}</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'flex-end',
                    fontSize: '10px',
                    marginTop: '4px',
                    opacity: 0.7,
                  }}>
                    <span>{m.time}</span>
                    {m.fromMe && (
                      m.status === 'read' ? <CheckCheck size={12} color="#60A5FA" /> :
                      m.status === 'delivered' ? <CheckCheck size={12} /> :
                      <Check size={12} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{
                padding: '12px 14px',
                background: 'var(--bg-3)',
                borderRadius: '18px 4px 18px 18px',
                border: '1px solid var(--border-2)',
                display: 'flex', gap: '4px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: 'var(--text-3)',
                    animation: `pulse 1s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Quick replies */}
        {messages.length < 4 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '8px 14px',
          }}>
            {QUICK_REPLIES.map(r => (
              <button
                key={r}
                onClick={() => { setInput(r); setTimeout(send, 0); }}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border-2)',
                  fontSize: '13px',
                  color: 'var(--text-1)',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '10px 14px',
          paddingBottom: 'calc(10px + var(--safe-bottom))',
          background: 'var(--bg-glass-strong)',
          borderTop: '1px solid var(--border-2)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
        }}>
          <button
            onClick={() => setShowAttach(!showAttach)}
            style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              background: 'var(--bg-3)',
              color: 'var(--text-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transform: showAttach ? 'rotate(45deg)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={22} />
          </button>

          <div style={{
            flex: 1,
            background: 'var(--bg-3)',
            border: '1px solid var(--border-2)',
            borderRadius: '22px',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '4px 8px 4px 12px',
          }}>
            <textarea
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
              placeholder="اكتب رسالة..."
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-0)',
                fontSize: '14px',
                resize: 'none',
                maxHeight: '100px',
                direction: 'rtl',
                padding: '8px 6px',
                lineHeight: 1.5,
              }}
            />
            <button style={{ padding: '8px', color: 'var(--text-3)' }}>
              <Smile size={20} />
            </button>
          </div>

          <button
            onClick={input.trim() ? send : undefined}
            style={{
              width: '44px', height: '44px',
              borderRadius: '50%',
              background: input.trim()
                ? 'linear-gradient(135deg, var(--green-3), var(--green-5))'
                : 'var(--bg-3)',
              color: input.trim() ? '#fff' : 'var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: input.trim() ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {input.trim() ? <Send size={18} /> : <Mic size={20} />}
          </button>
        </div>

        {/* Attach panel */}
        {showAttach && (
          <div className="animate-fade-up" style={{
            position: 'absolute',
            bottom: '80px',
            left: '16px',
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border-3)',
            borderRadius: 'var(--r-md)',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            zIndex: 10,
          }}>
            {[
              { icon: ImgIcon, label: 'صورة', color: 'var(--purple-5)' },
              { icon: Mic, label: 'صوت', color: 'var(--gold-5)' },
              { icon: '📿', label: 'دعاء', color: 'var(--green-5)', emoji: true },
              { icon: '📖', label: 'آية', color: 'var(--blue-5)', emoji: true },
              { icon: Phone, label: 'مكالمة', color: '#F87171' },
              { icon: '🤲', label: 'تذكير', color: '#FB923C', emoji: true },
            ].map((a, i) => (
              <button key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px',
                background: 'var(--bg-3)',
                borderRadius: 'var(--r-md)',
                width: '70px',
              }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: `${a.color}22`,
                  color: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {a.emoji ? a.icon as any : <a.icon size={18} />}
                </div>
                <span style={{ fontSize: '10px' }}>{a.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── CONTACTS LIST ──────────────────────────
  return (
    <div className="pt-safe pb-nav">
      <div className="container-app" style={{ padding: '0 16px' }}>

        <div className="animate-fade-down" style={{ paddingTop: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900 }}>💬 الدردشة</h1>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-icon glass" style={{ width: '40px', height: '40px' }}><Bell size={18} /></button>
              <button className="btn-icon glass" style={{ width: '40px', height: '40px' }}><Settings size={18} /></button>
            </div>
          </div>

          {/* Search */}
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
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="animate-fade-up delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
          marginBottom: '16px',
        }}>
          {[
            { label: 'الكل', value: CONTACTS.length, icon: '💬' },
            { label: 'متصل', value: CONTACTS.filter(c => c.online).length, icon: '🟢' },
            { label: 'غير مقروء', value: CONTACTS.reduce((s, c) => s + c.unread, 0), icon: '🔔' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{
              padding: '10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px' }}>{s.icon}</div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--gold-5)', marginTop: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveChat(c.id)}
              className={`animate-fade-up delay-${Math.min(i + 1, 8)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 8px',
                borderBottom: '1px solid var(--border-1)',
                cursor: 'pointer',
                textAlign: 'right',
                borderRadius: 'var(--r-sm)',
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${c.color}, ${c.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 900,
                  color: '#fff',
                }}>
                  {c.avatar}
                </div>
                {c.online && (
                  <div style={{
                    position: 'absolute', bottom: '2px', right: '2px',
                    width: '14px', height: '14px',
                    borderRadius: '50%',
                    background: 'var(--green-5)',
                    border: '2px solid var(--bg-0)',
                    boxShadow: '0 0 8px var(--green-5)',
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)' }}>
                    {c.name}
                    {c.isGroup && <Users size={11} style={{ display: 'inline', marginRight: 4, color: 'var(--text-4)' }} />}
                  </div>
                  <div style={{ fontSize: '11px', color: c.unread ? 'var(--green-5)' : 'var(--text-4)', fontWeight: c.unread ? 700 : 400 }}>
                    {c.time}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: c.typing ? 'var(--green-5)' : 'var(--text-3)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1, fontWeight: c.typing ? 600 : 400,
                  }}>
                    {c.typing ? '✍️ يكتب...' : c.lastMsg}
                  </div>
                  {c.unread > 0 && (
                    <span style={{
                      background: 'linear-gradient(135deg, var(--green-4), var(--green-5))',
                      color: '#fff',
                      borderRadius: 'var(--r-full)',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(16,185,129,0.4)',
                    }}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ height: '40px' }} />
      </div>

      <button style={{
        position: 'fixed',
        bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 20px)',
        right: '20px',
        width: '56px', height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--green-3), var(--green-5))',
        color: '#fff',
        display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-green)',
        zIndex: 50,
      }}>
        <Plus size={28} />
      </button>
    </div>
  );
}
