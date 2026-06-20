// Minimal Anthropic Messages API helper for edge functions (Deno).
// Secret: ANTHROPIC_API_KEY (set via `supabase secrets set`).

const MODEL = 'claude-haiku-4-5';

interface ClaudeOpts {
  system: string;
  user: string;
  maxTokens?: number;
}

export async function callClaude({ system, user, maxTokens = 512 }: ClaudeOpts): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('AI is not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Anthropic error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  return data?.content?.[0]?.text ?? '';
}

/** Pull the first balanced JSON object out of a model response. */
export function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object in model response');
  return JSON.parse(match[0]) as T;
}
