// ai-coach (PLUS, authenticated): a short, grounded debrief of the user's recent
// focus stats. Entitlement is checked SERVER-SIDE against the subscriptions table
// (never trust the client). Free users get 402.
//
// Secrets: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2?target=deno';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { callClaude, extractJson } from '../_shared/anthropic.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const SYSTEM = `You are a focus coach inside a Pomodoro study app. You receive the user's recent focus stats as JSON.
Write a short, warm, specific debrief and one concrete suggestion for their next session.
Be honest and NEVER fabricate numbers that are not present in the input. Ground every claim in a field from the data.
Output ONLY a JSON object:
{"headline":string(<=60 chars, encouraging, references a real metric),"insights":[string](2-3 items, each cites a number from input),"suggestion":string(one specific action for the next session, <=140 chars),"tone":"celebratory"|"steady"|"gentle-nudge"}`;

interface Coach { headline: string; insights: string[]; suggestion: string; tone: string }

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    if (!token) return jsonResponse({ error: 'Missing Authorization header' }, 401);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) return jsonResponse({ error: 'Invalid or expired token' }, 401);

    // Server-side entitlement check — the source of truth for Plus access.
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();
    const isPremium = sub?.status === 'active' || sub?.status === 'trialing';
    if (!isPremium) return jsonResponse({ error: 'Plus required' }, 402);

    const body = await req.json().catch(() => ({}));
    const stats = body?.stats;
    if (!stats || typeof stats !== 'object') return jsonResponse({ error: 'Missing stats' }, 400);

    const raw = await callClaude({ system: SYSTEM, user: JSON.stringify(stats), maxTokens: 400 });
    const parsed = extractJson<Coach>(raw);

    return jsonResponse({
      headline: String(parsed.headline ?? '').slice(0, 80),
      insights: (Array.isArray(parsed.insights) ? parsed.insights : []).slice(0, 3).map((s) => String(s).slice(0, 160)),
      suggestion: String(parsed.suggestion ?? '').slice(0, 160),
      tone: ['celebratory', 'steady', 'gentle-nudge'].includes(parsed.tone) ? parsed.tone : 'steady',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('ai-coach error', message);
    return jsonResponse({ error: message }, 500);
  }
});
