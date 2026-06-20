// customer-portal: opens a Stripe Billing Portal session for the authenticated
// user so they can manage / cancel their subscription and payment methods.
//
// Secrets (set via `supabase secrets set ...`):
//   STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'https://esm.sh/stripe@^16?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2?target=deno';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return jsonResponse({ error: 'Missing Authorization header' }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const origin =
      req.headers.get('origin') || body?.origin || 'http://localhost:8080';

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const customerId = sub?.stripe_customer_id;
    if (!customerId) {
      return jsonResponse({ error: 'No Stripe customer for this user' }, 400);
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/?billing=return`,
    });

    return jsonResponse({ url: portal.url });
  } catch (err) {
    console.error('customer-portal error', err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return jsonResponse({ error: message }, 500);
  }
});
