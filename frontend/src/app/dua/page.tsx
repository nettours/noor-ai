'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Sparkles, Share2, Download, RefreshCw, Loader2, Palette, Heart,
  MessageCircle, Copy, Check, X
} from 'lucide-react';
import { shareContent } from '@/lib/share';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

// الحالات
const MOODS = [
  { id: 'general', label: 'دعاء اليوم', emoji: '🤲' },
  { id: 'worry', label: 'همّ وقلق', emoji: '💚' },
  { id: 'success', label: 'توفيق ونجاح', emoji: '⭐' },
  { id: 'forgiveness', label: 'استغفار', emoji: '🌙' },
  { id: 'gratitude', label: 'شكر وحمد', emoji: '✨' },
];

// تصاميم البطاقات (تدرّجات)
const THEMES = [
  { id: 'emerald', name: 'زمرّد', c1: '#065F46', c2: '#10B981', text: '#ECFDF5', accent: '#A7F3D0' },
  { id: 'night', name: 'ليل', c1: '#0F172A', c2: '#1E3A8A', text: '#E0E7FF', accent: '#93C5FD' },
  { id: 'gold', name: 'ذهبي', c1: '#78350F', c2: '#D97706', text: '#FFFBEB', accent: '#FCD34D' },
  { id: 'rose', name: 'وردي', c1: '#831843', c2: '#BE185D', text: '#FFF1F2', accent: '#FBCFE8' },
  { id: 'violet', name: 'بنفسجي', c1: '#4C1D95', c2: '#7C3AED', text: '#F5F3FF', accent: '#C4B5FD' },
];

export default function DuaCardsPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [mood, setMood] = useState('general');
  const [feeling, setFeeling] = useState('');
  const [dua, setDua] = useState<{ text: string; src: string } | null>(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ ...u, token });
    } catch { router.push('/auth/login'); }
  }, []);

  const generate = async () => {
    if (!me?.token) return;
    setLoading(true);
    try {
      const r = await fetch(API + '/dua/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + me.token },
        body: JSON.stringify({ mood, feeling }),
      });
      const d = await r.json();
      if (d.success && d.dua) setDua(d.dua);
    } catch {}
    setLoading(false);
  };

  // رسم البطاقة على canvas
  useEffect(() => {
    if (!dua) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;

    // خلفية متدرّجة
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.c1);
    grad.addColorStop(1, theme.c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // زخرفة دوائر
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = theme.accent;
    ctx.beginPath(); ctx.arc(W - 120, 140, 200, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(120, H - 160, 160, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // إطار
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, W - 100, H - 100);
    ctx.globalAlpha = 1;

    // رمز علوي
    ctx.font = '70px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤲', W / 2, 220);

    // نص الدعاء (لفّ تلقائي)
    ctx.fillStyle = theme.text;
    ctx.font = 'bold 56px Amiri, serif';
    ctx.direction = 'rtl';
    const words = dua.text.split(' ');
    const lines: string[] = [];
    let line = '';
    const maxW = W - 240;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);

    const lineH = 88;
    let y = H / 2 - (lines.length * lineH) / 2 + 40;
    for (const ln of lines) { ctx.fillText(ln, W / 2, y); y += lineH; }

    // المصدر
    ctx.fillStyle = theme.accent;
    ctx.font = '34px Amiri, serif';
    ctx.fillText('﴿ ' + dua.src + ' ﴾', W / 2, y + 50);

    // التوقيع
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.7;
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('🌙 نور AI', W / 2, H - 90);
    ctx.globalAlpha = 1;

    setImgUrl(canvas.toDataURL('image/png'));
  }, [dua, theme]);

  // مشاركة (Web Share API مع صورة) - مع بدائل واضحة
  const share = async () => {
    if (!imgUrl || !dua) return;
    const text = `${dua.text}\n﴿ ${dua.src} ﴾\n\n🌙 نور AI`;
    try {
      const blob = await (await fetch(imgUrl)).blob();
      const file = new File([blob], 'noor-dua.png', { type: 'image/png' });
      if (navigator.share || navigator.clipboard) {
        // shareContent attaches the app link and shares the image when supported.
        const ok = await shareContent({ text, title: 'دعاء', files: [file] });
        if (ok) return;
      }
      setShowOptions(true);
    } catch {
      setShowOptions(true);
    }
  };

  // مشاركة على واتساب (نص الدعاء)
  const shareWhatsApp = () => {
    if (!dua) return;
    const text = encodeURIComponent(`${dua.text}\n﴿ ${dua.src} ﴾\n\n🌙 من تطبيق نور AI`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // نسخ نص الدعاء
  const copyText = async () => {
    if (!dua) return;
    try {
      await navigator.clipboard.writeText(`${dua.text}\n﴿ ${dua.src} ﴾\n\n🌙 نور AI`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const download = () => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl; a.download = 'noor-dua.png'; a.click();
  };

  if (!me) {
    return (
      <div style={{ minHeight: '100dvh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#030712', color: '#fff' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 16px 110px', maxWidth: '560px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.push('/home')} style={{
            width: '42px', height: '42px', borderRadius: '13px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900 }}>🎴 بطاقة دعاء</h1>
            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>اصنع وشارك دعاءً جميلاً</p>
          </div>
        </header>

        {/* اختيار الحالة */}
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', marginBottom: '10px' }}>كيف تشعر؟</div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
          {MOODS.map(m => (
            <button key={m.id} onClick={() => setMood(m.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '12px',
              whiteSpace: 'nowrap', cursor: 'pointer',
              background: mood === m.id ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
              border: mood === m.id ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.07)',
              color: mood === m.id ? '#10B981' : '#D1D5DB', fontSize: '13px', fontWeight: 700,
            }}>
              <span style={{ fontSize: '16px' }}>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>

        {/* وصف اختياري */}
        <input
          value={feeling}
          onChange={e => setFeeling(e.target.value)}
          placeholder="اكتب ما يدور في قلبك (اختياري)..."
          maxLength={120}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '14px', direction: 'rtl', outline: 'none', fontFamily: 'inherit',
          }}
        />

        {/* زر التوليد */}
        <button onClick={generate} disabled={loading} style={{
          width: '100%', padding: '16px', borderRadius: '16px', marginBottom: '24px',
          background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff',
          fontSize: '16px', fontWeight: 800, cursor: loading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={20} />}
          {loading ? 'جاري التوليد...' : dua ? 'دعاء آخر' : 'اصنع الدعاء ✨'}
        </button>

        {/* البطاقة */}
        {dua && (
          <>
            {/* اختيار التصميم */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Palette size={16} color="#9CA3AF" />
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {THEMES.map(th => (
                  <button key={th.id} onClick={() => setTheme(th)} style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${th.c1}, ${th.c2})`,
                    border: theme.id === th.id ? '2px solid #fff' : '2px solid transparent',
                  }} title={th.name} />
                ))}
              </div>
            </div>

            {/* معاينة البطاقة */}
            <div style={{
              borderRadius: '24px', overflow: 'hidden', marginBottom: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              aspectRatio: '1', position: 'relative',
              background: `linear-gradient(135deg, ${theme.c1}, ${theme.c2})`,
            }}>
              {imgUrl ? (
                <img src={imgUrl} alt="بطاقة الدعاء" style={{ width: '100%', height: '100%', display: 'block' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={32} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              )}
            </div>

            {/* أزرار المشاركة */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={share} style={{
                flex: 2, padding: '15px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <Share2 size={18} /> شارك
              </button>
              <button onClick={download} style={{
                flex: 1, padding: '15px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <Download size={18} /> حفظ
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#6B7280', marginTop: '16px', lineHeight: 1.7 }}>
              💚 شارك الأجر — كل من يقرأ الدعاء بسببك لك مثل أجره
            </p>
          </>
        )}

        {/* canvas مخفي للرسم */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* ورقة خيارات المشاركة (تظهر إذا تعذّرت المشاركة المباشرة) */}
      {showOptions && (
        <div onClick={() => setShowOptions(false)} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '560px',
            background: '#0F172A', borderRadius: '24px 24px 0 0',
            padding: '24px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
            border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none',
            animation: 'sheetUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>مشاركة الدعاء</h3>
              <button onClick={() => setShowOptions(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px', lineHeight: 1.7 }}>
              💡 احفظ الصورة ثم أرفقها، أو شارك نص الدعاء مباشرة
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* واتساب */}
              <button onClick={() => { shareWhatsApp(); setShowOptions(false); }} style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '14px',
                background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)',
                color: '#fff', cursor: 'pointer', width: '100%',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(37,211,102,0.2)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>واتساب</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>شارك نص الدعاء</div>
                </div>
              </button>

              {/* حفظ الصورة */}
              <button onClick={() => { download(); setShowOptions(false); }} style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', cursor: 'pointer', width: '100%',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>حفظ الصورة</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>للإرفاق في أي تطبيق</div>
                </div>
              </button>

              {/* نسخ النص */}
              <button onClick={copyText} style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', cursor: 'pointer', width: '100%',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(103,232,249,0.2)', color: '#67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </div>
                <div style={{ flex: 1, textAlign: 'start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{copied ? 'تم النسخ ✓' : 'نسخ النص'}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>الصقه أينما تريد</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
