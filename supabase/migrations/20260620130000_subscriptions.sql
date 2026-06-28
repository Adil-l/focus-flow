-- Kipto: per-user Stripe subscription state.
-- One row per user mirrors the latest Stripe subscription so the client can
-- gate premium features. ONLY the Stripe webhook (service role) ever writes
-- here; clients may read their own row but never mutate it — the source of
-- truth for entitlement lives in Stripe, reconciled by the webhook.

create table if not exists public.subscriptions (
  user_id                uuid        primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  stripe_price_id        text,
  -- free | active | trialing | past_due | canceled
  status                 text        not null default 'free',
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

-- Keep updated_at fresh on every write. Reuses the same trigger function the
-- sync migration defines; create-or-replace makes this migration order-safe.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Row Level Security: a user can read their own subscription row, nothing else.
alter table public.subscriptions enable row level security;

-- Read-only for the owner. There is intentionally NO insert/update/delete
-- policy for clients: writes flow exclusively through the webhook using the
-- service role key, which bypasses RLS.
drop policy if exists "subscriptions owner can select" on public.subscriptions;
create policy "subscriptions owner can select"
  on public.subscriptions for select
  using (auth.uid() = user_id);
