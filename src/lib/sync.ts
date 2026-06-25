import { createClient } from '@/lib/supabase/client';

/**
 * The user's full app state as mirrored in the `public.user_state` table.
 * Everything is a plain JSON value matching what the localStorage stores hold.
 */
export interface CloudState {
  settings: Record<string, unknown>;
  goals: Record<string, unknown>;
  gamification: Record<string, unknown>;
  tasks: unknown[];
  history: unknown[];
  presets: unknown[];
  notepad: string;
}

export type CloudStateWithMeta = Partial<CloudState> & { updated_at?: string };

const COLUMNS = 'settings,goals,gamification,tasks,history,presets,notepad,updated_at';

/** Load the signed-in user's cloud state (incl. updated_at), or null if no row yet. */
export async function fetchCloudState(userId: string): Promise<CloudStateWithMeta | null> {
  const { data, error } = await createClient()
    .from('user_state')
    .select(COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // Throw so callers can distinguish a transient fetch ERROR from a genuine
    // "no row yet" (null). Treating an error as "empty" risks overwriting good
    // cloud data with local on a flaky network.
    console.warn('[sync] failed to load cloud state:', error.message);
    throw new Error(error.message);
  }
  return (data as CloudStateWithMeta | null) ?? null;
}

/** First-time seed (insert/upsert) of the cloud row. Returns the new updated_at. */
export async function seedCloudState(userId: string, state: Partial<CloudState>): Promise<string | null> {
  const { data, error } = await createClient()
    .from('user_state')
    .upsert({ user_id: userId, ...state }, { onConflict: 'user_id' })
    .select('updated_at')
    .maybeSingle();

  if (error) {
    console.warn('[sync] failed to seed cloud state:', error.message);
    return null;
  }
  return (data as { updated_at?: string } | null)?.updated_at ?? null;
}

/**
 * Conditional push: only overwrites the row if the cloud copy hasn't changed
 * since `since` (the updated_at we last saw). Prevents one device from clobbering
 * newer data written by another. Returns the new updated_at on success, or null
 * on conflict (a newer write exists — caller should re-baseline rather than retry).
 */
export async function pushCloudState(
  userId: string,
  state: Partial<CloudState>,
  since: string | null,
): Promise<string | null> {
  let query = createClient()
    .from('user_state')
    .update({ ...state })
    .eq('user_id', userId);
  if (since) query = query.lte('updated_at', since);

  const { data, error } = await query.select('updated_at').maybeSingle();
  if (error) {
    console.warn('[sync] failed to push cloud state:', error.message);
    return null;
  }
  // data === null means no row matched the `lte` guard → a newer write won.
  return (data as { updated_at?: string } | null)?.updated_at ?? null;
}
