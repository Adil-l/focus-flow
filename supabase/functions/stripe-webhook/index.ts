// stripe-webhook: the single source of truth for subscription entitlement.
//
// Stripe POSTs events here. We verify the signature, then upsert the matching
// row in public.subscriptions using the SERVICE ROLE client (bypasses RLS).
// The handler is idempotent: every event maps to a full upsert keyed by
// user_id, so re-delivery of the same event simply rewrites the same state.
//
// IMPORTANT: in Deno we must use constructEventAsync (the sync variant relies
// on Node crypto that isn't available here).
//
// Secrets (set via `supabase secrets set ...`):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'https://esm.sh/stripe@^16?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface SubscriptionRow {
  user_id: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  status?: string;
  current_period_end?: string | null;
}

// Resolve the Supabase user id for an event. We prefer metadata set at
// checkout time, then fall back to the customer id already on file.
async function resolveUserId(
  metadataUserId: string | null | undefined,
  customerId: string | null | undefined,
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;
  if (customerId) {
    const { data } = await admin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (data?.user_id) return data.user_id;
  }
  return null;
}

async function upsertSubscription(row: SubscriptionRow): Promise<void> {
  // Drop null/undefined fields so an event that lacks (e.g.) the customer id
  // never overwrites a good stored value with null.
  const clean: Record<string, unknown> = { user_id: row.user_id };
  for (const [k, v] of Object.entries(row)) {
    if (k !== 'user_id' && v !== null && v !== undefined) clean[k] = v;
  }
  const { error } = await admin
    .from('subscriptions')
    .upsert(clean, { onConflict: 'user_id' });
  if (error) console.error('upsert subscription failed', error);
}

// A lifetime purchase is a row with status active/non-canceled, no subscription id
// and no period end. Subscription events for other Stripe objects must not revoke it.
async function isLifetime(userId: string): Promise<boolean> {
  const { data } = await admin
    .from('subscriptions')
    .select('stripe_subscription_id, current_period_end, status')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data && !data.stripe_subscription_id && !data.current_period_end && data.status === 'active';
}

function periodEndIso(sub: Stripe.Subscription): string | null {
  return sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error('Missing stripe-signature header');
    // Async verification is required in the Deno runtime.
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bad signature';
    console.error('webhook signature verification failed', message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === 'string' ? session.customer : null;
        const userId = await resolveUserId(
          session.metadata?.supabase_user_id ?? session.client_reference_id,
          customerId,
        );
        if (!userId) break;

        // Pull the freshly-created subscription to capture price + period.
        if (session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            stripe_price_id: sub.items.data[0]?.price.id ?? null,
            status: sub.status,
            current_period_end: periodEndIso(sub),
          });
        } else {
          await upsertSubscription({
            user_id: userId,
            stripe_customer_id: customerId,
            status: 'active',
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === 'string' ? sub.customer : null;
        const userId = await resolveUserId(
          sub.metadata?.supabase_user_id,
          customerId,
        );
        if (!userId) break;

        // Never let a subscription event downgrade a lifetime purchase.
        if (await isLifetime(userId)) break;

        const deleted = event.type === 'customer.subscription.deleted';
        await upsertSubscription({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          stripe_price_id: sub.items.data[0]?.price.id ?? null,
          status: deleted ? 'canceled' : sub.status,
          current_period_end: periodEndIso(sub),
        });
        break;
      }

      default:
        // Ignore unrelated events; Stripe still expects a 200.
        break;
    }
  } catch (err) {
    // Log but still return 200 for handled-but-failed processing where it's
    // safe, EXCEPT we want Stripe to retry on transient errors. Re-throw to
    // surface a 500 so Stripe retries.
    console.error('webhook handler error', err);
    return new Response('handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
