import { createClient } from '@/lib/supabase/client';

export interface LeaderboardRow {
  user_id: string;
  display_name: string;
  pomodoros_today: number;
  minutes_today: number;
  pomodoros_week: number;
  minutes_week: number;
  pomodoros_total: number;
}

export interface MyStats {
  pomodoros_today: number;
  minutes_today: number;
  pomodoros_week: number;
  minutes_week: number;
  pomodoros_total: number;
}

/**
 * Fetch the global leaderboard — opted-in users ranked by this week's
 * pomodoros. RLS guarantees only opted-in rows (plus the caller's own) are
 * visible. Returns [] when the table is missing/unreadable so the UI degrades
 * gracefully before the migration is applied.
 */
export async function fetchLeaderboard(limit = 100): Promise<LeaderboardRow[]> {
  const { data, error } = await createClient()
    .from('leaderboard')
    .select('user_id, display_name, pomodoros_today, minutes_today, pomodoros_week, minutes_week, pomodoros_total')
    .eq('opted_in', true)
    .order('pomodoros_week', { ascending: false })
    .order('pomodoros_total', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as LeaderboardRow[];
}

/**
 * Upsert the caller's own leaderboard row. `optedIn` controls visibility to
 * others. Safe to call on every panel open; RLS restricts writes to own row.
 */
export async function upsertMyStats(
  userId: string,
  displayName: string,
  stats: MyStats,
  optedIn: boolean,
): Promise<boolean> {
  const { error } = await createClient()
    .from('leaderboard')
    .upsert(
      {
        user_id: userId,
        display_name: displayName?.trim() || 'Anonymous',
        ...stats,
        opted_in: optedIn,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
  return !error;
}
