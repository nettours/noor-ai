'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Heart, Share2, Volume2, Pause, Plus,
  Sparkles, Trash2, Play, Loader2
} from 'lucide-react';
import { shareContent } from '@/lib/share';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorColor: string;
  kind: 'text' | 'image' | 'video';
  text: string;
  mediaUrl?: string;
  category: string;
  gradient: [string, string];
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
  createdAt: string;
}

export default function FeedPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const loadFeed = useCallback((token: string) => {
    fetch(API + '/feed', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => { if (d.success) setPosts(d.posts); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ ...u, token });
      loadFeed(token);
    } catch { router.push('/auth/login'); }
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  // تشغيل/إيقاف الفيديو حسب البطاقة النشطة
  const onScroll = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const idx = Math.round(c.scrollTop / c.clientHeight);
    if (idx !== active) {
      setActive(idx);
      window.speechSynthesis?.cancel();
      setSpeaking(null);
      // أوقف كل الفيديوهات وشغّل النشط
      Object.entries(videoRefs.current).forEach(([id, vid]) => {
        if (!vid) return;
        if (posts[idx]?.id === id) { vid.play().catch(() => {}); }
        else { vid.pause(); }
      });
    }
  }, [active, posts]);

  const toggleLike = async (post: Post) => {
    // تفاؤلي
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
      : p));
    try {
      await fetch(API + `/feed/${post.id}/like`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + me.token },
      });
    } catch {}
  };

  const deletePost = async (post: Post) => {
    if (!confirm('حذف هذا المنشور؟')) return;
    setPosts(prev => prev.filter(p => p.id !== post.id));
    try {
      await fetch(API + `/feed/${post.id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + me.token },
      });
    } catch {}
  };

  const share = async (post: Post) => {
    const text = `${post.text}\n\n— ${post.authorName} عبر نور AI 🌙`;
    const ok = await shareContent({ text });
    if (ok && !(navigator as any).share) alert('تم نسخ المحتوى والرابط 📋');
  };

  const speak = (post: Post) => {
    if (!post.text) return;
    const synth = window.speechSynthesis;
    if (!synth) { alert('متصفحك لا يدعم الصوت'); return; }

    // إذا نفس المنشور يتكلّم → أوقفه
    if (speaking === post.id) {
      synth.cancel();
      setSpeaking(null);
      return;
    }

    // أوقف أي صوت سابق تماماً
    synth.cancel();

    // مهلة قصيرة لضمان إلغاء الصوت السابق قبل البدء (إصلاح "أول واحد فقط")
    setTimeout(() => {
      const chunks = post.text.match(/[^.!?،\n]+[.!?،\n]*/g)?.filter(c => c.trim()) || [post.text];
      let idx = 0;
      const speakChunk = () => {
        if (idx >= chunks.length) { setSpeaking(null); return; }
        const u = new SpeechSynthesisUtterance(chunks[idx].trim());
        u.lang = 'ar-SA';
        u.rate = 0.85;
        u.onend = () => { idx++; speakChunk(); };
        u.onerror = () => { idx++; speakChunk(); }; // تابع رغم الخطأ
        synth.speak(u);
      };
      setSpeaking(post.id);
      speakChunk();
    }, 120);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'الآن';
    if (m < 60) return `قبل ${m} د`;
    const h = Math.floor(m / 60);
    if (h < 24) return `قبل ${h} س`;
    return `قبل ${Math.floor(h / 24)} يوم`;
  };

  if (!me || loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <Loader2 size={40} color="#EC4899" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 16px 14px',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)',
        pointerEvents: 'none',
      }}>
        <button onClick={() => router.push('/home')} style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', pointerEvents: 'auto',
        }}>
          <ArrowRight size={20} />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#FBBF24" />
          <span style={{ fontSize: '17px', fontWeight: 900, color: '#fff' }}>تأمّلات نور</span>
        </div>
        <button onClick={() => router.push('/feed/create')} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '999px',
          background: 'linear-gradient(135deg, #EC4899, #BE185D)',
          border: 'none', color: '#fff', fontSize: '13px', fontWeight: 800,
          cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 4px 16px rgba(236,72,153,0.5)',
        }}>
          <Plus size={16} /> انشر
        </button>
      </div>

      {posts.length === 0 ? (
        <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌙</div>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>لا توجد منشورات بعد</h2>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>كن أول من ينشر تأمّلاً يبهر القلوب</p>
          <button onClick={() => router.push('/feed/create')} style={{
            padding: '14px 28px', borderRadius: '999px',
            background: 'linear-gradient(135deg, #EC4899, #BE185D)',
            border: 'none', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: 'pointer',
          }}>
            ✍️ انشر أول تأمّل
          </button>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={onScroll}
          style={{ height: '100dvh', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
          className="feed-scroll"
        >
          {posts.map((post, i) => {
            const isSpeaking = speaking === post.id;
            return (
              <div key={post.id} style={{
                height: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always',
                position: 'relative', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', padding: '0 24px',
                background: post.kind === 'text'
                  ? `linear-gradient(160deg, ${post.gradient[0]}, ${post.gradient[1]})`
                  : '#000',
                overflow: 'hidden',
              }}>
                {/* وسائط: صورة أو فيديو خلفية */}
                {post.kind === 'image' && post.mediaUrl && (
                  <img src={post.mediaUrl} alt="" style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', opacity: 0.85,
                  }} />
                )}
                {post.kind === 'video' && post.mediaUrl && (
                  <video
                    ref={el => { videoRefs.current[post.id] = el; }}
                    src={post.mediaUrl}
                    loop muted={false} playsInline
                    autoPlay={i === 0}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onClick={(e) => {
                      const v = e.currentTarget;
                      v.paused ? v.play() : v.pause();
                    }}
                  />
                )}
                {/* تعتيم للصور/الفيديو لقراءة النص */}
                {post.kind !== 'text' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7))' }} />
                )}

                {/* زخرفة للنص */}
                {post.kind === 'text' && (
                  <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '60%', height: '40%', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(60px)' }} />
                )}

                {/* تصنيف */}
                <div style={{
                  position: 'relative', marginBottom: '24px',
                  padding: '8px 18px', background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)', borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: '13px', fontWeight: 800, color: '#fff',
                }}>
                  {post.category}
                </div>

                {/* النص */}
                {post.text && (
                  <p style={{
                    position: 'relative',
                    fontFamily: 'Amiri, serif',
                    fontSize: post.kind === 'text' ? 'clamp(24px, 5.5vw, 38px)' : 'clamp(20px, 5vw, 30px)',
                    fontWeight: 700, lineHeight: 1.9, textAlign: 'center',
                    color: '#fff', marginBottom: '20px', direction: 'rtl',
                    textShadow: '0 2px 20px rgba(0,0,0,0.5)', maxWidth: '600px',
                  }}>
                    {post.text}
                  </p>
                )}

                {/* معلومات الناشر (أسفل يسار) */}
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)',
                  left: '16px', right: '90px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${post.authorColor}, ${post.authorColor}aa)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 900, color: '#fff', flexShrink: 0,
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}>{post.authorAvatar}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {post.authorName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                      {timeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>

                {/* أزرار التفاعل (يمين) */}
                <div style={{
                  position: 'absolute', right: '16px',
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)',
                  display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center',
                }}>
                  <button onClick={() => toggleLike(post)} style={actionBtn}>
                    <Heart size={28} fill={post.likedByMe ? '#EF4444' : 'none'} color={post.likedByMe ? '#EF4444' : '#fff'} style={{ transition: 'all 0.2s' }} />
                    <span style={actionLabel}>{post.likeCount}</span>
                  </button>

                  {post.text && (
                    <button onClick={() => speak(post)} style={actionBtn}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: isSpeaking ? 'rgba(103,232,249,0.3)' : 'rgba(255,255,255,0.12)',
                        border: isSpeaking ? '2px solid #67E8F9' : '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        animation: isSpeaking ? 'pulse 1.5s infinite' : 'none',
                      }}>
                        {isSpeaking ? <Pause size={22} color="#67E8F9" /> : <Volume2 size={22} color="#fff" />}
                      </div>
                      <span style={actionLabel}>استماع</span>
                    </button>
                  )}

                  <button onClick={() => share(post)} style={actionBtn}>
                    <Share2 size={26} color="#fff" />
                    <span style={actionLabel}>مشاركة</span>
                  </button>

                  {post.isMine && (
                    <button onClick={() => deletePost(post)} style={actionBtn}>
                      <Trash2 size={24} color="#fff" />
                      <span style={actionLabel}>حذف</span>
                    </button>
                  )}
                </div>

                {i === 0 && active === 0 && posts.length > 1 && (
                  <div style={{
                    position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)',
                    left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    color: 'rgba(255,255,255,0.6)', animation: 'bounce 2s infinite',
                  }}>
                    <span style={{ fontSize: '11px' }}>اسحب للأعلى</span>
                    <span style={{ fontSize: '18px' }}>↑</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .feed-scroll::-webkit-scrollbar { display: none; }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes bounce { 0%,100% { transform: translate(-50%,0); } 50% { transform: translate(-50%,-10px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: 0,
};
const actionLabel: React.CSSProperties = {
  fontSize: '11px', color: '#fff', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.5)',
};
