import type { Metadata } from 'next';
import { PostView, type SharedPost } from './PostView';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

async function getPost(id: string): Promise<SharedPost | null> {
  try {
    const r = await fetch(`${API}/feed/${id}`, { cache: 'no-store' });
    const d = await r.json();
    return d?.success ? (d.post as SharedPost) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: 'تأمّل · نور AI' };
  const desc = (post.text || 'تأمّل على نور AI 🌙').slice(0, 180);
  const title = `${post.authorName} — تأمّل على نور AI`;
  const isVideo = post.kind === 'video';
  // صورة المعاينة: الصورة نفسها، أو لقطة من الفيديو (Cloudinary: استبدال الامتداد بـ jpg)
  const ogImage = post.kind === 'image' && post.mediaUrl
    ? post.mediaUrl
    : isVideo && post.mediaUrl
      ? post.mediaUrl.replace(/\.(mp4|mov|webm|m4v|ogg)$/i, '.jpg')
      : undefined;
  return {
    title,
    description: desc,
    openGraph: {
      title, description: desc, type: isVideo ? 'video.other' : 'article',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      ...(isVideo && post.mediaUrl ? { videos: [{ url: post.mediaUrl }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description: desc, ...(ogImage ? { images: [ogImage] } : {}) },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  return <PostView post={post} />;
}
