import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2?target=deno';

// Per-user, per-day quota for the paid AI endpoints, backed by public.ai_usage
// (written via the service role). Best-effort (read-then-write, not atomic) —
// adequate to stop runaway cost/abuse without an RPC.

const admin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
);

/** True if the user is under their daily `fn` limit (and atomically records this use). */
export async function underDailyLimit(userId: string, fn: string, limit: number): Promise<boolean> {
  const { data, error } = await admin.rpc('increment_ai_usage', {
    p_user_id: userId,
    p_fn: fn,
    p_limit: limit,
  });
  if (error) {
    // Fail open: don't block legitimate users on a rate-limit infra hiccup —
    // the per-call model cost is the backstop.
    console.warn('[rateLimit] increment_ai_usage failed:', error.message);
    return true;
  }
  return data === true;
}
