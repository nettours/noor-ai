// Unified Web Share helper.
// Previously every page called navigator.share({ text }) WITHOUT a url, so the
// shared message never contained a link back to the app. This always includes a
// url (the current page by default) and falls back to copying text + link.

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://noor-ai-v1.vercel.app';

export interface ShareOptions {
  text: string;
  title?: string;
  /** Defaults to the current page URL, falling back to the site root. */
  url?: string;
  /** Optional files (e.g. a generated dua image). */
  files?: File[];
}

export async function shareContent(opts: ShareOptions): Promise<boolean> {
  const url =
    opts.url ||
    (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      // If files are provided and supported, share them (text + url stay attached).
      if (opts.files?.length && (navigator as any).canShare?.({ files: opts.files })) {
        await navigator.share({ title: opts.title, text: opts.text, url, files: opts.files });
      } else {
        await navigator.share({ title: opts.title, text: opts.text, url });
      }
      return true;
    }
  } catch {
    // User cancelled or share failed — fall through to clipboard.
  }

  try {
    await navigator.clipboard?.writeText(`${opts.text}\n${url}`);
    return true;
  } catch {
    return false;
  }
}
