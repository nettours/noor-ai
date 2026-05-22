'use client';
import { useState } from 'react';

const CATS = [
  { id:'morning', label:'🌅 الصباح' },
  { id:'evening', label:'🌙 المساء' },
  { id:'prayer',  label:'🕌 الصلاة' },
  { id:'quran',   label:'📖 قرآنية'  },
  { id:'misc',    label:'✨ متنوعة'  },
];

const DATA: Record<string, Array<{t:string;ar:string;n:number}>> = {
  morning: [
    {t:'ذكر الصباح الأول',ar:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',n:1},
    {t:'سيد الاستغفار',ar:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',n:1},
    {t:'آية الكرسي',ar:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',n:1},
    {t:'سورة الإخلاص',ar:'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',n:3},
    {t:'تسبيح الصباح',ar:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',n:100},
    {t:'لا إله إلا الله',ar:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',n:10},
    {t:'دعاء الحفظ',ar:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',n:3},
  ],
  evening: [
    {t:'ذكر المساء الأول',ar:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',n:1},
    {t:'دعاء المساء',ar:'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',n:1},
    {t:'دعاء العافية',ar:'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',n:3},
    {t:'التعوذ من الشر',ar:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',n:3},
    {t:'دعاء العفو',ar:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ',n:1},
  ],
  prayer: [
    {t:'الاستغفار',ar:'أَسْتَغْفِرُ اللَّهَ',n:3},
    {t:'ذكر السلام',ar:'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ',n:1},
    {t:'التسبيح',ar:'سُبْحَانَ اللَّهِ',n:33},
    {t:'التحميد',ar:'الْحَمْدُ لِلَّهِ',n:33},
    {t:'التكبير',ar:'اللَّهُ أَكْبَرُ',n:34},
  ],
  quran: [
    {t:'دعاء الدنيا والآخرة',ar:'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',n:1},
    {t:'دعاء يونس ﵊',ar:'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',n:1},
    {t:'دعاء موسى ﵊',ar:'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',n:1},
    {t:'دعاء حسبنا الله',ar:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',n:7},
    {t:'دعاء الهداية',ar:'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',n:1},
  ],
  misc: [
    {t:'دعاء الهم',ar:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ',n:1},
    {t:'الصلاة على النبي ﷺ',ar:'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ',n:10},
    {t:'الحوقلة',ar:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',n:100},
    {t:'أفضل ذكر',ar:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',n:100},
    {t:'الدعاء الجامع',ar:'اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي',n:1},
  ],
};

export default function AdhkarPage() {
  const [cat, setCat] = useState('morning');
  const [counts, setCounts] = useState<Record<string,number>>(() => {
    try { return JSON.parse(localStorage.getItem('noor_adh')||'{}'); } catch { return {}; }
  });

  const tap = (key: string, max: number) => {
    setCounts(prev => {
      const next = { ...prev, [key]: (prev[key]||0) < max ? (prev[key]||0)+1 : prev[key] };
      localStorage.setItem('noor_adh', JSON.stringify(next));
      if (navigator.vibrate) navigator.vibrate(30);
      return next;
    });
  };

  const list = DATA[cat] || [];

  return (
    <div style={{ minHeight:'100vh', paddingBottom:80, background:'#080F1E', color:'#EEE8DC', fontFamily:'Cairo,sans-serif' }}>
      <div style={{ padding:'20px 16px 0', background:'rgba(10,22,40,0.95)', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:40 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 14px' }}>🤲 الأذكار والأدعية</h1>
        <div style={{ display:'flex', gap:0, overflowX:'auto', paddingBottom:1 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ padding:'10px 14px', background:'none', border:'none', borderBottom:`2px solid ${cat===c.id?'#FCD34D':'transparent'}`, color: cat===c.id ? '#FCD34D' : '#526070', fontFamily:'Cairo,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'12px 0' }}>
        {list.map((d, i) => {
          const key = `${cat}_${i}`;
          const done = counts[key] || 0;
          const pct = d.n > 0 ? Math.min(100, (done/d.n)*100) : 0;
          const isDone = done >= d.n;

          return (
            <div key={key} style={{ margin:'0 16px 12px', background: isDone ? 'rgba(22,163,74,0.08)' : 'rgba(16,30,52,0.8)',
              border:`1px solid ${isDone?'rgba(22,163,74,0.35)':'rgba(255,255,255,0.07)'}`, borderRadius:20, overflow:'hidden',
              animation:`fadeUp 0.4s ${i*0.06}s ease both` }}>
              {/* Header */}
              <div style={{ background:'linear-gradient(135deg,rgba(217,119,6,0.1),transparent)', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#D97706' }}>{d.t}</div>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(217,119,6,0.2)', border:'1px solid rgba(217,119,6,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#FCD34D' }}>{d.n}×</div>
              </div>
              {/* Text */}
              <div style={{ fontFamily:'serif', fontSize:20, lineHeight:2.1, color:'#EEE8DC', textAlign:'right', direction:'rtl', padding:'16px 16px 10px' }}>{d.ar}</div>
              {/* Footer */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:isDone?'#22C55E':'#D97706', borderRadius:3, transition:'width .3s' }} />
                  </div>
                  <div style={{ fontSize:11, color:'#526070', marginTop:5 }}>{done} / {d.n} {isDone?'✅':''}</div>
                </div>
                <button onClick={() => tap(key, d.n)} disabled={isDone}
                  style={{ width:48, height:48, borderRadius:'50%', border:`1px solid ${isDone?'rgba(22,163,74,0.4)':'rgba(22,163,74,0.35)'}`, background: isDone?'rgba(22,163,74,0.25)':'rgba(22,163,74,0.15)', color:isDone?'#4ADE80':'#22C55E', fontSize:20, cursor: isDone?'default':'pointer', flexShrink:0, transition:'all .15s', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
