# Best Practices — Subscription / Billing Layer

## Server-side gating is the source of truth
Client gating (`usePremium`, `PremiumGate`) is **UX only**. The real entitlement
check is data the client cannot forge:
- `public.subscriptions` is **read-only** to clients via RLS (owner SELECT, no
  write policies).
- Only the Stripe webhook, using the **service role**, writes status.
For any feature that costs money or must be truly protected, enforce on the
server (an edge function or RLS policy that checks `status`), not in React.

## Idempotent webhooks
Model every webhook handler as "given this event, the row should look exactly
like X" and `upsert`. Never increment, append, or assume single delivery.

## Async signature verification (Deno)
Use `constructEventAsync` and verify against the raw body. See `PITFALLS.md`.

## Keep secrets server-side
- Service role key + Stripe secret key + webhook secret → `supabase secrets set`.
- Client only ever sees `pk_...` and the (public) price id.
- Lint/CI should reject any `VITE_*SECRET*` / `VITE_*SERVICE_ROLE*` var.

## Reuse the Stripe customer
Store `stripe_customer_id` on first checkout and reuse it for future checkouts
and the billing portal. This prevents duplicate customers and keeps a single
billing history per user.

## Treat the `subscriptions` row as a cache of Stripe
Stripe is the system of record. The table is a denormalised read-cache for fast
client gating. If they ever diverge, trust Stripe and let the webhook
re-sync (or re-fetch the subscription in the handler, as `checkout.session.
completed` does here).

## Map events back to users explicitly
Always stamp `metadata.supabase_user_id` (at checkout and on the subscription)
and keep `stripe_customer_id` indexed so webhooks can resolve the user even
when metadata is missing.

## Fail safe to "free"
The client defaults to `free` on any error or missing row, so a transient DB
read failure downgrades UX gracefully rather than leaking premium features.
