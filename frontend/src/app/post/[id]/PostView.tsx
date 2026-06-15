'use client';

import Link from 'next/link';
import { Heart, Share2, ArrowLeft, Sparkles } from 'lucide-react';
import { shareContent } from '@/lib/share';

export interface SharedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorColor: string;
  category: string;
  text: string;
  kind?: string;
  mediaUrl?: string;
  likeCount: number;
  createdAt: string;
}

export function PostView({ post }: { post: SharedPost | null }) {
  if (!post) {
    return (
      <div style={wrap}>
        <div className="glass-card" style={{ padding: 30, textAlign: 'center', maxWidth: 460 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🌙</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>هذا التأمّل لم يعد متاحًا</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 22 }}>
            ربما حُذف أو انتهت صلاحيته. تصفّح تأمّلات أخرى من مجتمع نور.
          </p>
          <Link href="/feed" style={primaryBtn}>تصفّح التأمّلات <ArrowLeft size={16} /></Link>
        </div>
      </div>
    );
  }

  const isQuran = post.category === 'آية';
  const share = () =>
    shareContent({
      text: `${post.text}\n\n— ${post.authorName} عبر نور AI 🌙`,
      title: `تأمّل · ${post.authorName}`,
      // current page = the content-specific permalink
    });

  return (
    <div style={wrap}>
      <article className="glass-card" style={{ padding: 26, width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            backgroundImage: `linear-gradient(135deg, ${post.authorColor}, ${post.authorColor}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 19, fontWeight: 900, color: '#fff',
          }}>{post.authorAvatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-0)' }}>{post.authorName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-4)' }}>عضو في نور AI</div>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
            background: `${post.authorColor}1f`, color: post.authorColor,
          }}>{post.category}</span>
        </div>

        {post.mediaUrl && post.kind === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.mediaUrl} alt="" style={{ width: '100%', borderRadius: 16, display: 'block' }} />
        )}
        {post.mediaUrl && post.kind === 'video' && (
          <video src={post.mediaUrl} controls playsInline autoPlay muted loop style={{ width: '100%', borderRadius: 16, display: 'block', background: '#000', maxHeight: '70vh' }} />
        )}

        <p
          className={isQuran ? 'font-quran' : undefined}
          style={{
            margin: 0, color: isQuran ? 'var(--gold-7)' : 'var(--text-1)',
            fontSize: isQuran ? 24 : 17, lineHeight: isQuran ? 2.1 : 1.9,
            textAlign: isQuran ? 'center' : 'right',
          }}
        >
          {post.text}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 6, borderTop: '1px solid var(--border-2)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: 14 }}>
            <Heart size={17} color="#F87171" fill="#F87171" /> {post.likeCount}
          </span>
          <button onClick={share} style={ghostBtn}>
            <Share2 size={16} /> مشاركة
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
            {new Date(post.createdAt).toLocaleDateString('ar')}
          </span>
        </div>
      </article>

      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/auth/login?tab=register" style={primaryBtn}>
          <Sparkles size={16} /> انضمّ وشارك تأمّلك
        </Link>
        <Link href="/" style={ghostLink}>الصفحة الرئيسية</Link>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: '100dvh', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', padding: '40px 18px',
};
const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px',
  borderRadius: 14, fontWeight: 800, fontSize: 15, color: '#fff',
  backgroundImage: 'linear-gradient(135deg, var(--green-3), var(--green-5))',
  boxShadow: '0 14px 36px rgba(16,185,129,0.4)',
};
const ghostBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  borderRadius: 999, fontWeight: 700, fontSize: 13, color: 'var(--text-1)',
  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-2)', cursor: 'pointer',
};
const ghostLink: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '13px 22px',
  borderRadius: 14, fontWeight: 700, fontSize: 15, color: '#fff',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
};
