-- Kipto: opt-in global leaderboard.
-- Each user keeps one row with their rolling focus stats and a chosen display
-- name. The client upserts its own row; everyone signed in can read the rows of
-- users who opted in. No personal data beyond a display name is exposed, and a
-- user is only ever visible after explicitly opting in.

create table if not exists public.leaderboard (
  user_id          uuid        primary key references auth.users (id) on delete cascade,
  display_name     text        not null default 'Anonymous',
  pomodoros_today  integer     not null default 0,
  minutes_today    integer     not null default 0,
  pomodoros_week   integer     not null default 0,
  minutes_week     integer     not null default 0,
  pomodoros_total  integer     not null default 0,
  opted_in         boolean     not null default false,
  updated_at       timestamptz not null default now()
);

-- Reuse the shared updated_at trigger helper (defined by earlier migrations).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leaderboard_set_updated_at on public.leaderboard;
create trigger leaderboard_set_updated_at
  before update on public.leaderboard
  for each row execute function public.set_updated_at();

-- Helpful index for ranking queries.
create index if not exists leaderboard_week_idx
  on public.leaderboard (opted_in, pomodoros_week desc);

alter table public.leaderboard enable row level security;

-- Read: any signed-in user can see opted-in competitors, plus always their own
-- row (so they can manage opt-in even while hidden).
drop policy if exists "leaderboard read opted-in" on public.leaderboard;
create policy "leaderboard read opted-in"
  on public.leaderboard for select
  to authenticated
  using (opted_in or auth.uid() = user_id);

-- Write: a user may create / update ONLY their own row.
drop policy if exists "leaderboard insert own" on public.leaderboard;
create policy "leaderboard insert own"
  on public.leaderboard for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "leaderboard update own" on public.leaderboard;
create policy "leaderboard update own"
  on public.leaderboard for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "leaderboard delete own" on public.leaderboard;
create policy "leaderboard delete own"
  on public.leaderboard for delete
  to authenticated
  using (auth.uid() = user_id);
