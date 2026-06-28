# Kipto — SaaS / Subscription Layer

This document covers the real Stripe + Supabase subscription stack: how it is
wired, how to deploy it, and how to test it locally.

## Architecture

```
Browser (Vite SPA)
  ├─ useSubscription()  → reads public.subscriptions (RLS: own row, read-only)
  ├─ usePremium()       → ergonomic wrapper + upgrade toast (UX gating only)
  └─ lib/billing.ts     → invokes edge functions, redirects to Stripe
        │
        ▼
Supabase Edge Functions (Deno)
  ├─ create-checkout   → creates/reuses Stripe customer + Checkout Session
  ├─ customer-portal   → Stripe Billing Portal session
  └─ stripe-webhook    → verifies signature, upserts subscriptions (service role)
        │
        ▼
Stripe  ──(webhook events)──▶ stripe-webhook ──▶ public.subscriptions
```

The **server is the source of truth** for entitlement. Client gating is UX
only — the `subscriptions` table is read-only to clients via RLS, and only the
webhook (service role) writes to it.

## Files

- `supabase/migrations/20260620130000_subscriptions.sql` — table + RLS + trigger
- `supabase/functions/_shared/cors.ts` — shared CORS helper
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/customer-portal/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `src/hooks/useSubscription.ts`, `src/hooks/usePremium.ts`
- `src/lib/billing.ts`
- `src/components/PremiumGate.tsx`, `src/components/PricingPanel.tsx`

## 1. Apply the database migration

```bash
supabase db push
```

This creates `public.subscriptions` with RLS enabled (owner can SELECT only;
no client INSERT/UPDATE/DELETE).

## 2. Create the Stripe product & price

In the Stripe Dashboard (Test mode):

1. Products → Add product → "Kipto Plus".
2. Add a recurring price (e.g. $5 / month). Copy the Price id (`price_...`).

## 3. Set the edge function secrets

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  STRIPE_PRO_PRICE_ID=price_xxx
```

> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically for
> deployed functions. For local `supabase functions serve` you must also set
> `SUPABASE_SERVICE_ROLE_KEY` (and `SUPABASE_URL`) in your local secrets/env.

Set `VITE_STRIPE_PRO_PRICE_ID=price_xxx` in `.env` if you want the client to
pass the price id explicitly (optional — the function falls back to the secret).

## 4. Deploy the functions

```bash
supabase functions deploy create-checkout customer-portal stripe-webhook
```

> The webhook needs no JWT (Stripe calls it). If your project enforces JWT on
> functions, deploy the webhook with `--no-verify-jwt`:
> `supabase functions deploy stripe-webhook --no-verify-jwt`

## 5. Configure the Stripe webhook endpoint

In the Stripe Dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://<project-ref>.functions.supabase.co/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`

Copy the endpoint's signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`
(step 3) and redeploy if needed.

## 6. Local test flow

```bash
# Terminal 1 — run the functions locally
supabase functions serve

# Terminal 2 — forward Stripe events to the local webhook
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
# copy the printed whsec_... into your local STRIPE_WEBHOOK_SECRET

# Trigger / drive a checkout from the app's Pricing panel, then pay with the
# Stripe test card:
#   4242 4242 4242 4242  ·  any future expiry  ·  any CVC  ·  any ZIP
```

After a successful test payment, `public.subscriptions.status` for your user
becomes `active`, `usePremium().isPremium` flips to true, and premium sounds
unlock.

See `PITFALLS.md` and `BEST_PRACTICES.md` in this folder for the gotchas.
