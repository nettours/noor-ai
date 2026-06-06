import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoShell } from '@/components/legal/InfoShell';

export const metadata: Metadata = {
  title: 'عن نور AI',
  description:
    'نور AI منصة إسلامية ذكية متكاملة: القرآن الكريم، مساعد ذكاء اصطناعي، مواقيت الصلاة، القبلة، الأذكار، ومجتمع المؤمنين — من تطوير SNetProDz.',
};

const FEATURES = [
  { icon: '📖', title: 'القرآن الكريم', desc: '١١٤ سورة كاملة بأصوات ٦ من أعظم القرّاء، مع التفسير والإشارات المرجعية.' },
  { icon: '🤖', title: 'مساعد ذكي', desc: 'ذكاء اصطناعي يجيبك في التفسير والفقه والأحاديث بأدب وعلم.' },
  { icon: '🕌', title: 'الصلاة والقبلة', desc: 'مواقيت دقيقة حسب موقعك، تنبيه الأذان، وبوصلة قبلة عالية الدقة.' },
  { icon: '📿', title: 'الأذكار والتسبيح', desc: 'حصن المسلم كاملًا، وسبحة رقمية ذكية مع إحصائيات يومية.' },
  { icon: '🌙', title: 'تأمّلات نور', desc: 'مجتمع يشارك الآيات والأدعية والخواطر التي تُلامس القلوب.' },
  { icon: '🎯', title: 'تحديات يومية', desc: 'عادات روحانية يومية مع نقاط وإنجازات تحفّزك على الاستمرار.' },
];

export default function AboutPage() {
  return (
    <InfoShell
      title="عن نور AI"
      subtitle="رفيقك الذكي في طريق الإيمان — منصة إسلامية عصرية تجمع العلم والعبادة والمجتمع في مكان واحد."
    >
      {/* Story */}
      <section className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#fff' }}>رسالتنا</h2>
        <p style={{ fontSize: 15, lineHeight: 2, color: 'var(--text-2)' }}>
          أنشأنا <strong style={{ color: '#fff' }}>نور AI</strong> لنجعل كل ما يُقرّب المسلم إلى الله بين يديه:
          قرآنٌ يُتلى، علمٌ يُسأل عنه، صلاةٌ لا تفوت، وذكرٌ لا ينقطع — بتجربة عصرية أنيقة وسريعة،
          تحترم خصوصيتك وتخدم إيمانك. نؤمن أن التقنية حين تُسخَّر للخير، تصبح بابًا من أبواب الأجر.
        </p>
      </section>

      {/* Features grid */}
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#fff', textAlign: 'center' }}>
        ماذا تجد في نور AI؟
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 32 }}>
        {FEATURES.map((f) => (
          <div key={f.title} className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.8 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Maker */}
      <section className="glass-card" style={{ padding: 24, marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>من تطوير وتصميم</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>ساخي عبد الرحمن</div>
        <div style={{ fontSize: 14, color: 'var(--text-3)', direction: 'ltr', marginBottom: 14 }}>Sakhi Abderrahmane</div>
        <a href="https://www.snetprodz.com" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.14), rgba(217,119,6,0.10))',
          border: '1px solid rgba(255,255,255,0.12)', fontWeight: 800, direction: 'ltr',
        }}>
          <span style={{ color: '#F5F1E8' }}>SNet</span><span style={{ color: '#FBBF24' }}>Pro</span><span style={{ color: '#34D399' }}>Dz</span>
          <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>· snetprodz.com</span>
        </a>
      </section>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <Link href="/auth/login?tab=register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 34px', borderRadius: 14,
          fontWeight: 800, fontSize: 16, color: '#fff',
          backgroundImage: 'linear-gradient(135deg, #047857, #10B981)',
          boxShadow: '0 16px 40px rgba(16,185,129,0.4)',
        }}>
          ✨ ابدأ رحلتك مع نور AI
        </Link>
      </div>
    </InfoShell>
  );
}
