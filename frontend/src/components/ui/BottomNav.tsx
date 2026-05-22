'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Heart, MessageCircle, User } from 'lucide-react';

const NAV = [
  { href: '/home',    label: 'الرئيسية', Icon: Home },
  { href: '/quran',   label: 'القرآن',   Icon: BookOpen },
  { href: '/adhkar',  label: 'الأذكار',  Icon: Heart },
  { href: '/community', label: 'المجتمع', Icon: MessageCircle },
  { href: '/profile', label: 'حسابي',    Icon: User },
];

// Pages that hide the BottomNav (full-screen experiences)
const HIDDEN_PATHS = ['/ai', '/chat', '/auth', '/onboarding'];

export function BottomNav() {
  const path = usePathname();

  if (!path || path === '/') return null;
  for (const p of HIDDEN_PATHS) {
    if (path.startsWith(p)) return null;
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      paddingBottom: 'var(--safe-bottom)',
    }}>
      <div className="container-app glass-strong" style={{
        height: 'var(--nav-h)',
        display: 'flex',
        margin: '0 auto',
        borderRadius: '24px 24px 0 0',
        borderBottom: 'none',
      }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: active ? 'var(--gold-6)' : 'var(--text-4)',
              position: 'relative',
              transition: 'color 0.2s',
              padding: '8px 4px',
            }}>
              {active && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%', right: '25%',
                  height: '3px',
                  background: 'linear-gradient(90deg, var(--gold-5), var(--gold-4))',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: '0 2px 12px var(--gold-4)',
                }} />
              )}
              <div style={{
                transform: active ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                opacity: active ? 1 : 0.7,
              }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
