import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2?target=deno';

// Per-user, per-day quota for the paid AI endpoints, backed by public.ai_usage
// (written via the service role). Best-effort (read-then-write, not atomic) —
// adequate to stop runaway cost/abuse without an RPC.

const admin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
);

/** True if the user is under their daily `fn` limit (and records this use). */
export async function underDailyLimit(userId: string, fn: string, limit: number): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from('ai_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('day', day)
    .eq('fn', fn)
    .maybeSingle();

  const current = (data as { count?: number } | null)?.count ?? 0;
  if (current >= limit) return false;

  await admin
    .from('ai_usage')
    .upsert({ user_id: userId, day, fn, count: current + 1 }, { onConflict: 'user_id,day,fn' });
  return true;
}
