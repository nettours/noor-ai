'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Plus, Send,
  X, Smile, ImageIcon
} from 'lucide-react';

interface Comment {
  id: string;
  userName: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

interface Post {
  id: string;
  userName: string;
  avatar: string;
  time: string;
  type: 'text' | 'ayah' | 'hadith' | 'dua';
  content: string;
  ref?: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    userName: 'أحمد محمد',
    avatar: 'أ',
    time: 'منذ 5 دقائق',
    type: 'ayah',
    content: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    ref: 'سورة الطلاق — 2-3',
    likes: 142,
    liked: false,
    comments: [
      { id: 'c1', userName: 'فاطمة', avatar: 'ف', text: 'بارك الله فيك، آية عظيمة 💚', time: 'منذ دقيقة', likes: 12, liked: false },
      { id: 'c2', userName: 'يوسف', avatar: 'ي', text: 'جزاك الله خيراً على المشاركة', time: 'منذ دقيقتين', likes: 5, liked: false },
    ],
  },
  {
    id: '2',
    userName: 'فاطمة الزهراء',
    avatar: 'ف',
    time: 'منذ ساعة',
    type: 'dua',
    content: 'اللهم اجعل القرآن ربيع قلوبنا، ونور صدورنا، وجلاء أحزاننا، وذهاب همومنا وغمومنا',
    likes: 89,
    liked: true,
    comments: [
      { id: 'c3', userName: 'مريم', avatar: 'م', text: '🤲 آمين يا رب', time: 'منذ نصف ساعة', likes: 23, liked: false },
    ],
  },
  {
    id: '3',
    userName: 'يوسف بن خالد',
    avatar: 'ي',
    time: 'منذ 3 ساعات',
    type: 'hadith',
    content: 'قال النبي ﷺ: «من قال سبحان الله وبحمده في يوم مائة مرة حُطّت خطاياه وإن كانت مثل زبد البحر»',
    ref: 'متفق عليه',
    likes: 256,
    liked: false,
    comments: [],
  },
  {
    id: '4',
    userName: 'مريم العزيز',
    avatar: 'م',
    time: 'منذ 5 ساعات',
    type: 'text',
    content: 'لا تنسوا الاستغفار اليوم 🤲 فيه فرج كل ضيق، وحلّ كل عقدة. أكثروا من «أستغفر الله» وستجدون أثرها بإذن الله.',
    likes: 178,
    liked: false,
    comments: [],
  },
];

const TYPE_STYLE: Record<string, any> = {
  ayah: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', label: '📖 آية', color: 'var(--green-5)' },
  hadith: { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', label: '📜 حديث', color: 'var(--gold-5)' },
  dua: { bg: 'rgba(147,51,234,0.08)', border: 'rgba(147,51,234,0.25)', label: '🤲 دعاء', color: 'var(--purple-5)' },
  text: { bg: 'rgba(59,130,246,0.05)', border: 'var(--border-2)', label: '💬 منشور', color: 'var(--blue-5)' },
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'all'|'ayah'|'hadith'|'dua'>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'text'|'ayah'|'hadith'|'dua'>('text');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Load + save
  useEffect(() => {
    try {
      const saved = localStorage.getItem('noor_community_posts');
      if (saved) setPosts(JSON.parse(saved));
      else setPosts(INITIAL_POSTS);
    } catch {
      setPosts(INITIAL_POSTS);
    }
  }, []);

  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem('noor_community_posts', JSON.stringify(newPosts));
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.type === filter);

  const toggleLike = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(30);
    savePosts(posts.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    savePosts(posts.map(p => p.id === postId
      ? {
          ...p,
          comments: p.comments.map(c => c.id === commentId
            ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
            : c
          )
        }
      : p
    ));
  };

  const submitPost = () => {
    if (!newPost.trim()) return;
    try {
      const user = JSON.parse(localStorage.getItem('noor_user') || '{}');
      const post: Post = {
        id: Date.now().toString(),
        userName: user.name || 'مستخدم',
        avatar: (user.name || 'م')[0],
        time: 'الآن',
        type: postType,
        content: newPost,
        likes: 0,
        liked: false,
        comments: [],
      };
      savePosts([post, ...posts]);
    } catch {}
    setNewPost('');
    setShowCompose(false);
    setPostType('text');
  };

  const submitComment = (postId: string) => {
    if (!commentText.trim()) return;
    try {
      const user = JSON.parse(localStorage.getItem('noor_user') || '{}');
      const comment: Comment = {
        id: Date.now().toString(),
        userName: user.name || 'مستخدم',
        avatar: (user.name || 'م')[0],
        text: commentText,
        time: 'الآن',
        likes: 0,
        liked: false,
      };
      savePosts(posts.map(p => p.id === postId
        ? { ...p, comments: [...p.comments, comment] }
        : p
      ));
      setCommentText('');
    } catch {}
  };

  return (
    <div className="pt-safe pb-nav">
      <div className="container-app" style={{ padding: '0 16px' }}>
        {/* Header */}
        <header className="animate-fade-down" style={{
          paddingTop: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900 }}>👥 المجتمع</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
              تشارك الخير مع إخوانك
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/chat" className="btn btn-ghost btn-icon">
              <MessageCircle size={20} />
            </Link>
            <button onClick={() => setShowCompose(!showCompose)} className="btn btn-primary btn-icon">
              <Plus size={20} />
            </button>
          </div>
        </header>

        {/* Filter */}
        <div className="animate-fade-up delay-1" style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '16px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}>
          {[
            { id: 'all', label: 'الكل', icon: '🌟' },
            { id: 'ayah', label: 'آيات', icon: '📖' },
            { id: 'hadith', label: 'أحاديث', icon: '📜' },
            { id: 'dua', label: 'أدعية', icon: '🤲' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: filter === t.id ? 'rgba(16,185,129,0.18)' : 'var(--bg-3)',
                border: `1px solid ${filter === t.id ? 'var(--green-4)' : 'var(--border-2)'}`,
                color: filter === t.id ? 'var(--green-5)' : 'var(--text-3)',
                cursor: 'pointer',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Compose */}
        {showCompose && (
          <div className="glass-card animate-scale-in" style={{ padding: '16px', marginBottom: '16px' }}>
            {/* Type selector */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {Object.entries(TYPE_STYLE).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setPostType(k as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '14px',
                    fontSize: '12px',
                    background: postType === k ? v.bg.replace('0.05', '0.2').replace('0.08', '0.2') : 'var(--bg-4)',
                    border: `1px solid ${postType === k ? v.color : 'var(--border-2)'}`,
                    color: postType === k ? v.color : 'var(--text-3)',
                    cursor: 'pointer',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="اكتب شيئاً نافعاً... ✍️"
              rows={3}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-0)',
                fontSize: '14px',
                resize: 'none',
                direction: 'rtl',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-4)' }}>
                {newPost.length}/280
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setShowCompose(false); setNewPost(''); }} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  إلغاء
                </button>
                <button onClick={submitPost} disabled={!newPost.trim()} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '12px', opacity: !newPost.trim() ? 0.5 : 1 }}>
                  <Send size={14} />
                  نشر
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((post, i) => {
            const style = TYPE_STYLE[post.type];
            const isExpanded = activePostId === post.id;
            return (
              <article key={post.id} className={`animate-fade-up delay-${Math.min(i + 1, 8)}`} style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: 'var(--r-lg)',
                padding: '14px 16px',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '38px', height: '38px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${style.color}, ${style.color}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', fontWeight: 900,
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {post.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{post.userName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-4)' }}>{post.time}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: style.color, fontWeight: 700 }}>
                    {style.label}
                  </span>
                </div>

                {/* Content */}
                <div
                  className={post.type === 'ayah' || post.type === 'hadith' ? 'font-quran' : ''}
                  style={{
                    fontSize: post.type === 'ayah' || post.type === 'hadith' ? '18px' : '14px',
                    lineHeight: post.type === 'ayah' || post.type === 'hadith' ? 2 : 1.8,
                    color: 'var(--text-0)',
                    direction: 'rtl',
                    textAlign: 'right',
                  }}
                >
                  {post.content}
                </div>

                {post.ref && (
                  <div style={{
                    fontSize: '11px',
                    color: style.color,
                    marginTop: '8px',
                    textAlign: 'right',
                    fontWeight: 600,
                  }}>
                    ◈ {post.ref}
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-2)',
                }}>
                  <button
                    onClick={() => toggleLike(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: post.liked ? '#F87171' : 'var(--text-3)',
                      fontSize: '12px',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Heart size={18} fill={post.liked ? '#F87171' : 'none'} />
                    {post.likes}
                  </button>
                  <button
                    onClick={() => setActivePostId(isExpanded ? null : post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: isExpanded ? 'var(--green-5)' : 'var(--text-3)',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <MessageCircle size={18} />
                    {post.comments.length}
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-3)',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginRight: 'auto',
                  }}>
                    <Share2 size={18} />
                  </button>
                </div>

                {/* Comments */}
                {isExpanded && (
                  <div className="animate-fade-up" style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-2)',
                  }}>
                    {/* Existing comments */}
                    {post.comments.length > 0 && (
                      <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {post.comments.map(c => (
                          <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                            <div style={{
                              width: '30px', height: '30px',
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${style.color}, ${style.color}88)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 900,
                              color: '#fff',
                              flexShrink: 0,
                            }}>
                              {c.avatar}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                background: 'var(--bg-3)',
                                padding: '8px 12px',
                                borderRadius: '14px',
                                border: '1px solid var(--border-1)',
                              }}>
                                <div style={{ fontSize: '12px', fontWeight: 700 }}>{c.userName}</div>
                                <div style={{ fontSize: '13px', marginTop: '2px', direction: 'rtl', textAlign: 'right' }}>{c.text}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '14px', marginTop: '4px', fontSize: '11px', color: 'var(--text-4)' }}>
                                <span>{c.time}</span>
                                <button
                                  onClick={() => toggleCommentLike(post.id, c.id)}
                                  style={{
                                    color: c.liked ? '#F87171' : 'var(--text-4)',
                                    fontWeight: c.liked ? 700 : 400,
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                  }}
                                >
                                  <Heart size={11} fill={c.liked ? '#F87171' : 'none'} />
                                  إعجاب {c.likes > 0 && `(${c.likes})`}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment input */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      background: 'var(--bg-3)',
                      borderRadius: '20px',
                      padding: '6px 6px 6px 14px',
                      border: '1px solid var(--border-2)',
                    }}>
                      <input
                        type="text"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') submitComment(post.id); }}
                        placeholder="اكتب تعليقاً..."
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-0)',
                          fontSize: '13px',
                          direction: 'rtl',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        disabled={!commentText.trim()}
                        style={{
                          width: '32px', height: '32px',
                          borderRadius: '50%',
                          background: commentText.trim() ? 'var(--green-4)' : 'var(--bg-4)',
                          color: commentText.trim() ? '#fff' : 'var(--text-4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}
