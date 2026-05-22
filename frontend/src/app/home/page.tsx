'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Compass, Heart, Hash, MessageSquare, Bot,
  Flame, Star, TrendingUp, Calendar, MapPin, Clock,
  ChevronLeft, Sparkles, Award, Sunrise, Sun, Cloud, Sunset, Moon
} from 'lucide-react';

// ─── DATA ───────────────────────────────────────────────────
const AYAHS = [
  { a: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', r: 'سورة الشرح — الآية 6' },
  { a: 'وَبَشِّرِ الصَّابِرِينَ', r: 'سورة البقرة — الآية 155' },
  { a: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', r: 'سورة الطلاق — الآية 3' },
  { a: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', r: 'سورة طه — الآية 25' },
  { a: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ', r: 'سورة الأنبياء — الآية 87' },
  { a: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', r: 'سورة آل عمران — الآية 173' },
  { a: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', r: 'آية الكرسي — البقرة 255' },
];

const HADITHS = [
  { t: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', s: 'البخاري ومسلم' },
  { t: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', s: 'البخاري' },
  { t: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ', s: 'مسلم' },
  { t: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ', s: 'البخاري ومسلم' },
  { t: 'الطُّهُورُ شَطْرُ الإِيمَانِ', s: 'مسلم' },
  { t: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا', s: 'البخاري ومسلم' },
  { t: 'مَنْ صَمَتَ نَجَا', s: 'الترمذي' },
];

const PRAYER_NAMES: Record<string, string> = {
  Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
  Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};
const PRAYER_ICONS: Record<string, React.ComponentType<{size?:number}>> = {
  Fajr: Sunrise, Sunrise: Sun, Dhuhr: Sun, Asr: Cloud, Maghrib: Sunset, Isha: Moon,
};

const TOOLS = [
  { href: '/quran', icon: BookOpen, name: 'القرآن الكريم', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  { href: '/prayer', icon: Clock, name: 'أوقات الصلاة', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  { href: '/qibla', icon: Compass, name: 'بوصلة القبلة', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  { href: '/tasbih', icon: Hash, name: 'المسبحة', color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
  { href: '/adhkar', icon: Heart, name: 'الأذكار', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
  { href: '/ai', icon: Bot, name: 'مساعد AI', color: '#67E8F9', bg: 'rgba(103,232,249,0.1)' },
  { href: '/stories', icon: BookOpen, name: 'قصص الأنبياء', color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  { href: '/imam', icon: Sparkles, name: 'منبر الإمام', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { href: '/community', icon: MessageSquare, name: 'المجتمع', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
];

const CHALLENGES = [
  { id: 'q', icon: '📖', title: 'اقرأ 5 آيات من القرآن', pts: 50 },
  { id: 's', icon: '🕌', title: 'صلِّ الصلوات الخمس', pts: 100 },
  { id: 'd', icon: '📿', title: 'سبّح الله 33 مرة', pts: 30 },
  { id: 'a', icon: '🤲', title: 'اقرأ أذكار الصباح', pts: 40 },
];

// ─── HELPERS ────────────────────────────────────────────────
function hijriDate() {
  const J = Math.floor(Date.now() / 86400000 + 2440587.5);
  const l = J - 1948440 + 10632, n = Math.floor((l - 1) / 10631), ll = l - 10631 * n + 354;
  const j = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) + Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const ll2 = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * ll2) / 709), d = ll2 - Math.floor((709 * m) / 24), y = 30 * n + j - 29;
  const MN = ['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الثانية','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  return `${d} ${MN[m - 1]} ${y} هـ`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return { text: 'الله يسهر معك', emoji: '🌙' };
  if (h < 12) return { text: 'صباح الإيمان', emoji: '☀️' };
  if (h < 17) return { text: 'نهارك مبارك', emoji: '🌤️' };
  if (h < 20) return { text: 'مساء النور', emoji: '🌆' };
  return { text: 'أمسيات طيبة', emoji: '🌙' };
}

// ─── PAGE ───────────────────────────────────────────────────
export default function HomePage() {
  const [user, setUser] = useState({ name: 'أخي الكريم', points: 0, streak: 0, level: 'مبتدئ' });
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string> | null>(null);
  const [city, setCity] = useState('وهران');
  const [nextPrayer, setNextPrayer] = useState({ key: 'Fajr', name: '...', time: '--:--' });
  const [countdown, setCountdown] = useState({ h: '--', m: '--', s: '--' });
  const [doneChallenges, setDoneChallenges] = useState<string[]>([]);

  const greeting = getGreeting();
  const ayah = AYAHS[new Date().getDay()];
  const hadith = HADITHS[new Date().getDay()];

  // Load user
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      setUser(prev => ({ ...prev, ...u }));
      const today = new Date().toDateString();
      const done = JSON.parse(localStorage.getItem('noor_ch_' + today) || '[]');
      setDoneChallenges(done);
    } catch {}
  }, []);

  // Fetch prayer times
  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const loc = JSON.parse(localStorage.getItem('noor_location') || '{}');
        let lat = loc.lat || 35.6976;
        let lng = loc.lng || -0.6337;
        if (loc.city) setCity(loc.city);

        if (!loc.lat && navigator.geolocation) {
          await new Promise<void>(resolve => {
            navigator.geolocation.getCurrentPosition(
              p => {
                lat = p.coords.latitude;
                lng = p.coords.longitude;
                localStorage.setItem('noor_location', JSON.stringify({ lat, lng, city: 'موقعك' }));
                setCity('موقعك');
                resolve();
              },
              () => resolve(),
              { timeout: 4000 }
            );
          });
        }

        const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        const res = await fetch(`https://api.aladhan.com/v1/timings/${today}?latitude=${lat}&longitude=${lng}&method=2`);
        const data = await res.json();
        setPrayerTimes(data.data.timings);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTimes();
  }, []);

  // Countdown
  useEffect(() => {
    if (!prayerTimes) return;
    const tick = () => {
      const now = new Date();
      const nm = now.getHours() * 60 + now.getMinutes();
      const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      let nk = 'Fajr', nv = Infinity;
      order.forEach(k => {
        if (!prayerTimes[k]) return;
        const [h, m] = prayerTimes[k].split(':').map(Number);
        const t = h * 60 + m;
        if (t > nm && t < nv) { nk = k; nv = t; }
      });
      setNextPrayer({ key: nk, name: PRAYER_NAMES[nk] || nk, time: prayerTimes[nk] || '--:--' });
      const ns = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const [h, m] = (prayerTimes[nk] || '0:0').split(':').map(Number);
      const diff = Math.max(0, h * 3600 + m * 60 - ns);
      const pad = (n: number) => String(n).padStart(2, '0');
      setCountdown({
        h: pad(Math.floor(diff / 3600)),
        m: pad(Math.floor((diff % 3600) / 60)),
        s: pad(diff % 60),
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [prayerTimes]);

  const completeChallenge = (id: string, pts: number) => {
    if (doneChallenges.includes(id)) return;
    const next = [...doneChallenges, id];
    setDoneChallenges(next);
    const today = new Date().toDateString();
    localStorage.setItem('noor_ch_' + today, JSON.stringify(next));
    const newPoints = user.points + pts;
    const updated = { ...user, points: newPoints };
    setUser(updated);
    localStorage.setItem('noor_user', JSON.stringify(updated));
  };

  const NextIcon = PRAYER_ICONS[nextPrayer.key] || Sun;

  return (
    <div className="pt-safe pb-nav">
      <div className="container-app" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ─── HEADER ───────────────────────────── */}
        <header className="animate-fade-down" style={{
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-5)' }}>
              {greeting.text} {greeting.emoji}
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 900, marginTop: '2px' }}>
              مرحباً، <span className="text-gradient-gold">{user.name.split(' ')[0]}</span>
            </h1>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">📅 {hijriDate()}</span>
              <span className="badge badge-green">🔥 {user.streak} يوم</span>
            </div>
          </div>
          <Link href="/profile">
            <div style={{
              width: '54px', height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-3), var(--gold-5))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 900,
              color: 'var(--bg-0)',
              boxShadow: 'var(--shadow-gold)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }} className="animate-glow">
              {user.name[0] || '☪️'}
            </div>
          </Link>
        </header>

        {/* ─── STATS ROW ────────────────────────── */}
        <div className="animate-fade-up delay-1" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
        }}>
          <StatCard icon={<Star size={18} />} value={user.points.toLocaleString('ar')} label="نقطة" color="var(--gold-5)" />
          <StatCard icon={<Flame size={18} />} value={String(user.streak)} label="متتالي" color="#FB923C" />
          <StatCard icon={<Award size={18} />} value={user.level} label="المستوى" color="var(--green-5)" />
        </div>

        {/* ─── AI BANNER ────────────────────────── */}
        <Link href="/ai" className="animate-fade-up delay-2">
          <div className="glass-card" style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(6,182,212,0.02))',
            borderColor: 'rgba(103, 232, 249, 0.2)',
            cursor: 'pointer',
          }}>
            <div style={{
              width: '50px', height: '50px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(6,182,212,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={26} color="#67E8F9" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#67E8F9' }}>
                المساعد الإسلامي AI ✨
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
                اسأل أي سؤال إسلامي الآن
              </div>
            </div>
            <ChevronLeft size={20} color="var(--text-4)" />
          </div>
        </Link>

        {/* ─── PRAYER STRIP ─────────────────────── */}
        <Link href="/prayer" className="animate-fade-up delay-3">
          <div style={{
            background: 'linear-gradient(135deg, rgba(30,64,175,0.5), rgba(37,99,235,0.2))',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 'var(--r-lg)',
            padding: '18px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, opacity: 0.1 }}>
              <NextIcon size={140} />
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--blue-6)', fontWeight: 700, letterSpacing: '0.5px' }}>
                  الصلاة القادمة
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, marginTop: '4px' }}>
                  <NextIcon size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
                  {nextPrayer.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '4px' }}>
                  <MapPin size={10} style={{ display: 'inline' }} /> {city}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="num-arabic" style={{ fontSize: '32px', fontWeight: 900, color: 'var(--blue-6)', lineHeight: 1 }}>
                  {nextPrayer.time}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(147,197,253,0.7)', marginTop: '6px' }}>
                  ⏳ <span className="num-arabic">{countdown.h}:{countdown.m}:{countdown.s}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* ─── DAILY AYAH ───────────────────────── */}
        <div className="animate-fade-up delay-4" style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,78,59,0.2))',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 'var(--r-lg)',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, left: -20,
            width: '120px', height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.15), transparent)',
            pointerEvents: 'none',
          }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 700, color: 'var(--gold-5)',
            marginBottom: '12px',
          }}>
            <Sparkles size={14} className="animate-pulse-slow" />
            آية اليوم
          </div>
          <div className="font-quran" style={{
            fontSize: '22px',
            textAlign: 'right',
            direction: 'rtl',
            color: 'var(--text-0)',
            lineHeight: 2.1,
          }}>
            {ayah.a}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--gold-4)',
            textAlign: 'right',
            marginTop: '10px',
          }}>
            ◈ {ayah.r}
          </div>
        </div>

        {/* ─── TOOLS GRID ───────────────────────── */}
        <div className="animate-fade-up delay-5">
          <div className="divider-ornament">۞</div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>🛠️ الأدوات الإسلامية</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>9 أدوات</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}>
            {TOOLS.map((t, i) => {
              const Icon = t.icon;
              return (
                <Link key={t.href} href={t.href} className={`animate-scale-in delay-${Math.min(i+1, 8)}`}>
                  <div style={{
                    background: t.bg,
                    border: `1px solid ${t.color}33`,
                    borderRadius: 'var(--r-md)',
                    padding: '18px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: '46px', height: '46px',
                      borderRadius: '14px',
                      background: `${t.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 10px',
                    }}>
                      <Icon size={24} color={t.color} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{t.name}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── DAILY CHALLENGES ─────────────────── */}
        <div className="animate-fade-up delay-6">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>🎯 تحديات اليوم</h2>
            <span className="badge badge-gold">
              {doneChallenges.length}/{CHALLENGES.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CHALLENGES.map((c, i) => {
              const isDone = doneChallenges.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => completeChallenge(c.id, c.pts)}
                  className={`animate-slide-right delay-${i+1}`}
                  style={{
                    background: isDone ? 'rgba(16,185,129,0.1)' : 'var(--bg-3)',
                    border: `1px solid ${isDone ? 'rgba(16,185,129,0.4)' : 'var(--border-2)'}`,
                    borderRadius: 'var(--r-md)',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px',
                    borderRadius: '14px',
                    background: isDone ? 'rgba(16,185,129,0.2)' : 'var(--bg-4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    {c.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{c.title}</div>
                    <div style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.07)',
                      borderRadius: '2px',
                      marginTop: '8px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: isDone ? '100%' : '0%',
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--green-4), var(--green-5))',
                        borderRadius: '2px',
                        transition: 'width 0.5s',
                      }} />
                    </div>
                  </div>
                  {isDone ? (
                    <div style={{ fontSize: '24px' }}>✅</div>
                  ) : (
                    <span className="badge badge-gold">+{c.pts} ⭐</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── HADITH ───────────────────────────── */}
        <div className="animate-fade-up delay-7 glass-card" style={{
          padding: '18px',
          borderColor: 'rgba(217,119,6,0.2)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 700, color: 'var(--gold-4)',
            marginBottom: '12px',
          }}>
            <span style={{ width: 6, height: 6, background: 'var(--gold-4)', borderRadius: '50%' }} />
            📜 حديث اليوم
          </div>
          <div className="font-quran" style={{
            fontSize: '19px',
            textAlign: 'right',
            direction: 'rtl',
            lineHeight: 2,
          }}>
            {hadith.t}
          </div>
          <div style={{
            fontSize: '11px', color: 'var(--gold-4)',
            textAlign: 'right', marginTop: '8px',
          }}>
            ◈ رواه {hadith.s}
          </div>
        </div>

        {/* Footer space */}
        <div style={{ height: '20px' }} />
      </div>
    </div>
  );
}

// ─── COMPONENTS ─────────────────────────────────────────────
function StatCard({ icon, value, label, color }: any) {
  return (
    <div className="glass-card" style={{
      padding: '14px 8px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-15px', right: '-15px',
        width: '60px', height: '60px',
        borderRadius: '50%',
        background: color, opacity: 0.08,
      }} />
      <div style={{ color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>{label}</div>
    </div>
  );
}
