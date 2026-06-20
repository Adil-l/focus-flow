# Pitfalls — Stripe + Supabase Edge Functions

Hard-won gotchas specific to this stack (Deno edge functions, not Node).

## 1. Use async signature verification in Deno
`stripe.webhooks.constructEvent(...)` (the sync version) relies on Node's
synchronous crypto and **throws in Deno**. Always use
`await stripe.webhooks.constructEventAsync(payload, signature, secret)`.

## 2. Verify against the RAW request body
Read the body with `await req.text()` and pass that string to
`constructEventAsync`. Parsing to JSON first (or re-stringifying) breaks the
signature. Never `req.json()` before verifying.

## 3. Webhooks must be idempotent
Stripe retries deliveries and may send duplicates. Every handler here maps an
event to a full `upsert` keyed by `user_id` (`onConflict: 'user_id'`), so
re-processing the same event re-writes identical state. Never do blind
increments or append-only writes in a webhook.

## 4. Never expose the service role key or Stripe secret key
- The service role key bypasses RLS — it lives **only** in edge function
  secrets, never in a `VITE_` var or the client bundle.
- The Stripe secret key (`sk_...`) is server-only too. The client only ever
  sees the publishable key (`pk_...`) and (optionally) the price id.

## 5. Return 200 quickly, 4xx/5xx to trigger retries
Return `400` only for signature failures. For transient processing errors,
return `5xx` so Stripe retries. Returning `200` on a real failure makes Stripe
consider it delivered and it will never retry.

## 6. Resolve the user id robustly
A subscription event may not carry your Supabase user id. We set
`metadata.supabase_user_id` at checkout and also fall back to looking up the
row by `stripe_customer_id`. Without this mapping, webhook writes silently
no-op.

## 7. CORS preflight
The browser issues an `OPTIONS` preflight before `functions.invoke`. Each
function must answer `OPTIONS` with the CORS headers or the call fails before
it reaches your logic.

## 8. JWT on the webhook
Supabase may enforce a JWT on functions by default. Stripe cannot send one, so
deploy the webhook with `--no-verify-jwt` (its security comes from the Stripe
signature, not a Supabase JWT).
