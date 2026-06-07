'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { trackActivity } from '@/lib/track';
import {
  Send, ArrowRight, Sparkles, Bot, User, Copy, Check,
  Volume2, Loader2, RotateCcw, BookOpen, Heart, Star,
  HelpCircle, Compass, MessageSquare, Trash2
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

interface ScholarSource {
  type: 'quran' | 'hadith' | 'tafsir';
  text: string;
  ref: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  streaming?: boolean;
  sources?: ScholarSource[];
}

const SUGGESTED_PROMPTS = [
  { icon: BookOpen, text: 'اشرح لي تفسير سورة الفاتحة', category: 'تفسير' },
  { icon: Heart, text: 'ما فضل صلاة الفجر؟', category: 'فقه' },
  { icon: Star, text: 'كيف أحفظ القرآن بسهولة؟', category: 'حفظ' },
  { icon: HelpCircle, text: 'ما حكم الصلاة في السفر؟', category: 'فقه' },
  { icon: Compass, text: 'كيف أتوضأ بشكل صحيح؟', category: 'طهارة' },
  { icon: MessageSquare, text: 'علّمني دعاء قبل النوم', category: 'أذكار' },
];

export default function AIChatPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoAskedRef = useRef(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ id: u.id, name: u.name, token, avatar: u.avatar, color: u.color });

      // Load conversation history
      const history = localStorage.getItem('noor_ai_history');
      if (history) {
        try {
          const parsed = JSON.parse(history);
          if (Array.isArray(parsed)) setMessages(parsed);
        } catch {}
      }
    } catch { router.push('/auth/login'); }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-ask when arriving with ?q= (e.g. from "درس اليوم → اسأل نور Scholar").
  useEffect(() => {
    if (!me || autoAskedRef.current) return;
    try {
      const q = new URLSearchParams(window.location.search).get('q');
      if (q && q.trim()) {
        autoAskedRef.current = true;
        window.history.replaceState(null, '', '/ai');
        sendMessage(q.trim());
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Keep only last 30 messages
        const toSave = messages.slice(-30).map(m => ({
          ...m,
          streaming: false,
        }));
        localStorage.setItem('noor_ai_history', JSON.stringify(toSave));
      } catch {}
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    trackActivity('scholar');

    const userMsg: Message = {
      id: 'u_' + Date.now(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMsg: Message = {
      id: 'a_' + Date.now(),
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      streaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation context (last 10 messages)
      const context = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(API + '/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + me.token,
        },
        body: JSON.stringify({
          messages: [...context, { role: 'user', content }],
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      // Streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.sources) {
                  setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === 'assistant') last.sources = data.sources;
                    return updated;
                  });
                }
                if (data.text) {
                  accumulated += data.text;
                  setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === 'assistant') {
                      last.content = accumulated;
                    }
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      } else {
        // Fallback: non-streaming
        const data = await response.json();
        accumulated = data.text || data.content || '';
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            last.content = accumulated;
          }
          return updated;
        });
      }

      // Mark streaming complete
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          last.streaming = false;
          if (!last.content) {
            last.content = 'عذراً، حدث خطأ. حاول مرة أخرى.';
          }
        }
        return updated;
      });
    } catch (err: any) {
      console.error('AI error:', err);
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          last.streaming = false;
          last.content = 'عذراً، الخدمة غير متاحة حالياً. تأكد من إعداد AI API في الـ Backend.';
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const speakMessage = (id: string, content: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (speaking === id) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(content);
    u.lang = 'ar-SA';
    u.rate = 0.95;
    u.onend = () => setSpeaking(null);
    u.onerror = () => setSpeaking(null);
    setSpeaking(id);
    window.speechSynthesis.speak(u);
  };

  const clearHistory = () => {
    if (confirm('هل تريد حذف كل المحادثة؟')) {
      setMessages([]);
      localStorage.removeItem('noor_ai_history');
      window.speechSynthesis?.cancel();
      setSpeaking(null);
    }
  };

  if (!me) {
    return (
      <div style={{ minHeight: '100dvh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="#67E8F9" className="spin" />
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
      zIndex: 9999,
    }}>

      {/* Animated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(103,232,249,0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(168,85,247,0.08) 0%, transparent 50%),
          #000
        `,
      }} />

      {/* Header */}
      <header style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
        zIndex: 10,
      }}>
        <button onClick={() => router.push('/home')} style={{
          width: '36px', height: '36px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          border: 'none', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <ArrowRight size={20} />
        </button>

        <div style={{
          width: '40px', height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #67E8F9, #06B6D4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(103,232,249,0.4)',
          position: 'relative',
        }}>
          <Bot size={20} color="#000" />
          <div style={{
            position: 'absolute',
            bottom: '-2px', right: '-2px',
            width: '12px', height: '12px',
            borderRadius: '50%',
            background: '#10B981',
            border: '2px solid #000',
            animation: 'pulse 2s infinite',
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800 }}>نور Scholar</h2>
            <Sparkles size={12} color="#FBBF24" />
          </div>
          <p style={{ fontSize: '11px', color: '#10B981' }}>
            🟢 يبحث في القرآن والحديث قبل الإجابة
          </p>
        </div>

        {messages.length > 0 && (
          <button onClick={clearHistory} style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none', color: '#9CA3AF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Trash2 size={16} />
          </button>
        )}
      </header>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        position: 'relative',
        zIndex: 2,
      }}>

        {/* Welcome screen */}
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            maxWidth: '700px',
            margin: '0 auto',
          }}>
            <div style={{
              width: '90px', height: '90px',
              margin: '0 auto 20px',
              borderRadius: '26px',
              background: 'linear-gradient(135deg, #67E8F9, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(103,232,249,0.4)',
              position: 'relative',
              animation: 'float 4s ease-in-out infinite',
            }}>
              <Bot size={44} color="#000" />
              <div style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '34px',
                border: '2px solid rgba(103,232,249,0.3)',
                animation: 'pulse 3s infinite',
              }} />
            </div>

            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 38px)',
              fontWeight: 900,
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #fff, #9CA3AF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              مرحباً {me.name} 🌙
            </h2>

            <p style={{
              fontSize: '15px',
              color: '#9CA3AF',
              marginBottom: '8px',
              fontWeight: 500,
            }}>
              أنا نور Scholar — عالِمك الإسلامي المؤصَّل بالمصادر
            </p>

            <p style={{
              fontSize: '12px',
              color: '#6B7280',
              marginBottom: '32px',
              lineHeight: 1.7,
            }}>
              اسألني عن التفسير، الفقه، الأحاديث، الأدعية،
              <br />
              أو أي شيء عن دينك ✨
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '10px',
              maxWidth: '650px',
              margin: '0 auto',
            }}>
              {SUGGESTED_PROMPTS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.text)}
                    className="prompt-card"
                    style={{
                      padding: '14px 16px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      textAlign: 'right',
                      direction: 'rtl',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(103,232,249,0.15)',
                      border: '1px solid rgba(103,232,249,0.3)',
                      color: '#67E8F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
                        {p.text}
                      </div>
                      <div style={{ fontSize: '10px', color: '#67E8F9' }}>
                        {p.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="msg-anim"
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
              marginBottom: '20px',
              alignItems: 'flex-start',
              gap: '10px',
              maxWidth: '850px',
              margin: '0 auto 20px',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #67E8F9, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(103,232,249,0.3)',
              }}>
                <Bot size={18} color="#000" />
              </div>
            )}

            <div style={{
              maxWidth: '85%',
              padding: '14px 18px',
              borderRadius: msg.role === 'user'
                ? '16px 16px 4px 16px'
                : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user'
                ? 'none'
                : '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
            }}>
              <div style={{
                fontSize: '14px',
                lineHeight: 1.85,
                color: msg.role === 'user' ? '#fff' : '#E5E7EB',
                direction: 'rtl',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {msg.content || (msg.streaming && (
                  <span style={{ display: 'inline-flex', gap: '4px' }}>
                    <span className="dot" style={{ animationDelay: '0s' }} />
                    <span className="dot" style={{ animationDelay: '0.2s' }} />
                    <span className="dot" style={{ animationDelay: '0.4s' }} />
                  </span>
                ))}
                {msg.streaming && msg.content && (
                  <span style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '14px',
                    background: '#67E8F9',
                    marginInlineStart: '2px',
                    verticalAlign: 'middle',
                    animation: 'blink 1s infinite',
                  }} />
                )}
              </div>

              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    📚 المصادر المعتمَدة ({msg.sources.length})
                  </div>
                  {msg.sources.map((s, si) => {
                    const st = s.type === 'quran'
                      ? { bg: 'rgba(16,185,129,0.08)', bd: 'rgba(52,211,153,0.25)', body: '#6EE7B7', ref: '#34D399', icon: '📖', quran: true, open: '﴿ ', close: ' ﴾' }
                      : s.type === 'tafsir'
                      ? { bg: 'rgba(59,130,246,0.08)', bd: 'rgba(96,165,250,0.25)', body: '#BFDBFE', ref: '#60A5FA', icon: '📘', quran: false, open: '', close: '' }
                      : { bg: 'rgba(217,119,6,0.08)', bd: 'rgba(251,191,36,0.22)', body: '#E5E7EB', ref: '#FBBF24', icon: '🗞️', quran: false, open: '«', close: '»' };
                    return (
                      <div key={si} style={{
                        background: st.bg, border: `1px solid ${st.bd}`,
                        borderRadius: '12px', padding: '10px 12px',
                      }}>
                        <div style={{
                          fontFamily: st.quran ? 'Amiri, serif' : 'inherit',
                          fontSize: st.quran ? '15px' : '13px',
                          lineHeight: st.quran ? 1.9 : 1.75,
                          color: st.body,
                          direction: 'rtl', textAlign: 'right', marginBottom: '6px',
                        }}>
                          {st.open}{s.text}{st.close}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: st.ref, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {st.icon} {s.ref}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {msg.role === 'assistant' && !msg.streaming && msg.content && (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <button onClick={() => copyMessage(msg.id, msg.content)} style={{
                    width: '28px', height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.04)',
                    border: 'none',
                    color: '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }} className="action-btn" title="نسخ">
                    {copiedId === msg.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>

                  <button onClick={() => speakMessage(msg.id, msg.content)} style={{
                    width: '28px', height: '28px',
                    borderRadius: '8px',
                    background: speaking === msg.id ? 'rgba(103,232,249,0.15)' : 'rgba(255,255,255,0.04)',
                    border: 'none',
                    color: speaking === msg.id ? '#67E8F9' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }} className="action-btn" title="استماع">
                    <Volume2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${me.color || '#10B981'}, ${(me.color || '#10B981')}aa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 900,
                flexShrink: 0,
              }}>
                {me.avatar || me.name[0]}
              </div>
            )}
          </div>
        ))}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 100px)',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '850px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
        }}>
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '4px 14px',
            display: 'flex',
            alignItems: 'center',
            transition: 'border-color 0.2s',
          }} className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="اسأل نور AI أي شيء..."
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                resize: 'none',
                maxHeight: '120px',
                direction: 'rtl',
                padding: '12px 0',
                lineHeight: 1.5,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #67E8F9, #06B6D4)'
                : 'rgba(255,255,255,0.05)',
              border: 'none',
              color: input.trim() && !loading ? '#000' : '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              boxShadow: input.trim() && !loading ? '0 8px 20px rgba(103,232,249,0.5)' : 'none',
              transition: 'all 0.3s',
            }}
            className="send-btn"
          >
            {loading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '10px',
          color: '#6B7280',
          marginTop: '8px',
        }}>
          ⚡ Noor AI قد يخطئ — تحقّق من المعلومات الشرعية مع أهل العلم
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin { animation: spin 1s linear infinite; }
        .msg-anim { animation: msgIn 0.3s ease-out; }
        .prompt-card:hover {
          transform: translateY(-2px);
          border-color: rgba(103,232,249,0.3) !important;
          background: linear-gradient(135deg, rgba(103,232,249,0.06), rgba(255,255,255,0.02)) !important;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.08) !important;
          color: #fff !important;
        }
        .send-btn:not(:disabled):hover {
          transform: scale(1.05);
        }
        .input-wrapper:focus-within {
          border-color: rgba(103,232,249,0.4) !important;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #67E8F9;
          display: inline-block;
          animation: bounce 1.2s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
