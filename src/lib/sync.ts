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

const COLUMNS = 'settings,goals,gamification,tasks,history,presets,notepad';

/** Load the signed-in user's cloud state, or null if they have no row yet. */
export async function fetchCloudState(userId: string): Promise<Partial<CloudState> | null> {
  const { data, error } = await createClient()
    .from('user_state')
    .select(COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[sync] failed to load cloud state:', error.message);
    return null;
  }
  return (data as Partial<CloudState> | null) ?? null;
}

/** Upsert (insert or update) the signed-in user's cloud state. */
export async function upsertCloudState(userId: string, state: Partial<CloudState>): Promise<boolean> {
  const { error } = await createClient()
    .from('user_state')
    .upsert({ user_id: userId, ...state }, { onConflict: 'user_id' });

  if (error) {
    console.warn('[sync] failed to save cloud state:', error.message);
    return false;
  }
  return true;
}
