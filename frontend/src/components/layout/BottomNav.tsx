'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/home',   icon: '🏠', label: 'الرئيسية' },
  { href: '/quran',  icon: '📖', label: 'القرآن'   },
  { href: '/prayer', icon: '🕌', label: 'الصلاة'   },
  { href: '/adhkar', icon: '🤲', label: 'الأذكار'  },
  { href: '/ai',     icon: '🤖', label: 'AI'        },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      height: 64, display: 'flex',
      background: 'rgba(13,24,41,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      {NAV.map(n => {
        const active = path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            color: active ? '#FCD34D' : '#526070',
            textDecoration: 'none', fontSize: 10, fontWeight: 700,
            transition: 'color .2s',
          }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
