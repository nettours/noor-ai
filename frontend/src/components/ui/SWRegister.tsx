'use client';
import { useEffect } from 'react';

export function SWRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (window.location.hostname === 'localhost') return;

    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('🌙 SW registered'))
      .catch((e) => console.warn('SW failed:', e));

    let deferredPrompt: any;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      (window as any).deferredPrompt = e;
    });
  }, []);

  return null;
}