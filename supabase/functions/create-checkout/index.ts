// create-checkout: starts a Stripe Checkout Session for the authenticated user.
//
// Flow:
//   1. Verify the caller via the Authorization bearer JWT (Supabase auth).
//   2. Find or create the user's Stripe customer (reusing any id we already
//      stored in public.subscriptions).
//   3. Create a subscription-mode Checkout Session and return its { url }.
//
// Secrets (set via `supabase secrets set ...`):
//   STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

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

    // Resolve the user from their JWT. We pass the token through so getUser()
    // validates it against Supabase auth.
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const priceId: string =
      body?.priceId || Deno.env.get('STRIPE_PRO_PRICE_ID') || '';
    if (!priceId) {
      return jsonResponse({ error: 'No price id configured' }, 400);
    }

    const origin =
      req.headers.get('origin') ||
      body?.origin ||
      'http://localhost:8080';

    // Reuse an existing Stripe customer if we have one on file.
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      // Seed/refresh the row so the webhook and portal can find the customer.
      await supabase
        .from('subscriptions')
        .upsert(
          { user_id: user.id, stripe_customer_id: customerId },
          { onConflict: 'user_id' },
        );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel`,
      // Carry the user id so the webhook can map the session back to a user
      // even before the subscription object is fully populated.
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      metadata: { supabase_user_id: user.id },
    });

    return jsonResponse({ url: session.url });
  } catch (err) {
    console.error('create-checkout error', err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return jsonResponse({ error: message }, 500);
  }
});
