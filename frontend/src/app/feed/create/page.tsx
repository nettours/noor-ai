'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Type, Image as ImageIcon, Video, Upload,
  Loader2, Check, X, Send
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

const CATEGORIES = ['خاطرة', 'آية', 'حديث', 'دعاء', 'حكمة', 'نصيحة', 'ذِكر'];

export default function CreatePostPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [kind, setKind] = useState<'text' | 'image' | 'video'>('text');
  const [text, setText] = useState('');
  const [category, setCategory] = useState('خاطرة');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ ...u, token });
      // جلب إعدادات Cloudinary
      fetch(API + '/feed/upload-config', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.json())
        .then(d => setCloudConfig(d))
        .catch(() => {});
    } catch { router.push('/auth/login'); }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!cloudConfig?.configured) {
      alert('رفع الوسائط غير مُفعّل. أضف إعدادات Cloudinary في الـ Backend (انظر SETUP).');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudConfig.uploadPreset);

      const resourceType = kind === 'video' ? 'video' : 'image';
      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudConfig.cloudName}/${resourceType}/upload`,
        { method: 'POST', body: formData }
      );
      const data = await resp.json();
      if (data.secure_url) {
        setMediaUrl(data.secure_url);
      } else {
        alert('فشل الرفع. تأكّد من إعدادات Cloudinary.');
      }
    } catch (err) {
      alert('فشل الرفع: ' + err);
    } finally {
      setUploading(false);
    }
  };

  const publish = async () => {
    if (kind === 'text' && !text.trim()) { alert('اكتب نصاً أولاً'); return; }
    if ((kind === 'image' || kind === 'video') && !mediaUrl) { alert('ارفع وسائط أولاً'); return; }

    setPublishing(true);
    try {
      const resp = await fetch(API + '/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + me.token },
        body: JSON.stringify({ kind, text: text.trim(), mediaUrl, category }),
      });
      const data = await resp.json();
      if (data.success) {
        router.push('/feed');
      } else {
        alert(data.error || 'فشل النشر');
        setPublishing(false);
      }
    } catch {
      alert('فشل النشر');
      setPublishing(false);
    }
  };

  if (!me) {
    return (
      <div style={{ minHeight: '100dvh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="#EC4899" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#000', color: '#fff', position: 'relative' }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(236,72,153,0.12) 0%, transparent 50%), #000',
      }} />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 16px 40px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.push('/feed')} style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowRight size={20} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 900, flex: 1 }}>✍️ انشر تأمّلاً</h1>
        </header>

        {/* نوع المحتوى */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {[
            { k: 'text', icon: Type, label: 'نص' },
            { k: 'image', icon: ImageIcon, label: 'صورة' },
            { k: 'video', icon: Video, label: 'فيديو' },
          ].map(t => {
            const Icon = t.icon;
            const sel = kind === t.k;
            return (
              <button key={t.k} onClick={() => { setKind(t.k as any); setMediaUrl(''); }} style={{
                flex: 1, padding: '14px', borderRadius: '14px',
                background: sel ? 'linear-gradient(135deg, #EC4899, #BE185D)' : 'rgba(255,255,255,0.05)',
                border: sel ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                fontWeight: 700, fontSize: '13px',
              }}>
                <Icon size={22} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* رفع الوسائط */}
        {(kind === 'image' || kind === 'video') && (
          <div style={{ marginBottom: '20px' }}>
            {mediaUrl ? (
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                {kind === 'image'
                  ? <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                  : <video src={mediaUrl} controls style={{ width: '100%', maxHeight: '300px' }} />
                }
                <button onClick={() => setMediaUrl('')} style={{
                  position: 'absolute', top: '10px', left: '10px',
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  width: '100%', padding: '40px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '2px dashed rgba(255,255,255,0.2)',
                  color: '#9CA3AF', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>جاري الرفع...</span>
                  </>
                ) : (
                  <>
                    <Upload size={32} />
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>
                      اضغط لرفع {kind === 'image' ? 'صورة' : 'فيديو'}
                    </span>
                    {!cloudConfig?.configured && (
                      <span style={{ fontSize: '11px', color: '#F87171' }}>
                        ⚠️ يحتاج إعداد Cloudinary
                      </span>
                    )}
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={kind === 'image' ? 'image/*' : 'video/*'}
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
          </div>
        )}

        {/* النص */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={kind === 'text' ? 'اكتب تأمّلك، آية، حديثاً، أو خاطرة تؤثّر في القلوب...' : 'أضف وصفاً (اختياري)...'}
          style={{
            width: '100%', minHeight: kind === 'text' ? '160px' : '80px',
            padding: '18px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '16px', lineHeight: 1.8, resize: 'vertical',
            direction: 'rtl', outline: 'none', fontFamily: 'inherit',
            marginBottom: '20px',
          }}
        />

        {/* التصنيف */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '10px', fontWeight: 700 }}>التصنيف</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                padding: '8px 16px', borderRadius: '999px',
                background: category === c ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.04)',
                border: category === c ? '1px solid #EC4899' : '1px solid rgba(255,255,255,0.1)',
                color: category === c ? '#EC4899' : '#9CA3AF',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* نشر */}
        <button onClick={publish} disabled={publishing} style={{
          width: '100%', padding: '16px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #EC4899, #BE185D)',
          border: 'none', color: '#fff', fontSize: '16px', fontWeight: 800,
          cursor: publishing ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 8px 24px rgba(236,72,153,0.4)',
        }}>
          {publishing ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={20} />}
          {publishing ? 'جاري النشر...' : 'نشر الآن'}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
