'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, BookOpen, ExternalLink, Library } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// مكتبة نور — كتبٌ نافعة مُختارة، روابط القراءة من المكتبة الشاملة (مجانية)
// ═══════════════════════════════════════════════════════════════
interface Book { title: string; author: string; cat: string; note: string; }

const CATS = [
  { id: 'tazkiah', name: 'التزكية والرقائق', icon: '🫀', color: '#F472B6' },
  { id: 'hadith', name: 'الحديث وعلومه', icon: '📜', color: '#34D399' },
  { id: 'tafsir', name: 'التفسير وعلوم القرآن', icon: '📖', color: '#A78BFA' },
  { id: 'aqidah', name: 'العقيدة', icon: '☪️', color: '#60A5FA' },
  { id: 'fiqh', name: 'الفقه والسلوك', icon: '⚖️', color: '#FBBF24' },
  { id: 'sirah', name: 'السيرة والتاريخ', icon: '🕌', color: '#FB923C' },
  { id: 'adab', name: 'الآداب واللسان', icon: '🗣️', color: '#22D3EE' },
];

const BOOKS: Record<string, Book[]> = {
  tazkiah: [
    { title: 'مدارج السالكين', author: 'ابن القيّم', cat: 'tazkiah', note: 'شرحٌ لمنازل ﴿إياك نعبد وإياك نستعين﴾ ومقامات القلب — من أعظم كتب السلوك.' },
    { title: 'إغاثة اللهفان من مصايد الشيطان', author: 'ابن القيّم', cat: 'tazkiah', note: 'في أمراض القلوب ومكايد الشيطان وعلاجها.' },
    { title: 'الرعاية لحقوق الله', author: 'الحارث المحاسبي', cat: 'tazkiah', note: 'أصلٌ في علم محاسبة النفس ومراقبة القلب.' },
    { title: 'صيد الخاطر', author: 'ابن الجوزي', cat: 'tazkiah', note: 'خواطرُ إيمانيّةٌ تُحرّك الهمّة وتُوقظ القلب.' },
    { title: 'الفوائد', author: 'ابن القيّم', cat: 'tazkiah', note: 'دررٌ ولطائفُ في التوحيد والسلوك وتزكية النفس.' },
    { title: 'مختصر منهاج القاصدين', author: 'ابن قدامة المقدسي', cat: 'tazkiah', note: 'خلاصةٌ نافعةٌ في العبادات والأخلاق ومنازل السائرين.' },
  ],
  hadith: [
    { title: 'رياض الصالحين', author: 'النووي', cat: 'hadith', note: 'أحاديثُ صحيحةٌ في الأخلاق والآداب والعبادات — عمليٌّ ميسّر.' },
    { title: 'الأربعون النووية', author: 'النووي', cat: 'hadith', note: 'أحاديثُ جامعةٌ هي قواعدُ الإسلام؛ يُنصح بحفظها.' },
    { title: 'جامع العلوم والحكم', author: 'ابن رجب الحنبلي', cat: 'hadith', note: 'شرحٌ بديعٌ للأربعين النووية وزياداتها.' },
    { title: 'نزهة النظر شرح نخبة الفكر', author: 'ابن حجر العسقلاني', cat: 'hadith', note: 'متنٌ وشرحٌ في مصطلح الحديث — مدخلٌ معتمد.' },
    { title: 'تيسير مصطلح الحديث', author: 'محمود الطحّان', cat: 'hadith', note: 'مقرّرٌ معاصرٌ ميسّرٌ لعلم المصطلح.' },
    { title: 'بلوغ المرام', author: 'ابن حجر العسقلاني', cat: 'hadith', note: 'أحاديثُ الأحكام مع بيان درجاتها.' },
  ],
  tafsir: [
    { title: 'تيسير الكريم الرحمن (تفسير السعدي)', author: 'عبد الرحمن السعدي', cat: 'tafsir', note: 'تفسيرٌ ميسّرٌ يعين على التدبّر واستخراج الفوائد.' },
    { title: 'تفسير القرآن العظيم', author: 'ابن كثير', cat: 'tafsir', note: 'تفسيرٌ بالمأثور، من أصحّ التفاسير وأشهرها.' },
    { title: 'التبيان في آداب حملة القرآن', author: 'النووي', cat: 'tafsir', note: 'في فضل القرآن وآداب قارئه وحامله.' },
  ],
  aqidah: [
    { title: 'العقيدة الواسطية', author: 'ابن تيمية', cat: 'aqidah', note: 'متنٌ جامعٌ في عقيدة أهل السنّة والجماعة.' },
    { title: 'كتاب التوحيد', author: 'محمد بن عبد الوهاب', cat: 'aqidah', note: 'في تحقيق توحيد العبادة والتحذير من الشرك.' },
    { title: 'شرح الأصول الثلاثة', author: 'ابن عثيمين', cat: 'aqidah', note: 'شرحٌ ميسّرٌ لأصول الدين الثلاثة.' },
  ],
  fiqh: [
    { title: 'صفة صلاة النبي ﷺ', author: 'الألباني', cat: 'fiqh', note: 'لتصحيح صفة الصلاة على السنّة من التكبير إلى التسليم.' },
    { title: 'منهاج المسلم', author: 'أبو بكر الجزائري', cat: 'fiqh', note: 'موسوعةٌ ميسّرةٌ في العقيدة والأخلاق والعبادات والمعاملات.' },
    { title: 'الوابل الصيّب من الكلم الطيّب', author: 'ابن القيّم', cat: 'fiqh', note: 'في فضل الذكر وأثره وآدابه — سلوكيٌّ عمليّ.' },
  ],
  sirah: [
    { title: 'الرحيق المختوم', author: 'صفي الرحمن المباركفوري', cat: 'sirah', note: 'سيرةٌ نبويّةٌ موثّقةٌ ميسّرة — حائزةٌ على جائزة.' },
    { title: 'زاد المعاد في هدي خير العباد', author: 'ابن القيّم', cat: 'sirah', note: 'هديُ النبي ﷺ في العبادة والمعاملة والطبّ والسلوك.' },
    { title: 'البداية والنهاية', author: 'ابن كثير', cat: 'sirah', note: 'تاريخٌ جامعٌ من بدء الخلق إلى أحداث آخر الزمان.' },
  ],
  adab: [
    { title: 'الأذكار', author: 'النووي', cat: 'adab', note: 'جامعٌ لأذكار اليوم والليلة وآداب الكلام وحفظ اللسان.' },
    { title: 'الصمت وآداب اللسان', author: 'ابن أبي الدنيا', cat: 'adab', note: 'في خطر اللسان وآفاته وآداب الكلام.' },
    { title: 'حصن المسلم', author: 'سعيد بن وهف القحطاني', cat: 'adab', note: 'أذكارٌ صحيحةٌ مختصرةٌ من الكتاب والسنّة — للحفظ اليومي.' },
  ],
};

const readUrl = (b: Book) => `https://shamela.ws/search?q=${encodeURIComponent(b.title)}`;

export default function MaktabaPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');

  const all = useMemo(() => Object.values(BOOKS).flat(), []);
  const list = useMemo(() => {
    let r = cat ? BOOKS[cat] || [] : all;
    if (q.trim()) { const n = q.trim(); r = r.filter(b => b.title.includes(n) || b.author.includes(n) || b.note.includes(n)); }
    return r;
  }, [q, cat, all]);

  return (
    <div style={{ minHeight: '100dvh', background: '#0f0a04', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217,119,6,0.16), transparent 55%), #0f0a04' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px)+20px) 16px 120px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => router.push('/home')} style={iconBtn}><ArrowRight size={20} /></button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg,#FBBF24,#D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Library size={23} color="#FBBF24" /> مكتبة نور
            </h1>
            <p style={{ fontSize: 11, color: '#b9986a' }}>{all.length} كتابًا نافعًا مُختارًا · القراءة من المكتبة الشاملة</p>
          </div>
        </header>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '13px 16px', marginBottom: 14 }}>
          <Search size={18} color="#6B7280" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن كتاب أو مؤلّف..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 14, outline: 'none', direction: 'rtl' }} />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 18 }}>
          <button onClick={() => setCat('')} style={chip(cat === '', '#FBBF24')}>الكل</button>
          {CATS.map(c => <button key={c.id} onClick={() => setCat(cat === c.id ? '' : c.id)} style={chip(cat === c.id, c.color)}>{c.icon} {c.name}</button>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 12 }}>
          {list.map((b, i) => {
            const c = CATS.find(x => x.id === b.cat)!;
            return (
              <div key={i} style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: `${c.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Amiri, serif', fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: c.color, fontWeight: 700 }}>{b.author}</div>
                  </div>
                </div>
                <p style={{ flex: 1, fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.8, direction: 'rtl', marginBottom: 12 }}>{b.note}</p>
                <a href={readUrl(b)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 11, background: `${c.color}1a`, border: `1px solid ${c.color}44`, color: c.color, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  <BookOpen size={15} /> اقرأ على المكتبة الشاملة <ExternalLink size={13} />
                </a>
              </div>
            );
          })}
        </div>
        {list.length === 0 && <p style={{ textAlign: 'center', color: '#b9986a', padding: 40 }}>لا توجد نتائج.</p>}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#6b5536', marginTop: 28, lineHeight: 1.7 }}>
          📚 روابط القراءة تفتح بحثًا في المكتبة الشاملة (مجانية) — كتبٌ تراثيّةٌ نافعة لطالب العلم.
        </p>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
const chip = (active: boolean, c: string): React.CSSProperties => ({ flexShrink: 0, padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, border: `1px solid ${active ? c : 'rgba(255,255,255,0.1)'}`, background: active ? `${c}22` : 'rgba(255,255,255,0.03)', color: active ? c : '#cbd5e1' });
