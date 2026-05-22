'use client';
// ─── NextPrayerCard ───────────────────────────────────────
import { useEffect, useState } from 'react';

const PRAYER_NAMES: Record<string, string> = {
  Fajr:'الفجر', Dhuhr:'الظهر', Asr:'العصر', Maghrib:'المغرب', Isha:'العشاء'
};
const PRAYER_ICONS: Record<string, string> = {
  Fajr:'🌅', Dhuhr:'🌤️', Asr:'🌇', Maghrib:'🌆', Isha:'🌙'
};

export function NextPrayerCard({ prayerTimes, isLoading, city }: {
  prayerTimes: Record<string,string>; isLoading: boolean; city: string;
}) {
  const [countdown, setCountdown] = useState('--:--:--');
  const [nextPrayer, setNextPrayer] = useState({ name: '...', time: '--:--', icon: '🕌' });

  useEffect(() => {
    if (!Object.keys(prayerTimes).length) return;
    const calc = () => {
      const now = new Date();
      const nowM = now.getHours()*60+now.getMinutes();
      const order = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
      let nk = 'Fajr', nv = Infinity;
      order.forEach(k => {
        if (!prayerTimes[k]) return;
        const [h,m] = prayerTimes[k].split(':').map(Number);
        const t = h*60+m;
        if (t > nowM && t < nv) { nk = k; nv = t; }
      });
      setNextPrayer({ name: PRAYER_NAMES[nk]||nk, time: prayerTimes[nk]||'--:--', icon: PRAYER_ICONS[nk]||'🕌' });
      const nowS = now.getHours()*3600+now.getMinutes()*60+now.getSeconds();
      const [h,m] = (prayerTimes[nk]||'0:0').split(':').map(Number);
      const diff = Math.max(0, h*3600+m*60-nowS);
      const hh=Math.floor(diff/3600), mm=Math.floor((diff%3600)/60), ss=diff%60;
      setCountdown(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`);
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [prayerTimes]);

  if (isLoading) return (
    <div style={cardStyle('#1E3A5F','rgba(59,130,246,0.3)')}>
      <div style={{color:'#93C5FD',fontSize:13}}>جاري تحميل أوقات الصلاة...</div>
    </div>
  );

  return (
    <div style={cardStyle('#0F2744','rgba(59,130,246,0.25)')} onClick={() => window.location.href='/prayer'}>
      <div style={{fontSize:11,color:'#93C5FD',fontWeight:700,marginBottom:6}}>الصلاة القادمة • {city}</div>
      <div style={{fontSize:28,fontWeight:900,marginBottom:4}}>{nextPrayer.icon} {nextPrayer.name}</div>
      <div style={{fontSize:42,fontWeight:900,color:'#93C5FD',fontVariantNumeric:'tabular-nums'}}>{nextPrayer.time}</div>
      <div style={{fontSize:13,color:'rgba(147,197,253,0.7)',marginTop:8}}>⏳ متبقي: {countdown}</div>
    </div>
  );
}

function cardStyle(bg: string, border: string): React.CSSProperties {
  return { background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: 18, cursor:'pointer' };
}

// ─── DailyAyah ────────────────────────────────────────────
const AYAHS = [
  {a:'إِنَّ مَعَ الْعُسْرِ يُسْرًا', r:'سورة الشرح — الآية 6'},
  {a:'وَبَشِّرِ الصَّابِرِينَ', r:'سورة البقرة — الآية 155'},
  {a:'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', r:'سورة الطلاق — الآية 3'},
  {a:'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', r:'سورة طه — الآية 25'},
  {a:'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ', r:'سورة الأنبياء — الآية 87'},
  {a:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', r:'سورة آل عمران — الآية 173'},
  {a:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', r:'آية الكرسي'},
];

export function DailyAyah() {
  const ayah = AYAHS[new Date().getDay()];
  return (
    <div style={{ background:'rgba(22,163,74,0.12)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:20, padding:18, cursor:'pointer' }}
      onClick={() => window.location.href='/adhkar'}>
      <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,fontWeight:700,color:'#FCD34D',marginBottom:10}}>
        <span style={{width:7,height:7,background:'#FCD34D',borderRadius:'50%',animation:'pulse 1.5s infinite'}} />
        ✨ آية اليوم
      </div>
      <div style={{fontFamily:'serif',fontSize:20,lineHeight:2,textAlign:'right',direction:'rtl',color:'#EEE8DC'}}>{ayah.a}</div>
      <div style={{fontSize:11,color:'#D97706',textAlign:'right',marginTop:6}}>{ayah.r}</div>
    </div>
  );
}

// ─── QuickTools ────────────────────────────────────────────
const TOOLS = [
  { href:'/quran',  icon:'📖', name:'القرآن',   cls:'rgba(22,163,74,0.08)',  border:'rgba(74,222,128,0.25)' },
  { href:'/prayer', icon:'🕌', name:'الصلاة',   cls:'rgba(59,130,246,0.08)', border:'rgba(147,197,253,0.25)' },
  { href:'/qibla',  icon:'🧭', name:'القبلة',   cls:'rgba(217,119,6,0.08)',  border:'rgba(252,211,77,0.25)' },
  { href:'/tasbih', icon:'📿', name:'المسبحة',  cls:'rgba(124,58,237,0.08)', border:'rgba(196,181,253,0.25)' },
  { href:'/adhkar', icon:'🤲', name:'الأذكار',  cls:'rgba(220,38,38,0.08)',  border:'rgba(252,165,165,0.25)' },
  { href:'/ai',     icon:'🤖', name:'AI',        cls:'rgba(6,182,212,0.08)',  border:'rgba(103,232,249,0.25)' },
];

export function QuickTools() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
      {TOOLS.map(t => (
        <div key={t.href} onClick={() => window.location.href=t.href}
          style={{ background:t.cls, border:`1px solid ${t.border}`, borderRadius:18, padding:'16px 8px', textAlign:'center', cursor:'pointer' }}>
          <div style={{fontSize:30,marginBottom:7}}>{t.icon}</div>
          <div style={{fontSize:11,fontWeight:700,color:'#EEE8DC'}}>{t.name}</div>
        </div>
      ))}
    </div>
  );
}

// ─── DailyChallenges ──────────────────────────────────────
const CHS = [
  {id:'q',icon:'📖',title:'اقرأ 5 آيات من القرآن',pts:50},
  {id:'s',icon:'🕌',title:'صلِّ الصلوات الخمس',pts:100},
  {id:'d',icon:'📿',title:'سبّح الله 33 مرة',pts:30},
  {id:'a',icon:'🤲',title:'اقرأ أذكار الصباح',pts:40},
];

export function DailyChallenges() {
  const today = new Date().toDateString();
  const key = 'noor_ch_'+today;
  const [done, setDone] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch { return []; }
  });

  const complete = (id: string, pts: number) => {
    if (done.includes(id)) return;
    const next = [...done, id];
    setDone(next);
    localStorage.setItem(key, JSON.stringify(next));
    const pts_key = 'noor_pts';
    const cur = parseInt(localStorage.getItem(pts_key)||'0');
    localStorage.setItem(pts_key, String(cur+pts));
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{fontSize:16,fontWeight:800,color:'#EEE8DC'}}>🎯 تحديات اليوم</div>
        <div style={{fontSize:12,color:'#FCD34D',fontWeight:700,background:'rgba(217,119,6,0.12)',padding:'3px 10px',borderRadius:12}}>
          {done.length}/{CHS.length}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {CHS.map(c => {
          const isDone = done.includes(c.id);
          return (
            <div key={c.id} onClick={() => complete(c.id, c.pts)}
              style={{ background: isDone ? 'rgba(22,163,74,0.1)' : 'rgba(16,30,52,0.8)',
                border: `1px solid ${isDone ? 'rgba(22,163,74,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius:18, padding:14, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
              <div style={{width:46,height:46,borderRadius:14,background:isDone?'rgba(22,163,74,0.2)':'rgba(22,30,52,0.8)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{c.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:'#EEE8DC'}}>{c.title}</div>
                <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:2,marginTop:6,overflow:'hidden'}}>
                  <div style={{width:isDone?'100%':'0%',height:'100%',background:'#16A34A',borderRadius:2,transition:'width .4s'}} />
                </div>
              </div>
              {isDone
                ? <span style={{fontSize:22}}>✅</span>
                : <div style={{fontSize:11,color:'#FCD34D',fontWeight:700,padding:'4px 10px',background:'rgba(217,119,6,0.12)',borderRadius:14,flexShrink:0}}>+{c.pts}⭐</div>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HijriDate ────────────────────────────────────────────
export function HijriDate() {
  const J = Math.floor(Date.now()/86400000+2440587.5);
  const l = J-1948440+10632, n = Math.floor((l-1)/10631), ll = l-10631*n+354;
  const j = Math.floor((10985-ll)/5316)*Math.floor((50*ll)/17719)+Math.floor(ll/5670)*Math.floor((43*ll)/15238);
  const ll2 = ll-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29;
  const m = Math.floor((24*ll2)/709), d = ll2-Math.floor((709*m)/24), y = 30*n+j-29;
  const MN = ['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الثانية','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  return (
    <div style={{fontSize:11,fontWeight:700,color:'#FCD34D',background:'rgba(217,119,6,0.15)',padding:'3px 10px',borderRadius:12,border:'1px solid rgba(252,211,77,0.2)'}}>
      {d} {MN[m-1]} {y} هـ
    </div>
  );
}

// ─── StreakCard ───────────────────────────────────────────
export function StreakCard({ streak, points, level }: { streak:number; points:number; level:string }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
      {[
        { icon:'⭐', val: points.toLocaleString('ar'), label:'نقطة', color:'#FCD34D' },
        { icon:'🔥', val: streak, label:'متتالي', color:'#FB923C' },
        { icon:'🌱', val: level==='BEGINNER'?'مبتدئ':level==='INTERMEDIATE'?'متقدم':'عالم', label:'المستوى', color:'#4ADE80' },
      ].map((s,i) => (
        <div key={i} style={{background:'rgba(16,30,52,0.8)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:18,padding:'14px 10px',textAlign:'center'}}>
          <div style={{fontSize:18,marginBottom:5}}>{s.icon}</div>
          <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.val}</div>
          <div style={{fontSize:10,color:'#526070',marginTop:2}}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── AIMoodBanner ─────────────────────────────────────────
export function AIMoodBanner() {
  return (
    <div onClick={() => window.location.href='/ai'}
      style={{background:'rgba(6,182,212,0.08)',border:'1px solid rgba(103,232,249,0.2)',borderRadius:16,padding:'12px 16px',
        display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
      <div style={{fontSize:28}}>🤖</div>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:'#67E8F9'}}>المساعد الإسلامي AI</div>
        <div style={{fontSize:11,color:'#526070',marginTop:2}}>اسأل أي سؤال إسلامي الآن</div>
      </div>
      <div style={{marginRight:'auto',color:'#526070',fontSize:16}}>←</div>
    </div>
  );
}
