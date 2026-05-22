import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/layout/Providers';
import { BottomNav } from '@/components/ui/BottomNav';
import { ParticlesBg } from '@/components/ui/ParticlesBg';
import { AudioBar } from '@/components/audio/AudioBar';
import { Toaster } from '@/components/ui/Toast';
import { SWRegister } from '@/components/ui/SWRegister';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'نور AI — رفيقك في طريق الإيمان',
    template: '%s • نور AI',
  },
  description: 'تطبيق إسلامي شامل: قرآن، صلاة، أذكار، مساعد AI، مجتمع، ومكالمات بين المؤمنين',
  keywords: ['قرآن', 'صلاة', 'أذكار', 'إسلامي', 'تطبيق', 'AI', 'مساعد ذكي', 'مسلم'],
  authors: [{ name: 'SnetProDz', url: 'https://snetprodz.com' }],
  creator: 'SnetProDz',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'نور AI',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_DZ',
    title: 'نور AI — رفيقك في طريق الإيمان',
    description: 'تطبيق إسلامي شامل بأحدث التقنيات',
    siteName: 'نور AI',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'نور AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نور AI',
    description: 'رفيقك في طريق الإيمان 🌙',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/icons/icon-192.png',
    shortcut: '/icons/icon-72.png',
    apple: '/icons/icon-152.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-bg" />
        <ParticlesBg />
        <Providers>
          <main style={{ position: 'relative', zIndex: 2, minHeight: '100dvh' }}>
            {children}
          </main>
          <AudioBar />
          <BottomNav />
          <Toaster />
          <SWRegister />
        </Providers>
      </body>
    </html>
  );
}
