'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, Sparkles, Heart, Check, RotateCcw, X, BookOpen } from 'lucide-react';
import { NAMES, type Name } from './asma-data';

// ═══════════════════════════════════════════════════════════════
// أسماء الله الحسنى — والتعبّد بها · «مَن أحصاها دخل الجنّة» [متفق عليه]
// يعمل محليًّا (localStorage): الإحصاء + المفضّلة.
// ═══════════════════════════════════════════════════════════════
const norm = (s: string) => s.replace(/[ً-ْٰـ]/g, '').replace(/[إأآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');

export default function AsmaPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<number | null>(null);
  const [counted, setCounted] = useState<Set<number>>(new Set());
  const [fav, setFav] = useState<Set<number>>(new Set());
  const [tasbih, setTasbih] = useState(0);
  const [goal, setGoal] = useState(33);

  useEffect(() => {
    try { setCounted(new Set(JSON.parse(localStorage.getItem('noor_asma_counted') || '[]'))); } catch {}
    try { setFav(new Set(JSON.parse(localStorage.getItem('noor_asma_fav') || '[]'))); } catch {}
  }, []);

  const persist = (key: string, s: Set<number>) => { try { localStorage.setItem(key, JSON.stringify(Array.from(s))); } catch {} };
  const toggleCounted = (i: number) => setCounted(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); persist('noor_asma_counted', n); return n; });
  const toggleFav = (i: number) => setFav(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); persist('noor_asma_fav', n); return n; });

  const today = useMemo(() => Math.floor(Date.now() / 86400000) % NAMES.length, []);
  const list = useMemo(() => {
    if (!q.trim()) return NAMES.map((n, i) => ({ n, i }));
    const nq = norm(q.trim());
    return NAMES.map((n, i) => ({ n, i })).filter(x => norm(x.n.n).includes(nq) || norm(x.n.m).includes(nq));
  }, [q]);

  const open = (i: number) => { setSel(i); setTasbih(0); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const tap = () => { setTasbih(t => t + 1); try { (navigator as any).vibrate?.(15); } catch {} };

  // ── صفحة الاسم ──
  if (sel != null) {
    const nm = NAMES[sel]; const isC = counted.has(sel); const isF = fav.has(sel);
    const ring = Math.min(1, (tasbih % goal || (tasbih ? goal : 0)) / goal);
    return (
      <div style={{ minHeight: '100dvh', background: '#0c0a04', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 50% 12%, rgba(217,119,6,0.22), transparent 55%), #0c0a04' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px)+14px) 16px 120px' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <button onClick={() => setSel(null)} style={iconBtn}><ArrowRight size={20} /></button>
            <div style={{ flex: 1 }} />
            <button onClick={() => toggleFav(sel)} style={{ ...iconBtn, color: isF ? '#F472B6' : '#fff' }}><Heart size={18} fill={isF ? '#F472B6' : 'none'} /></button>
          </header>

          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h1 style={{ fontFamily: 'Amiri, serif', fontSize: 52, fontWeight: 700, color: '#FBBF24', lineHeight: 1.3, textShadow: '0 6px 30px rgba(251,191,36,0.4)' }}>{nm.n}</h1>
          </div>

          {/* المعنى */}
          <Card><Lbl c="#FBBF24" icon={<Sparkles size={14} />}>المعنى</Lbl>
            <p style={{ fontSize: 15.5, color: '#f0eadf', lineHeight: 2, direction: 'rtl' }}>{nm.m}</p>
          </Card>
          {/* الشاهد */}
          {nm.s && (
            <Card><Lbl c="#34D399" icon={<BookOpen size={14} />}>شاهدٌ من القرآن</Lbl>
              <p style={{ fontFamily: 'Amiri, serif', fontSize: 19, color: '#bbf7d0', lineHeight: 2, direction: 'rtl', textAlign: 'center' }}>﴿ {nm.s} ﴾</p>
            </Card>
          )}
          {/* التعبّد */}
          <Card><Lbl c="#C4B5FD" icon={<Heart size={14} />}>كيف تتعبّد بهذا الاسم</Lbl>
            <p style={{ fontSize: 15, color: '#e6e1f0', lineHeight: 2, direction: 'rtl' }}>{nm.t}</p>
          </Card>

          {/* المسبحة */}
          <div style={{ padding: 18, borderRadius: 20, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(251,191,36,0.2)', textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#b9986a', marginBottom: 14 }}>اذكر الله بهذا الاسم</div>
            <button onClick={tap} style={{ position: 'relative', width: 180, height: 180, margin: '0 auto', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent' }}>
              <svg width="180" height="180" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle cx="90" cy="90" r="82" fill="none" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 82} strokeDashoffset={2 * Math.PI * 82 * (1 - ring)} style={{ transition: 'stroke-dashoffset .2s' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, color: '#FBBF24', fontWeight: 700 }}>يا {nm.n}</div>
                <div style={{ fontSize: 44, fontWeight: 900 }}>{tasbih}</div>
              </div>
            </button>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {[33, 99, 100].map(g => (
                <button key={g} onClick={() => setGoal(g)} style={{ padding: '7px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 700, border: `1px solid ${goal === g ? '#FBBF24' : 'rgba(255,255,255,0.12)'}`, background: goal === g ? 'rgba(251,191,36,0.18)' : 'transparent', color: goal === g ? '#FBBF24' : '#9CA3AF' }}>{g}</button>
              ))}
              <button onClick={() => setTasbih(0)} style={{ ...iconBtn, width: 36, height: 36 }}><RotateCcw size={15} /></button>
            </div>
          </div>

          {/* أحصيته */}
          <button onClick={() => toggleCounted(sel)} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', cursor: 'pointer', background: isC ? 'rgba(16,185,129,0.18)' : 'linear-gradient(135deg,#D97706,#B45309)', color: isC ? '#34D399' : '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Check size={18} /> {isC ? 'أحصيتَ هذا الاسم ✓' : 'علّم: أحصيتُ هذا الاسم (حفظًا وتدبّرًا)'}
          </button>

          {/* تنقّل */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={() => open((sel + NAMES.length - 1) % NAMES.length)} style={navBtn}>السابق</button>
            <button onClick={() => open((sel + 1) % NAMES.length)} style={navBtn}>التالي</button>
          </div>
        </div>
      </div>
    );
  }

  // ── القائمة ──
  return (
    <div style={{ minHeight: '100dvh', background: '#0c0a04', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217,119,6,0.16), transparent 55%), #0c0a04' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px)+20px) 16px 120px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => router.push('/home')} style={iconBtn}><ArrowRight size={20} /></button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg,#FBBF24,#D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>أسماء الله الحسنى</h1>
            <p style={{ fontSize: 11, color: '#b9986a' }}>والتعبّد بها · {NAMES.length} اسمًا</p>
          </div>
        </header>

        {/* الحديث + الإحصاء */}
        <div style={{ padding: 16, borderRadius: 18, marginBottom: 16, background: 'linear-gradient(160deg, rgba(217,119,6,0.12), rgba(251,191,36,0.04))', border: '1px solid rgba(251,191,36,0.22)' }}>
          <p style={{ fontFamily: 'Amiri, serif', fontSize: 16, color: '#f0eadf', lineHeight: 1.9, direction: 'rtl', textAlign: 'center' }}>«إنّ لله تسعةً وتسعين اسمًا، مَن أحصاها دخل الجنّة» <span style={{ fontSize: 11, color: '#b9986a' }}>[متفق عليه]</span></p>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#b9986a', marginBottom: 6 }}><span>ما أحصيتَ</span><span>{counted.size} / {NAMES.length}</span></div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}><div style={{ width: `${(counted.size / NAMES.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#D97706,#FBBF24)', transition: 'width .4s' }} /></div>
          </div>
        </div>

        {/* اسم اليوم */}
        <button onClick={() => open(today)} style={{ width: '100%', textAlign: 'center', padding: '20px', borderRadius: 18, marginBottom: 16, cursor: 'pointer', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#FBBF24', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Sparkles size={14} /> اسمُ اليوم — تأمّله وتعبّد به</div>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: 36, fontWeight: 700, color: '#FBBF24' }}>{NAMES[today].n}</div>
          <div style={{ fontSize: 13, color: '#cbb896', marginTop: 6, lineHeight: 1.7, direction: 'rtl' }}>{NAMES[today].m}</div>
        </button>

        {/* بحث */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '13px 16px', marginBottom: 16 }}>
          <Search size={18} color="#6B7280" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن اسمٍ أو معنى..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 14, outline: 'none', direction: 'rtl' }} />
        </div>

        {/* الشبكة */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 10 }}>
          {list.map(({ n, i }) => (
            <button key={i} onClick={() => open(i)} style={{ position: 'relative', padding: '18px 8px', borderRadius: 14, cursor: 'pointer', background: counted.has(i) ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.035)', border: `1px solid ${counted.has(i) ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 9, color: '#6b5536' }}>{i + 1}</span>
              {counted.has(i) && <Check size={12} color="#34D399" style={{ position: 'absolute', top: 6, left: 8 }} />}
              <span style={{ fontFamily: 'Amiri, serif', fontSize: 19, fontWeight: 700, color: '#FBBF24' }}>{n.n}</span>
            </button>
          ))}
        </div>
        {list.length === 0 && <p style={{ textAlign: 'center', color: '#b9986a', padding: 40 }}>لا توجد نتائج.</p>}
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
const navBtn: React.CSSProperties = { flex: 1, padding: 12, borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, fontWeight: 700 };
function Card({ children }: { children: React.ReactNode }) { return <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }}>{children}</div>; }
function Lbl({ c, icon, children }: { c: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 800, color: c, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 24, height: 24, borderRadius: 7, background: `${c}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>{children}</div>;
}
