'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Search, ScrollText, BookOpen, Bookmark, Share2, X, Info,
  Loader2, Sparkles, Library, GraduationCap, ChevronLeft, Hash,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

interface Grade { key: string; label: string; color: string; desc: string; count: number; }
interface Book { id: string; name: string; author: string; died: string; count: string; rank: string; brief: string; }
interface Category { id: string; name: string; icon: string; color: string; count: number; }
interface LightHadith { id: string; text: string; attribution: string; grade: string; gradeKey: string; category?: string; bookId?: string; source: string; }
interface FullHadith extends LightHadith {
  explanation?: string; reference?: string; benefits?: string[];
  wordsMeanings?: { word: string; meaning: string }[];
  gradeInfo?: Grade; book?: Book | null;
}
interface Term { id: string; term: string; group: string; definition: string; example: string; related: string[]; relatedTerms?: { id: string; term: string; definition: string }[]; }

function authHeaders(): Record<string, string> {
  try { const t = localStorage.getItem('noor_token'); return t ? { Authorization: `Bearer ${t}` } : {}; } catch { return {}; }
}
const gradeColor = (g: Grade[] | undefined, key: string) => g?.find(x => x.key === key)?.color || '#9CA3AF';
const gradeLabel = (g: Grade[] | undefined, key: string) => g?.find(x => x.key === key)?.label || key;

export default function HadithPage() {
  const router = useRouter();
  const [view, setView] = useState<'browse' | 'terms' | 'books'>('browse');
  const [meta, setMeta] = useState<{ total: number; grades: Grade[]; books: Book[]; categories: Category[]; termsCount: number; disclaimer: string } | null>(null);
  const [hadiths, setHadiths] = useState<LightHadith[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FullHadith | null>(null);
  const [daily, setDaily] = useState<{ hadith: FullHadith | null; term: Term | null } | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const loggedIn = useRef(false);

  // terms
  const [terms, setTerms] = useState<Term[]>([]);
  const [termGroups, setTermGroups] = useState<string[]>([]);
  const [termGroup, setTermGroup] = useState('');
  const [selTerm, setSelTerm] = useState<Term | null>(null);

  useEffect(() => {
    try { loggedIn.current = !!localStorage.getItem('noor_token'); } catch {}
    (async () => {
      try {
        const [m, d] = await Promise.all([
          fetch(`${API}/hadith/meta`).then(r => r.json()),
          fetch(`${API}/hadith/daily`).then(r => r.json()),
        ]);
        if (m.success) setMeta(m);
        if (d.success) setDaily({ hadith: d.hadith, term: d.term });
        await loadHadiths('', '', '');
        if (loggedIn.current) {
          const c = await fetch(`${API}/hadith/collection`, { headers: authHeaders() }).then(r => r.json()).catch(() => null);
          if (c?.success) setSaved(new Set(c.hadiths.map((h: LightHadith) => h.id)));
        }
      } catch {}
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHadiths = async (q: string, g: string, c: string) => {
    const p = new URLSearchParams({ per: '24' });
    if (q) p.set('q', q); if (g) p.set('grade', g); if (c) p.set('category', c);
    const r = await fetch(`${API}/hadith/hadiths?${p}`).then(x => x.json()).catch(() => null);
    if (r?.success) { setHadiths(r.hadiths); setTotal(r.total); }
  };

  const timer = useRef<any>(null);
  const onSearch = (v: string) => { setSearch(v); clearTimeout(timer.current); timer.current = setTimeout(() => loadHadiths(v, grade, category), 230); };
  const onGrade = (g: string) => { const n = grade === g ? '' : g; setGrade(n); loadHadiths(search, n, category); };
  const onCat = (c: string) => { const n = category === c ? '' : c; setCategory(n); loadHadiths(search, grade, n); };

  const openHadith = async (id: string) => {
    setSelected(null);
    const r = await fetch(`${API}/hadith/hadiths/${id}`).then(x => x.json()).catch(() => null);
    if (r?.success) { setSelected(r.hadith); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const toggleSave = async (id: string) => {
    if (!loggedIn.current) { router.push('/auth/login'); return; }
    const r = await fetch(`${API}/hadith/collection/${id}`, { method: 'POST', headers: authHeaders() }).then(x => x.json()).catch(() => null);
    if (r?.success) setSaved(p => { const n = new Set(p); r.saved ? n.add(id) : n.delete(id); return n; });
  };
  const share = async (h: FullHadith) => {
    const text = `${h.text}\n\n${h.attribution} — الحكم: ${h.grade}\n(أكاديمية علم الحديث · نور AI)`;
    try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); alert('تم النسخ ✅'); } } catch {}
  };

  const loadTerms = async (g: string) => {
    const r = await fetch(`${API}/hadith/terms${g ? `?group=${encodeURIComponent(g)}` : ''}`).then(x => x.json()).catch(() => null);
    if (r?.success) { setTerms(r.terms); setTermGroups(r.groups); }
  };
  const openTerm = async (id: string) => {
    const r = await fetch(`${API}/hadith/terms/${id}`).then(x => x.json()).catch(() => null);
    if (r?.success) setSelTerm(r.term);
  };
  useEffect(() => { if (view === 'terms' && terms.length === 0) loadTerms(''); /* eslint-disable-next-line */ }, [view]);

  // ═══ صفحة حديث ═══
  if (selected) {
    const h = selected; const col = h.gradeInfo?.color || '#10B981';
    return (
      <div style={{ minHeight: '100dvh', background: '#04140d', color: '#fff' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: `radial-gradient(ellipse at top, ${col}26, transparent 60%), #04140d` }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px)+14px) 16px 120px' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, position: 'sticky', top: 0, background: 'rgba(4,20,13,0.7)', backdropFilter: 'blur(14px)', padding: '8px 0', zIndex: 30, borderRadius: 12 }}>
            <button onClick={() => setSelected(null)} style={iconBtn}><ArrowRight size={20} /></button>
            <div style={{ flex: 1 }}><h1 style={{ fontSize: 15, fontWeight: 800 }}>الحديث الشريف</h1></div>
            <button onClick={() => toggleSave(h.id)} style={{ ...iconBtn, color: saved.has(h.id) ? '#34D399' : '#fff' }}><Bookmark size={18} fill={saved.has(h.id) ? '#34D399' : 'none'} /></button>
            <button onClick={() => share(h)} style={iconBtn}><Share2 size={17} /></button>
          </header>

          {/* النصّ */}
          <div style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: `1px solid ${col}44`, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, padding: '5px 14px', borderRadius: 999, background: `${col}22`, color: col, border: `1px solid ${col}66` }}>● {h.grade || gradeLabel(meta?.grades, h.gradeKey)}</span>
            </div>
            <p style={{ fontFamily: 'Amiri, serif', fontSize: 21, lineHeight: 2.2, color: '#f0f4f1', direction: 'rtl', textAlign: 'justify' }}>{h.text}</p>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#86c5a6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} /> {h.attribution}
            </div>
          </div>

          {/* حكم */}
          {h.gradeInfo && (
            <Card><Label icon={<Info size={14} />} c={col}>الحكم على الحديث</Label>
              <p style={{ fontSize: 14, color: '#dfeee6', lineHeight: 1.9, direction: 'rtl' }}><b style={{ color: col }}>{h.grade}:</b> {h.gradeInfo.desc}</p>
            </Card>
          )}
          {/* شرح */}
          {h.explanation && (
            <Card><Label icon={<Sparkles size={14} />} c="#34D399">الشرح</Label>
              <p style={{ fontSize: 14.5, color: '#e6efe9', lineHeight: 2, direction: 'rtl', textAlign: 'justify' }}>{h.explanation}</p>
            </Card>
          )}
          {/* الفوائد */}
          {h.benefits && h.benefits.length > 0 && (
            <Card><Label icon={<Hash size={14} />} c="#FBBF24">الفوائد</Label>
              <ul style={{ margin: 0, paddingInlineStart: 18, direction: 'rtl' }}>
                {h.benefits.map((b, i) => <li key={i} style={{ fontSize: 13.5, color: '#dfeee6', lineHeight: 1.9, marginBottom: 6 }}>{b}</li>)}
              </ul>
            </Card>
          )}
          {/* معاني الكلمات */}
          {h.wordsMeanings && h.wordsMeanings.length > 0 && (
            <Card><Label icon={<BookOpen size={14} />} c="#60A5FA">معاني الكلمات</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {h.wordsMeanings.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, direction: 'rtl' }}>
                    <span style={{ fontWeight: 800, color: '#93c5fd', minWidth: 70 }}>{w.word}</span>
                    <span style={{ color: '#cbd5e1' }}>{w.meaning}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {/* المرجع + الكتاب */}
          {(h.reference || h.book) && (
            <Card>
              <Label icon={<Library size={14} />} c="#A78BFA">المرجع والتخريج</Label>
              {h.book && <p style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 6 }}><b>{h.book.name}</b> — {h.book.author} ({h.book.died})</p>}
              {h.reference && <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.8, direction: 'rtl', whiteSpace: 'pre-line' }}>{h.reference}</p>}
            </Card>
          )}

          <div style={{ display: 'flex', gap: 10, padding: 13, borderRadius: 14, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <Info size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: '#FDE68A', lineHeight: 1.7, direction: 'rtl' }}>هذا القسم للتعريف والدراسة لا للإفتاء؛ والحكم على الحديث منقولٌ عن مصدره. واستنباط الأحكام مرجعه أهل العلم.</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══ الواجهة الرئيسية ═══
  return (
    <div style={{ minHeight: '100dvh', background: '#04140d', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.15), transparent 55%), #04140d' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px)+20px) 16px 120px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => router.push('/home')} style={iconBtn}><ArrowRight size={20} /></button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 25, fontWeight: 900, background: 'linear-gradient(135deg,#34D399,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ScrollText size={23} color="#34D399" /> أكاديمية علم الحديث
            </h1>
            <p style={{ fontSize: 11, color: '#86c5a6' }}>{meta?.total ?? '…'} حديثاً مخرَّجاً · {meta?.termsCount ?? '…'} مصطلحاً · {meta?.books.length ?? 9} كتب</p>
          </div>
        </header>

        <div style={{ display: 'flex', gap: 8, padding: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 16, marginBottom: 16 }}>
          {[{ k: 'browse', label: 'الأحاديث', icon: ScrollText }, { k: 'terms', label: 'مصطلح الحديث', icon: GraduationCap }, { k: 'books', label: 'الكتب', icon: Library }].map(t => {
            const Icon = t.icon; const active = view === t.k;
            return <button key={t.k} onClick={() => setView(t.k as any)} style={{ flex: 1, padding: 11, borderRadius: 12, border: 'none', cursor: 'pointer', background: active ? 'linear-gradient(135deg,#059669,#047857)' : 'transparent', color: '#fff', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon size={16} /> {t.label}</button>;
          })}
        </div>

        {/* تنبيه */}
        <div style={{ display: 'flex', gap: 10, padding: '11px 14px', borderRadius: 14, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 16 }}>
          <Info size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 11.5, color: '#FDE68A', lineHeight: 1.7, direction: 'rtl' }}>{meta?.disclaimer || 'للتعريف والدراسة لا للإفتاء؛ والأحكام منقولة عن مصادرها.'}</p>
        </div>

        {view === 'browse' && (
          <>
            {/* حديث اليوم */}
            {daily?.hadith && !search && !grade && !category && (
              <button onClick={() => openHadith(daily.hadith!.id)} style={{ width: '100%', textAlign: 'right', padding: 18, borderRadius: 18, marginBottom: 16, cursor: 'pointer', background: 'linear-gradient(160deg, rgba(16,185,129,0.14), rgba(5,150,105,0.05))', border: '1px solid rgba(16,185,129,0.3)', color: '#fff' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#34D399', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} /> حديث اليوم</div>
                <p style={{ fontFamily: 'Amiri, serif', fontSize: 17, lineHeight: 1.9, color: '#eafaf2', direction: 'rtl', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{daily.hadith.text}</p>
                <div style={{ marginTop: 8, fontSize: 11, color: '#86c5a6' }}>{daily.hadith.attribution} · {daily.hadith.grade}</div>
              </button>
            )}

            {/* بحث */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '13px 16px', marginBottom: 12 }}>
              <Search size={18} color="#6B7280" />
              <input value={search} onChange={e => onSearch(e.target.value)} placeholder="ابحث في متون الأحاديث... (الصلاة، النية، الصدق)" style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 14, outline: 'none', direction: 'rtl' }} />
            </div>

            {/* مرشّح الحكم */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 }}>
              {(meta?.grades || []).filter(g => g.count > 0).map(g => {
                const active = grade === g.key;
                return <button key={g.key} onClick={() => onGrade(g.key)} style={{ flexShrink: 0, padding: '8px 13px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, border: `1px solid ${active ? g.color : 'rgba(255,255,255,0.1)'}`, background: active ? `${g.color}22` : 'rgba(255,255,255,0.03)', color: active ? g.color : '#cbd5e1', display: 'flex', alignItems: 'center', gap: 5 }}>● {g.label} <span style={{ opacity: 0.6 }}>{g.count}</span></button>;
              })}
            </div>
            {/* مرشّح التصنيف */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
              {(meta?.categories || []).filter(c => c.count > 0).map(c => {
                const active = category === c.id;
                return <button key={c.id} onClick={() => onCat(c.id)} style={{ flexShrink: 0, padding: '8px 13px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, border: `1px solid ${active ? c.color : 'rgba(255,255,255,0.1)'}`, background: active ? `${c.color}22` : 'rgba(255,255,255,0.03)', color: active ? c.color : '#cbd5e1' }}>{c.icon} {c.name} <span style={{ opacity: 0.6 }}>{c.count}</span></button>;
              })}
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 800, margin: '4px 0 12px', color: '#cbd5e1' }}>{search || grade || category ? `النتائج (${total})` : `الأحاديث (${total})`}</h3>
            {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Loader2 size={26} className="spin" color="#34D399" /></div>
              : hadiths.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#86c5a6' }}>لا توجد نتائج. جرّب كلمة أخرى.</div>
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
                  {hadiths.map(h => (
                    <button key={h.id} className="hcard" onClick={() => openHadith(h.id)} style={{ textAlign: 'right', padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: `${gradeColor(meta?.grades, h.gradeKey)}22`, color: gradeColor(meta?.grades, h.gradeKey) }}>● {gradeLabel(meta?.grades, h.gradeKey)}</span>
                      </div>
                      <p style={{ fontFamily: 'Amiri, serif', fontSize: 16, lineHeight: 1.95, color: '#eafaf2', direction: 'rtl', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{h.text}</p>
                      <div style={{ marginTop: 8, fontSize: 11, color: '#86c5a6', display: 'flex', alignItems: 'center', gap: 5 }}><BookOpen size={11} /> {h.attribution}</div>
                    </button>
                  ))}
                </div>}
          </>
        )}

        {view === 'terms' && (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
              <button onClick={() => { setTermGroup(''); loadTerms(''); }} style={chip(termGroup === '')}>الكل</button>
              {termGroups.map(g => <button key={g} onClick={() => { setTermGroup(g); loadTerms(g); }} style={chip(termGroup === g)}>{g}</button>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
              {terms.map(t => (
                <button key={t.id} className="hcard" onClick={() => openTerm(t.id)} style={{ textAlign: 'right', padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(139,92,246,0.2)', color: '#fff', cursor: 'pointer' }}>
                  <div style={{ fontFamily: 'Amiri, serif', fontSize: 17, fontWeight: 700, color: '#c4b5fd', marginBottom: 5 }}>{t.term}</div>
                  <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, direction: 'rtl', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.definition}</div>
                  <div style={{ marginTop: 8, fontSize: 10, color: '#8b5cf6' }}>{t.group}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {view === 'books' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(meta?.books || []).map(b => (
              <div key={b.id} style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Library size={20} color="#34D399" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'Amiri, serif', fontSize: 19, fontWeight: 700 }}>{b.name}</h3>
                    <div style={{ fontSize: 11, color: '#86c5a6' }}>{b.author} · {b.died} · {b.count} حديثاً</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>{b.rank}</span>
                </div>
                <p style={{ fontSize: 13.5, color: '#dfeee6', lineHeight: 1.85, direction: 'rtl' }}>{b.brief}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة المصطلح */}
      {selTerm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setSelTerm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, maxHeight: '85dvh', overflowY: 'auto', background: '#0d0b1a', borderRadius: 22, border: '1px solid rgba(139,92,246,0.3)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ flex: 1, fontFamily: 'Amiri, serif', fontSize: 24, fontWeight: 700, color: '#c4b5fd' }}>{selTerm.term}</h2>
              <button onClick={() => setSelTerm(null)} style={iconBtn}><X size={18} /></button>
            </div>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(139,92,246,0.18)', color: '#a78bfa' }}>{selTerm.group}</span>
            <p style={{ fontSize: 15, color: '#e6e9f0', lineHeight: 2, direction: 'rtl', margin: '14px 0', textAlign: 'justify' }}>{selTerm.definition}</p>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 4 }}>مثال</div>
              <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.8, direction: 'rtl' }}>{selTerm.example}</p>
            </div>
            {selTerm.relatedTerms && selTerm.relatedTerms.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selTerm.relatedTerms.map(r => <button key={r.id} onClick={() => openTerm(r.id)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 999, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{r.term} <ChevronLeft size={12} /></button>)}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.hcard{transition:transform .2s,border-color .2s}.hcard:hover{transform:translateY(-3px);border-color:rgba(255,255,255,0.18)!important}`}</style>
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
const chip = (active: boolean): React.CSSProperties => ({ flexShrink: 0, padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, border: `1px solid ${active ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)', color: active ? '#c4b5fd' : '#cbd5e1' });
function Card({ children }: { children: React.ReactNode }) { return <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>{children}</div>; }
function Label({ icon, c, children }: { icon: React.ReactNode; c: string; children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, fontWeight: 800, color: c, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 26, height: 26, borderRadius: 8, background: `${c}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>{children}</div>;
}
