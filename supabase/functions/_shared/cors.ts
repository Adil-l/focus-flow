// Shared CORS headers for all Kipto edge functions.
// The web client calls these via supabase.functions.invoke from the browser,
// so every function must answer the preflight OPTIONS request and echo back
// permissive CORS headers.

// Restrict to the app origin when ALLOWED_ORIGIN is configured (recommended in
// production); falls back to '*' when unset (local dev / preview).
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*';

export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}
