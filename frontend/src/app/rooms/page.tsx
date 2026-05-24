'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Users, Lock, Globe, Star,
  ChevronLeft, BookOpen, Scale, Heart,
  GraduationCap, Sparkles, MessageCircle, X, ArrowRight
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

interface Room {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  isPublic: boolean;
  memberCount: number;
  onlineCount: number;
  isMember: boolean;
  isOwner: boolean;
  createdByName: string;
}

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Sparkles },
  { id: 'quran', label: 'القرآن', icon: BookOpen },
  { id: 'fiqh', label: 'الفقه', icon: Scale },
  { id: 'study', label: 'العلم', icon: GraduationCap },
  { id: 'general', label: 'عام', icon: MessageCircle },
  { id: 'youth', label: 'الشباب', icon: Star },
  { id: 'family', label: 'الأسرة', icon: Heart },
];

const ICONS = ['💬', '📖', '⚖️', '🎓', '🌟', '👨‍👩‍👧', '🕌', '📿', '🌙', '✨', '☪️', '🤲', '📚', '💚', '🌺', '🌹'];

const COLORS = [
  '#10B981', '#FBBF24', '#67E8F9', '#A855F7',
  '#EC4899', '#F87171', '#60A5FA', '#34D399',
];

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ id: u.id, name: u.name, token });
    } catch { router.push('/auth/login'); }
  }, []);

  useEffect(() => { if (me?.token) fetchRooms(); }, [me?.token]);

  const fetchRooms = async () => {
    try {
      const res = await fetch(API + '/rooms', { headers: { Authorization: 'Bearer ' + me.token } });
      const json = await res.json();
      if (json.success) setRooms(json.rooms);
    } catch {} finally { setLoading(false); }
  };

  const filtered = rooms.filter(r => {
    if (filter !== 'all' && r.category !== filter) return false;
    if (search && !r.name.includes(search) && !r.description.includes(search)) return false;
    return true;
  });

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#000',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(217,119,6,0.08) 0%, transparent 50%),
          #000
        `,
      }} />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(env(safe-area-inset-top) + 20px) 16px 100px' }}>

        {/* Header */}
        <header style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <button onClick={() => router.push('/home')} style={{
              width: '40px', height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <ArrowRight size={20} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #10B981, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2px',
              }}>
                غرف الدردشة
              </h1>
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {rooms.length} غرفة • {rooms.filter(r => r.isMember).length} عضوية
              </p>
            </div>
            <button onClick={() => setShowCreate(true)} style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
            }}>
              <Plus size={16} />
              غرفة جديدة
            </button>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '14px 20px',
            marginBottom: '20px',
          }}>
            <Search size={20} color="#6B7280" />
            <input
              type="text"
              placeholder="ابحث عن غرفة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                direction: 'rtl',
              }}
            />
          </div>

          {/* Categories filter */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '24px',
            scrollbarWidth: 'none',
          }}>
            {CATEGORIES.map(c => {
              const Icon = c.icon;
              const active = filter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setFilter(c.id)}
                  style={{
                    padding: '10px 16px',
                    background: active
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'rgba(255,255,255,0.04)',
                    border: active
                      ? '1px solid rgba(16,185,129,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 8px 20px rgba(16,185,129,0.3)' : 'none',
                  }}
                >
                  <Icon size={14} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Rooms grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <div style={{
                width: 40, height: 40,
                margin: '0 auto 16px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#10B981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <p style={{ fontSize: '13px', color: '#9CA3AF' }}>جاري التحميل...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏠</div>
              <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                لا توجد غرف
              </p>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
                كن أول من يُنشئ غرفة في هذا التصنيف
              </p>
              <button onClick={() => setShowCreate(true)} style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}>
                + إنشاء غرفة
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {filtered.map((room, i) => (
                <div
                  key={room.id}
                  onClick={() => router.push('/rooms/' + room.id)}
                  className="room-card"
                  style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s',
                  }}
                >
                  {/* Glow background */}
                  <div style={{
                    position: 'absolute',
                    top: '-40px', right: '-40px',
                    width: '120px', height: '120px',
                    borderRadius: '50%',
                    background: room.color,
                    opacity: 0.15,
                    filter: 'blur(30px)',
                  }} />

                  {/* Icon */}
                  <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${room.color}, ${room.color}aa)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    marginBottom: '16px',
                    boxShadow: `0 8px 24px ${room.color}66`,
                    position: 'relative',
                  }}>
                    {room.icon}
                  </div>

                  {/* Privacy & status */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    display: 'flex',
                    gap: '6px',
                  }}>
                    {room.isMember && (
                      <div style={{
                        padding: '4px 8px',
                        background: 'rgba(16,185,129,0.2)',
                        border: '1px solid rgba(16,185,129,0.4)',
                        borderRadius: '999px',
                        fontSize: '10px',
                        color: '#10B981',
                        fontWeight: 700,
                      }}>عضو</div>
                    )}
                    {!room.isPublic && (
                      <Lock size={14} color="#FBBF24" />
                    )}
                  </div>

                  <h3 style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    marginBottom: '6px',
                    color: '#fff',
                  }}>
                    {room.name}
                  </h3>

                  <p style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    lineHeight: 1.6,
                    marginBottom: '16px',
                    minHeight: '38px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {room.description || 'لا يوجد وصف'}
                  </p>

                  {/* Footer stats */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '14px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '11px',
                      color: '#9CA3AF',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} />
                        {room.memberCount}
                      </div>
                      {room.onlineCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{
                            width: '6px', height: '6px',
                            borderRadius: '50%',
                            background: '#10B981',
                            boxShadow: '0 0 8px #10B981',
                          }} />
                          {room.onlineCount} متصل
                        </div>
                      )}
                    </div>
                    <ChevronLeft size={16} color={room.color} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && <CreateRoomModal me={me} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchRooms(); }} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .room-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.15) !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) !important;
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// CREATE ROOM MODAL
// ═══════════════════════════════════════════════════
function CreateRoomModal({ me, onClose, onCreated }: any) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState('💬');
  const [color, setColor] = useState('#10B981');
  const [category, setCategory] = useState('general');
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!name.trim() || name.trim().length < 3) return;
    setCreating(true);
    try {
      const res = await fetch(API + '/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + me.token,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: desc.trim(),
          icon, color, category,
          isPublic: true,
        }),
      });
      const json = await res.json();
      if (json.success) onCreated();
    } catch {} finally { setCreating(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #111827, #030712)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '28px',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '16px', left: '16px',
          width: '36px', height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <X size={18} />
        </button>

        {/* Preview */}
        <div style={{
          textAlign: 'center',
          marginBottom: '28px',
          padding: '20px',
          background: `radial-gradient(circle at center top, ${color}22, transparent 70%)`,
          borderRadius: '16px',
        }}>
          <div style={{
            width: '80px', height: '80px',
            margin: '0 auto 12px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
            boxShadow: `0 12px 32px ${color}66`,
          }}>
            {icon}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>
            {name || 'اسم الغرفة'}
          </h2>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
            {desc || 'وصف الغرفة سيظهر هنا'}
          </p>
        </div>

        {/* Name input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 600 }}>
            اسم الغرفة *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="مثلاً: مدارسة سورة البقرة"
            maxLength={50}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              direction: 'rtl',
              outline: 'none',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 600 }}>
            الوصف
          </label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="وصف موجز للغرفة..."
            maxLength={200}
            rows={2}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              direction: 'rtl',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Icon picker */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '8px', fontWeight: 600 }}>
            اختر أيقونة
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '6px',
          }}>
            {ICONS.map(i => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                style={{
                  aspectRatio: '1',
                  background: icon === i ? `${color}33` : 'rgba(255,255,255,0.04)',
                  border: icon === i ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  fontSize: '22px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '8px', fontWeight: 600 }}>
            اختر لوناً
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '3px solid #fff' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 12px ${c}66`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '8px', fontWeight: 600 }}>
            التصنيف
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                style={{
                  padding: '8px 14px',
                  background: category === c.id ? `${color}33` : 'rgba(255,255,255,0.04)',
                  border: category === c.id ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={create}
          disabled={!name.trim() || name.trim().length < 3 || creating}
          style={{
            width: '100%',
            padding: '16px',
            background: name.trim().length >= 3
              ? `linear-gradient(135deg, ${color}, ${color}cc)`
              : 'rgba(255,255,255,0.05)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: name.trim().length >= 3 ? 'pointer' : 'not-allowed',
            opacity: creating ? 0.6 : 1,
            boxShadow: name.trim().length >= 3 ? `0 12px 32px ${color}66` : 'none',
            transition: 'all 0.3s',
          }}
        >
          {creating ? 'جاري الإنشاء...' : '✨ إنشاء الغرفة'}
        </button>
      </div>
    </div>
  );
}
