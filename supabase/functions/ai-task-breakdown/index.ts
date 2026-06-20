// ai-task-breakdown (FREE, authenticated): turns a natural-language goal into a
// short list of pomodoro-sized tasks that drop straight into the task store.
//
// Secrets: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2?target=deno';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callClaude, extractJson } from '../_shared/anthropic.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const SYSTEM = `You break a user's study/work goal into a short list of focused, pomodoro-sized tasks.
Rules:
- Return 2 to 6 tasks, ordered logically.
- Each task name is concrete and <= 50 characters.
- estPomodoros is an integer 1-6 (a pomodoro ≈ 25 min).
- Never invent specifics the user didn't imply; keep tasks general if the goal is vague.
Output ONLY a JSON object: {"tasks":[{"name":string,"estPomodoros":number}],"note":string(optional, <=120 chars)}`;

interface Breakdown { tasks: { name: string; estPomodoros: number }[]; note?: string }

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    if (!token) return jsonResponse({ error: 'Missing Authorization header' }, 401);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return jsonResponse({ error: 'Invalid or expired token' }, 401);

    const body = await req.json().catch(() => ({}));
    const goal = typeof body?.goal === 'string' ? body.goal.trim() : '';
    if (!goal || goal.length > 300) return jsonResponse({ error: 'Provide a goal (<=300 chars)' }, 400);

    const raw = await callClaude({ system: SYSTEM, user: goal, maxTokens: 400 });
    const parsed = extractJson<Breakdown>(raw);

    // Validate + clamp before returning.
    const tasks = (Array.isArray(parsed.tasks) ? parsed.tasks : [])
      .slice(0, 6)
      .map((t) => ({
        name: String(t.name ?? '').slice(0, 50),
        estPomodoros: Math.min(6, Math.max(1, Math.round(Number(t.estPomodoros) || 1))),
      }))
      .filter((t) => t.name.length > 0);

    if (tasks.length === 0) return jsonResponse({ error: 'Could not break down that goal' }, 422);

    return jsonResponse({ tasks, note: typeof parsed.note === 'string' ? parsed.note.slice(0, 120) : undefined });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('ai-task-breakdown error', message);
    return jsonResponse({ error: message }, 500);
  }
});
