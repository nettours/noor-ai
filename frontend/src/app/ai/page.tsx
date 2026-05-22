'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, ArrowRight, RefreshCw, Key, Bot, Sparkles,
  BookOpen, FileText, Calendar
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const SUGGESTIONS = [
  'ما حكم قضاء الصلاة الفائتة؟',
  'فسّر لي آية الكرسي',
  'ما فضل قراءة سورة الكهف يوم الجمعة؟',
  'دعاء الكرب والفرج',
  'ما شروط الصلاة الخمس؟',
  'كيف أحفظ القرآن الكريم؟',
  'أنشئ خطبة جمعة عن الصبر',
];

const DEMOS: Record<string, string> = {
  'قضاء': 'قضاء الصلاة الفائتة واجب على من تركها بعذر كالنوم أو النسيان.\n\nقال النبي ﷺ: «مَنْ نَامَ عَنْ صَلاةٍ أَوْ نَسِيَهَا فَلْيُصَلِّها إِذَا ذَكَرَهَا».',
  'آية الكرسي': 'آية الكرسي (البقرة:255) أعظم آية في القرآن.\n\nقال ﷺ: «مَنْ قَرَأَ آيَةَ الْكُرْسِيِّ دُبُرَ كُلِّ صَلَاةٍ مَكْتُوبَةٍ لَمْ يَمْنَعْهُ مِنْ دُخُولِ الْجَنَّةِ إِلَّا أَنْ يَمُوتَ».',
  'الكهف': 'قال ﷺ: «مَنْ قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ».',
  'الجمعة': 'يوم الجمعة فيه ساعة إجابة. أكثر من الصلاة على النبي ﷺ، وقراءة سورة الكهف، والدعاء قبل المغرب.',
  'الكرب': 'من أعظم أدعية الكرب:\n\n🤲 «لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ»\n🤲 حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
  'دعاء': 'من الأدعية المباركة:\n🤲 «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ»\n🤲 «اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ»',
  'شروط': 'شروط الصلاة:\n١. الإسلام\n٢. العقل\n٣. البلوغ\n٤. النية\n٥. الطهارة\n٦. ستر العورة\n٧. استقبال القبلة\n٨. دخول الوقت',
  'حفظ': 'لحفظ القرآن:\n١. النية الخالصة لله\n٢. اختيار وقت ثابت يومياً\n٣. حفظ نصف صفحة على الأقل يومياً\n٤. المراجعة المستمرة\n٥. الدعاء بالتيسير\n٦. مصاحبة أهل القرآن',
  'الصبر': 'الحَمْدُ لِلَّهِ والصَّلَاةُ والسَّلَامُ عَلَى رَسُولِ اللهِ...\n\n**خطبة الصبر**\n\nأيها المؤمنون: الصبر مفتاح الفرج. قال تعالى: «إِنَّ اللَّهَ مَعَ الصَّابِرِينَ».\n\nأنواع الصبر:\n• صبر على الطاعات\n• صبر عن المعاصي\n• صبر على الأقدار\n\nقال ﷺ: «عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ».\n\nاللهم اجعلنا من الصابرين 🤲',
};

interface Msg {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

export default function AIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [mode, setMode] = useState<'chat' | 'imam' | 'tafsir' | 'plan'>('chat');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const k = localStorage.getItem('noor_ai_key');
    if (k) setApiKey(k);
    setMessages([{
      id: '0',
      role: 'ai',
      text: 'السلام عليكم ورحمة الله 🌙\n\nأنا **نور** — مساعدك الإسلامي الذكي.\n\nيمكنني الإجابة عن:\n• 📖 تفسير الآيات\n• 📿 شرح الأحاديث\n• ⚖️ مسائل الفقه\n• 🤲 الأدعية والأذكار\n• 🕌 خطب الجمعة\n\nاسأل ما شئت 🌿',
      time: getTime(),
    }]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function getTime() {
    const d = new Date();
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    const userMsg: Msg = { id: Date.now().toString(), role: 'user', text: q, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    let reply = '';
    if (apiKey.startsWith('sk-ant-')) {
      try {
        const history = messages.slice(-6).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
        const modeNote = mode === 'imam' ? '\nأنت في وضع الإمام: ركز على إنشاء الخطب.'
          : mode === 'tafsir' ? '\nأنت في وضع التفسير: فسّر الآيات بمنهج ابن كثير.'
          : mode === 'plan' ? '\nأنت في وضع التخطيط: قدم خطة إسلامية يومية.'
          : '';

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1200,
            system: 'أنت نور — مساعد إسلامي متخصص. أجب بالعربية الفصحى السهلة. استند للقرآن والسنة الصحيحة. كن موجزاً ومفيداً.' + modeNote,
            messages: [...history, { role: 'user', content: q }],
          }),
        });
        const data = await res.json();
        if (data.error) reply = '⚠️ ' + (data.error.message || 'خطأ');
        else reply = data.content?.[0]?.text || 'تعذّر الحصول على إجابة.';
      } catch (e: any) {
        reply = '⚠️ تعذّر الاتصال — تحقق من المفتاح والإنترنت.';
      }
    } else {
      await new Promise(r => setTimeout(r, 900));
      for (const [k, v] of Object.entries(DEMOS)) {
        if (q.includes(k)) { reply = v; break; }
      }
      if (!reply) reply = 'وعليكم السلام 🌙\n\nشكراً على سؤالك.\n\n⚠️ هذا وضع التجريب — أضف مفتاح Anthropic API من 🔑 للحصول على إجابات شاملة.\n\nاحصل على المفتاح مجاناً من **console.anthropic.com**';
    }

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: reply, time: getTime() }]);
    setLoading(false);
    inputRef.current?.focus();
  };

  const saveKey = () => {
    if (!apiKey.startsWith('sk-ant-')) {
      toast('المفتاح يجب أن يبدأ بـ sk-ant-', 'error');
      return;
    }
    localStorage.setItem('noor_ai_key', apiKey);
    setShowKey(false);
    toast('✅ تم تفعيل المساعد AI');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-0)',
      zIndex: 5,
      paddingTop: 'var(--safe-top)',
    }}>
      {/* Header */}
      <div className="glass-strong" style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-2)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.push('/home')} style={{ padding: '8px', color: 'var(--text-1)' }}>
            <ArrowRight size={22} />
          </button>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-3), var(--green-5))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>نور AI</div>
            <div style={{ fontSize: '11px', color: loading ? 'var(--gold-5)' : 'var(--green-5)' }}>
              {loading ? '🔄 يفكر...' : '🟢 متصل'}
            </div>
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-3)',
              border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: apiKey ? 'var(--green-5)' : 'var(--text-3)',
            }}
          >
            <Key size={16} />
          </button>
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-3)',
              border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-3)',
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Key input */}
        {showKey && (
          <div className="animate-fade-down" style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                style={{
                  flex: 1,
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border-2)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: 'var(--text-0)',
                  fontSize: '13px',
                  direction: 'ltr',
                  outline: 'none',
                }}
              />
              <button onClick={saveKey} className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '13px' }}>
                حفظ
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '6px' }}>
              من <a href="https://console.anthropic.com" target="_blank" style={{ color: 'var(--blue-5)' }}>console.anthropic.com</a>
            </p>
          </div>
        )}

        {/* Modes */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          marginTop: '10px',
        }}>
          {[
            { id: 'chat', label: '💬 محادثة' },
            { id: 'imam', label: '🕌 الإمام' },
            { id: 'tafsir', label: '📖 تفسير' },
            { id: 'plan', label: '📋 خطة' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 700,
                background: mode === m.id ? 'rgba(16,185,129,0.18)' : 'transparent',
                border: '1px solid ' + (mode === m.id ? 'var(--green-4)' : 'var(--border-2)'),
                color: mode === m.id ? 'var(--green-5)' : 'var(--text-3)',
                flexShrink: 0,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {messages.map(m => (
          <div
            key={m.id}
            className="animate-fade-up"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end',
              maxWidth: '85%',
            }}
          >
            <div style={{
              padding: '12px 15px',
              borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: m.role === 'user'
                ? 'rgba(22,37,64,0.9)'
                : 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(6,78,59,0.3))',
              border: m.role === 'user' ? '1px solid var(--border-2)' : '1px solid rgba(16,185,129,0.3)',
              fontSize: '14px',
              lineHeight: 1.8,
              direction: 'rtl',
              textAlign: 'right',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-0)',
            }} dangerouslySetInnerHTML={{
              __html: m.text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>')
            }} />
            <div style={{ fontSize: '10px', color: 'var(--text-4)', marginTop: '3px', textAlign: 'center' }}>
              {m.time}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: 'flex-end' }}>
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-3)',
              border: '1px solid var(--border-2)',
              borderRadius: '20px 20px 20px 4px',
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  background: 'var(--green-5)',
                  animation: 'pulse 0.7s ' + (i * 0.2) + 's ease-in-out infinite',
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px 14px',
          flexShrink: 0,
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 14px',
                background: 'var(--bg-3)',
                border: '1px solid var(--border-2)',
                borderRadius: '16px',
                color: 'var(--text-2)',
                fontSize: '12px',
                flexShrink: 0,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input - ABOVE bottom nav */}
      <div style={{
        padding: '10px 14px',
        paddingBottom: 'calc(10px + var(--safe-bottom))',
        background: 'rgba(10,22,40,0.97)',
        borderTop: '1px solid var(--border-2)',
        flexShrink: 0,
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
      }}>
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
              send();
            }
          }}
          placeholder="اسأل سؤالاً إسلامياً..."
          rows={1}
          style={{
            flex: 1,
            background: 'var(--bg-3)',
            border: '1px solid var(--border-2)',
            borderRadius: '20px',
            padding: '10px 16px',
            color: 'var(--text-0)',
            fontSize: '14px',
            resize: 'none',
            maxHeight: '120px',
            direction: 'rtl',
            lineHeight: 1.5,
            outline: 'none',
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            width: '44px', height: '44px',
            borderRadius: '50%',
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, var(--green-3), var(--green-5))'
              : 'var(--bg-3)',
            color: input.trim() && !loading ? '#fff' : 'var(--text-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: 'none',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
