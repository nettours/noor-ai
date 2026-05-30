'use client';
import { useState } from 'react';
import { useI18n } from '@/components/ui/I18nProvider';

type L = { ar: string; fr: string; en: string };

const CATS: { id: string; label: L; emoji: string }[] = [
  { id: 'morning', emoji: '🌅', label: { ar: 'الصباح', fr: 'Matin', en: 'Morning' } },
  { id: 'evening', emoji: '🌙', label: { ar: 'المساء', fr: 'Soir', en: 'Evening' } },
  { id: 'prayer', emoji: '🕌', label: { ar: 'الصلاة', fr: 'Prière', en: 'Prayer' } },
  { id: 'quran', emoji: '📖', label: { ar: 'قرآنية', fr: 'Coraniques', en: 'Quranic' } },
  { id: 'misc', emoji: '✨', label: { ar: 'متنوعة', fr: 'Divers', en: 'Misc' } },
];

// الذِكر (ar) يبقى بالعربية دائماً. الاسم (t) مترجم.
const DATA: Record<string, Array<{ t: L; ar: string; n: number }>> = {
  morning: [
    { t: { ar: 'ذكر الصباح الأول', fr: 'Première invocation du matin', en: 'First morning remembrance' }, ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', n: 1 },
    { t: { ar: 'سيد الاستغفار', fr: 'Le maître du repentir', en: 'Master of seeking forgiveness' }, ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ', n: 1 },
    { t: { ar: 'آية الكرسي', fr: 'Le Verset du Trône', en: 'The Throne Verse' }, ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', n: 1 },
    { t: { ar: 'سورة الإخلاص', fr: "Sourate Al-Ikhlas", en: 'Surah Al-Ikhlas' }, ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', n: 3 },
    { t: { ar: 'تسبيح الصباح', fr: 'Glorification du matin', en: 'Morning glorification' }, ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', n: 100 },
    { t: { ar: 'لا إله إلا الله', fr: "Il n'y a de dieu qu'Allah", en: 'There is no god but Allah' }, ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', n: 10 },
    { t: { ar: 'دعاء الحفظ', fr: 'Invocation de protection', en: 'Protection supplication' }, ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', n: 3 },
  ],
  evening: [
    { t: { ar: 'ذكر المساء الأول', fr: 'Première invocation du soir', en: 'First evening remembrance' }, ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', n: 1 },
    { t: { ar: 'دعاء المساء', fr: 'Invocation du soir', en: 'Evening supplication' }, ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', n: 1 },
    { t: { ar: 'دعاء العافية', fr: 'Invocation de bien-être', en: 'Well-being supplication' }, ar: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', n: 3 },
    { t: { ar: 'التعوذ من الشر', fr: 'Refuge contre le mal', en: 'Seeking refuge from evil' }, ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', n: 3 },
    { t: { ar: 'دعاء العفو', fr: 'Invocation du pardon', en: 'Pardon supplication' }, ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ', n: 1 },
  ],
  prayer: [
    { t: { ar: 'الاستغفار', fr: 'Demande de pardon', en: 'Seeking forgiveness' }, ar: 'أَسْتَغْفِرُ اللَّهَ', n: 3 },
    { t: { ar: 'ذكر السلام', fr: 'Invocation de la paix', en: 'Peace remembrance' }, ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ', n: 1 },
    { t: { ar: 'التسبيح', fr: 'Glorification', en: 'Glorification' }, ar: 'سُبْحَانَ اللَّهِ', n: 33 },
    { t: { ar: 'التحميد', fr: 'Louange', en: 'Praise' }, ar: 'الْحَمْدُ لِلَّهِ', n: 33 },
    { t: { ar: 'التكبير', fr: 'Magnification', en: 'Magnification' }, ar: 'اللَّهُ أَكْبَرُ', n: 34 },
  ],
  quran: [
    { t: { ar: 'دعاء الدنيا والآخرة', fr: "Invocation d'ici-bas et de l'au-delà", en: 'This life & Hereafter supplication' }, ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', n: 1 },
    { t: { ar: 'دعاء يونس ﵊', fr: 'Invocation de Younous', en: 'Supplication of Yunus' }, ar: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', n: 1 },
    { t: { ar: 'دعاء موسى ﵊', fr: 'Invocation de Moussa', en: 'Supplication of Musa' }, ar: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', n: 1 },
    { t: { ar: 'دعاء حسبنا الله', fr: 'Allah nous suffit', en: 'Allah is sufficient for us' }, ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', n: 7 },
    { t: { ar: 'دعاء الهداية', fr: 'Invocation de guidée', en: 'Guidance supplication' }, ar: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا', n: 1 },
  ],
  misc: [
    { t: { ar: 'دعاء الهم', fr: "Invocation contre l'angoisse", en: 'Supplication against distress' }, ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ', n: 1 },
    { t: { ar: 'الصلاة على النبي ﷺ', fr: 'Prière sur le Prophète ﷺ', en: 'Blessings on the Prophet ﷺ' }, ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ', n: 10 },
    { t: { ar: 'الحوقلة', fr: "Il n'y a de force qu'en Allah", en: 'There is no power except in Allah' }, ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', n: 100 },
    { t: { ar: 'أفضل ذكر', fr: 'La meilleure invocation', en: 'The best remembrance' }, ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', n: 100 },
    { t: { ar: 'الدعاء الجامع', fr: 'Invocation globale', en: 'Comprehensive supplication' }, ar: 'اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي', n: 1 },
  ],
};

// نصوص الواجهة
const UI = {
  title: { ar: '🤲 الأذكار والأدعية', fr: '🤲 Invocations & Prières', en: '🤲 Adhkar & Supplications' },
  remaining: { ar: 'تبقّى', fr: 'restant', en: 'remaining' },
};

export default function AdhkarPage() {
  const { lang, dir } = useI18n();
  const [cat, setCat] = useState('morning');
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('noor_adh') || '{}'); } catch { return {}; }
  });

  const tap = (key: string, max: number) => {
    setCounts(prev => {
      const next = { ...prev, [key]: (prev[key] || 0) < max ? (prev[key] || 0) + 1 : prev[key] };
      localStorage.setItem('noor_adh', JSON.stringify(next));
      if (navigator.vibrate) navigator.vibrate(30);
      return next;
    });
  };

  const list = DATA[cat] || [];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#080F1E', color: '#EEE8DC', fontFamily: 'Cairo,sans-serif' }}>
      <div style={{ padding: '20px 16px 0', background: 'rgba(10,22,40,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 40 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 14px' }}>{UI.title[lang]}</h1>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 1 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: `2px solid ${cat === c.id ? '#FCD34D' : 'transparent'}`, color: cat === c.id ? '#FCD34D' : '#526070', fontFamily: 'Cairo,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s' }}>
              {c.emoji} {c.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 0' }}>
        {list.map((d, i) => {
          const key = `${cat}_${i}`;
          const done = counts[key] || 0;
          const pct = d.n > 0 ? Math.min(100, (done / d.n) * 100) : 0;
          const isDone = done >= d.n;

          return (
            <div key={key} style={{ margin: '0 16px 12px', background: isDone ? 'rgba(22,163,74,0.08)' : 'rgba(16,30,52,0.8)', border: `1px solid ${isDone ? 'rgba(22,163,74,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, overflow: 'hidden', animation: `fadeUp 0.4s ${i * 0.06}s ease both` }}>
              <div style={{ background: 'linear-gradient(135deg,rgba(217,119,6,0.1),transparent)', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>{d.t[lang]}</div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FCD34D' }}>{d.n}×</div>
              </div>
              {/* نص الذِكر يبقى بالعربية دائماً */}
              <div style={{ fontFamily: 'serif', fontSize: 20, lineHeight: 2.1, color: '#EEE8DC', textAlign: 'right', direction: 'rtl', padding: '16px 16px 10px' }}>{d.ar}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isDone ? '#22C55E' : '#D97706', borderRadius: 3, transition: 'width .3s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#526070', marginTop: 5 }}>{done} / {d.n} {isDone ? '✅' : ''}</div>
                </div>
                <button onClick={() => tap(key, d.n)} disabled={isDone}
                  style={{ width: 48, height: 48, borderRadius: '50%', border: `1px solid ${isDone ? 'rgba(22,163,74,0.4)' : 'rgba(22,163,74,0.35)'}`, background: isDone ? 'rgba(22,163,74,0.25)' : 'rgba(22,163,74,0.15)', color: isDone ? '#4ADE80' : '#22C55E', fontSize: 20, cursor: isDone ? 'default' : 'pointer', flexShrink: 0, transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone ? '✓' : '+'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
