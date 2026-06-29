// Desktop Google sign-in via deep link. The webview can't receive a normal OAuth
// redirect (origin is tauri://localhost), so: open Google in the system browser,
// have Supabase redirect back to kipto://auth-callback?code=…, and exchange that
// code for a session here. No-op on web (which uses the standard redirect flow).
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { openExternal } from '@/platform/openExternal';
import { isTauri } from '@/platform';

const REDIRECT = 'kipto://auth-callback';
const isPt = () => { try { return localStorage.getItem('pomo:language') === 'pt'; } catch { return false; } };

/** Kick off Google OAuth from the desktop app (opens the system browser). */
export async function signInWithGoogleDesktop(): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: REDIRECT, skipBrowserRedirect: true },
  });
  if (error || !data?.url) {
    toast.error(error?.message ?? (isPt() ? 'Falha no login Google' : 'Google sign-in failed'));
    return;
  }
  await openExternal(data.url);
}

// Finish the flow when the OS hands the kipto://auth-callback URL back to the app.
let registered = false;
export async function initDeepLinkAuth(): Promise<void> {
  if (!isTauri() || registered) return;
  registered = true;
  try {
    const { onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
    await onOpenUrl(async (urls) => {
      for (const u of urls) {
        if (!u.startsWith('kipto://auth-callback')) continue;
        try {
          const supabase = createClient();
          const url = new URL(u);
          // Errors can arrive in the query or the fragment.
          const frag = new URLSearchParams(u.includes('#') ? u.slice(u.indexOf('#') + 1) : '');
          const errDesc = url.searchParams.get('error_description') || frag.get('error_description');
          if (errDesc) { toast.error(errDesc); return; }

          const code = url.searchParams.get('code');
          if (code) {
            // PKCE: exchange the code (uses the verifier stored at sign-in).
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) { toast.error(error.message); return; }
          } else {
            // Implicit fallback: tokens in the URL fragment.
            const access_token = frag.get('access_token');
            const refresh_token = frag.get('refresh_token');
            if (!access_token || !refresh_token) return;
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) { toast.error(error.message); return; }
          }
          toast.success(isPt() ? 'Sessão iniciada com Google.' : 'Signed in with Google.');
        } catch { /* malformed callback — ignore */ }
      }
    });
  } catch { /* plugin unavailable — ignore */ }
}
