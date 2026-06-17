-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (supplements Supabase Auth)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'UTC',
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Daily entries
create table if not exists public.daily_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  entry_date date not null,
  sleep_hours numeric(3,1) not null check (sleep_hours between 0 and 24),
  sleep_bedtime time,
  mood smallint not null check (mood between 1 and 5),
  energy smallint not null check (energy between 1 and 10),
  activity text not null check (activity in ('none', 'light', 'medium', 'hard')),
  nutrition text not null check (nutrition in ('poor', 'ok', 'good')),
  note text check (char_length(note) <= 300),
  generated_frame text,
  generated_frame_sub text,
  generated_insights jsonb default '[]',
  state_score numeric(3,1),
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

-- Row-level security
alter table public.users enable row level security;
alter table public.daily_entries enable row level security;

-- Users can only see and modify their own data
create policy "users_self" on public.users
  for all using (auth.uid() = id);

create policy "entries_self" on public.daily_entries
  for all using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_entries_user_date
  on public.daily_entries (user_id, entry_date desc);

-- Auto-create user profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id) values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
