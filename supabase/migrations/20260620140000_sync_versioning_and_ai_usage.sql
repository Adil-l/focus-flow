-- Production hardening: out-of-order webhook protection + per-user AI rate limiting.

-- 1) Monotonic guard for the subscriptions webhook. Stores the Stripe event time
--    of the last write so older, re-delivered events can be ignored.
alter table public.subscriptions
  add column if not exists last_event_at timestamptz;

-- 2) Per-user, per-day AI usage counters (rate limiting). Written only by the
--    edge functions via the service role; users may read their own usage.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null default ((now() at time zone 'utc')::date),
  fn      text not null,
  count   integer not null default 0,
  primary key (user_id, day, fn)
);

alter table public.ai_usage enable row level security;

drop policy if exists "ai_usage owner can select" on public.ai_usage;
create policy "ai_usage owner can select"
  on public.ai_usage for select
  using (auth.uid() = user_id);
-- No insert/update/delete policy: only the service-role edge functions write here.
