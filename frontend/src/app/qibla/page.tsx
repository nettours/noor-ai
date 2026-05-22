'use client';
import { useEffect, useState, useRef } from 'react';
import { usePrayerStore } from '@/store';

function calcQibla(lat: number, lng: number) {
  const la1=lat*Math.PI/180, lo1=lng*Math.PI/180, la2=21.4225*Math.PI/180, lo2=39.8262*Math.PI/180, dL=lo2-lo1;
  const y=Math.sin(dL)*Math.cos(la2), x=Math.cos(la1)*Math.sin(la2)-Math.sin(la1)*Math.cos(la2)*Math.cos(dL);
  const bearing = (Math.atan2(y,x)*180/Math.PI+360)%360;
  const R=6371, dLa=la2-lat*Math.PI/180, a=Math.sin(dLa/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dL/2)**2;
  const dist = Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
  return { bearing: Math.round(bearing), dist };
}

export default function QiblaPage() {
  const { location, setLocation } = usePrayerStore();
  const [qibla, setQibla] = useState<{bearing:number;dist:number}|null>(null);
  const [device, setDevice] = useState(0);
  const [live, setLive] = useState(false);
  const [status, setStatus] = useState('جاري حساب اتجاه القبلة...');
  const needleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loc = location || { latitude:35.6976, longitude:-0.6337 };
    const q = calcQibla(loc.latitude, loc.longitude);
    setQibla(q);
    setStatus(`القبلة باتجاه ${q.bearing}° — على بُعد ${q.dist.toLocaleString('ar')} كم`);
    if (!location) navigator.geolocation?.getCurrentPosition(p => {
      setLocation({ latitude:p.coords.latitude, longitude:p.coords.longitude, city:'موقعك', country:'', timezone:'' });
      const qq = calcQibla(p.coords.latitude, p.coords.longitude);
      setQibla(qq); setStatus(`القبلة باتجاه ${qq.bearing}° — ${qq.dist.toLocaleString('ar')} كم من مكة`);
    });
  }, [location]);

  useEffect(() => {
    if (!needleRef.current || !qibla) return;
    needleRef.current.style.transform = `rotate(${qibla.bearing - device}deg)`;
  }, [qibla, device]);

  const enableSensor = () => {
    const go = () => {
      window.addEventListener('deviceorientationabsolute', (e:any) => {
        const a = e.webkitCompassHeading || (e.alpha!=null ? 360-e.alpha : 0);
        setDevice(a); setLive(true);
      }, true);
      window.addEventListener('deviceorientation', (e:any) => {
        const a = e.webkitCompassHeading || (e.alpha!=null ? 360-e.alpha : 0);
        setDevice(a); setLive(true);
      }, true);
      setStatus('🟢 المستشعر الحي مفعّل');
    };
    if ((DeviceOrientationEvent as any).requestPermission) {
      (DeviceOrientationEvent as any).requestPermission().then((r:string) => r==='granted'&&go());
    } else go();
  };

  return (
    <div style={{ minHeight:'100vh', paddingBottom:80, background:'#080F1E', color:'#EEE8DC', fontFamily:'Cairo,sans-serif' }}>
      <div style={{ padding:'20px 16px 14px', background:'rgba(10,22,40,0.95)', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:40 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:0 }}>🧭 بوصلة القبلة</h1>
      </div>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 20px 30px', gap:24 }}>

        {/* Compass */}
        <div style={{ position:'relative', width:300, height:300,
          background:'radial-gradient(circle,#162540,#101E34)',
          border:`2px solid rgba(252,211,77,${live?0.5:0.2})`,
          borderRadius:'50%',
          boxShadow:`0 0 40px rgba(22,163,74,0.1), 0 0 ${live?60:20}px rgba(252,211,77,${live?0.2:0.05})`,
          transition:'box-shadow 0.5s',
        }}>
          {/* Cardinal points */}
          {[{l:'ش',top:16,left:'50%',tx:'-50%',c:'#F87171'},{l:'ج',bottom:16,left:'50%',tx:'-50%'},{l:'ق',right:16,top:'50%',ty:'-50%'},{l:'غ',left:16,top:'50%',ty:'-50%'}].map((p,i)=>(
            <div key={i} style={{ position:'absolute', ...p as any, fontSize:14, fontWeight:900, color:p.c||'#526070', transform:`translateX(${p.tx||'0'}) translateY(${p.ty||'0'})` }}>{p.l}</div>
          ))}
          {/* Needle */}
          <div ref={needleRef} style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ width:5, height:90, background:'linear-gradient(to bottom,#FCD34D,transparent)', borderRadius:'3px 3px 0 0' }} />
            <div style={{ fontSize:32, lineHeight:1 }}>🕋</div>
            <div style={{ width:5, height:70, background:'linear-gradient(to top,#526070,transparent)', borderRadius:'0 0 3px 3px', opacity:.4 }} />
            <div style={{ position:'absolute', width:14, height:14, background:'#FCD34D', borderRadius:'50%', boxShadow:'0 0 14px #D97706' }} />
          </div>
        </div>

        {/* Data cards */}
        <div style={{ width:'100%', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { val:`${qibla?.bearing||'--'}°`, lbl:'الاتجاه' },
            { val:qibla ? qibla.dist.toLocaleString('ar')+' كم' : '--', lbl:'المسافة' },
            { val: live ? '🟢 حي' : '⚪ يدوي', lbl:'الوضع' },
          ].map((d,i) => (
            <div key={i} style={{ background:'rgba(16,30,52,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:14, textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:900, color:'#FCD34D' }}>{d.val}</div>
              <div style={{ fontSize:10, color:'#526070', marginTop:3 }}>{d.lbl}</div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div style={{ width:'100%', background:'rgba(16,30,52,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'13px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background: live?'#4ADE80':'#FCD34D', boxShadow: live?'0 0 8px #22C55E':'none', flexShrink:0 }} />
          <div style={{ fontSize:13, color:'#A8B8CC' }}>{status}</div>
        </div>

        <button onClick={enableSensor}
          style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#166534,#16A34A)', border:'none', borderRadius:50, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(22,163,74,0.3)' }}>
          📡 تفعيل المستشعر الحي
        </button>

        <p style={{ fontSize:12, color:'#526070', textAlign:'center', lineHeight:1.8, margin:0 }}>
          استقبل اتجاه الكعبة المشرفة للصلاة<br/>
          <span style={{ color:'#FCD34D' }}>اللهم تقبل صلاتنا ودعاءنا 🤲</span>
        </p>
      </div>
    </div>
  );
}
