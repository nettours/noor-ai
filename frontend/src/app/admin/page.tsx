'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Users, FileText, Home, Radio, Trash2,
  Loader2, TrendingUp, UserCheck, MessageSquare, Phone, Send, ShieldAlert
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

type Tab = 'stats' | 'users' | 'posts' | 'rooms' | 'broadcast';

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sending, setSending] = useState(false);

  const authHeaders = (token: string) => ({ Authorization: 'Bearer ' + token });

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ ...u, token });
      // تحقّق أدمن
      fetch(API + '/admin/stats', { headers: authHeaders(token) })
        .then(r => { setAuthorized(r.ok); return r.ok ? r.json() : null; })
        .then(d => { if (d?.success) setStats(d.stats); })
        .catch(() => setAuthorized(false));
    } catch { router.push('/auth/login'); }
  }, []);

  const loadTab = async (target: Tab) => {
    setTab(target);
    if (!me?.token) return;
    setLoading(true);
    try {
      if (target === 'users') {
        const d = await (await fetch(API + '/admin/users', { headers: authHeaders(me.token) })).json();
        if (d.success) setUsers(d.users);
      } else if (target === 'posts') {
        const d = await (await fetch(API + '/admin/posts', { headers: authHeaders(me.token) })).json();
        if (d.success) setPosts(d.posts);
      } else if (target === 'rooms') {
        const d = await (await fetch(API + '/admin/rooms', { headers: authHeaders(me.token) })).json();
        if (d.success) setRooms(d.rooms);
      }
    } catch {}
    setLoading(false);
  };

  const deleteUser = async (id: string) => {
    if (!confirm('حذف هذا المستخدم نهائياً؟')) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    try { await fetch(API + '/admin/users/' + id, { method: 'DELETE', headers: authHeaders(me.token) }); } catch {}
  };

  const deletePost = async (id: string) => {
    if (!confirm('حذف هذا المنشور؟')) return;
    setPosts(prev => prev.filter(p => p.id !== id));
    try { await fetch(API + '/admin/posts/' + id, { method: 'DELETE', headers: authHeaders(me.token) }); } catch {}
  };

  const broadcast = async () => {
    if (!broadcastMsg.trim()) return;
    if (!confirm('إرسال هذه الرسالة لكل الغرف؟')) return;
    setSending(true);
    try {
      const d = await (await fetch(API + '/admin/broadcast', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(me.token) },
        body: JSON.stringify({ message: broadcastMsg.trim() }),
      })).json();
      if (d.success) { alert(`تم الإرسال إلى ${d.sentTo} غرفة ✅`); setBroadcastMsg(''); }
    } catch { alert('فشل الإرسال'); }
    setSending(false);
  };

  const timeAgo = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // تحميل / تحقّق
  if (authorized === null) {
    return (
      <div style={{ minHeight: '100dvh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="#FBBF24" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // غير مصرّح
  if (!authorized) {
    return (
      <div style={{ minHeight: '100dvh', background: '#030712', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '16px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldAlert size={40} color="#EF4444" />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>غير مصرّح</h1>
        <p style={{ fontSize: '14px', color: '#9CA3AF', maxWidth: '300px', lineHeight: 1.7 }}>
          هذه اللوحة للمدير فقط. إذا كنت المدير، تأكّد من ضبط ADMIN_EMAIL في Railway بنفس بريد حسابك.
        </p>
        <button onClick={() => router.push('/home')} style={{
          padding: '14px 28px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, cursor: 'pointer',
        }}>العودة للرئيسية</button>
      </div>
    );
  }

  const STAT_CARDS = stats ? [
    { label: 'المستخدمون', value: stats.totalUsers, icon: Users, color: '#10B981' },
    { label: 'متصل الآن', value: stats.online, icon: UserCheck, color: '#34D399' },
    { label: 'مسجّلون', value: stats.registered, icon: TrendingUp, color: '#67E8F9' },
    { label: 'ضيوف', value: stats.guests, icon: Users, color: '#A855F7' },
    { label: 'المنشورات', value: stats.feedPosts, icon: FileText, color: '#EC4899' },
    { label: 'الغرف', value: stats.rooms, icon: Home, color: '#FBBF24' },
    { label: 'رسائل الغرف', value: stats.roomMessages, icon: MessageSquare, color: '#FB923C' },
    { label: 'مكالمات نشطة', value: stats.activeCalls, icon: Phone, color: '#F87171' },
  ] : [];

  const TABS: { k: Tab; label: string; icon: any }[] = [
    { k: 'stats', label: 'إحصائيات', icon: TrendingUp },
    { k: 'users', label: 'المستخدمون', icon: Users },
    { k: 'posts', label: 'المنشورات', icon: FileText },
    { k: 'rooms', label: 'الغرف', icon: Home },
    { k: 'broadcast', label: 'إشعار جماعي', icon: Radio },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: '#030712', color: '#fff' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 16px 110px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <button onClick={() => router.push('/home')} style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              👑 لوحة التحكّم
            </h1>
            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>إدارة منصة نور AI</p>
          </div>
        </header>

        {/* التبويبات */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.k;
            return (
              <button key={t.k} onClick={() => loadTab(t.k)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
                borderRadius: '12px', whiteSpace: 'nowrap', cursor: 'pointer',
                background: active ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)',
                border: active ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.06)',
                color: active ? '#FBBF24' : '#9CA3AF', fontSize: '13px', fontWeight: 700,
              }}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* المحتوى */}
        {tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {STAT_CARDS.map((c, i) => (
              <div key={i} style={{
                padding: '20px', borderRadius: '18px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${c.color}1a`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <c.icon size={20} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900 }}>{c.value ?? 0}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{c.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} color="#FBBF24" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {tab === 'users' && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{users.length} مستخدم</div>
            {users.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `linear-gradient(135deg, ${u.color}, ${u.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                  {u.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {u.name}
                    {u.online && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />}
                    {u.isGuest && <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(168,85,247,0.2)', color: '#A855F7' }}>ضيف</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  <div style={{ fontSize: '10px', color: '#4B5563' }}>انضمّ: {timeAgo(u.createdAt)}</div>
                </div>
                <button onClick={() => deleteUser(u.id)} style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'posts' && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{posts.length} منشور</div>
            {posts.map(p => (
              <div key={p.id} style={{
                padding: '14px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{p.authorName}</span>
                    <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>{p.category}</span>
                    {p.kind !== 'text' && <span style={{ fontSize: '11px' }}>{p.kind === 'video' ? '🎬' : '🖼️'}</span>}
                  </div>
                  <button onClick={() => deletePost(p.id)} style={{
                    width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)',
                    border: 'none', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {p.text && <p style={{ fontSize: '13px', color: '#D1D5DB', lineHeight: 1.6, marginBottom: '6px' }}>{p.text.slice(0, 120)}{p.text.length > 120 ? '...' : ''}</p>}
                <div style={{ fontSize: '10px', color: '#4B5563' }}>❤️ {p.likes} • {timeAgo(p.createdAt)}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'rooms' && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rooms.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '24px' }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{r.members} عضو • {r.messages} رسالة</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'broadcast' && (
          <div>
            <div style={{
              padding: '16px', borderRadius: '16px', marginBottom: '16px',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
            }}>
              <p style={{ fontSize: '13px', color: '#FBBF24', lineHeight: 1.7 }}>
                📢 الرسالة ستُرسل لكل الغرف ({stats?.rooms || 0} غرفة) باسم "إدارة نور AI"
              </p>
            </div>
            <textarea
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              placeholder="اكتب رسالتك أو إعلانك للمستخدمين..."
              style={{
                width: '100%', minHeight: '140px', padding: '18px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '15px', lineHeight: 1.7, resize: 'vertical',
                direction: 'rtl', outline: 'none', fontFamily: 'inherit', marginBottom: '16px',
              }}
            />
            <button onClick={broadcast} disabled={sending || !broadcastMsg.trim()} style={{
              width: '100%', padding: '16px', borderRadius: '16px',
              background: broadcastMsg.trim() ? 'linear-gradient(135deg, #FBBF24, #D97706)' : 'rgba(255,255,255,0.08)',
              border: 'none', color: broadcastMsg.trim() ? '#000' : '#6B7280',
              fontSize: '16px', fontWeight: 800, cursor: broadcastMsg.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {sending ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={20} />}
              {sending ? 'جاري الإرسال...' : 'إرسال للجميع 📢'}
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
