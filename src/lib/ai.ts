import { createClient } from '@/lib/supabase/client';

export interface BreakdownTask { name: string; estPomodoros: number }

/** Free: turn a natural-language goal into pomodoro-sized tasks (server-side AI). */
export async function breakdownTask(goal: string): Promise<{ tasks: BreakdownTask[]; note?: string }> {
  const { data, error } = await createClient().functions.invoke<{ tasks: BreakdownTask[]; note?: string }>(
    'ai-task-breakdown',
    { body: { goal } },
  );
  if (error) throw error;
  if (!data?.tasks?.length) throw new Error('No tasks returned');
  return data;
}

export interface CoachDebrief {
  headline: string;
  insights: string[];
  suggestion: string;
  tone: 'celebratory' | 'steady' | 'gentle-nudge' | string;
}

/** Plus: a short, grounded debrief of the user's focus stats (entitlement checked server-side). */
export async function getCoachDebrief(stats: unknown): Promise<CoachDebrief> {
  const { data, error } = await createClient().functions.invoke<CoachDebrief>('ai-coach', {
    body: { stats },
  });
  if (error) throw error;
  if (!data) throw new Error('No debrief returned');
  return data;
}
