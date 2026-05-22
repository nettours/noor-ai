'use client';
import { useEffect, useState } from 'react';
import { PrayerAPI } from '@/services/api';
import { usePrayerStore } from '@/store';

const PRAYERS = [
  { key: 'Fajr',    name: 'الفجر',   icon: '🌅', color: '#818CF8' },
  { key: 'Sunrise', name: 'الشروق',  icon: '☀️', color: '#FCD34D' },
  { key: 'Dhuhr',   name: 'الظهر',   icon: '🌤️', color: '#34D399' },
  { key: 'Asr',     name: 'العصر',   icon: '🌇', color: '#FB923C' },
  { key: 'Maghrib', name: 'المغرب',  icon: '🌆', color: '#F472B6' },
  { key: 'Isha',    name: 'العشاء',  icon: '🌙', color: '#93C5FD' },
];

const S: Record<string, React.CSSProperties> = {
  page:   { minHeight: '100vh', paddingBottom: 80, background: '#080F1E', color: '#EEE8DC', fontFamily: 'Cairo, sans-serif' },
  header: { padding: '20px 16px 14px', background: 'rgba(10,22,40,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 40 },
  h1:     { fontSize: 20, fontWeight: 900, margin: 0 },
};

function animate(el: HTMLElement | null) {
  if (!el) return;
  el.style.transform = 'scale(0.95)';
  setTimeout(() => { if (el) el.style.transform = 'scale(1)'; }, 150);
}

export default function PrayerPage() {
  const { location, prayerTimes, setPrayerTimes, setLocation, trackerToday, markPrayer } = usePrayerStore();
  const [loading, setLoading] = useState(true);
  const [nextKey, setNextKey] = useState('Fajr');
  const [countdown, setCountdown] = useState('--:--:--');
  const [hijri, setHijri] = useState('جاري...');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        let lat = location?.latitude || 35.6976;
        let lng = location?.longitude || -0.6337;
        if (!location && navigator.geolocation) {
          await new Promise<void>(r => navigator.geolocation.getCurrentPosition(
            p => { lat = p.coords.latitude; lng = p.coords.longitude; setLocation({ latitude: lat, longitude: lng, city: 'موقعك', country: '', timezone: '' }); r(); },
            () => r(), { timeout: 5000 }
          ));
        }
        const d = new Date();
        const ds = `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;
        const res = await fetch(`https://api.aladhan.com/v1/timings/${ds}?latitude=${lat}&longitude=${lng}&method=2`);
        const data = await res.json();
        setPrayerTimes(data.data.timings);
        const h = data.data.date.hijri;
        const MN = ['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الثانية','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
        setHijri(`${h.day} ${MN[+h.month.number-1]} ${h.year} هـ`);
      } catch {} finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;
    const tick = () => {
      const now = new Date(), nm = now.getHours()*60+now.getMinutes();
      let nk = 'Fajr', nv = Infinity;
      PRAYERS.filter(p => p.key !== 'Sunrise').forEach(p => {
        if (!prayerTimes[p.key]) return;
        const [h,m] = prayerTimes[p.key].split(':').map(Number);
        const t = h*60+m;
        if (t > nm && t < nv) { nk = p.key; nv = t; }
      });
      setNextKey(nk);
      const ns = now.getHours()*3600+now.getMinutes()*60+now.getSeconds();
      const [h,m] = (prayerTimes[nk]||'0:0').split(':').map(Number);
      const diff = Math.max(0, h*3600+m*60-ns);
      const hh=Math.floor(diff/3600), mm=Math.floor((diff%3600)/60), ss=diff%60;
      setCountdown(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`);
    };
    tick(); const iv = setInterval(tick,1000); return () => clearInterval(iv);
  }, [prayerTimes]);

  const next = PRAYERS.find(p => p.key === nextKey);
  const now = new Date(), nm = now.getHours()*60+now.getMinutes();

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h1 style={S.h1}>🕌 أوقات الصلاة</h1>
          <span style={{ fontSize:11, color:'#A8B8CC' }}>📍 {location?.city||'وهران'}</span>
        </div>
      </div>

      {/* Hijri */}
      <div style={{ margin:'14px 16px', background:'rgba(16,30,52,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'13px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#FCD34D' }}>{hijri}</div>
        <div style={{ fontSize:11, color:'#526070' }}>التاريخ الهجري</div>
      </div>

      {/* Next Prayer Hero */}
      <div style={{ margin:'0 16px 14px', background:'linear-gradient(135deg,rgba(30,58,138,0.5),rgba(37,99,235,0.2))', border:'1px solid rgba(59,130,246,0.3)', borderRadius:22, padding:22, textAlign:'center',
        animation: 'fadeUp 0.5s ease both' }}>
        <div style={{ fontSize:11, color:'#93C5FD', fontWeight:700, marginBottom:6, letterSpacing:.5 }}>الصلاة القادمة</div>
        <div style={{ fontSize:32, fontWeight:900, marginBottom:6 }}>{next?.icon} {next?.name}</div>
        <div style={{ fontSize:48, fontWeight:900, color:'#93C5FD', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
          {loading ? '--:--' : prayerTimes?.[nextKey]||'--:--'}
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:14 }}>
          {['ساعة','دقيقة','ثانية'].map((l,i) => (
            <div key={l} style={{ background:'rgba(255,255,255,0.08)', borderRadius:12, padding:'9px 14px', minWidth:60, textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:900, fontVariantNumeric:'tabular-nums' }}>
                {countdown.split(':')[i]||'00'}
              </div>
              <div style={{ fontSize:9, color:'#93C5FD', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Prayer List */}
      <div style={{ padding:'0 0 16px' }}>
        {PRAYERS.map((p, i) => {
          const time = prayerTimes?.[p.key] || '--:--';
          const isNext = p.key === nextKey;
          const [h,m] = time.split(':').map(Number);
          const isPast = h*60+m < nm && !isNext;
          const isDone = trackerToday?.[p.key];

          return (
            <div key={p.key}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 20px',
                borderBottom:'1px solid rgba(255,255,255,0.05)',
                background: isNext ? 'rgba(59,130,246,0.07)' : 'transparent',
                animation: `fadeUp 0.4s ${i*0.07}s ease both`,
                cursor: p.key !== 'Sunrise' ? 'pointer' : 'default',
              }}
              onClick={e => { if(p.key!=='Sunrise'){ animate(e.currentTarget); markPrayer(p.key, !isDone); }}}
            >
              <span style={{ fontSize:26, flexShrink:0 }}>{p.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700 }}>
                  {p.name}
                  {isNext && <span style={{ fontSize:9, color:p.color, background:`${p.color}22`, padding:'2px 7px', borderRadius:10, marginRight:8, fontWeight:700 }}>قادمة</span>}
                </div>
              </div>
              {isPast && p.key !== 'Sunrise' && (
                <span style={{ fontSize:14, color: isDone ? '#4ADE80' : '#526070' }}>
                  {isDone ? '✅' : '○'}
                </span>
              )}
              <div style={{ fontSize:18, fontWeight:700, fontVariantNumeric:'tabular-nums', color: isNext ? '#93C5FD' : '#EEE8DC' }}>
                {loading ? '--:--' : time}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ margin:'0 16px', padding:14, background:'rgba(16,30,52,0.6)', borderRadius:14, textAlign:'center' }}>
        <button onClick={() => { setLoading(true); window.location.reload(); }}
          style={{ background:'rgba(22,163,74,0.15)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:50, padding:'10px 24px', color:'#4ADE80', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          📍 تحديث الموقع
        </button>
      </div>

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
