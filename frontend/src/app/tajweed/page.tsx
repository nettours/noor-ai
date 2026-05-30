'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Volume2, Pause, Play, CheckCircle2, XCircle,
  BookOpen, GraduationCap, Award, ChevronLeft, RotateCcw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// منهج التجويد الشامل — مرتّب من الأساس للمتقدّم
// ═══════════════════════════════════════════════════════
interface Example { ar: string; note: string; }
interface Lesson {
  id: string;
  title: string;
  short: string;          // وصف قصير
  explain: string;        // الشرح (يُقرأ بالصوت)
  examples: Example[];
  color: string;
}
interface Unit { id: string; name: string; icon: string; lessons: Lesson[]; }

const CURRICULUM: Unit[] = [
  {
    id: 'basics', name: 'الأساسيات', icon: '🌱',
    lessons: [
      {
        id: 'istiadha', title: 'الاستعاذة والبسملة', short: 'كيف تبدأ التلاوة',
        explain: 'قبل قراءة القرآن نقول الاستعاذة: أعوذ بالله من الشيطان الرجيم. ثم البسملة: بسم الله الرحمن الرحيم. الاستعاذة سنّة عند بدء القراءة، والبسملة تُقرأ في أول كل سورة عدا سورة التوبة.',
        examples: [
          { ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', note: 'الاستعاذة' },
          { ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', note: 'البسملة' },
        ], color: '#10B981',
      },
      {
        id: 'makharij', title: 'مخارج الحروف', short: 'من أين يخرج كل حرف',
        explain: 'مخارج الحروف هي المواضع التي يخرج منها الحرف. هناك خمسة مخارج رئيسية: الجوف، والحلق، واللسان، والشفتان، والخيشوم. مثلاً: حروف الحلق هي الهمزة والهاء والعين والحاء والغين والخاء.',
        examples: [
          { ar: 'ء هـ ع ح غ خ', note: 'حروف الحلق' },
          { ar: 'ب م و', note: 'حروف الشفتين' },
        ], color: '#10B981',
      },
    ],
  },
  {
    id: 'noon', name: 'أحكام النون الساكنة والتنوين', icon: '🔤',
    lessons: [
      {
        id: 'idhhar', title: 'الإظهار', short: 'إظهار النون عند حروف الحلق',
        explain: 'الإظهار: هو إخراج النون الساكنة أو التنوين واضحة من غير غُنّة زائدة، إذا جاء بعدها أحد حروف الحلق الستة: الهمزة والهاء والعين والحاء والغين والخاء.',
        examples: [
          { ar: 'مَنْ آمَنَ', note: 'نون ساكنة ثم همزة' },
          { ar: 'مِنْ خَيْرٍ', note: 'نون ساكنة ثم خاء' },
          { ar: 'عَلِيمٌ حَكِيمٌ', note: 'تنوين ثم حاء' },
        ], color: '#67E8F9',
      },
      {
        id: 'idgham', title: 'الإدغام', short: 'دمج النون فيما بعدها',
        explain: 'الإدغام: هو إدخال النون الساكنة أو التنوين في الحرف الذي بعدها، فيصيران حرفاً واحداً مشدّداً. حروفه ستة مجموعة في كلمة يَرْمَلُونَ. ينقسم إلى إدغام بغُنّة في: ي ن م و، وإدغام بغير غُنّة في: ل ر.',
        examples: [
          { ar: 'مَن يَقُولُ', note: 'إدغام بغُنّة (ي)' },
          { ar: 'مِن رَّبِّهِمْ', note: 'إدغام بغير غُنّة (ر)' },
          { ar: 'مِن مَّالٍ', note: 'إدغام بغُنّة (م)' },
        ], color: '#67E8F9',
      },
      {
        id: 'iqlab', title: 'الإقلاب', short: 'قلب النون ميماً عند الباء',
        explain: 'الإقلاب: هو قلب النون الساكنة أو التنوين ميماً مخفاة بغُنّة، إذا جاء بعدها حرف الباء. وله حرف واحد فقط وهو الباء.',
        examples: [
          { ar: 'مِنۢ بَعْدِ', note: 'نون تُقلب ميماً قبل الباء' },
          { ar: 'سَمِيعٌۢ بَصِيرٌ', note: 'تنوين يُقلب ميماً' },
        ], color: '#67E8F9',
      },
      {
        id: 'ikhfa', title: 'الإخفاء', short: 'إخفاء النون مع غُنّة',
        explain: 'الإخفاء: هو النطق بالنون الساكنة أو التنوين بصفة بين الإظهار والإدغام مع بقاء الغُنّة. وحروفه خمسة عشر حرفاً، وهي الباقية بعد حروف الإظهار والإدغام والإقلاب.',
        examples: [
          { ar: 'أَنصَارًا', note: 'إخفاء عند الصاد' },
          { ar: 'مِن قَبْلُ', note: 'إخفاء عند القاف' },
          { ar: 'رِيحًا صَرْصَرًا', note: 'إخفاء عند الصاد' },
        ], color: '#67E8F9',
      },
    ],
  },
  {
    id: 'meem', name: 'أحكام الميم الساكنة', icon: '🅼',
    lessons: [
      {
        id: 'ikhfa_shafawi', title: 'الإخفاء الشفوي', short: 'إخفاء الميم عند الباء',
        explain: 'الإخفاء الشفوي: هو إخفاء الميم الساكنة عند حرف الباء مع الغُنّة. سُمّي شفوياً لأن الميم والباء يخرجان من الشفتين.',
        examples: [{ ar: 'تَرْمِيهِم بِحِجَارَةٍ', note: 'ميم ساكنة ثم باء' }], color: '#A855F7',
      },
      {
        id: 'idgham_shafawi', title: 'الإدغام الشفوي', short: 'إدغام الميم في الميم',
        explain: 'الإدغام الشفوي (الصغير): هو إدغام الميم الساكنة في ميم متحرّكة بعدها مع الغُنّة، فتصير ميماً مشدّدة.',
        examples: [{ ar: 'لَهُم مَّا', note: 'ميم ساكنة تُدغم في ميم' }], color: '#A855F7',
      },
      {
        id: 'idhhar_shafawi', title: 'الإظهار الشفوي', short: 'إظهار الميم مع باقي الحروف',
        explain: 'الإظهار الشفوي: هو إظهار الميم الساكنة عند جميع الحروف عدا الباء والميم. وأشدّها إظهاراً عند الفاء والواو.',
        examples: [{ ar: 'أَلَمْ تَرَ', note: 'ميم ساكنة ثم تاء (إظهار)' }], color: '#A855F7',
      },
    ],
  },
  {
    id: 'madd', name: 'أحكام المدود', icon: '〰️',
    lessons: [
      {
        id: 'madd_tabii', title: 'المد الطبيعي', short: 'المد الأصلي حركتان',
        explain: 'المد الطبيعي أو الأصلي: هو المد الذي لا تقوم ذات الحرف إلا به، ولا يتوقّف على سبب من همز أو سكون. مقداره حركتان. وحروف المد ثلاثة: الألف الساكنة المفتوح ما قبلها، والواو الساكنة المضموم ما قبلها، والياء الساكنة المكسور ما قبلها.',
        examples: [
          { ar: 'قَالَ', note: 'مد بالألف' },
          { ar: 'يَقُولُ', note: 'مد بالواو' },
          { ar: 'قِيلَ', note: 'مد بالياء' },
        ], color: '#FBBF24',
      },
      {
        id: 'madd_muttasil', title: 'المد المتّصل', short: 'مد واجب 4-5 حركات',
        explain: 'المد المتّصل الواجب: هو أن يأتي بعد حرف المد همزة في كلمة واحدة. حكمه الوجوب، ومقداره أربع أو خمس حركات.',
        examples: [
          { ar: 'جَاءَ', note: 'مد ثم همزة في كلمة' },
          { ar: 'السَّمَاءِ', note: 'مد متّصل' },
        ], color: '#FBBF24',
      },
      {
        id: 'madd_munfasil', title: 'المد المنفصل', short: 'مد جائز 4-5 حركات',
        explain: 'المد المنفصل الجائز: هو أن يأتي حرف المد في آخر كلمة، والهمزة في أول الكلمة التي تليها. مقداره أربع أو خمس حركات.',
        examples: [
          { ar: 'بِمَا أُنزِلَ', note: 'مد آخر كلمة ثم همزة' },
          { ar: 'قُوا أَنفُسَكُمْ', note: 'مد منفصل' },
        ], color: '#FBBF24',
      },
      {
        id: 'madd_lazim', title: 'المد اللازم', short: 'أقوى المدود 6 حركات',
        explain: 'المد اللازم: هو أن يأتي بعد حرف المد سكون أصلي ثابت وصلاً ووقفاً. مقداره ست حركات، وهو أقوى المدود.',
        examples: [
          { ar: 'الضَّالِّينَ', note: 'مد لازم كلمي' },
          { ar: 'الۤمۤ', note: 'مد لازم حرفي' },
        ], color: '#FBBF24',
      },
    ],
  },
  {
    id: 'extra', name: 'أحكام متنوّعة', icon: '⭐',
    lessons: [
      {
        id: 'qalqala', title: 'القلقلة', short: 'اهتزاز الحرف الساكن',
        explain: 'القلقلة: هي اضطراب الحرف عند النطق به ساكناً حتى يُسمع له نبرة قويّة. وحروفها خمسة مجموعة في: قُطْبُ جَدٍّ، وهي القاف والطاء والباء والجيم والدال.',
        examples: [
          { ar: 'خَلَقَ', note: 'قلقلة القاف عند السكون' },
          { ar: 'الْفَلَقِ', note: 'قلقلة القاف عند الوقف' },
          { ar: 'أَحَدٌ', note: 'قلقلة الدال' },
        ], color: '#F87171',
      },
      {
        id: 'ghunna', title: 'الغُنّة', short: 'صوت يخرج من الأنف',
        explain: 'الغُنّة: هي صوت لذيذ يخرج من الخيشوم، تصاحب النون والميم. وأكمل ما تكون في النون والميم المشدّدتين. مقدارها حركتان.',
        examples: [
          { ar: 'إِنَّ', note: 'نون مشدّدة - غُنّة' },
          { ar: 'ثُمَّ', note: 'ميم مشدّدة - غُنّة' },
        ], color: '#F87171',
      },
      {
        id: 'lam', title: 'أحكام اللام', short: 'تفخيم وترقيق اللام',
        explain: 'لام لفظ الجلالة (الله): تُفخّم إذا سبقها فتح أو ضم، وتُرقّق إذا سبقها كسر. أما اللام الشمسية والقمرية: اللام القمرية تُظهر مثل الكتاب، واللام الشمسية تُدغم مثل الشمس.',
        examples: [
          { ar: 'قَالَ اللَّهُ', note: 'تفخيم اللام (فتح قبلها)' },
          { ar: 'بِسْمِ اللَّهِ', note: 'ترقيق اللام (كسر قبلها)' },
          { ar: 'الشَّمْس', note: 'لام شمسية مُدغمة' },
        ], color: '#F87171',
      },
    ],
  },
];

// ═══ أسئلة الاختبار ═══
interface Quiz { q: string; options: string[]; correct: number; explain: string; }
const QUIZZES: Quiz[] = [
  { q: 'كم عدد حروف الإظهار؟', options: ['4', '6', '15', '5'], correct: 1, explain: 'حروف الإظهار ستة، وهي حروف الحلق: ء هـ ع ح غ خ' },
  { q: 'ما حكم النون الساكنة قبل الباء؟', options: ['إظهار', 'إدغام', 'إقلاب', 'إخفاء'], correct: 2, explain: 'الإقلاب: تُقلب النون ميماً قبل الباء' },
  { q: 'مقدار المد الطبيعي؟', options: ['حركتان', '4 حركات', '6 حركات', 'حركة'], correct: 0, explain: 'المد الطبيعي حركتان' },
  { q: 'حروف القلقلة مجموعة في؟', options: ['يرملون', 'قطب جد', 'الحلق', 'شفتان'], correct: 1, explain: 'حروف القلقلة: قطب جد (ق ط ب ج د)' },
  { q: 'المد اللازم مقداره؟', options: ['حركتان', '4 حركات', '6 حركات', '3 حركات'], correct: 2, explain: 'المد اللازم ست حركات، وهو أقوى المدود' },
  { q: 'متى تُفخّم لام لفظ الجلالة؟', options: ['بعد كسر', 'بعد فتح أو ضم', 'دائماً', 'أبداً'], correct: 1, explain: 'تُفخّم بعد الفتح أو الضم، وتُرقّق بعد الكسر' },
];

export default function TajweedPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  // الاختبار
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    try { setProgress(JSON.parse(localStorage.getItem('noor_tajweed') || '{}')); } catch {}
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const markDone = (id: string) => {
    setProgress(prev => {
      const next = { ...prev, [id]: true };
      localStorage.setItem('noor_tajweed', JSON.stringify(next));
      return next;
    });
  };

  // المدرّس الصوتي: يقرأ الشرح ثم الأمثلة
  const teach = (lesson: Lesson) => {
    const synth = window.speechSynthesis;
    if (!synth) { alert('متصفحك لا يدعم الصوت'); return; }
    if (speaking === lesson.id) { synth.cancel(); setSpeaking(null); return; }
    synth.cancel();

    setTimeout(() => {
      // اجمع: العنوان + الشرح + الأمثلة
      const parts = [
        lesson.title + '.',
        lesson.explain,
        'أمثلة:',
        ...lesson.examples.map(e => e.ar),
      ];
      let i = 0;
      const speakNext = () => {
        if (i >= parts.length) { setSpeaking(null); markDone(lesson.id); return; }
        const u = new SpeechSynthesisUtterance(parts[i]);
        u.lang = 'ar-SA'; u.rate = 0.8;
        u.onend = () => { i++; speakNext(); };
        u.onerror = () => { i++; speakNext(); };
        synth.speak(u);
      };
      setSpeaking(lesson.id);
      speakNext();
    }, 120);
  };

  const speakExample = (text: string, id: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA'; u.rate = 0.7;
      synth.speak(u);
    }, 100);
  };

  // الاختبار
  const answerQuiz = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === QUIZZES[qIndex].correct) setScore(s => s + 1);
  };
  const nextQuiz = () => {
    if (qIndex + 1 >= QUIZZES.length) { setQuizDone(true); return; }
    setQIndex(i => i + 1); setSelected(null);
  };
  const resetQuiz = () => { setQIndex(0); setSelected(null); setScore(0); setQuizDone(false); };

  const totalLessons = CURRICULUM.reduce((a, u) => a + u.lessons.length, 0);
  const doneCount = Object.keys(progress).filter(k => progress[k]).length;

  return (
    <div style={{ minHeight: '100dvh', background: '#030712', color: '#fff' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 16px 110px', maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => router.push('/home')} style={{
            width: '42px', height: '42px', borderRadius: '13px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900 }}>📖 تعلّم التجويد</h1>
            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>مع المدرّس الصوتي</p>
          </div>
        </header>

        {/* شريط التقدّم */}
        <div style={{ padding: '16px', borderRadius: '18px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>تقدّمك في التعلّم</span>
            <span style={{ fontSize: '13px', fontWeight: 800 }}>{doneCount} / {totalLessons}</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${(doneCount / totalLessons) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '999px', transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* تبديل: تعلّم / اختبار */}
        <div style={{ display: 'flex', gap: '8px', padding: '5px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', marginBottom: '24px' }}>
          {[
            { k: 'learn', label: 'الدروس', icon: BookOpen },
            { k: 'quiz', label: 'الاختبار', icon: GraduationCap },
          ].map(t => {
            const Icon = t.icon; const active = mode === t.k;
            return (
              <button key={t.k} onClick={() => setMode(t.k as any)} style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: active ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                color: '#fff', fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <Icon size={18} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ═══ وضع التعلّم ═══ */}
        {mode === 'learn' && CURRICULUM.map(unit => (
          <div key={unit.id} style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{unit.icon}</span> {unit.name}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unit.lessons.map(lesson => {
                const isOpen = openLesson === lesson.id;
                const isDone = progress[lesson.id];
                const isSpeaking = speaking === lesson.id;
                return (
                  <div key={lesson.id} style={{
                    borderRadius: '18px', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                    {/* رأس الدرس */}
                    <button onClick={() => setOpenLesson(isOpen ? null : lesson.id)} style={{
                      width: '100%', padding: '16px', background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', textAlign: 'start',
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                        background: `${lesson.color}1a`, color: lesson.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isDone ? <CheckCircle2 size={20} /> : <BookOpen size={18} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{lesson.title}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{lesson.short}</div>
                      </div>
                      <ChevronLeft size={18} color="#6B7280" style={{ transform: isOpen ? 'rotate(-90deg)' : 'none', transition: 'transform 0.3s' }} />
                    </button>

                    {/* محتوى الدرس */}
                    {isOpen && (
                      <div style={{ padding: '0 16px 16px' }}>
                        {/* زر المدرّس الصوتي */}
                        <button onClick={() => teach(lesson)} style={{
                          width: '100%', padding: '12px', borderRadius: '12px', marginBottom: '14px',
                          background: isSpeaking ? 'rgba(16,185,129,0.2)' : `${lesson.color}1a`,
                          border: `1px solid ${isSpeaking ? '#10B981' : lesson.color + '44'}`,
                          color: isSpeaking ? '#10B981' : lesson.color,
                          cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          animation: isSpeaking ? 'pulse 1.5s infinite' : 'none',
                        }}>
                          {isSpeaking ? <Pause size={16} /> : <Volume2 size={16} />}
                          {isSpeaking ? 'المدرّس يشرح... (اضغط للإيقاف)' : '🎙️ اشرح لي هذا الدرس'}
                        </button>

                        {/* الشرح */}
                        <p style={{ fontSize: '14px', lineHeight: 1.9, color: '#D1D5DB', marginBottom: '14px', direction: 'rtl' }}>
                          {lesson.explain}
                        </p>

                        {/* الأمثلة */}
                        <div style={{ fontSize: '12px', fontWeight: 700, color: lesson.color, marginBottom: '8px' }}>أمثلة:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {lesson.examples.map((ex, j) => (
                            <div key={j} style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                              borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)',
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'Amiri, serif', fontSize: '20px', color: '#fff', direction: 'rtl', marginBottom: '2px' }}>{ex.ar}</div>
                                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{ex.note}</div>
                              </div>
                              <button onClick={() => speakExample(ex.ar, lesson.id + j)} style={{
                                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                background: 'rgba(255,255,255,0.05)', border: 'none', color: lesson.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              }}>
                                <Play size={15} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {!isDone && (
                          <button onClick={() => markDone(lesson.id)} style={{
                            width: '100%', padding: '10px', borderRadius: '10px', marginTop: '14px',
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                            color: '#10B981', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          }}>
                            ✓ أتممت هذا الدرس
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ═══ وضع الاختبار ═══ */}
        {mode === 'quiz' && !quizDone && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', color: '#9CA3AF' }}>
              <span>سؤال {qIndex + 1} / {QUIZZES.length}</span>
              <span>النقاط: {score}</span>
            </div>
            <div style={{ padding: '24px 20px', borderRadius: '20px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', textAlign: 'center', lineHeight: 1.6 }}>
                {QUIZZES[qIndex].q}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {QUIZZES[qIndex].options.map((opt, idx) => {
                  const isCorrect = idx === QUIZZES[qIndex].correct;
                  const isSelected = selected === idx;
                  let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.1)', icon = null;
                  if (selected !== null) {
                    if (isCorrect) { bg = 'rgba(16,185,129,0.15)'; border = '#10B981'; icon = <CheckCircle2 size={18} color="#10B981" />; }
                    else if (isSelected) { bg = 'rgba(239,68,68,0.15)'; border = '#EF4444'; icon = <XCircle size={18} color="#EF4444" />; }
                  }
                  return (
                    <button key={idx} onClick={() => answerQuiz(idx)} disabled={selected !== null} style={{
                      padding: '16px', borderRadius: '14px', background: bg, border: `1px solid ${border}`,
                      color: '#fff', fontSize: '15px', fontWeight: 600, cursor: selected === null ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'start',
                    }}>
                      <span>{opt}</span> {icon}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)' }}>
                  <p style={{ fontSize: '13px', color: '#A5F3FC', lineHeight: 1.7 }}>💡 {QUIZZES[qIndex].explain}</p>
                </div>
              )}
            </div>
            {selected !== null && (
              <button onClick={nextQuiz} style={{
                width: '100%', padding: '16px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff',
                fontSize: '16px', fontWeight: 800, cursor: 'pointer',
              }}>
                {qIndex + 1 >= QUIZZES.length ? 'إنهاء الاختبار' : 'السؤال التالي'}
              </button>
            )}
          </div>
        )}

        {/* نتيجة الاختبار */}
        {mode === 'quiz' && quizDone && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {score === QUIZZES.length ? '🏆' : score >= QUIZZES.length / 2 ? '🌟' : '📚'}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>
              {score} / {QUIZZES.length}
            </h2>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '28px' }}>
              {score === QUIZZES.length ? 'ممتاز! أتقنت التجويد 🎉' : score >= QUIZZES.length / 2 ? 'أحسنت! واصل التعلّم' : 'راجع الدروس وحاول مجدداً'}
            </p>
            <button onClick={resetQuiz} style={{
              width: '100%', maxWidth: '280px', padding: '16px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff',
              fontSize: '16px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto',
            }}>
              <RotateCcw size={18} /> أعد الاختبار
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
