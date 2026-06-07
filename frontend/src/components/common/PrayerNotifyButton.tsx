'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, BellOff } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type State = 'idle' | 'on' | 'denied' | 'working' | 'unsupported' | 'error';

/** Enable prayer-time push notifications. Needs prayerTimes (Fajr..Isha HH:MM). */
export function PrayerNotifyButton({ prayerTimes }: { prayerTimes: Record<string, string> }) {
  const [state, setState] = useState<State>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') { setState('denied'); return; }
    // Reflect existing subscription
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (sub && Notification.permission === 'granted') setState('on'); })
      .catch(() => {});
  }, []);

  const enable = async () => {
    setState('working'); setMsg('');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setState('denied'); return; }

      const reg = await navigator.serviceWorker.ready;

      // Get VAPID public key from backend.
      const vr = await fetch(`${API}/push/vapid`).then(r => r.json()).catch(() => null);
      if (!vr?.enabled || !vr?.key) { setState('error'); setMsg('الإشعارات غير مُفعّلة على الخادم بعد'); return; }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vr.key),
        });
      }

      const tzOffset = -new Date().getTimezoneOffset(); // minutes east of UTC
      const ok = await fetch(`${API}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), prayers: prayerTimes, tzOffset }),
      }).then(r => r.ok).catch(() => false);

      if (!ok) { setState('error'); setMsg('تعذّر حفظ الاشتراك'); return; }

      // Confirmation push.
      fetch(`${API}/push/test`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});

      setState('on');
    } catch (e: any) {
      setState('error'); setMsg(String(e?.message || 'حدث خطأ'));
    }
  };

  const disable = async () => {
    setState('working');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(`${API}/push/unsubscribe`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setState('idle');
    } catch { setState('idle'); }
  };

  if (state === 'unsupported') return null;

  const denied = state === 'denied';
  const on = state === 'on';
  const working = state === 'working';

  return (
    <button
      onClick={denied ? undefined : on ? disable : enable}
      disabled={working || denied}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, cursor: denied ? 'default' : 'pointer',
        padding: '14px 16px', borderRadius: 18, textAlign: 'right',
        background: on ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${on ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: on ? 'rgba(16,185,129,0.18)' : 'rgba(251,191,36,0.14)',
        color: on ? '#34D399' : '#FBBF24',
      }}>
        {on ? <BellRing size={20} /> : denied ? <BellOff size={20} /> : <Bell size={20} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
          {on ? 'تنبيهات الصلاة مُفعّلة ✅' : denied ? 'الإشعارات محظورة' : 'فعّل تنبيهات الصلاة'}
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
          {working ? 'جارٍ…' : on ? 'اضغط للإيقاف' : denied ? 'فعّلها من إعدادات المتصفح' : msg || 'لا تفوّت صلاة — يصلك تذكير عند كل وقت'}
        </div>
      </div>
    </button>
  );
}
