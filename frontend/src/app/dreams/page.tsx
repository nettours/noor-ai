'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Search, Moon, Star, Heart, BookOpen, Share2, Printer,
  X, Sparkles, ChevronLeft, Info, TrendingUp, PenLine, Trash2, Loader2, Layers,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

// ═══ الأنواع ═══
interface LightSymbol {
  id: string; name: string; category: string; icon: string; color: string;
  tags: string[]; summary: string; interpretationsCount: number; views: number;
}
interface SourceInfo { id: string; name: string; author: string; confidence: string; note: string; }
interface Interpretation {
  text: string; sourceId: string; context: string; tradition: 'تراثي' | 'معاصر'; source: SourceInfo;
}
interface DetailSymbol extends LightSymbol {
  interpretations: Interpretation[];
  relatedSymbols: { id: string; name: string; icon: string; color: string; summary: string }[];
  category_info: { id: string; name: string; icon: string; color: string } | null;
  notes?: string;
}
interface Category { id: string; name: string; icon: string; color: string; count: number; }
interface DreamLog {
  id: string; text: string; symbols: string[]; emotions: string[];
  socialState: string; isRecurring: boolean; classification: string; createdAt: string;
}

const CONF_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  'عالية':    { bg: 'rgba(16,185,129,0.15)',  fg: '#34D399', label: 'توثيق عالٍ' },
  'مشهورة':   { bg: 'rgba(245,158,11,0.15)',  fg: '#FBBF24', label: 'مشهور' },
  'اجتهادية': { bg: 'rgba(148,163,184,0.15)', fg: '#CBD5E1', label: 'اجتهادي' },
};
const EMOTIONS = ['خوف', 'قلق', 'حزن', 'فرح', 'طمأنينة', 'دهشة', 'غضب', 'حيرة'];
const SOCIAL = ['أعزب', 'متزوج', 'حامل', 'مسافر', 'مريض', 'طالب', 'أخرى'];

function authHeaders(): Record<string, string> {
  try {
    const t = localStorage.getItem('noor_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch { return {}; }
}

export default function DreamsPage() {
  const router = useRouter();
  const [view, setView] = useState<'home' | 'journal'>('home');
  const [meta, setMeta] = useState<{ categories: Category[]; sources: SourceInfo[]; total: number; disclaimer: string } | null>(null);
  const [symbols, setSymbols] = useState<LightSymbol[]>([]);
  const [popular, setPopular] = useState<LightSymbol[]>([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DetailSymbol | null>(null);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<LightSymbol[]>([]);
  const [showClassifier, setShowClassifier] = useState(false);

  const loggedIn = useRef(false);
  useEffect(() => { try { loggedIn.current = !!localStorage.getItem('noor_token'); } catch {} }, []);

  // ── تحميل أولي ──
  useEffect(() => {
    (async () => {
      try {
        const [m, p] = await Promise.all([
          fetch(`${API}/dreams/meta`).then(r => r.json()),
          fetch(`${API}/dreams/popular`).then(r => r.json()),
        ]);
        if (m.success) setMeta(m);
        if (p.success) setPopular(p.symbols);
        await loadSymbols('', '');
        // المفضّلة (إن كان مسجّلاً)
        if (loggedIn.current) {
          const f = await fetch(`${API}/dreams/favorites`, { headers: authHeaders() }).then(r => r.json()).catch(() => null);
          if (f?.success) setFavIds(new Set(f.favorites.map((s: LightSymbol) => s.id)));
        }
      } catch {}
      setLoading(false);
      // رابط مشاركة مباشر ?symbol=
      try {
        const sid = new URLSearchParams(window.location.search).get('symbol');
        if (sid) openSymbol(sid);
      } catch {}
    })();
    // recent
    try { setRecent(JSON.parse(localStorage.getItem('noor_dream_recent') || '[]')); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSymbols = async (q: string, cat: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    const r = await fetch(`${API}/dreams/symbols?${params}`).then(x => x.json()).catch(() => null);
    if (r?.success) setSymbols(r.symbols);
  };

  // بحث حيّ (debounce بسيط)
  const searchTimer = useRef<any>(null);
  const onSearch = (v: string) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadSymbols(v, activeCat), 220);
  };
  const onCat = (id: string) => {
    const next = activeCat === id ? '' : id;
    setActiveCat(next);
    loadSymbols(search, next);
  };

  const openSymbol = async (id: string) => {
    setSelected(null);
    const r = await fetch(`${API}/dreams/symbols/${id}`).then(x => x.json()).catch(() => null);
    if (r?.success) {
      setSelected(r.symbol);
      // سجل الأخير
      try {
        const item = { id: r.symbol.id, name: r.symbol.name, icon: r.symbol.icon, color: r.symbol.color, summary: r.symbol.summary, category: r.symbol.category, tags: r.symbol.tags, interpretationsCount: r.symbol.interpretations.length, views: r.symbol.views };
        const prev: LightSymbol[] = JSON.parse(localStorage.getItem('noor_dream_recent') || '[]');
        const dedup = [item, ...prev.filter(x => x.id !== id)].slice(0, 8);
        localStorage.setItem('noor_dream_recent', JSON.stringify(dedup));
        setRecent(dedup);
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFav = async (id: string) => {
    if (!loggedIn.current) { router.push('/auth/login'); return; }
    const r = await fetch(`${API}/dreams/favorites/${id}`, { method: 'POST', headers: authHeaders() }).then(x => x.json()).catch(() => null);
    if (r?.success) {
      setFavIds(prev => { const n = new Set(prev); r.favorited ? n.add(id) : n.delete(id); return n; });
    }
  };

  const shareSymbol = async (s: DetailSymbol) => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/dreams?symbol=${s.id}`;
    const text = `تفسير رؤية ${s.name} — موسوعة تفسير الأحلام 🌙\n${s.summary}`;
    try {
      if (navigator.share) await navigator.share({ title: `تفسير ${s.name}`, text, url });
      else { await navigator.clipboard.writeText(url); alert('تم نسخ الرابط ✅'); }
    } catch {}
  };

  // ════════════════════════════════════════════════════════
  // صفحة التفاصيل
  // ════════════════════════════════════════════════════════
  if (selected) {
    const s = selected;
    const turath = s.interpretations.filter(i => i.tradition === 'تراثي');
    const muasir = s.interpretations.filter(i => i.tradition === 'معاصر');
    const isFav = favIds.has(s.id);
    return (
      <div style={{ minHeight: '100dvh', background: '#000', color: '#fff' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: `radial-gradient(ellipse at top, ${s.color}2e, transparent 65%), #050510` }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px) + 14px) 16px 120px' }}>
          {/* Header */}
          <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, position: 'sticky', top: 0, zIndex: 30, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', padding: '8px 0', borderRadius: 14 }}>
            <button onClick={() => setSelected(null)} style={iconBtn}><ArrowRight size={20} /></button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 16, fontWeight: 800 }}>تفسير رؤية {s.name}</h1>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>{s.category_info?.name} · {s.interpretations.length} تفسير من المصادر</p>
            </div>
            <button onClick={() => toggleFav(s.id)} title="حفظ" style={{ ...iconBtn, color: isFav ? '#F472B6' : '#fff' }}>
              <Heart size={18} fill={isFav ? '#F472B6' : 'none'} />
            </button>
            <button onClick={() => shareSymbol(s)} title="مشاركة" style={iconBtn}><Share2 size={17} /></button>
            <button onClick={() => window.print()} title="طباعة" style={iconBtn}><Printer size={17} /></button>
          </header>

          {/* البطاقة الرئيسية */}
          <div style={{ textAlign: 'center', padding: '14px 0 22px' }}>
            <div style={{ width: 110, height: 110, margin: '0 auto 16px', borderRadius: 30, background: `linear-gradient(135deg, ${s.color}, ${s.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, boxShadow: `0 20px 50px ${s.color}66` }}>{s.icon}</div>
            <h2 style={{ fontFamily: 'Amiri, serif', fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{s.name}</h2>
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8, maxWidth: 540, margin: '0 auto', direction: 'rtl' }}>{s.summary}</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
              {s.tags.map(t => (<span key={t} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>{t}</span>))}
            </div>
          </div>

          {/* تنبيه الاجتهاد */}
          <div style={{ display: 'flex', gap: 10, padding: 14, borderRadius: 16, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', marginBottom: 22 }}>
            <Info size={18} color="#FBBF24" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12.5, color: '#FDE68A', lineHeight: 1.8, direction: 'rtl' }}>
              تفسير الرؤى <b>اجتهادٌ ظنّي</b> يحتمل الصواب والخطأ، وليس حكماً قطعياً. والرؤيا الصادقة بشرى، لكن تأويلها يُستأنس به ولا يُبنى عليه قرار قاطع.
            </p>
          </div>

          {/* التفسير التراثي */}
          {turath.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <SectionTitle icon={<BookOpen size={16} />} color="#34D399">التفسير التراثي</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {turath.map((i, idx) => <InterpCard key={idx} i={i} />)}
              </div>
            </section>
          )}

          {/* التحليل المعاصر */}
          {muasir.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <SectionTitle icon={<Sparkles size={16} />} color="#67E8F9">تحليل معاصر (مفصول عن التراث)</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {muasir.map((i, idx) => <InterpCard key={idx} i={i} />)}
              </div>
            </section>
          )}

          {/* ملاحظات */}
          {s.notes && (
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.22)', marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#C4B5FD', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Info size={14} /> ملاحظة مهمة</div>
              <p style={{ fontSize: 13.5, color: '#ddd', lineHeight: 1.9, direction: 'rtl' }}>{s.notes}</p>
            </div>
          )}

          {/* رموز مشابهة */}
          {s.relatedSymbols.length > 0 && (
            <section>
              <SectionTitle icon={<Layers size={16} />} color="#FB923C">رموز مشابهة</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
                {s.relatedSymbols.map(r => (
                  <button key={r.id} onClick={() => openSymbol(r.id)} style={{ textAlign: 'right', padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontFamily: 'Amiri, serif', fontSize: 16, fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.summary}</div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // الواجهة الرئيسية / السجل
  // ════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100dvh', background: '#050510', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168,85,247,0.16), transparent 55%), #050510' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px) + 20px) 16px 120px' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button onClick={() => router.push('/home')} style={iconBtn}><ArrowRight size={20} /></button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,#C084FC,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Moon size={24} color="#C084FC" /> موسوعة تفسير الأحلام
            </h1>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>{meta?.total ?? '…'} رمزاً موثّقاً · بحث · تصنيف · سجل أحلام</p>
          </div>
        </header>

        {/* تبويب */}
        <div style={{ display: 'flex', gap: 8, padding: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 16, marginBottom: 18 }}>
          {[{ k: 'home', label: 'الموسوعة', icon: BookOpen }, { k: 'journal', label: 'سجل أحلامي', icon: PenLine }].map(t => {
            const Icon = t.icon; const active = view === t.k;
            return (
              <button key={t.k} onClick={() => setView(t.k as any)} style={{ flex: 1, padding: 11, borderRadius: 12, border: 'none', cursor: 'pointer', background: active ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : 'transparent', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon size={17} /> {t.label}
              </button>
            );
          })}
        </div>

        {view === 'journal' ? (
          <Journal onOpen={openSymbol} loggedIn={loggedIn.current} goLogin={() => router.push('/auth/login')} />
        ) : (
          <>
            {/* تنبيه عام */}
            <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 16 }}>
              <Info size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: '#FDE68A', lineHeight: 1.7, direction: 'rtl' }}>{meta?.disclaimer || 'تفسير الرؤى اجتهادٌ ظنّي وليس يقيناً قطعياً.'}</p>
            </div>

            {/* بحث + زر صف حلمك */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '13px 16px' }}>
                <Search size={18} color="#6B7280" />
                <input value={search} onChange={e => onSearch(e.target.value)} placeholder="ابحث عن رمز: ثعبان، مطر، طيران، خوف..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 14, outline: 'none', direction: 'rtl' }} />
              </div>
              <button onClick={() => setShowClassifier(true)} style={{ padding: '0 16px', borderRadius: 16, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <Sparkles size={16} /> صِف حلمك
              </button>
            </div>

            {/* التصنيفات */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 18 }}>
              {(meta?.categories || []).map(c => {
                const active = activeCat === c.id;
                return (
                  <button key={c.id} onClick={() => onCat(c.id)} style={{ flexShrink: 0, padding: '9px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, border: `1px solid ${active ? c.color : 'rgba(255,255,255,0.1)'}`, background: active ? `${c.color}22` : 'rgba(255,255,255,0.03)', color: active ? c.color : '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{c.icon}</span> {c.name} <span style={{ opacity: 0.6 }}>{c.count}</span>
                  </button>
                );
              })}
            </div>

            {/* الأخير */}
            {recent.length > 0 && !search && !activeCat && (
              <Strip title="آخر ما اطّلعت عليه" items={recent} onOpen={openSymbol} />
            )}
            {/* الأكثر تداولاً */}
            {popular.length > 0 && !search && !activeCat && (
              <Strip title="الأكثر تداولاً" icon={<TrendingUp size={14} />} items={popular} onOpen={openSymbol} />
            )}

            {/* الشبكة */}
            <h3 style={{ fontSize: 14, fontWeight: 800, margin: '8px 0 12px', color: '#cbd5e1' }}>
              {search ? `نتائج البحث (${symbols.length})` : activeCat ? meta?.categories.find(c => c.id === activeCat)?.name : 'كل الرموز'}
            </h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 50, color: '#9CA3AF' }}><Loader2 size={28} className="spin" /></div>
            ) : symbols.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                لا توجد نتائج لـ «{search}». جرّب كلمة أخرى أو استخدم «صِف حلمك».
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(165px,1fr))', gap: 12 }}>
                {symbols.map(s => <SymbolCard key={s.id} s={s} fav={favIds.has(s.id)} onOpen={openSymbol} />)}
              </div>
            )}
          </>
        )}
      </div>

      {showClassifier && <Classifier onClose={() => setShowClassifier(false)} onOpen={(id) => { setShowClassifier(false); openSymbol(id); }} loggedIn={loggedIn.current} />}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dcard { transition: transform .25s, border-color .25s; }
        .dcard:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.18) !important; }
        @media print { header, button { display: none !important; } body { background: #fff !important; } }
      `}</style>
    </div>
  );
}

// ═══ مكوّنات مساعدة ═══
const iconBtn: React.CSSProperties = { width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };

function SectionTitle({ icon, color, children }: { icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: `${color}1f`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      {children}
    </h3>
  );
}

function InterpCard({ i }: { i: Interpretation }) {
  const conf = CONF_STYLE[i.source.confidence] || CONF_STYLE['اجتهادية'];
  return (
    <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p style={{ fontFamily: 'Amiri, serif', fontSize: 17, lineHeight: 2, color: '#e8eaed', direction: 'rtl', marginBottom: 12 }}>{i.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: i.context ? 8 : 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}><BookOpen size={13} color="#94a3b8" /> {i.source.name}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>· {i.source.author}</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: conf.bg, color: conf.fg }}>{conf.label}</span>
      </div>
      {i.context && (
        <p style={{ fontSize: 12, color: '#a5b4c2', lineHeight: 1.7, direction: 'rtl', borderRight: '2px solid rgba(255,255,255,0.1)', paddingRight: 10 }}>
          <b style={{ color: '#cbd5e1' }}>السياق المُرجِّح:</b> {i.context}
        </p>
      )}
      {i.source.note && (
        <p style={{ fontSize: 10.5, color: '#6b7280', marginTop: 8, lineHeight: 1.6, direction: 'rtl' }}>ℹ︎ {i.source.note}</p>
      )}
    </div>
  );
}

function SymbolCard({ s, fav, onOpen }: { s: LightSymbol; fav: boolean; onOpen: (id: string) => void }) {
  return (
    <button className="dcard" onClick={() => onOpen(s.id)} style={{ position: 'relative', textAlign: 'right', padding: '18px 16px', borderRadius: 18, background: 'linear-gradient(135deg, rgba(255,255,255,0.045), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -28, right: -28, width: 110, height: 110, borderRadius: '50%', background: s.color, opacity: 0.12, filter: 'blur(26px)' }} />
      {fav && <Heart size={14} fill="#F472B6" color="#F472B6" style={{ position: 'absolute', top: 12, left: 12 }} />}
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${s.color}, ${s.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 10, boxShadow: `0 6px 16px ${s.color}55`, position: 'relative' }}>{s.icon}</div>
      <h3 style={{ fontFamily: 'Amiri, serif', fontSize: 17, fontWeight: 700, marginBottom: 4, position: 'relative' }}>{s.name}</h3>
      <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, position: 'relative', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.summary}</p>
      <div style={{ marginTop: 8, fontSize: 10, color: s.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
        <BookOpen size={11} /> {s.interpretationsCount} تفسير
      </div>
    </button>
  );
}

function Strip({ title, icon, items, onOpen }: { title: string; icon?: React.ReactNode; items: LightSymbol[]; onOpen: (id: string) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {title}</h3>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
        {items.map(s => (
          <button key={s.id} onClick={() => onOpen(s.id)} style={{ flexShrink: 0, width: 120, textAlign: 'center', padding: '14px 10px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, margin: '0 auto 8px', borderRadius: 12, background: `linear-gradient(135deg, ${s.color}, ${s.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: 14, fontWeight: 700 }}>{s.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ مُصنّف الحلم (محلي/موثوق) ═══
function Classifier({ onClose, onOpen, loggedIn }: { onClose: () => void; onOpen: (id: string) => void; loggedIn: boolean }) {
  const [text, setText] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [social, setSocial] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const toggleEmo = (e: string) => setEmotions(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);

  const run = async () => {
    if (!text.trim()) return;
    setBusy(true); setSaved(false);
    const r = await fetch(`${API}/dreams/classify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, emotions }) }).then(x => x.json()).catch(() => null);
    setBusy(false);
    if (r?.success) setResult(r);
  };

  const saveLog = async () => {
    if (!loggedIn) { onClose(); return; }
    const r = await fetch(`${API}/dreams/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ text, emotions, socialState: social, isRecurring: recurring }) }).then(x => x.json()).catch(() => null);
    if (r?.success) setSaved(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, maxHeight: '92dvh', overflowY: 'auto', background: '#0b0b18', borderRadius: '24px 24px 0 0', border: '1px solid rgba(168,85,247,0.25)', padding: '20px 18px calc(env(safe-area-inset-bottom,0px) + 24px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Sparkles size={20} color="#C084FC" />
          <h2 style={{ flex: 1, fontSize: 17, fontWeight: 800 }}>صِف حلمك ودَعنا نُصنّفه</h2>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="اكتب تفاصيل حلمك كما تتذكّره..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, color: '#fff', fontSize: 14, direction: 'rtl', outline: 'none', resize: 'vertical', marginBottom: 12 }} />

        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>المشاعر المصاحبة</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
          {EMOTIONS.map(e => (
            <button key={e} onClick={() => toggleEmo(e)} style={{ padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: `1px solid ${emotions.includes(e) ? '#C084FC' : 'rgba(255,255,255,0.1)'}`, background: emotions.includes(e) ? 'rgba(168,85,247,0.2)' : 'transparent', color: emotions.includes(e) ? '#C084FC' : '#cbd5e1' }}>{e}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <select value={social} onChange={e => setSocial(e.target.value)} style={{ flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 11, color: '#fff', fontSize: 13, outline: 'none' }}>
            <option value="" style={{ background: '#0b0b18' }}>الحالة الاجتماعية</option>
            {SOCIAL.map(s => <option key={s} value={s} style={{ background: '#0b0b18' }}>{s}</option>)}
          </select>
          <button onClick={() => setRecurring(r => !r)} style={{ flex: 1, minWidth: 140, padding: 11, borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: `1px solid ${recurring ? '#C084FC' : 'rgba(255,255,255,0.1)'}`, background: recurring ? 'rgba(168,85,247,0.2)' : 'transparent', color: recurring ? '#C084FC' : '#cbd5e1' }}>
            {recurring ? '✓ ' : ''}حلم متكرّر
          </button>
        </div>

        <button onClick={run} disabled={busy || !text.trim()} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', cursor: busy || !text.trim() ? 'default' : 'pointer', background: busy || !text.trim() ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />} صنّف الحلم
        </button>

        {result && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>التصنيف</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#C084FC', marginBottom: 12 }}>{result.classification}</div>
            {result.matchedSymbols?.length > 0 ? (
              <>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>رموز مطابقة من الموسوعة (اضغط للتفسير الموثّق):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.matchedSymbols.map((m: LightSymbol) => (
                    <button key={m.id} onClick={() => onOpen(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, cursor: 'pointer', background: `${m.color}22`, border: `1px solid ${m.color}55`, color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      <span>{m.icon}</span> {m.name} <ChevronLeft size={13} />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>لم نطابق رموزاً معروفة. أضف تفاصيل أكثر أو ابحث يدوياً في الموسوعة.</p>
            )}
            <p style={{ fontSize: 11, color: '#6b7280', marginTop: 12, lineHeight: 1.6 }}>ℹ︎ {result.note}</p>
            <button onClick={saveLog} disabled={saved} style={{ width: '100%', marginTop: 12, padding: 11, borderRadius: 12, border: '1px solid rgba(168,85,247,0.3)', background: saved ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.12)', color: saved ? '#34D399' : '#C084FC', fontSize: 13, fontWeight: 700, cursor: saved ? 'default' : 'pointer' }}>
              {saved ? '✓ حُفظ في سجلّك' : loggedIn ? '＋ احفظ في سجل أحلامي' : 'سجّل الدخول لحفظ الحلم'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ سجل الأحلام ═══
function Journal({ onOpen, loggedIn, goLogin }: { onOpen: (id: string) => void; loggedIn: boolean; goLogin: () => void }) {
  const [logs, setLogs] = useState<DreamLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) { setLoading(false); return; }
    fetch(`${API}/dreams/logs`, { headers: authHeaders() }).then(r => r.json()).then(r => { if (r.success) setLogs(r.logs); }).catch(() => {}).finally(() => setLoading(false));
  }, [loggedIn]);

  const del = async (id: string) => {
    await fetch(`${API}/dreams/logs/${id}`, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
    setLogs(p => p.filter(l => l.id !== id));
  };

  if (!loggedIn) return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <PenLine size={40} color="#6B7280" style={{ marginBottom: 14 }} />
      <p style={{ color: '#cbd5e1', marginBottom: 16 }}>سجّل الدخول لتحفظ أحلامك وتتابعها عبر الزمن.</p>
      <button onClick={goLogin} style={{ padding: '12px 28px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', fontSize: 14, fontWeight: 700 }}>تسجيل الدخول</button>
    </div>
  );
  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#9CA3AF' }}><Loader2 size={26} className="spin" /></div>;
  if (logs.length === 0) return <div style={{ textAlign: 'center', padding: 50, color: '#9CA3AF' }}>سجلّك فارغ. استخدم «صِف حلمك» لإضافة أول حلم.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {logs.map(l => (
        <div key={l.id} style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(168,85,247,0.18)', color: '#C084FC' }}>{l.classification}</span>
            {l.isRecurring && <span style={{ fontSize: 11, color: '#FBBF24' }}>متكرّر</span>}
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>{new Date(l.createdAt).toLocaleDateString('ar')}</span>
            <button onClick={() => del(l.id)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}><Trash2 size={15} /></button>
          </div>
          <p style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.8, direction: 'rtl', whiteSpace: 'pre-line' }}>{l.text}</p>
          {l.symbols.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {l.symbols.map(sid => (
                <button key={sid} onClick={() => onOpen(sid)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#C084FC', cursor: 'pointer' }}>#{sid}</button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
