'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowLeft } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

interface Reflection {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorColor: string;
  category: string;
  text: string;
  likeCount: number;
  isQuran?: boolean;
}

// Curated fallback so visitors ALWAYS see beautiful content, even when the
// backend feed is private/unreachable. Replaced by live posts when available.
const FALLBACK: Reflection[] = [
  { id: 'f1', authorName: 'أحمد المصري', authorAvatar: 'أ', authorColor: '#10B981', category: 'آية', isQuran: true, text: '﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا • وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ﴾', likeCount: 142 },
  { id: 'f2', authorName: 'فاطمة الزهراء', authorAvatar: 'ف', authorColor: '#EC4899', category: 'دعاء', text: 'اللهم اجعل القرآن ربيع قلوبنا، ونور صدورنا، وجلاء أحزاننا، وذهاب همومنا وغمومنا 🤲', likeCount: 98 },
  { id: 'f3', authorName: 'يوسف عبد الله', authorAvatar: 'ي', authorColor: '#A855F7', category: 'خاطرة', text: 'حين تضيق بك الدنيا، تذكّر أن مع كل سجدة قُربًا، ومع كل دعاء فرجًا. لا تيأس من رحمة الله.', likeCount: 76 },
  { id: 'f4', authorName: 'مريم حسن', authorAvatar: 'م', authorColor: '#FBBF24', category: 'آية', isQuran: true, text: '﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾', likeCount: 211 },
  { id: 'f5', authorName: 'عبد الرحمن', authorAvatar: 'ع', authorColor: '#60A5FA', category: 'حكمة', text: 'الصبر مفتاح الفرج، والشكر مفتاح المزيد، والدعاء سلاح المؤمن. اجمعها تجمع خيري الدنيا والآخرة.', likeCount: 64 },
  { id: 'f6', authorName: 'خديجة', authorAvatar: 'خ', authorColor: '#34D399', category: 'دعاء', text: 'ربِّ اشرح لي صدري ويسّر لي أمري، واجعل لي من كل همٍّ فرجًا، ومن كل ضيقٍ مخرجًا.', likeCount: 153 },
];

export function Reflections() {
  const [items, setItems] = useState<Reflection[]>(FALLBACK);

  useEffect(() => {
    let alive = true;
    // Public read attempt (no auth). If the backend allows it, show real posts.
    fetch(`${API}/feed`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const posts = d?.posts;
        if (d?.success && Array.isArray(posts) && posts.length) {
          const mapped: Reflection[] = posts
            .filter((p: any) => p?.text && (p.kind === 'text' || !p.kind))
            .slice(0, 6)
            .map((p: any) => ({
              id: p.id,
              authorName: p.authorName || 'عضو نور',
              authorAvatar: p.authorAvatar || (p.authorName || 'ن').charAt(0),
              authorColor: p.authorColor || '#10B981',
              category: p.category || 'خاطرة',
              text: p.text,
              likeCount: p.likeCount || 0,
              isQuran: p.category === 'آية',
            }));
          if (mapped.length) setItems(mapped);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section style={{ padding: '90px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 16px', borderRadius: 999,
          background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(251,191,36,0.28)',
          color: 'var(--gold-6)', fontSize: 13, fontWeight: 700, marginBottom: 18,
        }}>
          🌙 تأمّلات نور
        </div>
        <h2 style={{ fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12 }}>
          خواطر تُلامس <span className="text-gradient-gold">القلوب</span>
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>
          آيات، أدعية، وخواطر يشاركها مجتمع نور كل يوم. اقرأها الآن، وانضمّ لتشارك تأمّلك مع الآلاف.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {items.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3) }}
            className="glass-card"
            style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                backgroundImage: `linear-gradient(135deg, ${r.authorColor}, ${r.authorColor}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 900, color: '#fff',
              }}>{r.authorAvatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{r.authorName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-4)' }}>عضو في نور AI</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                background: `${r.authorColor}1f`, color: r.authorColor,
              }}>{r.category}</span>
            </div>

            <p
              className={r.isQuran ? 'font-quran' : undefined}
              style={{
                flex: 1, margin: 0, color: r.isQuran ? 'var(--gold-7)' : 'var(--text-2)',
                fontSize: r.isQuran ? 19 : 15, lineHeight: r.isQuran ? 2 : 1.85,
                textAlign: r.isQuran ? 'center' : 'right',
                display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {r.text}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-4)', fontSize: 13 }}>
              <Heart size={15} color="#F87171" fill="#F87171" />
              <span>{r.likeCount}</span>
            </div>
          </motion.article>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/auth/login?tab=register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 30px', borderRadius: 14, fontWeight: 800, fontSize: 15, color: '#fff',
          backgroundImage: 'linear-gradient(135deg, var(--gold-3), var(--gold-5))',
          boxShadow: '0 16px 40px rgba(217,119,6,0.4)',
        }}>
          <Sparkles size={18} /> شارك تأمّلك الآن
        </Link>
        <Link href="/feed" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 26px', borderRadius: 14, fontWeight: 700, fontSize: 15, color: '#fff',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        }}>
          تصفّح المزيد <ArrowLeft size={16} />
        </Link>
      </div>
    </section>
  );
}
