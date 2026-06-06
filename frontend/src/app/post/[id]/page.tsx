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
  const desc = post.text.slice(0, 180);
  const title = `${post.authorName} — تأمّل على نور AI`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: 'article' },
    twitter: { card: 'summary_large_image', title, description: desc },
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
