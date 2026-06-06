import Link from 'next/link';
import type { ReactNode } from 'react';

/** Shared shell for public info pages (about / privacy / terms). */
export function InfoShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: '100dvh', position: 'relative', zIndex: 2 }}>
      {/* Top bar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px',
        background: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundImage: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
          }}>☪️</div>
          <span style={{ fontFamily: 'Amiri, serif', fontSize: 19, fontWeight: 700, color: '#fff' }}>
            نور <span style={{ color: '#FBBF24' }}>AI</span>
          </span>
        </Link>
        <Link href="/" style={{
          padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, color: '#fff',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        }}>
          ← الرئيسية
        </Link>
      </nav>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '48px 20px 100px' }}>
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, color: '#fff' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
              {subtitle}
            </p>
          )}
        </header>

        {children}

        {/* Brand signature */}
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: 12, color: 'var(--text-4)' }}>
          <p style={{ marginBottom: 8 }}>
            نور <span style={{ color: '#FBBF24', fontWeight: 700 }}>AI</span> © {new Date().getFullYear()} — منتج من{' '}
            <a href="https://www.snetprodz.com" target="_blank" rel="noopener noreferrer"
              style={{ color: '#34D399', fontWeight: 700, direction: 'ltr', display: 'inline-block' }}>
              SNetProDz
            </a>
          </p>
          <p>تطوير وتصميم: ساخي عبد الرحمن · <span style={{ direction: 'ltr', display: 'inline-block' }}>Sakhi Abderrahmane</span></p>
        </div>
      </main>
    </div>
  );
}

/** A titled content block used by privacy/terms. */
export function InfoSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="glass-card" style={{ padding: 22, marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: 'var(--text-0)' }}>{heading}</h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.95, color: 'var(--text-2)' }}>{children}</div>
    </section>
  );
}
