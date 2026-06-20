'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Scale, Check, Minus, X, Sparkles, Flame, RotateCcw, Lightbulb, BookOpen, ChevronLeft, ArrowLeft, Volume2, Library, CalendarDays } from 'lucide-react';
import { PLAN30 } from './plan30';

let _ayahAudio: HTMLAudioElement | null = null;
function playAyah(file: string) {
  try {
    if (_ayahAudio) { _ayahAudio.pause(); }
    _ayahAudio = new Audio(`https://everyayah.com/data/Alafasy_128kbps/${file}.mp3`);
    _ayahAudio.play().catch(() => {});
  } catch {}
}

// ═══════════════════════════════════════════════════════════════
// مرآة القلب — محاسبة النفس
// إحياءٌ لسُنّة المحاسبة: «حاسِبوا أنفسَكم قبل أن تُحاسَبوا» (عمر بن الخطاب).
// يعمل محليًّا (localStorage) — خصوصيّةٌ تامّة، لا يُرفع شيء.
// ═══════════════════════════════════════════════════════════════

interface Dim { id: string; label: string; question: string; source: string; icon: string; color: string; }
const DIMENSIONS: Dim[] = [
  { id: 'salah', label: 'الصلة بالله', icon: '🕌', color: '#34D399',
    question: 'هل حافظتَ على صلواتك في أوقاتها بخشوع؟',
    source: '﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾ [النساء ١٠٣]' },
  { id: 'tongue', label: 'اللسان والتعامل', icon: '🗣️', color: '#60A5FA',
    question: 'هل سلِم الناسُ من لسانك ويدك اليوم؟',
    source: '«المسلمُ من سلِم المسلمون من لسانه ويده» [متفق عليه]' },
  { id: 'naf3', label: 'النفع والإحسان', icon: '🤝', color: '#FBBF24',
    question: 'هل نفعتَ أحدًا اليوم ولو بابتسامةٍ أو كلمة؟',
    source: '«خيرُ الناس أنفعُهم للناس» [حديثٌ حسن]' },
  { id: 'ilm', label: 'العلم والتدبّر', icon: '📖', color: '#A78BFA',
    question: 'هل تعلّمتَ أو تدبّرتَ ما يقرّبك إلى الله؟',
    source: '«من سلك طريقًا يلتمس فيه علمًا سهّل اللهُ له طريقًا إلى الجنّة» [مسلم]' },
  { id: 'qalb', label: 'القلب والنيّة', icon: '🫀', color: '#F472B6',
    question: 'هل راقبتَ نيّتك وأخلصتَ، وتذكّرتَ الآخرة؟',
    source: '«إنما الأعمالُ بالنيّات» [متفق عليه]' },
];

interface Remedy {
  intro: string;
  steps: string[];
  reminders: { text: string; source: string; audio?: string }[];
  books: { title: string; author: string; note: string }[];
  link?: { label: string; href: string };
}
const REMEDIES: Record<string, Remedy> = {
  salah: {
    intro: 'الصلاةُ صلةٌ بين العبد وربّه، وأوّلُ ما يُحاسَب عليه العبدُ يوم القيامة. وإصلاحُها إصلاحٌ لسائر العمل.',
    steps: [
      'اضبط منبّهًا قبل كل صلاةٍ بدقائق، واجعل الطهارة جاهزة.',
      'ابدأ بهدفٍ صغير: فرضٌ واحدٌ في أوّل وقته كلَّ يوم، ثم زِد.',
      'أحضِر قلبك: تذكّر أنك بين يدي الله، وتدبّر ما تقرأ.',
      'حافظ على السنن الرواتب؛ فهي جابرةٌ لنقص الفرائض.',
      'صلِّ ركعتين قبل النوم بخشوع، وحاسِب نفسك على صلوات يومك.',
    ],
    reminders: [
      { text: 'أوّلُ ما يُحاسَب به العبدُ يوم القيامة الصلاةُ، فإن صلَحت صلَح سائرُ عمله.', source: 'حديث [الطبراني، حسن]' },
      { text: '﴿ وَأَقِمِ الصَّلَاةَ لِذِكْرِي ﴾', source: '[طه ١٤]', audio: '020014' },
    ],
    books: [
      { title: 'أسرار الصلاة', author: 'ابن القيّم', note: 'في معاني الصلاة وحِكَمها وإحضار القلب فيها.' },
      { title: 'الخشوع في الصلاة', author: 'ابن رجب الحنبلي', note: 'رسالةٌ لطيفة في تحصيل الخشوع وعلاج الوسوسة.' },
      { title: 'صفة صلاة النبي ﷺ', author: 'الألباني', note: 'لتصحيح صفة الصلاة على السنّة.' },
    ],
    link: { label: 'أوقات الصلاة', href: '/prayer' },
  },
  tongue: {
    intro: 'حفظُ اللسان رأسُ الأمر؛ فأكثرُ خطايا ابن آدم من لسانه، وأكثرُ ما يُدخل الجنّةَ تقوى الله وحُسنُ الخُلق.',
    steps: [
      'قبل أن تتكلّم اسأل: أهو خيرٌ يُكتب لي؟ فإن شككتَ فاصمت.',
      'اهجُر الغيبةَ والنميمةَ والجدالَ والسخرية.',
      'إذا غضبتَ فاسكت، وإن أخطأتَ فبادِر بالاعتذار.',
      'اشغل لسانك بالذكر والكلمة الطيّبة بدل فضول الكلام.',
      'أحسِن الظنّ، واطوِ عثرات الناس كما تحبّ أن تُطوى عثراتُك.',
    ],
    reminders: [
      { text: 'من كان يؤمن بالله واليوم الآخر فليقل خيرًا أو ليصمت.', source: 'حديث [متفق عليه]' },
      { text: 'وهل يَكُبّ الناسَ في النار على وجوههم إلا حصائدُ ألسنتهم؟', source: 'حديث [الترمذي، حسن صحيح]' },
    ],
    books: [
      { title: 'الصمت وآداب اللسان', author: 'ابن أبي الدنيا', note: 'جامعٌ للآثار في خطر اللسان وآدابه.' },
      { title: 'الأذكار', author: 'النووي', note: 'فيه أبوابٌ نفيسة في آداب الكلام وحفظ اللسان.' },
      { title: 'آفات اللسان', author: 'أبو حامد الغزالي', note: 'بابٌ ماتعٌ ضمن «إحياء علوم الدين».' },
    ],
    link: { label: 'الأذكار', href: '/adhkar' },
  },
  naf3: {
    intro: 'خيرُ الناس أنفعُهم للناس؛ والإحسانُ إلى الخلق بابٌ عظيمٌ لمحبّة الله، وبه تُبنى المجتمعات.',
    steps: [
      'ابدأ بصدقةٍ يوميّةٍ ولو يسيرة؛ فالصدقةُ تُطفئ الخطيئة.',
      'أعِن محتاجًا، أو اقضِ حاجةَ أخٍ لك، أو فرّج كربةً.',
      'ابتسم في وجه من تلقاه، وأمِط الأذى عن الطريق.',
      'صِل رحمك، واتّصل بمن انقطع عنك، وأطعِم الطعام.',
      'انوِ بعملك نفعَ الناس لله؛ فالنيّةُ تُحوّل العادةَ عبادة.',
    ],
    reminders: [
      { text: 'خيرُ الناس أنفعُهم للناس.', source: 'حديث [الطبراني، حسن]' },
      { text: '﴿ وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ ﴾', source: '[البقرة ١٩٥]', audio: '002195' },
    ],
    books: [
      { title: 'صناعة المعروف', author: 'ابن أبي الدنيا', note: 'في فضل قضاء الحوائج والإحسان للناس.' },
      { title: 'رياض الصالحين', author: 'النووي', note: 'أبواب البرّ والصلة والإحسان — عمليّةٌ ميسّرة.' },
      { title: 'مكارم الأخلاق', author: 'ابن أبي الدنيا', note: 'في محاسن الأخلاق وأثرها الاجتماعي.' },
    ],
    link: { label: 'شارك خيرًا في المجتمع', href: '/feed' },
  },
  ilm: {
    intro: 'طلبُ العلم النافع طريقٌ إلى الجنّة، وتدبّرُ القرآن غايةُ إنزاله. والعلمُ بلا عملٍ كالشجر بلا ثمر.',
    steps: [
      'خصّص وِردًا يوميًّا من القرآن بتدبّرٍ ولو صفحة.',
      'احفظ كلَّ يومٍ حديثًا أو فائدةً وطبّقها.',
      'اقرأ صفحاتٍ من كتابٍ نافعٍ بنيّة العمل.',
      'احضر مجلسَ علمٍ أو درسًا (ولو مسموعًا)، وراجِع ما تعلّمت.',
      'علّم ما تعلّمت؛ فالعلمُ يزكو بالبذل، والدالُّ على الخير كفاعله.',
    ],
    reminders: [
      { text: 'من سلك طريقًا يلتمس فيه علمًا سهّل اللهُ له به طريقًا إلى الجنّة.', source: 'حديث [مسلم]' },
      { text: '﴿ أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا ﴾', source: '[محمد ٢٤]', audio: '047024' },
    ],
    books: [
      { title: 'مفتاح دار السعادة', author: 'ابن القيّم', note: 'في فضل العلم والحثّ عليه وثمراته.' },
      { title: 'صيد الخاطر', author: 'ابن الجوزي', note: 'خواطرُ إيمانيّةٌ تُحرّك الهمّة وتُذكّر.' },
      { title: 'تيسير الكريم الرحمن (تفسير السعدي)', author: 'عبد الرحمن السعدي', note: 'تفسيرٌ ميسّرٌ يعين على التدبّر.' },
    ],
    link: { label: 'أكاديمية علم الحديث', href: '/hadith' },
  },
  qalb: {
    intro: 'صلاحُ القلب صلاحُ الجسد كلّه؛ وأصلُ المحاسبة مراقبةُ القلب والنيّة، فبهما تُقبَل الأعمالُ أو تُردّ.',
    steps: [
      'جدّد النيّةَ لله قبل كل عمل، واطلب الإخلاص.',
      'راقب خواطرك؛ فمن راقب اللهَ في سرّه حفظه في علنه.',
      'أكثِر من الاستغفار والذكر؛ فبه تطمئنّ القلوب.',
      'تذكّر الموتَ والآخرةَ كلَّ يوم؛ فهو مُليّنٌ للقلب القاسي.',
      'حاسِب قلبك: ما الذي يشغله عن الله؟ وطهّره منه.',
    ],
    reminders: [
      { text: 'ألا وإنّ في الجسد مضغةً إذا صلَحت صلَح الجسدُ كلّه، وإذا فسَدت فسَد الجسدُ كلّه، ألا وهي القلب.', source: 'حديث [متفق عليه]' },
      { text: '﴿ الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ﴾', source: '[الرعد ٢٨]', audio: '013028' },
    ],
    books: [
      { title: 'الرعاية لحقوق الله', author: 'الحارث المحاسبي', note: 'أصلٌ في علم المحاسبة ومراقبة القلب.' },
      { title: 'إغاثة اللهفان من مصايد الشيطان', author: 'ابن القيّم', note: 'في أمراض القلوب وعلاجها.' },
      { title: 'مدارج السالكين', author: 'ابن القيّم', note: 'في منازل القلب ومقامات الإيمان (للمتقدّم).' },
    ],
    link: { label: 'الأذكار', href: '/adhkar' },
  },
};

const COUNSELS: { text: string; source: string }[] = [
  { text: 'حاسِبوا أنفسَكم قبل أن تُحاسَبوا، وزِنوا أعمالَكم قبل أن تُوزَن.', source: 'عمر بن الخطاب رضي الله عنه' },
  { text: 'إنما خفّ الحسابُ يوم القيامة على قومٍ حاسبوا أنفسَهم في الدنيا.', source: 'الحسن البصري' },
  { text: 'الكَيِّسُ من دانَ نفسَه وعمِل لما بعد الموت، والعاجزُ من أتبع نفسَه هواها وتمنّى على الله.', source: 'حديث [الترمذي]' },
  { text: 'من راقب اللهَ في خواطره، عصمه اللهُ في حركات جوارحه.', source: 'ابن القيّم' },
  { text: 'حياةٌ لا تُفحَص لا تستحقّ أن تُعاش — ومحاسبةُ المؤمن أعمق: فحصٌ لله وبين يديه.', source: 'حكمة (سقراط) في ضوء التزكية' },
  { text: 'لا تحقرنّ من المعروف شيئًا، ولو أن تلقى أخاك بوجهٍ طَلْق.', source: 'حديث [مسلم]' },
  { text: 'من حسُن إسلامُ المرءِ تركُه ما لا يعنيه.', source: 'حديث [حسن]' },
  { text: 'أحبُّ الأعمال إلى الله أدومُها وإن قلّ — فالقليلُ الدائم خيرٌ من الكثير المنقطع.', source: 'حديث [متفق عليه]' },
  { text: 'ما من يومٍ ينشقّ فجرُه إلا نادى: يا ابن آدم، أنا خلقٌ جديد، وعلى عملك شهيد، فتزوّد منّي.', source: 'أثرٌ في الزهد' },
  { text: 'المجتمعُ الصالح يبدأ من نفسٍ صالحة؛ فأصلِح نفسَك يُصلِح اللهُ بك غيرَك.', source: 'حكمة' },
  { text: 'إنّ من البيان لسحرًا — فزِن كلماتك قبل أن تَزِنك.', source: 'حديث [البخاري]' },
  { text: 'استعِن بالله ولا تعجِز، وإذا أصابك شيءٌ فقل: قدّر اللهُ وما شاء فعل.', source: 'حديث [مسلم]' },
  { text: 'ابن آدم، إنك ما دعوتَني ورجوتَني غفرتُ لك على ما كان منك ولا أبالي.', source: 'حديث قدسي [الترمذي]' },
  { text: 'راجِع حسابَك مع الله كلّ ليلةٍ كما يراجع التاجرُ دفترَه؛ فالرابحُ من زاد خيرُه.', source: 'حكمة في المحاسبة' },
];

const STATES = [
  { v: 0, label: 'لا', icon: X, color: '#F87171' },
  { v: 1, label: 'جزئيًّا', icon: Minus, color: '#FBBF24' },
  { v: 2, label: 'نعم', icon: Check, color: '#34D399' },
];

const todayKey = () => new Date().toISOString().slice(0, 10);
type Store = Record<string, { scores: Record<string, number>; note: string; at: string }>;

function loadStore(): Store { try { return JSON.parse(localStorage.getItem('noor_muhasaba') || '{}'); } catch { return {}; } }
function saveStore(s: Store) { try { localStorage.setItem('noor_muhasaba', JSON.stringify(s)); } catch {} }

function computeStreak(store: Store): number {
  let n = 0; const d = new Date();
  for (;;) {
    const k = d.toISOString().slice(0, 10);
    if (store[k]) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  return n;
}

export default function MuhasabaPage() {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [store, setStore] = useState<Store>({});
  const [saved, setSaved] = useState(false);
  const [openRemedy, setOpenRemedy] = useState<string | null>(null);
  const [openPlan, setOpenPlan] = useState<string | null>(null);
  const [planDone, setPlanDone] = useState<Record<string, boolean>>({});

  const togglePlan = (axis: string, day: number) => {
    setPlanDone(p => {
      const n = { ...p, [`${axis}:${day}`]: !p[`${axis}:${day}`] };
      try { localStorage.setItem('noor_plan30', JSON.stringify(n)); } catch {}
      return n;
    });
  };

  useEffect(() => {
    const s = loadStore();
    setStore(s);
    const t = s[todayKey()];
    if (t) { setScores(t.scores || {}); setNote(t.note || ''); setSaved(true); }
    try { setPlanDone(JSON.parse(localStorage.getItem('noor_plan30') || '{}')); } catch {}
  }, []);

  const counsel = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000);
    return COUNSELS[day % COUNSELS.length];
  }, []);

  const answered = Object.keys(scores).length;
  const pct = Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / (DIMENSIONS.length * 2)) * 100) || 0;
  const streak = computeStreak(store);

  const set = (id: string, v: number) => {
    setScores(p => ({ ...p, [id]: v })); setSaved(false);
    if (v < 2) setOpenRemedy(id); // عند «لا» أو «جزئيًّا» يُفتح لوحُ الارتقاء لهذا المحور
  };

  const save = () => {
    const s = { ...store, [todayKey()]: { scores, note: note.trim(), at: new Date().toISOString() } };
    saveStore(s); setStore(s); setSaved(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const result = pct === 100 ? { t: 'نورٌ تامّ — ثبّتك الله ودُم على هذا 🌟', c: '#34D399' }
    : pct >= 70 ? { t: 'خيرٌ كثير — أكمِل ما بدأتَ وأصلِح ما بقي', c: '#FBBF24' }
    : pct >= 40 ? { t: 'بدايةٌ طيّبة — وغدًا أفضل بإذن الله، لا تيأس', c: '#FB923C' }
    : { t: 'لا تقنط — التوبةُ تجبّ ما قبلها، وكلُّ يومٍ فرصة', c: '#F87171' };

  // آخر 7 أيام
  const last7 = useMemo(() => {
    const out: { k: string; pct: number | null }[] = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(d); dd.setDate(d.getDate() - i);
      const k = dd.toISOString().slice(0, 10);
      const e = store[k];
      out.push({ k, pct: e ? Math.round((Object.values(e.scores).reduce((a, b) => a + b, 0) / (DIMENSIONS.length * 2)) * 100) : null });
    }
    return out;
  }, [store]);

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a16', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: `radial-gradient(circle at 50% 8%, rgba(129,140,248,${0.06 + (pct / 100) * 0.18}), transparent 55%), #0a0a16` }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 680, margin: '0 auto', padding: 'calc(env(safe-area-inset-top,0px)+20px) 16px 120px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button onClick={() => router.push('/home')} style={iconBtn}><ArrowRight size={20} /></button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 23, fontWeight: 900, background: 'linear-gradient(135deg,#A5B4FC,#FBBF24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={22} color="#A5B4FC" /> مرآة القلب
            </h1>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>محاسبة النفس اليومية · خاصّةٌ بك تمامًا</p>
          </div>
          {streak > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, background: 'rgba(251,146,60,0.15)', color: '#FB923C', fontWeight: 800, fontSize: 13 }}><Flame size={15} /> {streak}</div>}
        </header>

        {/* نور اليوم */}
        <div style={{ textAlign: 'center', padding: '14px 0 20px' }}>
          <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, rgba(251,191,36,${0.15 + (pct / 100) * 0.6}), rgba(129,140,248,0.08) 70%)`, filter: 'blur(6px)', transition: 'all .6s' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: result.c }}>{answered ? pct : '—'}{answered ? '%' : ''}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>نورُ اليوم</div>
            </div>
          </div>
          {answered > 0 && <p style={{ fontSize: 13.5, color: result.c, fontWeight: 700, marginTop: 14, lineHeight: 1.7 }}>{result.t}</p>}
        </div>

        {/* وصية اليوم */}
        <div style={{ padding: 16, borderRadius: 18, marginBottom: 22, background: 'linear-gradient(160deg, rgba(251,191,36,0.1), rgba(129,140,248,0.05))', border: '1px solid rgba(251,191,36,0.22)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#FBBF24', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} /> وصيّة اليوم</div>
          <p style={{ fontFamily: 'Amiri, serif', fontSize: 18, lineHeight: 1.95, color: '#f0eee6', direction: 'rtl', textAlign: 'center' }}>{counsel.text}</p>
          <p style={{ fontSize: 11.5, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>— {counsel.source}</p>
        </div>

        {/* المحاور */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
          {DIMENSIONS.map(d => (
            <div key={d.id} style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.035)', border: `1px solid ${scores[d.id] != null ? d.color + '44' : 'rgba(255,255,255,0.08)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>{d.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: d.color }}>{d.label}</span>
              </div>
              <p style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.8, direction: 'rtl', marginBottom: 6 }}>{d.question}</p>
              <p style={{ fontSize: 11.5, color: '#8b93a7', lineHeight: 1.7, direction: 'rtl', marginBottom: 12 }}>{d.source}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {STATES.map(s => {
                  const Icon = s.icon; const active = scores[d.id] === s.v;
                  return (
                    <button key={s.v} onClick={() => set(d.id, s.v)} style={{
                      flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      border: `1px solid ${active ? s.color : 'rgba(255,255,255,0.1)'}`,
                      background: active ? `${s.color}22` : 'transparent', color: active ? s.color : '#9CA3AF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}><Icon size={15} /> {s.label}</button>
                  );
                })}
              </div>

              {/* لوح الارتقاء (يُفتح عند «لا/جزئيًّا») */}
              {(() => {
                const rem = REMEDIES[d.id]; if (!rem) return null;
                const open = openRemedy === d.id;
                return (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => setOpenRemedy(open ? null : d.id)} style={{ width: '100%', padding: '10px', borderRadius: 11, cursor: 'pointer', fontSize: 13, fontWeight: 700, border: `1px solid ${d.color}44`, background: `${d.color}14`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Lightbulb size={15} /> {open ? 'إخفاء' : 'كيف ترتقي في هذا المحور؟'}
                      <ChevronLeft size={15} style={{ transform: open ? 'rotate(-90deg)' : 'none', transition: 'transform .3s' }} />
                    </button>
                    {open && (
                      <div style={{ marginTop: 10, padding: 14, borderRadius: 14, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p style={{ fontSize: 13.5, color: '#dfe3ea', lineHeight: 1.9, direction: 'rtl', marginBottom: 12 }}>{rem.intro}</p>
                        <div style={{ fontSize: 12, fontWeight: 800, color: d.color, marginBottom: 6 }}>✦ خطواتٌ عمليّة</div>
                        <ul style={{ margin: '0 0 12px', paddingInlineStart: 18, direction: 'rtl' }}>
                          {rem.steps.map((s, i) => <li key={i} style={{ fontSize: 13, color: '#dfe3ea', lineHeight: 1.85, marginBottom: 5 }}>{s}</li>)}
                        </ul>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#FBBF24', marginBottom: 6 }}>✦ تذكيرٌ مؤصَّل</div>
                        {rem.reminders.map((r, i) => (
                          <div key={i} style={{ marginBottom: 9 }}>
                            <p style={{ fontFamily: 'Amiri, serif', fontSize: 15.5, color: '#f0eee6', lineHeight: 1.95, direction: 'rtl' }}>{r.text}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, direction: 'rtl' }}>
                              <p style={{ fontSize: 11, color: '#9CA3AF' }}>— {r.source}</p>
                              {r.audio && (
                                <button onClick={() => playAyah(r.audio!)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                  <Volume2 size={12} /> استمع للتلاوة
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#A78BFA', margin: '12px 0 6px', display: 'flex', alignItems: 'center', gap: 5 }}><BookOpen size={13} /> كتبٌ نافعة للاستزادة</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {rem.books.map((b, i) => (
                            <div key={i} style={{ padding: '9px 11px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#e5e7eb', direction: 'rtl' }}>📘 {b.title} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>— {b.author}</span></div>
                              <div style={{ fontSize: 11.5, color: '#9ca3af', lineHeight: 1.6, direction: 'rtl', marginTop: 2 }}>{b.note}</div>
                            </div>
                          ))}
                        </div>
                        {rem.link && (
                          <button onClick={() => router.push(rem.link!.href)} style={{ width: '100%', marginTop: 12, padding: '11px', borderRadius: 11, cursor: 'pointer', border: 'none', background: `linear-gradient(135deg, ${d.color}, ${d.color}cc)`, color: '#0a0a16', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            انتقل إلى: {rem.link.label} <ArrowLeft size={15} />
                          </button>
                        )}
                        <button onClick={() => router.push('/maktaba')} style={{ width: '100%', marginTop: 8, padding: '10px', borderRadius: 11, cursor: 'pointer', border: '1px solid rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.1)', color: '#FBBF24', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Library size={14} /> المكتبة الكاملة (كل الكتب النافعة)
                        </button>

                        {/* خطّة 30 يومًا */}
                        {(() => {
                          const planOpen = openPlan === d.id;
                          const tasks = PLAN30[d.id] || [];
                          const doneCount = tasks.filter((_, di) => planDone[`${d.id}:${di}`]).length;
                          return (
                            <>
                              <button onClick={() => setOpenPlan(planOpen ? null : d.id)} style={{ width: '100%', marginTop: 8, padding: '10px', borderRadius: 11, cursor: 'pointer', border: `1px solid ${d.color}44`, background: `${d.color}10`, color: d.color, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <CalendarDays size={14} /> خطّة الـ30 يومًا — {doneCount}/30
                              </button>
                              {planOpen && (
                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingInlineEnd: 4 }}>
                                  {tasks.map((task, di) => {
                                    const dn = !!planDone[`${d.id}:${di}`];
                                    return (
                                      <button key={di} onClick={() => togglePlan(d.id, di)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10, textAlign: 'right', cursor: 'pointer', background: dn ? `${d.color}1a` : 'rgba(255,255,255,0.03)', border: `1px solid ${dn ? d.color + '55' : 'rgba(255,255,255,0.07)'}`, color: '#fff' }}>
                                        <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, background: dn ? d.color : 'rgba(255,255,255,0.06)', color: dn ? '#0a0a16' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{dn ? '✓' : di + 1}</span>
                                        <span style={{ flex: 1, fontSize: 12.5, lineHeight: 1.6, direction: 'rtl', textDecoration: dn ? 'line-through' : 'none', opacity: dn ? 0.65 : 1 }}>{task}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>

        {/* تأمّل اليوم */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', marginBottom: 8 }}>تأمّل اليوم — ما أعزم على إصلاحه غدًا؟</div>
          <textarea value={note} onChange={e => { setNote(e.target.value); setSaved(false); }} rows={3} placeholder="اكتب خاطرتك أو عزمك بينك وبين الله..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, color: '#fff', fontSize: 14, direction: 'rtl', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        <button onClick={save} disabled={answered === 0} style={{ width: '100%', padding: 15, borderRadius: 15, border: 'none', cursor: answered ? 'pointer' : 'not-allowed', background: answered ? 'linear-gradient(135deg,#6366F1,#4F46E5)' : 'rgba(255,255,255,0.08)', color: answered ? '#fff' : '#6B7280', fontSize: 15.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {saved ? <><Check size={18} /> حُفظت محاسبةُ اليوم</> : <><Scale size={18} /> احفظ محاسبة اليوم</>}
        </button>

        {/* آخر 7 أيام */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#cbd5e1', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><RotateCcw size={14} /> آخر سبعة أيام</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {last7.map(d => {
              const c = d.pct == null ? '#374151' : d.pct >= 70 ? '#34D399' : d.pct >= 40 ? '#FBBF24' : '#F87171';
              const day = new Date(d.k).toLocaleDateString('ar', { weekday: 'short' });
              return (
                <div key={d.k} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ width: 22, height: d.pct == null ? 8 : Math.max(8, (d.pct / 100) * 54), borderRadius: 6, background: c, transition: 'height .4s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#6B7280', marginTop: 6 }}>{day}</div>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#4B5563', marginTop: 28, lineHeight: 1.7 }}>
          🔒 محاسبتُك محفوظةٌ على جهازك فقط — بينك وبين الله، لا تُرفَع لأحد.
        </p>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
