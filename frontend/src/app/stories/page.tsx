'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Play, Pause, SkipBack, SkipForward,
  Volume2, BookOpen, Search, Star
} from 'lucide-react';

// قصص الأنبياء — 25 نبي
const PROPHETS = [
  {
    id: 'adam', name: 'آدم عليه السلام', color: '#10B981', icon: '🌍',
    summary: 'أبو البشرية، خلقه الله بيديه من تراب، ونفخ فيه من روحه',
    story: `خلق الله تعالى آدم عليه السلام بيديه من تراب الأرض، ونفخ فيه من روحه، وعلّمه الأسماء كلها. ثم أمر الملائكة بالسجود له فسجدوا إلا إبليس استكبر. أسكنه الله الجنة مع زوجته حواء، وأباح لهما كل ما فيها إلا شجرة واحدة. لكن وسوس لهما الشيطان فأكلا منها، فأهبطهما الله إلى الأرض. تاب آدم وتاب الله عليه، وأنزل عليه السكينة والرحمة. وكان آدم أول نبي في الأرض، وعاش طويلاً حتى مات بعد أن نشر ذريته في الأرض.`,
  },
  {
    id: 'idris', name: 'إدريس عليه السلام', color: '#67E8F9', icon: '⭐',
    summary: 'أول من خط بالقلم، ورفعه الله مكاناً علياً',
    story: `إدريس عليه السلام هو أول من خط بالقلم، ومن أنبياء الله الصالحين. عاش في عصر بعد آدم عليه السلام بأجيال. كان عابداً تقياً، يدعو قومه إلى عبادة الله وحده. علّمه الله الكتابة والحساب وعلم النجوم. رفعه الله مكاناً علياً كما قال تعالى: ﴿ وَرَفَعْنَاهُ مَكَانًا عَلِيًّا ﴾. وقد ذكره الله في القرآن بكل ثناء وتقدير.`,
  },
  {
    id: 'nuh', name: 'نوح عليه السلام', color: '#FBBF24', icon: '🚢',
    summary: 'أول الرسل، دعا قومه ألف سنة إلا خمسين عاماً',
    story: `أرسله الله إلى قومه ليدعوهم لعبادة الله وحده. دعاهم تسعمائة وخمسين سنة، لكنهم استكبروا وكذّبوه إلا قليلاً. أمره الله ببناء سفينة عظيمة، فبناها رغم سخرية قومه. ثم أمر الله الأرض بإخراج مائها والسماء بإنزال مطرها، فحدث الطوفان العظيم. ركب نوح ومن آمن معه السفينة، ومن كل زوجين اثنين. هلك الكفار جميعاً ومنهم ابنه الذي رفض الركوب. بعد انتهاء الطوفان، استقرّت السفينة على الجودي، وبدأت الحياة من جديد بنوح ومن معه.`,
  },
  {
    id: 'hud', name: 'هود عليه السلام', color: '#A855F7', icon: '🌪️',
    summary: 'أرسله الله إلى قوم عاد في الأحقاف',
    story: `أرسله الله إلى قوم عاد في الأحقاف بجنوب الجزيرة العربية. كانوا أقواماً جبارين أصحاب قوة وبأس شديد، يبنون قصوراً عظيمة. دعاهم هود إلى عبادة الله وترك الأصنام، لكنهم سخروا منه وكذّبوه. أرسل الله عليهم ريحاً صرصراً عاتية، دمّرت كل شيء واستمرت سبع ليال وثمانية أيام. نجا هود ومن آمن معه، وهلك الباقون.`,
  },
  {
    id: 'salih', name: 'صالح عليه السلام', color: '#EC4899', icon: '🐪',
    summary: 'نبي ثمود، آيته الناقة العظيمة',
    story: `أرسله الله إلى قوم ثمود في شمال الجزيرة العربية. طلبوا منه آية، فأخرج الله لهم ناقة عظيمة من صخرة. أمرهم بأن لا يمسوها بسوء، ولها شِرب يوم ولهم شِرب يوم آخر. لكنهم عقروا الناقة، فأخذتهم الصيحة فأصبحوا في ديارهم جاثمين. نجا صالح ومن آمن معه.`,
  },
  {
    id: 'ibrahim', name: 'إبراهيم عليه السلام', color: '#F87171', icon: '🕋',
    summary: 'خليل الرحمن، أبو الأنبياء، باني الكعبة',
    story: `إبراهيم عليه السلام هو خليل الرحمن وأبو الأنبياء. حطّم الأصنام التي كان يعبدها قومه، فألقوه في النار، فجعلها الله برداً وسلاماً عليه. هاجر مع زوجته سارة وابن أخيه لوط. رزقه الله إسماعيل وإسحاق على الكبر. أمره الله بذبح ابنه إسماعيل ففعل، فلما استسلما فداه الله بذبح عظيم. بنى مع ابنه إسماعيل الكعبة المشرفة، ودعا الناس للحج.`,
  },
  {
    id: 'lut', name: 'لوط عليه السلام', color: '#34D399', icon: '🏛️',
    summary: 'أرسل إلى قوم سدوم بفاحشتهم',
    story: `ابن أخي إبراهيم عليه السلام، أرسله الله إلى قوم سدوم في الشام. كانوا يأتون الفاحشة العظيمة (اللواط)، فدعاهم إلى ترك ذلك وعبادة الله. لكنهم استمروا في غيّهم. جاءته الملائكة في صورة شبان جميلين فأراد قومه الاعتداء عليهم. أرسل الله عليهم حجارة من السماء وقلب قراهم عاليها سافلها. نجا لوط ومن آمن معه، إلا امرأته كانت من الكافرين.`,
  },
  {
    id: 'ismail', name: 'إسماعيل عليه السلام', color: '#FB923C', icon: '🏹',
    summary: 'الذبيح، ساعد أباه في بناء الكعبة',
    story: `الابن البكر لإبراهيم عليه السلام من زوجته هاجر. تركه أبوه مع أمه في وادٍ مكة، فلما عطشت أمه سعت بين الصفا والمروة، فأخرج الله ماء زمزم تحت قدمي إسماعيل. أمر الله إبراهيم بذبح ابنه ففديا، وقصته من أعظم قصص الفداء. ساعد أباه في بناء الكعبة المشرفة. كان رسولاً نبياً، وعاش حياة طاهرة في مكة.`,
  },
  {
    id: 'ishaq', name: 'إسحاق عليه السلام', color: '#60A5FA', icon: '🌾',
    summary: 'بشّر به الملائكة لإبراهيم على الكبر',
    story: `الابن الثاني لإبراهيم عليه السلام من زوجته سارة. بشّرت به الملائكة على الكبر، فضحكت سارة من العجب. كان نبياً صالحاً، نشأ في كنف أبيه إبراهيم. تزوج رفقة بنت بتوئيل، وأنجب منها التوأم: عيصو ويعقوب (إسرائيل). من ذريته خرج أنبياء بني إسرائيل.`,
  },
  {
    id: 'yaqub', name: 'يعقوب عليه السلام', color: '#A855F7', icon: '🌳',
    summary: 'إسرائيل، أبو الأسباط، وأبو يوسف',
    story: `ابن إسحاق عليه السلام، ويُعرف بإسرائيل (أي عبد الله). أنجب اثني عشر ابناً منهم الأسباط ويوسف. أحبّ يوسف حباً شديداً ففقده زماناً طويلاً بسبب مكر إخوته. عمي من كثرة البكاء على ابنه. لما ألقي قميص يوسف على وجهه عاد بصيره، ثم اجتمع بأبنائه جميعاً في مصر.`,
  },
  {
    id: 'yusuf', name: 'يوسف عليه السلام', color: '#FBBF24', icon: '👑',
    summary: 'صاحب أحسن القصص، عزيز مصر',
    story: `أحبه أبوه يعقوب حباً شديداً، فحسده إخوته وألقوه في الجبّ. باعه بعض المسافرين كعبد، فاشتراه عزيز مصر. حاولت امرأة العزيز إغراءه فاستعصم بالله. ألقي في السجن ظلماً، فعبّر فيه الرؤى. خرج من السجن ليصبح وزيراً لخزائن مصر بعد تأويله رؤيا الملك. لما جاءه إخوته للطعام في المجاعة، عرّفهم بنفسه وعفا عنهم. اجتمع بأبيه يعقوب على الكبر. سورة يوسف هي "أحسن القصص" في القرآن.`,
  },
  {
    id: 'ayyub', name: 'أيوب عليه السلام', color: '#34D399', icon: '⏳',
    summary: 'نموذج الصبر العظيم على البلاء',
    story: `كان نبياً غنياً صاحب أهل ومال، ابتلاه الله بمرض شديد وفقد المال والولد. صبر صبراً عظيماً ولم يجزع، حتى ضرب به المثل في الصبر. ظلّ على البلاء ثمانية عشر عاماً وهو حامد لله. لما اشتدّ به البلاء دعا ربه: ﴿ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ ﴾. فاستجاب الله له وعافاه وأعاد له ماله وأهله أضعافاً مضاعفة.`,
  },
  {
    id: 'shuaib', name: 'شعيب عليه السلام', color: '#EC4899', icon: '⚖️',
    summary: 'خطيب الأنبياء، أرسل لأهل مدين',
    story: `أرسله الله إلى أهل مدين، كانوا يبخسون الناس أشياءهم ويفسدون في الأرض. دعاهم إلى توفية الكيل والميزان وترك الفساد. كان فصيحاً بليغاً يُسمى "خطيب الأنبياء". كذّبوه واستهزؤوا به، فأخذتهم الرجفة فأصبحوا في دارهم جاثمين. زوّج ابنته من موسى عليه السلام.`,
  },
  {
    id: 'musa', name: 'موسى عليه السلام', color: '#10B981', icon: '🌊',
    summary: 'كليم الله، صاحب فرعون والعصا',
    story: `وُلد في عصر فرعون الذي كان يذبح أبناء بني إسرائيل. ألقته أمه في صندوق في النيل فالتقطه آل فرعون وربّوه. كبر وقتل قبطياً خطأً ففرّ إلى مدين. تزوج بنت شعيب. كلّمه الله في الوادي المقدس وأرسله إلى فرعون. أعطاه الله المعجزات: العصا واليد البيضاء. شقّ الله له البحر فعبره مع بني إسرائيل، وأغرق فرعون وجنوده. أنزل الله عليه التوراة في طور سيناء.`,
  },
  {
    id: 'harun', name: 'هارون عليه السلام', color: '#67E8F9', icon: '🤝',
    summary: 'أخو موسى ووزيره',
    story: `أخو موسى عليه السلام، أكبر منه سناً وأفصح لساناً. كان وزيراً لأخيه في الدعوة إلى فرعون. شارك موسى في تبليغ الرسالة وإخراج بني إسرائيل من مصر. لما ذهب موسى للقاء ربه استخلفه على قومه، لكنهم اتخذوا العجل، فبيّن لهم خطأهم. توفي قبل موسى عليه السلام في صحراء سيناء.`,
  },
  {
    id: 'dhul-kifl', name: 'ذو الكفل عليه السلام', color: '#A855F7', icon: '🛡️',
    summary: 'تكفّل بأمور قومه فسُمي ذا الكفل',
    story: `من أنبياء بني إسرائيل، سُمي بذي الكفل لأنه تكفّل بأمور قومه. ذكره الله في القرآن مع الصابرين: ﴿ وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ كُلٌّ مِّنَ الصَّابِرِينَ ﴾. كان صالحاً تقياً، يدعو قومه إلى الحق، صبر على أذاهم.`,
  },
  {
    id: 'dawud', name: 'داود عليه السلام', color: '#FBBF24', icon: '🎵',
    summary: 'الملك النبي، صاحب الزبور',
    story: `كان شاباً صغيراً قتل جالوت الطاغية بمقلاع، فأصبح ملكاً على بني إسرائيل. أنزل الله عليه كتاب الزبور. أعطاه الله صوتاً جميلاً تخشع له الجبال والطير، حتى كانت تسبّح معه. علّمه الله صنعة الدروع، ولان له الحديد. كان قوياً عادلاً، يقضي بين الناس بالحق.`,
  },
  {
    id: 'sulaiman', name: 'سليمان عليه السلام', color: '#FB923C', icon: '👑',
    summary: 'الملك الذي علّمه الله منطق الطير',
    story: `ابن داود عليه السلام، آتاه الله ملكاً عظيماً لا ينبغي لأحد من بعده. سخّر له الجن والإنس والريح والطير. علّمه الله منطق الطير والحيوان. سمع كلام النملة فابتسم. أرسل الهدهد إلى ملكة سبأ، فأسلمت معه. بنى المسجد الأقصى. توفي وهو يصلي متكئاً على عصاه، ولم يعلم الجن بموته حتى أكلت الأرضة عصاه.`,
  },
  {
    id: 'ilyas', name: 'إلياس عليه السلام', color: '#60A5FA', icon: '⛰️',
    summary: 'دعا قومه إلى ترك عبادة "بعل"',
    story: `من أنبياء بني إسرائيل، أرسله الله إلى قومه الذين كانوا يعبدون صنماً اسمه "بعل". دعاهم إلى عبادة الله وحده، لكنهم كذّبوه. صبر عليهم وحاول هدايتهم. ذكره الله في القرآن: ﴿ وَإِنَّ إِلْيَاسَ لَمِنَ الْمُرْسَلِينَ ﴾.`,
  },
  {
    id: 'alyasa', name: 'اليسع عليه السلام', color: '#34D399', icon: '🌿',
    summary: 'خليفة إلياس في دعوة بني إسرائيل',
    story: `كان تلميذاً لإلياس عليه السلام ثم خلفه في الدعوة. أرسله الله إلى بني إسرائيل بعد إلياس، فدعاهم إلى الله. ذكره الله في القرآن ضمن الأنبياء المختارين. واصل دعوة قومه إلى التوحيد.`,
  },
  {
    id: 'yunus', name: 'يونس عليه السلام', color: '#06B6D4', icon: '🐋',
    summary: 'صاحب الحوت، نجاه الله من الظلمات',
    story: `أرسله الله إلى أهل نينوى، فدعاهم فلم يؤمنوا، فخرج مغضباً قبل إذن الله. ركب سفينة فاضطربت، فألقوه في البحر فالتقمه الحوت. مكث في بطن الحوت يسبّح: ﴿ لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ ﴾. أنقذه الله وأخرجه الحوت. عاد إلى قومه فآمنوا جميعاً.`,
  },
  {
    id: 'zakariya', name: 'زكريا عليه السلام', color: '#A855F7', icon: '🕊️',
    summary: 'كافل مريم، رزقه الله يحيى على الكبر',
    story: `كان نبياً صالحاً يكفل مريم بنت عمران في المحراب. كان يجد عندها رزقاً من عند الله. دعا ربه أن يرزقه ولداً صالحاً وهو شيخ كبير، فبشّره الله بيحيى. جعل الله علامته أن لا يكلّم الناس ثلاثة أيام إلا رمزاً. كان متعبداً مخبتاً لله.`,
  },
  {
    id: 'yahya', name: 'يحيى عليه السلام', color: '#EC4899', icon: '🌟',
    summary: 'ابن زكريا، آتاه الله الحكمة صبياً',
    story: `بشّر الله أباه زكريا به وهو شيخ كبير. سمّاه الله بنفسه "يحيى"، ولم يجعل له من قبل سمياً. آتاه الله الحكمة وهو صبي، وكان براً بوالديه، ولم يكن جباراً عصياً. عاش حياة طاهرة عابداً لله. قُتل ظلماً، وكان شهيداً.`,
  },
  {
    id: 'isa', name: 'عيسى عليه السلام', color: '#FBBF24', icon: '✨',
    summary: 'المسيح، روح الله وكلمته',
    story: `ابن مريم العذراء، خلقه الله من غير أب، كآدم. تكلّم في المهد طفلاً، فبرّأ أمه من التهمة. أنزل الله عليه الإنجيل. أعطاه الله معجزات: إحياء الموتى، إبراء الأكمه والأبرص، خلق الطير من الطين. أرسل إلى بني إسرائيل ليدعوهم إلى الله. حاول اليهود قتله، لكن الله رفعه إلى السماء حياً. سينزل في آخر الزمان قبل قيام الساعة.`,
  },
  {
    id: 'muhammad', name: 'محمد ﷺ', color: '#10B981', icon: '☪️',
    summary: 'خاتم النبيين، رحمة للعالمين',
    story: `وُلد في مكة عام الفيل، يتيم الأب والأم. كان أميناً صادقاً قبل البعثة. نزل عليه الوحي في غار حراء وهو في الأربعين. دعا إلى الإسلام ثلاث عشرة سنة في مكة. هاجر إلى المدينة فأسس أول دولة إسلامية. خاض غزوات لإعلاء كلمة الله. فتح مكة بعد ثمان سنوات من الهجرة. حجّ حجة الوداع. توفي في المدينة بعد أن أكمل الله به الدين. خاتم الأنبياء والمرسلين، وأرسل رحمة للعالمين أجمعين.`,
  },
];

export default function StoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof PROPHETS[0] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      if (!token) router.push('/auth/login');
    } catch {}

    return () => {
      // Stop any speech when leaving
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('متصفحك لا يدعم تشغيل الصوت');
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = speechRate;
    u.pitch = 1;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const togglePlay = () => {
    if (!selected) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      speak(selected.story);
    }
  };

  const filtered = PROPHETS.filter(p =>
    !search || p.name.includes(search) || p.summary.includes(search)
  );

  // STORY DETAIL VIEW
  if (selected) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#000',
        color: '#fff',
        position: 'relative',
      }}>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: `radial-gradient(ellipse at top, ${selected.color}33, transparent 70%), #000`,
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <header style={{
            padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 16px 14px',
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <button onClick={() => { window.speechSynthesis?.cancel(); setSelected(null); setPlaying(false); }} style={{
              width: '40px', height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <ArrowRight size={20} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '16px', fontWeight: 800 }}>{selected.name}</h1>
              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>قصة نبي</p>
            </div>
          </header>

          <div style={{ padding: '20px', paddingBottom: '180px', maxWidth: '700px', margin: '0 auto' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{
                width: '120px', height: '120px',
                margin: '0 auto 20px',
                borderRadius: '32px',
                background: `linear-gradient(135deg, ${selected.color}, ${selected.color}aa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '60px',
                boxShadow: `0 24px 60px ${selected.color}77`,
              }}>
                {selected.icon}
              </div>
              <h2 style={{
                fontFamily: 'Amiri, serif',
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '8px',
              }}>
                {selected.name}
              </h2>
              <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.6 }}>
                {selected.summary}
              </p>
            </div>

            {/* Story */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontFamily: 'Amiri, serif',
                fontSize: '18px',
                lineHeight: 2,
                color: '#E5E7EB',
                textAlign: 'justify',
                direction: 'rtl',
              }}>
                {selected.story}
              </p>
            </div>
          </div>

          {/* Floating Audio Player */}
          <div style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            width: 'calc(100% - 32px)',
            maxWidth: '500px',
          }}>
            <div style={{
              padding: '14px 18px',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(30px)',
              border: `1px solid ${selected.color}44`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: `0 16px 40px ${selected.color}33`,
            }}>
              <button onClick={togglePlay} style={{
                width: '50px', height: '50px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`,
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: `0 4px 16px ${selected.color}66`,
              }}>
                {playing ? <Pause size={22} /> : <Play size={22} fill="#fff" />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  🎙️ {playing ? 'يقرأ القصة...' : 'استمع للقصة'}
                </div>
                <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>
                  TTS بصوت عربي تلقائي
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#9CA3AF',
                fontSize: '11px',
              }}>
                <Volume2 size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STORIES LIST
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#000',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251,146,60,0.12) 0%, transparent 50%),
          #000
        `,
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 16px 120px',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <header style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => router.push('/home')} style={{
              width: '40px', height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <ArrowRight size={20} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '26px', fontWeight: 900,
                background: 'linear-gradient(135deg, #FB923C, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2px',
              }}>
                ⭐ قصص الأنبياء
              </h1>
              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
                25 نبياً • مع تشغيل صوتي 🎙️
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '14px 18px',
          }}>
            <Search size={18} color="#6B7280" />
            <input
              type="text"
              placeholder="ابحث عن نبي..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                direction: 'rtl',
              }}
            />
          </div>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '12px',
        }}>
          {filtered.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="prophet-card"
              style={{
                padding: '20px 16px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s',
                textAlign: 'right',
                color: '#fff',
                fontFamily: 'inherit',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-30px', right: '-30px',
                width: '120px', height: '120px',
                borderRadius: '50%',
                background: p.color,
                opacity: 0.1,
                filter: 'blur(30px)',
              }} />

              <div style={{
                width: '50px', height: '50px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${p.color}, ${p.color}aa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px',
                marginBottom: '12px',
                boxShadow: `0 6px 18px ${p.color}55`,
                position: 'relative',
              }}>
                {p.icon}
              </div>

              <h3 style={{
                fontFamily: 'Amiri, serif',
                fontSize: '15px',
                fontWeight: 700,
                marginBottom: '4px',
                position: 'relative',
              }}>
                {p.name}
              </h3>

              <p style={{
                fontSize: '11px',
                color: '#9CA3AF',
                lineHeight: 1.5,
                position: 'relative',
              }}>
                {p.summary}
              </p>

              <div style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                color: p.color,
                fontWeight: 700,
                position: 'relative',
              }}>
                <Volume2 size={11} /> استمع
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .prophet-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.15) !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) !important;
        }
      `}</style>
    </div>
  );
}
