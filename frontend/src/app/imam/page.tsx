'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Sparkles, Copy, Share2, Download,
  Edit, Save, Mic, Volume2, BookOpen, FileText
} from 'lucide-react';

const TOPICS = [
  { id: 'patience', label: 'الصبر', icon: '⏳', color: '#10B981' },
  { id: 'tawakkul', label: 'التوكل', icon: '🤲', color: '#FBBF24' },
  { id: 'ihsan', label: 'الإحسان', icon: '💚', color: '#34D399' },
  { id: 'rahma', label: 'الرحمة', icon: '🕊️', color: '#60A5FA' },
  { id: 'akhlaq', label: 'الأخلاق', icon: '✨', color: '#A855F7' },
  { id: 'family', label: 'الأسرة', icon: '👨‍👩‍👧‍👦', color: '#F472B6' },
  { id: 'youth', label: 'الشباب', icon: '🌱', color: '#FB923C' },
  { id: 'parents', label: 'بر الوالدين', icon: '🌷', color: '#EC4899' },
  { id: 'jihad', label: 'الجهاد الأكبر', icon: '⚔️', color: '#EF4444' },
  { id: 'taqwa', label: 'التقوى', icon: '🕌', color: '#F59E0B' },
  { id: 'ramadan', label: 'رمضان', icon: '🌙', color: '#8B5CF6' },
  { id: 'hajj', label: 'الحج', icon: '🕋', color: '#06B6D4' },
];

const SAMPLE_KHUTBAH = (topic: string, sub: string) => `
# الخطبة الأولى

الحَمْدُ لِلَّهِ رَبِّ العَالَمِيْنَ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى أَشْرَفِ الأَنْبِيَاءِ وَالمُرْسَلِيْنَ، سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِيْنَ.

أَمَّا بَعْدُ، فَيَا أَيُّهَا المُؤْمِنُونَ، أُوصِيكُمْ وَنَفْسِي بِتَقْوَى اللهِ تَعَالَى.

## ${sub}

عِبَادَ اللهِ، إنَّ موضوع خطبتنا اليوم هو "${sub}" — وهو من المواضيع العظيمة التي ينبغي على المسلم أن يعتني بها حق العناية.

قَالَ تَعَالَى في كِتَابِهِ العَزِيز:
﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنْتُمْ مُسْلِمُونَ ﴾
(آل عمران: 102)

وقَالَ النَّبِيُّ ﷺ:
«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»
(رواه البخاري ومسلم)

## أهمية الموضوع

إخوة الإسلام، يجب علينا أن نتدبّر هذا الموضوع من جوانب عدة:

١. **الجانب القرآني**: ذكر الله تعالى ${sub} في مواضع كثيرة من كتابه الكريم.

٢. **الجانب النبوي**: حثَّ النبي ﷺ على الالتزام بـ${sub} في أحاديث جامعة.

٣. **الجانب العملي**: كيف نطبّق ${sub} في حياتنا اليومية مع أنفسنا، وأهلنا، ومجتمعنا.

أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللهَ لِي وَلَكُمْ.

---

# الخطبة الثانية

الحَمْدُ لِلَّهِ عَلَى إِحْسَانِهِ، وَالشُّكْرُ لَهُ عَلَى تَوْفِيقِهِ وَامْتِنَانِهِ، وَأَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ تَعْظِيمًا لِشَأْنِهِ.

## التطبيق العملي

أيها الإخوة الكرام، إنَّ ${sub} ليس مجرد كلام نقوله، بل سلوك يومي وممارسة دائمة. وإليكم بعض الوسائل العملية:

🌿 **الوسيلة الأولى**: استشعار رقابة الله تعالى في كل أعمالنا.

🌿 **الوسيلة الثانية**: مجالسة الصالحين والاستفادة من سيرتهم.

🌿 **الوسيلة الثالثة**: محاسبة النفس قبل النوم على أعمال اليوم.

🌿 **الوسيلة الرابعة**: الإكثار من الدعاء والاستعانة بالله.

## الدعاء

اللَّهُمَّ اجْعَلْنَا مِنْ عِبَادِكَ الصَّالِحِيْنَ، وَوَفِّقْنَا لِمَا تُحِبُّ وَتَرْضَى.

اللَّهُمَّ ارْحَمْنَا بِالقُرْآنِ، وَاجْعَلْهُ لَنَا إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً.

اللَّهُمَّ أَصْلِحْ أَحْوَالَ المُسْلِمِيْنَ فِي كُلِّ مَكَانٍ، وَاحْفَظْ بِلَادَنَا مِنْ كُلِّ سُوءٍ وَمَكْرُوهٍ.

عِبَادَ اللهِ: ﴿ إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَى وَيَنْهَى عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ وَالْبَغْيِ ﴾

فَاذْكُرُوا اللهَ يَذْكُرْكُمْ، وَأَقِيمُوا الصَّلَاة.
`.trim();

export default function ImamPage() {
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'generate' | 'view'>('select');
  const [selectedTopic, setSelectedTopic] = useState<typeof TOPICS[0] | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [khutbah, setKhutbah] = useState('');
  const [duration, setDuration] = useState<'short' | 'medium' | 'long'>('medium');
  const [history, setHistory] = useState<any[]>([]);

  const generate = async () => {
    const topicLabel = selectedTopic?.label || customTopic;
    if (!topicLabel) return;

    setStep('view');
    setLoading(true);

    // Check if AI key is set
    const apiKey = localStorage.getItem('noor_ai_key');

    if (apiKey?.startsWith('sk-ant-')) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3000,
            system: 'أنت إمام مسجد متخصص في كتابة خطب الجمعة. اكتب خطبة كاملة مكونة من خطبتين بأسلوب عربي فصيح، تحتوي على آيات قرآنية وأحاديث نبوية صحيحة، مع تنسيق واضح.',
            messages: [{
              role: 'user',
              content: `اكتب خطبة جمعة كاملة عن "${topicLabel}". اجعلها ${duration === 'short' ? 'مختصرة 5-10 دقائق' : duration === 'long' ? 'مفصلة 20-25 دقيقة' : 'متوسطة 15 دقيقة'}.\n\nيجب أن تحتوي على:\n- الخطبة الأولى مع آيات قرآنية وأحاديث\n- الخطبة الثانية\n- الدعاء الختامي\n\nاكتبها بتنسيق Markdown.`
            }]
          })
        });
        const data = await res.json();
        setKhutbah(data.content?.[0]?.text || SAMPLE_KHUTBAH(topicLabel, topicLabel));
      } catch {
        setKhutbah(SAMPLE_KHUTBAH(topicLabel, topicLabel));
      }
    } else {
      // Demo mode
      await new Promise(r => setTimeout(r, 1500));
      setKhutbah(SAMPLE_KHUTBAH(topicLabel, topicLabel));
    }

    setLoading(false);

    // Save to history
    const item = { topic: topicLabel, date: new Date().toISOString(), duration };
    const newHistory = [item, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('noor_khutbah_history', JSON.stringify(newHistory));
  };

  const copyKhutbah = () => {
    navigator.clipboard?.writeText(khutbah);
    alert('📋 تم نسخ الخطبة كاملة');
  };

  const shareKhutbah = () => {
    if (navigator.share) {
      navigator.share({ title: `خطبة جمعة: ${selectedTopic?.label || customTopic}`, text: khutbah });
    } else {
      copyKhutbah();
    }
  };

  const download = () => {
    const blob = new Blob([khutbah], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `خطبة-${selectedTopic?.label || customTopic}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'view') {
    return (
      <div className="pt-safe pb-nav" style={{ paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom) + 100px)' }}>
        <div className="container-app" style={{ padding: '0 16px' }}>
          {/* Header */}
          <div className="glass-strong" style={{
            position: 'sticky', top: 0, zIndex: 40,
            padding: '12px 16px',
            margin: '0 -16px 16px',
            borderRadius: '0 0 var(--r-lg) var(--r-lg)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <button onClick={() => setStep('select')} style={{ padding: '8px', color: 'var(--text-1)' }}>
              <ArrowRight size={22} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '16px', fontWeight: 800 }}>
                {selectedTopic?.icon} خطبة: {selectedTopic?.label || customTopic}
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                مولّدة بواسطة نور AI ✨
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={copyKhutbah} className="btn btn-ghost" style={{ flex: 1, padding: '10px' }}>
              <Copy size={16} /> نسخ
            </button>
            <button onClick={shareKhutbah} className="btn btn-ghost" style={{ flex: 1, padding: '10px' }}>
              <Share2 size={16} /> مشاركة
            </button>
            <button onClick={download} className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
              <Download size={16} /> تحميل
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 20px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>
                ✨ نور AI يكتب الخطبة الآن...
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: '8px' }}>
                قد يستغرق هذا 30-60 ثانية
              </p>
            </div>
          ) : (
            <div className="glass-card animate-fade-up" style={{
              padding: '24px',
              fontSize: '15px',
              lineHeight: 2.2,
              direction: 'rtl',
              textAlign: 'right',
            }}>
              {khutbah.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h2 key={i} className="text-gradient-gold" style={{ fontSize: '22px', fontWeight: 900, marginTop: i ? '24px' : 0, marginBottom: '12px' }}>{line.replace('# ', '')}</h2>;
                if (line.startsWith('## ')) return <h3 key={i} style={{ fontSize: '17px', fontWeight: 800, color: 'var(--green-5)', marginTop: '16px', marginBottom: '8px' }}>{line.replace('## ', '')}</h3>;
                if (line.startsWith('---')) return <hr key={i} style={{ border: 'none', height: '1px', background: 'linear-gradient(to right, transparent, var(--gold-4), transparent)', margin: '24px 0' }} />;
                if (line.startsWith('﴿') || line.includes('﴿')) return <p key={i} className="font-quran" style={{ fontSize: '20px', color: 'var(--gold-5)', textAlign: 'center', margin: '14px 0', padding: '16px', background: 'rgba(217,119,6,0.08)', borderRadius: 'var(--r-md)', border: '1px solid rgba(217,119,6,0.2)' }}>{line}</p>;
                if (line.startsWith('«') || line.includes('«')) return <p key={i} className="font-quran" style={{ fontSize: '18px', color: 'var(--green-5)', textAlign: 'right', margin: '12px 0', padding: '12px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--r-md)', borderRight: '3px solid var(--green-5)' }}>{line}</p>;
                if (line.startsWith('**')) return <p key={i} style={{ fontWeight: 700, color: 'var(--text-0)', marginTop: '8px' }}>{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('🌿') || line.startsWith('١') || line.startsWith('٢') || line.startsWith('٣') || line.startsWith('٤')) return <p key={i} style={{ marginRight: '12px', marginTop: '8px' }}>{line}</p>;
                if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
                return <p key={i} style={{ marginBottom: '8px' }}>{line}</p>;
              })}
            </div>
          )}

          <div style={{ height: '40px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-safe pb-nav">
      <div className="container-app" style={{ padding: '0 16px' }}>
        <div className="animate-fade-down" style={{ paddingTop: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => router.back()} style={{ padding: '8px', color: 'var(--text-1)' }}>
              <ArrowRight size={22} />
            </button>
            <div>
              <h1 className="text-gradient-gold" style={{ fontSize: '24px', fontWeight: 900 }}>
                🕌 منبر الإمام
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
                إنشاء خطب الجمعة بواسطة AI
              </p>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="animate-fade-up glass-card" style={{
          padding: '20px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(217,119,6,0.12), transparent)',
          borderColor: 'rgba(217,119,6,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '56px', height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-3), var(--gold-5))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
            }}>
              ✨
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gold-5)' }}>
                مولّد خطب الجمعة الذكي
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px', lineHeight: 1.7 }}>
                اختر موضوعاً وسيكتب نور AI خطبة كاملة بالآيات والأحاديث
              </p>
            </div>
          </div>
        </div>

        {/* Duration selector */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px' }}>
            ⏱️ مدة الخطبة
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'short', label: 'مختصرة', sub: '5-10 د' },
              { id: 'medium', label: 'متوسطة', sub: '15 د' },
              { id: 'long', label: 'مفصلة', sub: '20-25 د' },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id as any)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--r-md)',
                  background: duration === d.id ? 'rgba(217,119,6,0.18)' : 'var(--bg-3)',
                  border: `1px solid ${duration === d.id ? 'var(--gold-4)' : 'var(--border-2)'}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: duration === d.id ? 'var(--gold-5)' : 'var(--text-1)',
                }}>{d.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="animate-fade-up delay-2">
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px' }}>
            📋 اختر الموضوع
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}>
            {TOPICS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t)}
                className={`animate-scale-in delay-${Math.min(i % 8, 8)}`}
                style={{
                  padding: '16px 10px',
                  borderRadius: 'var(--r-md)',
                  background: selectedTopic?.id === t.id ? `${t.color}22` : `${t.color}08`,
                  border: `1px solid ${selectedTopic?.id === t.id ? t.color : t.color + '33'}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: t.color }}>
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom topic */}
        <div className="animate-fade-up delay-4" style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px' }}>
            ✍️ أو اكتب موضوعاً مخصصاً
          </h3>
          <input
            type="text"
            value={customTopic}
            onChange={e => { setCustomTopic(e.target.value); setSelectedTopic(null); }}
            placeholder="مثال: فضل الصدقة في رمضان..."
            className="input"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={!selectedTopic && !customTopic}
          className="btn btn-gold animate-fade-up delay-5"
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '20px',
            fontSize: '15px',
            opacity: (!selectedTopic && !customTopic) ? 0.5 : 1,
          }}
        >
          <Sparkles size={20} />
          إنشاء الخطبة الآن
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--text-4)',
          marginTop: '12px',
          lineHeight: 1.7,
        }}>
          ✨ الخطبة مولّدة بـ AI — راجعها قبل الإلقاء<br />
          💡 أضف مفتاح Anthropic API في الإعدادات لخطب أعمق
        </p>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}
