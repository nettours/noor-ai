'use client';
import { useEffect } from 'react';
export function SWRegister() {
  useEffect(() => { if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.hostname !== 'localhost') { navigator.serviceWorker.register('/sw.js').catch(() => {}); } }, []);
  return null;
}
