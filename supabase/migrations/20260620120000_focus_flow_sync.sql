-- Kipto: per-user cloud state for cross-device sync.
-- The app stores everything as a handful of JSON blobs in localStorage; this
-- mirrors that shape one-row-per-user so login actually persists/loads data.

create table if not exists public.user_state (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  settings     jsonb       not null default '{}'::jsonb,
  goals        jsonb       not null default '{}'::jsonb,
  gamification jsonb       not null default '{}'::jsonb,
  tasks        jsonb       not null default '[]'::jsonb,
  history      jsonb       not null default '[]'::jsonb,
  presets      jsonb       not null default '[]'::jsonb,
  notepad      text        not null default '',
  updated_at   timestamptz not null default now()
);

-- Keep updated_at fresh on every write (used for last-write-wins reconciliation).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_state_set_updated_at on public.user_state;
create trigger user_state_set_updated_at
  before update on public.user_state
  for each row execute function public.set_updated_at();

-- Row Level Security: a user can only ever see or modify their own row.
alter table public.user_state enable row level security;

drop policy if exists "user_state owner can select" on public.user_state;
create policy "user_state owner can select"
  on public.user_state for select
  using (auth.uid() = user_id);

drop policy if exists "user_state owner can insert" on public.user_state;
create policy "user_state owner can insert"
  on public.user_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_state owner can update" on public.user_state;
create policy "user_state owner can update"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_state owner can delete" on public.user_state;
create policy "user_state owner can delete"
  on public.user_state for delete
  using (auth.uid() = user_id);
