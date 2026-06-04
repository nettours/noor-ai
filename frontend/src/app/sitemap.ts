import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noor-ai-v1.vercel.app';

// Public, indexable routes. Private/app routes (chat, rooms, profile…) are omitted.
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/quran', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/ai', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/prayer', priority: 0.8, changeFrequency: 'daily' },
  { path: '/qibla', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/adhkar', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/dua', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tasbih', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/stories', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/tajweed', priority: 0.6, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
