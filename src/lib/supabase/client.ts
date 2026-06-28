import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isTauri } from '@/platform';

const url = import.meta.env.VITE_SUPABASE_URL!;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

// In the desktop app (origin tauri://localhost) cookie-based persistence is
// unreliable, so the login session was lost on restart — which is why premium
// wasn't recognized. Use supabase-js with explicit localStorage there so the
// session survives. The web build keeps the SSR browser client unchanged.
const supabase = isTauri()
  ? createSupabaseClient(url, key, {
      auth: {
        storage: window.localStorage,
        storageKey: 'kipto-auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : createBrowserClient(url, key);

export function createClient() {
  return supabase;
}
