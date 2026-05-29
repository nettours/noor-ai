'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Heart, Share2, Bookmark, Volume2, VolumeX,
  Sparkles, BookOpen, MessageCircle, Play, Pause
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

interface FeedItem {
  id: string;
  type: 'verse' | 'hadith' | 'dua' | 'wisdom' | 'dhikr';
  text: string;
  source: string;
  extra?: string;
  gradient: [string, string];
  icon: string;
}

// ═══ محتوى الـ Feed (يتوسّع لاحقاً من الـ Backend) ═══
const FEED_CONTENT: FeedItem[] = [
  { id: 'f1', type: 'verse', text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ', source: 'سورة الطلاق ٢-٣', extra: 'فمهما ضاقت بك الدنيا، التقوى مفتاح الفرج', gradient: ['#0f766e', '#042f2e'], icon: '📖' },
  { id: 'f2', type: 'hadith', text: 'مَن قال سُبحانَ اللهِ وبِحَمدِه في يومٍ مِئةَ مرَّةٍ، حُطَّت خطاياه وإن كانت مِثلَ زَبَدِ البَحر', source: 'متفق عليه', extra: 'ذكرٌ خفيف على اللسان، ثقيل في الميزان', gradient: ['#b45309', '#451a03'], icon: '📜' },
  { id: 'f3', type: 'dua', text: 'اللّهُمَّ إنّي أسألُكَ علماً نافعاً، ورِزقاً طيّباً، وعمَلاً مُتقبَّلاً', source: 'دعاء نبوي', extra: 'كان النبي ﷺ يقوله بعد صلاة الفجر', gradient: ['#6d28d9', '#2e1065'], icon: '🤲' },
  { id: 'f4', type: 'verse', text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', source: 'سورة الشرح ٦', extra: 'العسر واحد، واليسر اثنان — فلن يغلب عسرٌ يُسرين', gradient: ['#be185d', '#500724'], icon: '📖' },
  { id: 'f5', type: 'dhikr', text: 'لا إلهَ إلّا اللهُ وحدَهُ لا شريكَ له، له المُلكُ وله الحَمدُ وهو على كلِّ شيءٍ قدير', source: 'ذكر عظيم', extra: 'من قالها ١٠٠ مرة كانت له عِدلَ عشرِ رقاب', gradient: ['#0369a1', '#082f49'], icon: '☪️' },
  { id: 'f6', type: 'hadith', text: 'الكلمةُ الطيّبةُ صدقة', source: 'متفق عليه', extra: 'ابتسامتك، كلمة طيبة، دعوة بظهر الغيب — كلها صدقات', gradient: ['#15803d', '#052e16'], icon: '📜' },
  { id: 'f7', type: 'wisdom', text: 'مَن أصلحَ ما بينَه وبينَ اللهِ، أصلحَ اللهُ ما بينَه وبينَ الناس', source: 'حكمة سلفية', extra: 'ابدأ بقلبك مع الله، يُصلح لك كل شيء', gradient: ['#9333ea', '#3b0764'], icon: '💡' },
  { id: 'f8', type: 'dua', text: 'رَبَّنا آتِنا في الدُّنيا حسَنةً وفي الآخرةِ حسَنةً وقِنا عذابَ النار', source: 'سورة البقرة ٢٠١', extra: 'أجمع دعاء في القرآن — للدنيا والآخرة', gradient: ['#c2410c', '#431407'], icon: '🤲' },
  { id: 'f9', type: 'verse', text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ', source: 'سورة البقرة ١٥٢', extra: 'ذِكرٌ مقابل ذِكر — صفقة رابحة مع الكريم', gradient: ['#0e7490', '#083344'], icon: '📖' },
  { id: 'f10', type: 'dhikr', text: 'سُبحانَ اللهِ، والحمدُ لله، ولا إلهَ إلّا الله، واللهُ أكبر', source: 'الباقيات الصالحات', extra: 'أحبُّ الكلام إلى الله أربع', gradient: ['#7c3aed', '#2e1065'], icon: '☪️' },
];

const TYPE_LABELS: Record<string, string> = {
  verse: 'آية', hadith: 'حديث', dua: 'دعاء', wisdom: 'حكمة', dhikr: 'ذِكر',
};

export default function FeedPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [items] = useState<FeedItem[]>(FEED_CONTENT);
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe(u);
      // استرجاع الإعجابات والمحفوظات
      const l = localStorage.getItem('noor_feed_liked');
      const s = localStorage.getItem('noor_feed_saved');
      if (l) setLiked(new Set(JSON.parse(l)));
      if (s) setSaved(new Set(JSON.parse(s)));
    } catch { router.push('/auth/login'); }

    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  // اكتشاف البطاقة النشطة عند التمرير
  const onScroll = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const idx = Math.round(c.scrollTop / c.clientHeight);
    if (idx !== active) {
      setActive(idx);
      window.speechSynthesis?.cancel();
      setSpeaking(null);
    }
  }, [active]);

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('noor_feed_liked', JSON.stringify([...next]));
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('noor_feed_saved', JSON.stringify([...next]));
      return next;
    });
  };

  const share = async (item: FeedItem) => {
    const text = `${item.text}\n\n— ${item.source}\n\nعبر تطبيق نور AI 🌙`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ المحتوى 📋');
    }
  };

  const speak = (item: FeedItem) => {
    if (speaking === item.id) {
      window.speechSynthesis?.cancel();
      setSpeaking(null);
      return;
    }
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(item.text + '. ' + (item.extra || ''));
    u.lang = 'ar-SA';
    u.rate = 0.85;
    u.onend = () => setSpeaking(null);
    u.onerror = () => setSpeaking(null);
    setSpeaking(item.id);
    setMuted(false);
    window.speechSynthesis.speak(u);
  };

  if (!me) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#67E8F9', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 16px 14px',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)',
        pointerEvents: 'none',
      }}>
        <button onClick={() => router.push('/home')} style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', pointerEvents: 'auto',
        }}>
          <ArrowRight size={20} />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#FBBF24" />
          <span style={{ fontSize: '17px', fontWeight: 900, color: '#fff' }}>تأمّلات نور</span>
        </div>
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.7)',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          padding: '6px 12px', borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {active + 1} / {items.length}
        </div>
      </div>

      {/* Vertical scroll feed */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        style={{
          height: '100dvh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
        }}
        className="feed-scroll"
      >
        {items.map((item, i) => {
          const isLiked = liked.has(item.id);
          const isSaved = saved.has(item.id);
          const isSpeaking = speaking === item.id;

          return (
            <div
              key={item.id}
              style={{
                height: '100dvh',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 24px',
                background: `linear-gradient(160deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                overflow: 'hidden',
              }}
            >
              {/* خلفية زخرفية */}
              <div style={{
                position: 'absolute', top: '-10%', right: '-15%',
                width: '60%', height: '40%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                filter: 'blur(60px)',
              }} />
              <div style={{
                position: 'absolute', bottom: '5%', left: '-15%',
                width: '50%', height: '35%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                filter: 'blur(60px)',
              }} />

              {/* نوع المحتوى */}
              <div style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '28px',
                padding: '8px 18px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                  {TYPE_LABELS[item.type]}
                </span>
              </div>

              {/* النص الرئيسي */}
              <p style={{
                position: 'relative',
                fontFamily: 'Amiri, serif',
                fontSize: 'clamp(26px, 6vw, 40px)',
                fontWeight: 700,
                lineHeight: 1.9,
                textAlign: 'center',
                color: '#fff',
                marginBottom: '24px',
                direction: 'rtl',
                textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                maxWidth: '600px',
              }}>
                {item.text}
              </p>

              {/* الشرح */}
              {item.extra && (
                <p style={{
                  position: 'relative',
                  fontSize: 'clamp(14px, 3.5vw, 17px)',
                  lineHeight: 1.7,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.85)',
                  marginBottom: '18px',
                  direction: 'rtl',
                  maxWidth: '480px',
                  fontWeight: 500,
                }}>
                  {item.extra}
                </p>
              )}

              {/* المصدر */}
              <div style={{
                position: 'relative',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 700,
                padding: '6px 16px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '999px',
              }}>
                ﴿ {item.source} ﴾
              </div>

              {/* أزرار التفاعل (يمين) */}
              <div style={{
                position: 'absolute',
                right: '16px',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                alignItems: 'center',
              }}>
                {/* إعجاب */}
                <button onClick={() => toggleLike(item.id)} style={actionBtnStyle}>
                  <Heart size={26} fill={isLiked ? '#EF4444' : 'none'} color={isLiked ? '#EF4444' : '#fff'} style={{ transition: 'all 0.2s' }} />
                  <span style={actionLabelStyle}>{isLiked ? 'أحببت' : 'إعجاب'}</span>
                </button>

                {/* استماع */}
                <button onClick={() => speak(item)} style={actionBtnStyle}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: isSpeaking ? 'rgba(103,232,249,0.3)' : 'rgba(255,255,255,0.12)',
                    border: isSpeaking ? '2px solid #67E8F9' : '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    animation: isSpeaking ? 'pulse 1.5s infinite' : 'none',
                  }}>
                    {isSpeaking ? <Pause size={22} color="#67E8F9" /> : <Play size={22} color="#fff" fill="#fff" />}
                  </div>
                  <span style={actionLabelStyle}>{isSpeaking ? 'يقرأ' : 'استماع'}</span>
                </button>

                {/* حفظ */}
                <button onClick={() => toggleSave(item.id)} style={actionBtnStyle}>
                  <Bookmark size={26} fill={isSaved ? '#FBBF24' : 'none'} color={isSaved ? '#FBBF24' : '#fff'} style={{ transition: 'all 0.2s' }} />
                  <span style={actionLabelStyle}>{isSaved ? 'محفوظ' : 'حفظ'}</span>
                </button>

                {/* مشاركة */}
                <button onClick={() => share(item)} style={actionBtnStyle}>
                  <Share2 size={26} color="#fff" />
                  <span style={actionLabelStyle}>مشاركة</span>
                </button>
              </div>

              {/* تلميح التمرير (أول بطاقة فقط) */}
              {i === 0 && active === 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
                  left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  color: 'rgba(255,255,255,0.6)',
                  animation: 'bounce 2s infinite',
                }}>
                  <span style={{ fontSize: '11px' }}>اسحب للأعلى</span>
                  <span style={{ fontSize: '20px' }}>↑</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .feed-scroll::-webkit-scrollbar { display: none; }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes bounce { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -10px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  padding: 0,
};

const actionLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#fff',
  fontWeight: 600,
  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
};
