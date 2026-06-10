'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Trash2, Save, X, Loader2, Edit3, ShieldAlert } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

interface Interp { text: string; sourceId: string; context: string; tradition: 'تراثي' | 'معاصر'; }
interface SymbolForm {
  id: string; name: string; category: string; icon: string; color: string;
  tags: string; summary: string; notes: string; related: string; interpretations: Interp[];
}
const EMPTY: SymbolForm = { id: '', name: '', category: 'objects', icon: '💭', color: '#A855F7', tags: '', summary: '', notes: '', related: '', interpretations: [] };

function headers(): Record<string, string> {
  try { const t = localStorage.getItem('noor_token'); return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }; }
  catch { return { 'Content-Type': 'application/json' }; }
}

export default function DreamsAdmin() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [symbols, setSymbols] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [form, setForm] = useState<SymbolForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const chk = await fetch(`${API}/admin/check`, { headers: headers() }).then(r => r.json()).catch(() => null);
        if (!chk?.isAdmin) { setStatus('denied'); return; }
        setStatus('ok');
        const [m, list] = await Promise.all([
          fetch(`${API}/dreams/meta`).then(r => r.json()),
          fetch(`${API}/dreams/symbols`).then(r => r.json()),
        ]);
        if (m.success) { setCats(m.categories); setSources(m.sources); }
        if (list.success) setSymbols(list.symbols);
      } catch { setStatus('denied'); }
    })();
  }, []);

  const reloadList = async () => {
    const list = await fetch(`${API}/dreams/symbols`).then(r => r.json()).catch(() => null);
    if (list?.success) setSymbols(list.symbols);
  };

  const edit = async (id: string) => {
    const r = await fetch(`${API}/dreams/symbols/${id}`).then(x => x.json()).catch(() => null);
    if (!r?.success) return;
    const s = r.symbol;
    setForm({
      id: s.id, name: s.name, category: s.category, icon: s.icon, color: s.color,
      tags: (s.tags || []).join('، '), summary: s.summary, notes: s.notes || '',
      related: (s.related || []).join('، '),
      interpretations: (s.interpretations || []).map((i: any) => ({ text: i.text, sourceId: i.sourceId, context: i.context || '', tradition: i.tradition || 'تراثي' })),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    if (!form || !form.id || !form.name) { alert('id و name مطلوبان'); return; }
    setSaving(true);
    const body = {
      ...form,
      tags: form.tags.split(/[،,]/).map(t => t.trim()).filter(Boolean),
      related: form.related.split(/[،,]/).map(t => t.trim()).filter(Boolean),
    };
    const r = await fetch(`${API}/dreams/symbols`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(x => x.json()).catch(() => null);
    setSaving(false);
    if (r?.success) { setForm(null); reloadList(); } else alert('فشل الحفظ: ' + (r?.error || ''));
  };

  const del = async (id: string) => {
    if (!confirm(`حذف الرمز «${id}»؟`)) return;
    await fetch(`${API}/dreams/symbols/${id}`, { method: 'DELETE', headers: headers() }).catch(() => {});
    reloadList();
  };

  if (status === 'checking') return <Center><Loader2 size={28} className="spin" /></Center>;
  if (status === 'denied') return (
    <Center>
      <ShieldAlert size={40} color="#F87171" style={{ marginBottom: 12 }} />
      <p style={{ color: '#cbd5e1', marginBottom: 16 }}>هذه اللوحة للمدير فقط (اضبط ADMIN_EMAIL وسجّل بنفس البريد).</p>
      <button onClick={() => router.push('/dreams')} style={btnPrimary}>العودة للموسوعة</button>
    </Center>
  );

  const up = (patch: Partial<SymbolForm>) => setForm(f => f ? { ...f, ...patch } : f);
  const upInterp = (idx: number, patch: Partial<Interp>) => setForm(f => f ? { ...f, interpretations: f.interpretations.map((i, j) => j === idx ? { ...i, ...patch } : i) } : f);

  return (
    <div style={{ minHeight: '100dvh', background: '#050510', color: '#fff' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px) + 18px) 16px 100px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => router.push('/dreams')} style={iconBtn}><ArrowRight size={20} /></button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900 }}>⚙️ إدارة موسوعة الأحلام</h1>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>{symbols.length} رمزاً</p>
          </div>
          {!form && <button onClick={() => setForm({ ...EMPTY })} style={btnPrimary}><Plus size={16} /> رمز جديد</button>}
        </header>

        {form ? (
          <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ flex: 1, fontSize: 16, fontWeight: 800 }}>{symbols.find(s => s.id === form.id) ? 'تعديل رمز' : 'رمز جديد'}</h2>
              <button onClick={() => setForm(null)} style={iconBtn}><X size={18} /></button>
            </div>
            <Row>
              <Field label="المعرّف (id بالإنجليزية)"><input style={inp} value={form.id} onChange={e => up({ id: e.target.value })} placeholder="sea" /></Field>
              <Field label="الاسم"><input style={inp} value={form.name} onChange={e => up({ name: e.target.value })} placeholder="البحر" /></Field>
            </Row>
            <Row>
              <Field label="التصنيف"><select style={inp} value={form.category} onChange={e => up({ category: e.target.value })}>{cats.map(c => <option key={c.id} value={c.id} style={{ background: '#0b0b18' }}>{c.icon} {c.name}</option>)}</select></Field>
              <Field label="الإيموجي"><input style={inp} value={form.icon} onChange={e => up({ icon: e.target.value })} /></Field>
              <Field label="اللون"><input style={{ ...inp, padding: 4, height: 42 }} type="color" value={form.color} onChange={e => up({ color: e.target.value })} /></Field>
            </Row>
            <Field label="وسوم/مرادفات (افصل بفاصلة)"><input style={inp} value={form.tags} onChange={e => up({ tags: e.target.value })} placeholder="بحر، محيط، موج" /></Field>
            <Field label="تفسير مختصر"><textarea style={{ ...inp, minHeight: 60 }} value={form.summary} onChange={e => up({ summary: e.target.value })} /></Field>
            <Field label="ملاحظات (اختياري)"><textarea style={{ ...inp, minHeight: 50 }} value={form.notes} onChange={e => up({ notes: e.target.value })} /></Field>
            <Field label="رموز مشابهة (معرّفات بفاصلة)"><input style={inp} value={form.related} onChange={e => up({ related: e.target.value })} placeholder="water، rain" /></Field>

            <div style={{ margin: '14px 0 8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: '#C084FC' }}>التفسيرات ({form.interpretations.length})</span>
              <button onClick={() => up({ interpretations: [...form.interpretations, { text: '', sourceId: sources[0]?.id || '', context: '', tradition: 'تراثي' }] })} style={{ ...btnGhost, padding: '6px 12px' }}><Plus size={14} /> إضافة تفسير</button>
            </div>
            {form.interpretations.map((it, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 10 }}>
                <textarea style={{ ...inp, minHeight: 56, marginBottom: 8 }} value={it.text} onChange={e => upInterp(idx, { text: e.target.value })} placeholder="نص التفسير..." />
                <Row>
                  <Field label="المصدر"><select style={inp} value={it.sourceId} onChange={e => upInterp(idx, { sourceId: e.target.value })}>{sources.map(s => <option key={s.id} value={s.id} style={{ background: '#0b0b18' }}>{s.name}</option>)}</select></Field>
                  <Field label="النوع"><select style={inp} value={it.tradition} onChange={e => upInterp(idx, { tradition: e.target.value as any })}><option value="تراثي" style={{ background: '#0b0b18' }}>تراثي</option><option value="معاصر" style={{ background: '#0b0b18' }}>معاصر</option></select></Field>
                </Row>
                <Field label="السياق المُرجِّح"><input style={inp} value={it.context} onChange={e => upInterp(idx, { context: e.target.value })} /></Field>
                <button onClick={() => up({ interpretations: form.interpretations.filter((_, j) => j !== idx) })} style={{ ...btnGhost, color: '#F87171', marginTop: 4 }}><Trash2 size={13} /> حذف هذا التفسير</button>
              </div>
            ))}

            <button onClick={save} disabled={saving} style={{ ...btnPrimary, width: '100%', marginTop: 14, justifyContent: 'center' }}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} حفظ الرمز
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {symbols.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Amiri, serif' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.id} · {s.interpretationsCount} تفسير · {s.views} مشاهدة</div>
                </div>
                <button onClick={() => edit(s.id)} style={iconBtn}><Edit3 size={16} /></button>
                <button onClick={() => del(s.id)} style={{ ...iconBtn, color: '#F87171' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
const btnPrimary: React.CSSProperties = { padding: '9px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 };
const btnGhost: React.CSSProperties = { padding: '7px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#cbd5e1', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' };
const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 10, color: '#fff', fontSize: 13, outline: 'none', direction: 'rtl', fontFamily: 'inherit' };

function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ flex: 1, minWidth: 130, display: 'block', marginBottom: 10 }}><span style={{ display: 'block', fontSize: 11, color: '#9CA3AF', marginBottom: 5 }}>{label}</span>{children}</label>;
}
function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100dvh', background: '#050510', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>{children}</div>;
}
