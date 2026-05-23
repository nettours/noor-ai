import { AuthGuard } from '@/components/ui/AuthGuard';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/layout/Providers';
import { BottomNav } from '@/components/ui/BottomNav';
import { ParticlesBg } from '@/components/ui/ParticlesBg';
import { AudioBar } from '@/components/audio/AudioBar';
import { Toaster } from '@/components/ui/Toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'نور AI — رفيقك في طريق الإيمان',
  description: 'تطبيق إسلامي شامل',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'نور AI' },
};

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="app-bg" />
        <ParticlesBg />
        <Providers>
         <AuthGuard>
  <main style={{ position: 'relative', zIndex: 2, minHeight: '100dvh' }}>
    {children}
  </main>
</AuthGuard>
          <AudioBar />
          <BottomNav />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
