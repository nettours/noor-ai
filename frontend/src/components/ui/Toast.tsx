'use client';
import { useEffect, useState } from 'react';

let _toastFn: ((msg: string, type?: 'success' | 'error' | 'info') => void) | null = null;

export function toast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
  if (_toastFn) _toastFn(msg, type);
}

export function Toaster() {
  const [msg, setMsg] = useState<{ text: string; type: string } | null>(null);

  useEffect(() => {
    _toastFn = (text: string, type: any = 'success') => {
      setMsg({ text, type });
      setTimeout(() => setMsg(null), 2500);
    };
    return () => { _toastFn = null; };
  }, []);

  if (!msg) return null;

  const colors = {
    success: 'rgba(16,185,129,0.95)',
    error: 'rgba(239,68,68,0.95)',
    info: 'rgba(59,130,246,0.95)',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 'calc(var(--safe-top) + 20px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      pointerEvents: 'none',
      animation: 'fadeDown 0.3s ease',
    }}>
      <div style={{
        background: 'var(--bg-glass-strong)',
        border: '1px solid var(--border-3)',
        borderRadius: 'var(--r-full)',
        padding: '12px 24px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#fff',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(20px)',
        borderRightColor: colors[msg.type as keyof typeof colors],
        borderRightWidth: '3px',
        whiteSpace: 'nowrap',
        maxWidth: '90vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {msg.text}
      </div>
    </div>
  );
}
