import { ImageResponse } from 'next/og';

export const alt = 'Noor AI — رفيقك الذكي في طريق الإيمان';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Dynamic social share card (real PNG) — replaces the missing static /og-image.png.
 * Note: next/og (Satori) cannot shape connected Arabic glyphs with the default font
 * (throws "substFormat: 3 is not yet supported"), so the card uses Latin text + the
 * crescent symbol only. The Arabic title still lives in the page <title>/OG metadata.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030712',
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.25), transparent)',
          color: '#FAFAF9',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 150,
            height: 150,
            borderRadius: 40,
            backgroundImage: 'linear-gradient(135deg, #10B981, #059669)',
            fontSize: 96,
            boxShadow: '0 20px 60px rgba(16,185,129,0.5)',
          }}
        >
          <span style={{ color: '#FCD34D' }}>☪</span>
        </div>
        <div style={{ marginTop: 44, fontSize: 96, fontWeight: 800, display: 'flex', gap: 18 }}>
          <span>NOOR</span>
          <span style={{ color: '#FBBF24' }}>AI</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 34, color: '#D4D8DD', letterSpacing: 2 }}>
          YOUR SMART ISLAMIC COMPANION
        </div>
        <div style={{ marginTop: 30, fontSize: 24, color: '#8B96A8', letterSpacing: 1 }}>
          Quran · AI Assistant · Prayer Times · Qibla · Adhkar
        </div>
        <div style={{ marginTop: 46, fontSize: 20, color: '#5B6675', letterSpacing: 1, display: 'flex', gap: 10 }}>
          <span>by</span>
          <span style={{ color: '#FBBF24', fontWeight: 700 }}>SNetProDz</span>
          <span>·</span>
          <span style={{ color: '#9CA3AF' }}>Sakhi Abderrahmane</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
