'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Type, Image as ImageIcon, Video, Upload,
  Loader2, X, Send, Sparkles, Wand2
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
  const [generating, setGenerating] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('noor_token');
      const u = JSON.parse(localStorage.getItem('noor_user') || '{}');
      if (!token || !u.id) { router.push('/auth/login'); return; }
      setMe({ ...u, token });
      fetch(API + '/feed/upload-config', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.json()).then(d => setCloudConfig(d)).catch(() => {});
    } catch { router.push('/auth/login'); }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!cloudConfig?.configured) {
      alert('رفع الوسائط غير مُفعّل بعد. تأكّد من إعداد Cloudinary في Railway.');
      return;
    }
    // حد الحجم: 50MB للفيديو، 10MB للصورة
    const maxMB = kind === 'video' ? 50 : 10;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`الملف كبير جداً (الحد ${maxMB}MB)`);
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
        alert('فشل الرفع: ' + (data.error?.message || 'تحقّق أن الـ preset يقبل ' + (kind === 'video' ? 'الفيديو' : 'الصور')));
      }
    } catch (err) {
      alert('فشل الرفع: ' + err);
    } finally {
      setUploading(false);
    }
  };

  const generateAI = async () => {
    setGenerating(true);
    try {
      const resp = await fetch(API + '/feed/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + me.token },
        body: JSON.stringify({ topic: '' }),
      });
      const data = await resp.json();
      if (data.success && data.generated) {
        setText(data.generated.text);
        if (data.generated.category) setCategory(data.generated.category);
        setKind('text');
      }
    } catch {
      alert('فشل التوليد، حاول مجدداً');
    } finally {
      setGenerating(false);
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
    } catch (err) {
      alert('فشل الاتصال بالخادم');
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

  const canPublish = kind === 'text' ? text.trim().length > 0 : !!mediaUrl;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(236,72,153,0.12) 0%, transparent 50%), #000' }} />

      {/* Header (ثابت) */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 16px 14px',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button onClick={() => router.push('/feed')} style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <ArrowRight size={20} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 900, flex: 1 }}>✍️ انشر تأمّلاً</h1>
      </header>

      {/* المحتوى القابل للتمرير */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 2, padding: '20px 16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {/* نوع المحتوى */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          {[
            { k: 'text', icon: Type, label: 'نص' },
            { k: 'image', icon: ImageIcon, label: 'صورة' },
            { k: 'video', icon: Video, label: 'فيديو' },
          ].map(t => {
            const Icon = t.icon; const sel = kind === t.k;
            return (
              <button key={t.k} onClick={() => { setKind(t.k as any); setMediaUrl(''); }} style={{
                flex: 1, padding: '14px', borderRadius: '14px',
                background: sel ? 'linear-gradient(135deg, #EC4899, #BE185D)' : 'rgba(255,255,255,0.05)',
                border: sel ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                fontWeight: 700, fontSize: '13px',
              }}>
                <Icon size={22} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* زر توليد AI (للنص) */}
        {kind === 'text' && (
          <button onClick={generateAI} disabled={generating} style={{
            width: '100%', padding: '14px', borderRadius: '14px', marginBottom: '16px',
            background: 'linear-gradient(135deg, rgba(103,232,249,0.15), rgba(168,85,247,0.15))',
            border: '1px solid rgba(103,232,249,0.3)', color: '#67E8F9',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontWeight: 800, fontSize: '14px',
          }}>
            {generating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={18} />}
            {generating ? 'يولّد محتوى مؤثّراً...' : '✨ ولّد محتوى بالذكاء الاصطناعي'}
          </button>
        )}

        {/* رفع الوسائط */}
        {(kind === 'image' || kind === 'video') && (
          <div style={{ marginBottom: '16px' }}>
            {mediaUrl ? (
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                {kind === 'image'
                  ? <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover' }} />
                  : <video src={mediaUrl} controls style={{ width: '100%', maxHeight: '280px' }} />}
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
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                width: '100%', padding: '40px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.2)',
                color: '#9CA3AF', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              }}>
                {uploading ? (
                  <><Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} /><span>جاري الرفع...</span></>
                ) : (
                  <>
                    <Upload size={32} />
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>اضغط لرفع {kind === 'image' ? 'صورة' : 'فيديو'}</span>
                    {!cloudConfig?.configured && <span style={{ fontSize: '11px', color: '#F87171' }}>⚠️ يحتاج إعداد Cloudinary</span>}
                  </>
                )}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept={kind === 'image' ? 'image/*' : 'video/*'} style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
          </div>
        )}

        {/* النص */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={kind === 'text' ? 'اكتب تأمّلك، آية، أو خاطرة تؤثّر في القلوب...\n\nأو اضغط "ولّد محتوى" بالأعلى ✨' : 'أضف وصفاً (اختياري)...'}
          style={{
            width: '100%', minHeight: kind === 'text' ? '140px' : '70px',
            padding: '18px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '16px', lineHeight: 1.8, resize: 'vertical',
            direction: 'rtl', outline: 'none', fontFamily: 'inherit', marginBottom: '16px',
          }}
        />

        {/* التصنيف */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '10px', fontWeight: 700 }}>التصنيف</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                padding: '8px 16px', borderRadius: '999px',
                background: category === c ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.04)',
                border: category === c ? '1px solid #EC4899' : '1px solid rgba(255,255,255,0.1)',
                color: category === c ? '#EC4899' : '#9CA3AF',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* زر النشر (ثابت دائماً في الأسفل) */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '14px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button onClick={publish} disabled={publishing || !canPublish} style={{
          width: '100%', maxWidth: '600px', margin: '0 auto',
          padding: '16px', borderRadius: '16px',
          background: canPublish ? 'linear-gradient(135deg, #EC4899, #BE185D)' : 'rgba(255,255,255,0.08)',
          border: 'none', color: canPublish ? '#fff' : '#6B7280',
          fontSize: '16px', fontWeight: 800,
          cursor: canPublish && !publishing ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: canPublish ? '0 8px 24px rgba(236,72,153,0.4)' : 'none',
        }}>
          {publishing ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={20} />}
          {publishing ? 'جاري النشر...' : 'نشر الآن 🚀'}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
