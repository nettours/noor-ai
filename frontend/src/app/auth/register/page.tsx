import { redirect } from 'next/navigation';

/**
 * /auth/register previously duplicated /auth/login (which already has a
 * login ⇄ "create account" tab). To keep a single source of truth for auth,
 * this route now redirects to the unified screen with the signup tab open.
 * Existing links and bookmarks to /auth/register keep working.
 */
export default function RegisterRedirect() {
  redirect('/auth/login?tab=register');
}
