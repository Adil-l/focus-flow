import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Once onAuthStateChange has fired (it emits INITIAL_SESSION on subscribe),
    // it owns the truth. Ignore the slower one-shot getSession() result if it
    // resolves afterwards, otherwise a stale snapshot can flip user back.
    let authEventSeen = false;

    createClient().auth.getSession().then(({ data: { session } }) => {
      if (!mounted || authEventSeen) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      authEventSeen = true;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return { user, loading };
}
