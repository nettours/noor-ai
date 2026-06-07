const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

/** Fire-and-forget activity ping for the live habit wall. Never throws. */
export function trackActivity(action: string): void {
  try {
    fetch(`${API}/stats/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
