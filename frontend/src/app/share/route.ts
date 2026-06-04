import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * PWA Web Share Target handler.
 *
 * manifest.json declares:
 *   share_target: { action: "/share", method: "POST",
 *                   enctype: "multipart/form-data",
 *                   params: { title, text, url } }
 *
 * When the user shares content *into* Noor AI from the OS share sheet, the
 * platform POSTs the form here. We merge the fields and redirect (303) to the
 * post composer with the text prefilled. Previously this route did not exist,
 * so every share attempt resulted in a 404.
 */
export async function POST(req: NextRequest) {
  let title = '';
  let text = '';
  let url = '';

  try {
    const form = await req.formData();
    title = (form.get('title') ?? '').toString().trim();
    text = (form.get('text') ?? '').toString().trim();
    url = (form.get('url') ?? '').toString().trim();
  } catch {
    // Malformed payload — fall through to an empty composer.
  }

  const shared = [title, text, url].filter(Boolean).join('\n').trim();

  const dest = new URL('/feed/create', req.nextUrl.origin);
  if (shared) dest.searchParams.set('shared', shared);

  return NextResponse.redirect(dest, 303);
}

// Some platforms probe the target with GET — never 404.
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/feed/create', req.nextUrl.origin), 303);
}
