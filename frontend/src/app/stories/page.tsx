'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Clock, Play, Book, Sparkles, Star,
  ChevronLeft, Heart, Share2
} from 'lucide-react';

const PROPHETS = [
  { id: 'adam', name: 'آدم', en: 'Adam', icon: '🌍', age: 1000, color: '#10B981', summary: 'أبو البشر، خليفة الله في الأرض', desc: 'خلق الله آدم من تراب ونفخ فيه من روحه. علّمه الأسماء كلها وأسكنه الجنة، ثم أهبطه إلى الأرض ليكون خليفة فيها.' },
  { id: 'idris', name: 'إدريس', en: 'Idris', icon: '⭐', age: 365, color: '#A855F7', summary: 'أول من خط بالقلم وعرف الفلك', desc: 'رفعه الله مكاناً علياً. كان أول من خط بالقلم وأول من نظر في الفلك.' },
  { id: 'nuh', name: 'نوح', en: 'Nuh', icon: '🚢', age: 950, color: '#3B82F6', summary: 'صاحب السفينة والطوفان', desc: 'دعا قومه ألف سنة إلا خمسين عاماً. كذّبوه فأنذرهم الله بالطوفان وأمره ببناء سفينة. نجا فيها المؤمنون.' },
  { id: 'hud', name: 'هود', en: 'Hud', icon: '🌪️', age: 150, color: '#FB923C', summary: 'نبي قوم عاد', desc: 'أرسله الله إلى قوم عاد فكفروا. أهلكهم الله بريح صرصر عاتية.' },
  { id: 'salih', name: 'صالح', en: 'Salih', icon: '🐪', age: 120, color: '#F59E0B', summary: 'نبي ثمود وناقة الله', desc: 'أرسل إلى قوم ثمود وأخرج لهم ناقة من الصخر. عقروها فأهلكهم الله بصيحة.' },
  { id: 'ibrahim', name: 'إبراهيم', en: 'Ibrahim', icon: '🔥', age: 175, color: '#EF4444', summary: 'خليل الله، أبو الأنبياء', desc: 'حطم الأصنام، ألقي في النار فجعلها الله برداً وسلاماً. بنى الكعبة مع ابنه إسماعيل.' },
  { id: 'lut', name: 'لوط', en: 'Lut', icon: '🏛️', age: 175, color: '#A855F7', summary: 'نبي قوم سدوم', desc: 'أرسل لقوم انتشرت فيهم الفاحشة. أنجاه الله ومن آمن معه وأهلك القوم.' },
  { id: 'ismail', name: 'إسماعيل', en: 'Ismail', icon: '🕋', age: 137, color: '#10B981', summary: 'الذبيح، جد العرب', desc: 'ابن إبراهيم. أمر الله أباه بذبحه فاستسلم لأمر الله، فأبدله الله بكبش عظيم.' },
  { id: 'ishaq', name: 'إسحاق', en: 'Ishaq', icon: '✨', age: 180, color: '#FBBF24', summary: 'البشرى من الله لإبراهيم', desc: 'ابن إبراهيم من سارة. ولد بعد دعاء طويل وكان بشارة من الله.' },
  { id: 'yaqub', name: 'يعقوب', en: 'Yaqub', icon: '👨‍👦‍👦', age: 147, color: '#3B82F6', summary: 'إسرائيل وأبو الأنبياء', desc: 'يعقوب هو إسرائيل، أبو الأسباط. صبر على فقد ابنه يوسف زماناً طويلاً.' },
  { id: 'yusuf', name: 'يوسف', en: 'Yusuf', icon: '👑', age: 110, color: '#F59E0B', summary: 'الصديق، صاحب الرؤيا', desc: 'حسده إخوته فألقوه في البئر. صار عزيز مصر بحكمته وتأويله للرؤى. أعظم قصة في القرآن.' },
  { id: 'shuayb', name: 'شعيب', en: 'Shuayb', icon: '⚖️', age: 0, color: '#A855F7', summary: 'خطيب الأنبياء، نبي مدين', desc: 'دعا أهل مدين للتوحيد وترك الغش في الميزان. أُهلكوا بصيحة.' },
  { id: 'ayyub', name: 'أيوب', en: 'Ayyub', icon: '🤲', age: 93, color: '#34D399', summary: 'الصابر', desc: 'ابتلاه الله بالمرض والفقر وفقد الأهل. صبر فأعاد الله له كل شيء أضعافاً مضاعفة.' },
  { id: 'musa', name: 'موسى', en: 'Musa', icon: '🌊', age: 120, color: '#3B82F6', summary: 'كليم الله، صاحب العصا', desc: 'كلّمه الله تكليماً. شق له البحر، أُيّد بمعجزات عظيمة في مواجهة فرعون. أنزل عليه التوراة.' },
  { id: 'harun', name: 'هارون', en: 'Harun', icon: '🗣️', age: 122, color: '#3B82F6', summary: 'وزير موسى وأخوه', desc: 'أخو موسى ووزيره. كان فصيح اللسان، أعانه على دعوة بني إسرائيل.' },
  { id: 'dawud', name: 'داود', en: 'Dawud', icon: '🎵', age: 100, color: '#F59E0B', summary: 'صاحب الزبور والصوت الجميل', desc: 'ملك ونبي. أنزل عليه الزبور. كان يحسن الصوت بالتلاوة، وألان الله له الحديد.' },
  { id: 'sulayman', name: 'سليمان', en: 'Sulayman', icon: '👑', age: 53, color: '#FBBF24', summary: 'الملك الذي علّم منطق الطير', desc: 'ابن داود. ملك سخّر الله له الجن والإنس والريح وعلّمه منطق الطير.' },
  { id: 'ilyas', name: 'إلياس', en: 'Ilyas', icon: '⚡', age: 0, color: '#A855F7', summary: 'نبي بني إسرائيل', desc: 'دعا بني إسرائيل لترك عبادة الأوثان. من أنبياء بني إسرائيل العظام.' },
  { id: 'alyasa', name: 'اليسع', en: 'Al-Yasa', icon: '✨', age: 0, color: '#34D399', summary: 'خليفة إلياس', desc: 'من أنبياء بني إسرائيل، خلف إلياس في الدعوة.' },
  { id: 'dhulkifl', name: 'ذو الكفل', en: 'Dhul-Kifl', icon: '🛡️', age: 0, color: '#A855F7', summary: 'الصابر المحتسب', desc: 'من الأنبياء الصابرين. كفل أمته بالعدل والإحسان.' },
  { id: 'yunus', name: 'يونس', en: 'Yunus', icon: '🐋', age: 0, color: '#3B82F6', summary: 'صاحب الحوت', desc: 'دعا قومه فعصوه، فخرج مغاضباً. ابتلعه الحوت ودعا في ظلماته فأنجاه الله.' },
  { id: 'zakariya', name: 'زكريا', en: 'Zakariya', icon: '👴', age: 100, color: '#10B981', summary: 'كافل مريم', desc: 'دعا ربه فرزقه يحيى رغم كبر سنه. كفل مريم بنت عمران.' },
  { id: 'yahya', name: 'يحيى', en: 'Yahya', icon: '🌿', age: 31, color: '#10B981', summary: 'الذي لم يجعل له من قبل سمياً', desc: 'ابن زكريا. كان حصوراً وسيداً ونبياً من الصالحين.' },
  { id: 'isa', name: 'عيسى', en: 'Isa', icon: '🕊️', age: 33, color: '#34D399', summary: 'المسيح ابن مريم، روح الله', desc: 'ولد بغير أب. أيده الله بمعجزات: إحياء الموتى، إبراء الأكمه والأبرص. رفعه الله إليه.' },
  { id: 'muhammad', name: 'محمد ﷺ', en: 'Muhammad', icon: '🕌', age: 63, color: '#FBBF24', summary: 'خاتم الأنبياء والمرسلين', desc: 'أفضل الخلق. أرسله الله رحمة للعالمين. خاتم الأنبياء، وكتابه القرآن باق إلى يوم القيامة.' },
];

export default function StoriesPage() {
  const router = useRouter();
  const [active, setActive] = useState<typeof PROPHETS[0] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  if (active) {
    const isFav = favorites.includes(active.id);
    return (
      <div className="pt-safe pb-nav" style={{ paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom) + 80px)' }}>
        <div className="container-app">
          {/* Header */}
          <div style={{
            background: `linear-gradient(180deg, ${active.color}33 0%, transparent 100%)`,
            padding: '20px 16px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <button onClick={() => setActive(null)} style={{
              padding: '8px', marginBottom: '20px', color: 'var(--text-1)',
            }}>
              <ArrowRight size={24} />
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px',
            }}>
              <div className="animate-glow" style={{
                width: '140px', height: '140px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${active.color}33, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '70px',
                filter: `drop-shadow(0 0 30px ${active.color}66)`,
              }}>
                {active.icon}
              </div>
              <h1 className="font-quran" style={{ fontSize: '36px', color: active.color }}>
                {active.name}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                {active.en} • عليه السلام
              </p>
              <span className="badge badge-gold">{active.summary}</span>
              {active.age > 0 && (
                <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>
                  🕰️ عاش {active.age} سنة
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '0 16px', marginTop: '-20px', position: 'relative', zIndex: 2 }}>
            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>
                  <Play size={16} /> استمع للقصة
                </button>
                <button
                  onClick={() => setFavorites(isFav ? favorites.filter(f => f !== active.id) : [...favorites, active.id])}
                  className="btn-icon"
                  style={{
                    background: isFav ? 'rgba(248,113,113,0.15)' : 'var(--bg-3)',
                    color: isFav ? '#F87171' : 'var(--text-2)',
                  }}
                >
                  <Heart size={18} fill={isFav ? '#F87171' : 'none'} />
                </button>
                <button className="btn-icon" style={{ background: 'var(--bg-3)' }}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Story */}
          <div style={{ padding: '20px 16px' }}>
            <div className="glass-card animate-fade-up" style={{ padding: '20px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: active.color, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} /> القصة
              </h3>
              <p style={{ fontSize: '15px', lineHeight: 2, color: 'var(--text-1)', textAlign: 'right', direction: 'rtl' }}>
                {active.desc}
              </p>
            </div>

            <div className="glass-card animate-fade-up delay-1" style={{ padding: '20px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gold-5)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Book size={16} /> من القرآن الكريم
              </h3>
              <p className="font-quran" style={{ fontSize: '17px', lineHeight: 2, color: 'var(--text-0)', textAlign: 'right', direction: 'rtl' }}>
                ذكر الله قصة {active.name} في القرآن الكريم في مواضع عدة، تتضمن دروساً عظيمة في الصبر والإيمان والتوكل على الله.
              </p>
            </div>

            <div className="glass-card animate-fade-up delay-2" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--green-5)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} /> الدروس المستفادة
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', lineHeight: 2 }}>
                <li>✨ الصبر والثبات على الحق</li>
                <li>✨ التوكل على الله في الشدائد</li>
                <li>✨ الدعوة بالحكمة والموعظة الحسنة</li>
                <li>✨ الإيمان بقضاء الله وقدره</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-safe pb-nav">
      <div className="container-app" style={{ padding: '0 16px' }}>
        {/* Header */}
        <div className="animate-fade-down" style={{ paddingTop: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <button onClick={() => router.back()} style={{ padding: '8px', color: 'var(--text-1)' }}>
              <ArrowRight size={22} />
            </button>
            <h1 className="text-gradient-gold" style={{ fontSize: '24px', fontWeight: 900 }}>
              📚 قصص الأنبياء
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginRight: '46px' }}>
            25 نبياً ذكرهم القرآن الكريم
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          {PROPHETS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className={`animate-fade-up delay-${Math.min(i % 8, 8)}`}
              style={{
                background: `linear-gradient(135deg, ${p.color}15, transparent)`,
                border: `1px solid ${p.color}33`,
                borderRadius: 'var(--r-lg)',
                padding: '18px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: '90px', height: '90px',
                borderRadius: '50%',
                background: p.color,
                opacity: 0.06,
              }} />
              <div style={{
                fontSize: '40px',
                marginBottom: '8px',
                filter: `drop-shadow(0 0 12px ${p.color}66)`,
              }}>
                {p.icon}
              </div>
              <div className="font-quran" style={{ fontSize: '17px', color: p.color, fontWeight: 700 }}>
                {p.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '4px', minHeight: '28px' }}>
                {p.summary}
              </div>
            </button>
          ))}
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}
