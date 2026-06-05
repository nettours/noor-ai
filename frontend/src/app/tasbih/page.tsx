'use client';
import { useState } from 'react';
import { shareContent } from '@/lib/share';

const DHIKR = [
  { t:'سبحان الله',        tr:'Glory be to Allah',           n:33,  c:'#22C55E' },
  { t:'الحمد لله',          tr:'All praise to Allah',          n:33,  c:'#A855F7' },
  { t:'الله أكبر',          tr:'Allah is the Greatest',        n:34,  c:'#3B82F6' },
  { t:'لا إله إلا الله',    tr:'No god but Allah',             n:100, c:'#F97316' },
  { t:'أستغفر الله',        tr:'I seek forgiveness',           n:100, c:'#EF4444' },
  { t:'اللهم صل على محمد ﷺ',tr:'Peace upon the Prophet ﷺ',   n:100, c:'#EAB308' },
  { t:'سبحان الله وبحمده',  tr:'Glory and praise to Allah',   n:100, c:'#06B6D4' },
];

export default function TasbihPage() {
  const [cur, setCur] = useState(0);
  const [count, setCount] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [total, setTotal] = useState(0);
  const [flash, setFlash] = useState(false);

  const d = DHIKR[cur];
  const pct = d.n > 0 ? count / d.n : 0;
  const C = 647; // circumference r=103

  const tap = () => {
    if (navigator.vibrate) navigator.vibrate(25);
    const next = count + 1;
    setTotal(t => t+1);
    if (next >= d.n) {
      setSessions(s => s+1);
      setCount(0);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
      if (navigator.vibrate) navigator.vibrate([50,30,150]);
    } else {
      setCount(next);
    }
  };

  const select = (i: number) => { setCur(i); setCount(0); setSessions(0); };

  return (
    <div style={{ minHeight:'100vh', paddingBottom:80, background:'#080F1E', color:'#EEE8DC', fontFamily:'Cairo,sans-serif' }}>
      <div style={{ padding:'20px 16px 14px', background:'rgba(10,22,40,0.95)', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:40 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:0 }}>📿 المسبحة الرقمية</h1>
      </div>

      {/* Dhikr tabs */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'12px 16px' }}>
        {DHIKR.map((dh,i) => (
          <button key={i} onClick={() => select(i)}
            style={{ whiteSpace:'nowrap', padding:'8px 14px', borderRadius:20,
              background: cur===i ? `${DHIKR[i].c}33` : 'rgba(16,30,52,0.8)',
              border: `1px solid ${cur===i ? DHIKR[i].c+'66' : 'rgba(255,255,255,0.07)'}`,
              color: cur===i ? DHIKR[i].c : '#526070',
              fontFamily:'Cairo,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0, transition:'all .2s' }}>
            {dh.t}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 20px 28px', gap:16 }}>
        {/* Dhikr text */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'serif', fontSize:28, color:'#FCD34D', lineHeight:1.8 }}>{d.t}</div>
          <div style={{ fontSize:12, color:'#526070', marginTop:4 }}>{d.tr}</div>
        </div>

        {/* Ring */}
        <div onClick={tap}
          style={{ position:'relative', width:240, height:240, cursor:'pointer', userSelect:'none',
            filter: flash ? `drop-shadow(0 0 20px ${d.c})` : 'none', transition:'filter .3s' }}>
          <svg viewBox="0 0 240 240" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
            <circle cx="120" cy="120" r="103" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14"/>
            <circle cx="120" cy="120" r="103" fill="none" stroke={d.c} strokeWidth="14"
              strokeLinecap="round" strokeDasharray={C}
              strokeDashoffset={C*(1-pct)}
              style={{ transition:'stroke-dashoffset .25s ease', filter:`drop-shadow(0 0 8px ${d.c}88)` }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
            <div style={{ fontSize:60, fontWeight:900, color:'#FCD34D', lineHeight:1, fontVariantNumeric:'tabular-nums',
              transform: flash ? 'scale(1.1)' : 'scale(1)', transition:'transform .15s' }}>{count}</div>
            <div style={{ fontSize:13, color:'#526070', marginTop:4 }}>من {d.n}</div>
          </div>
        </div>

        <p style={{ fontSize:12, color:'#526070', margin:0 }}>👆 اضغط الدائرة للتسبيح</p>

        {/* Stats */}
        <div style={{ width:'100%', display:'flex', gap:12 }}>
          {[{v:sessions,l:'الدورات'},{v:total,l:'الإجمالي'}].map((s,i)=>(
            <div key={i} style={{ flex:1, background:'rgba(16,30,52,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:14, textAlign:'center' }}>
              <div style={{ fontSize:24, fontWeight:900, color:'#FCD34D' }}>{s.v}</div>
              <div style={{ fontSize:10, color:'#526070', marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ width:'100%', display:'flex', gap:10 }}>
          <button onClick={() => { setCount(0); setSessions(0); setTotal(0); }}
            style={{ flex:1, padding:'13px', background:'rgba(16,30,52,0.8)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:50, color:'#EEE8DC', fontFamily:'Cairo,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            🔄 إعادة
          </button>
          <button onClick={() => { const t=`قلت "${d.t}" ${sessions*d.n+count} مرة 📿\nنور AI 🌙`; shareContent({ text: t }); }}
            style={{ flex:1, padding:'13px', background:'linear-gradient(135deg,#166534,#16A34A)', border:'none', borderRadius:50, color:'#fff', fontFamily:'Cairo,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(22,163,74,0.3)' }}>
            📤 مشاركة
          </button>
        </div>
      </div>
    </div>
  );
}
