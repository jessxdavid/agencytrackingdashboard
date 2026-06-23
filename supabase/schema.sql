-- Agency Acquisition Dashboard — Supabase schema
-- Run this once in the Supabase SQL editor to go live (shared team data).

create table if not exists public.leads (
  id text primary key,
  name text not null default '',
  ig text not null default '',
  youtube text not null default '',
  email text not null default '',
  niche text not null default '',
  funnel text not null default '',
  date date,
  stage text not null default 'possible_clients',
  loom_links jsonb not null default '[]'::jsonb,
  close_friends jsonb not null default '[]'::jsonb,
  email_sent_date date,
  email_followups jsonb not null default '[]'::jsonb,
  dms jsonb not null default '[]'::jsonb,
  close_friends_stories integer not null default 0,
  notes text,
  engaged_date date,
  call_one_date date,
  call_two_date date,
  closed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Internal team tool: the anon key gets full access (no per-user auth).
alter table public.leads enable row level security;
drop policy if exists "anon full access" on public.leads;
create policy "anon full access" on public.leads
  for all using (true) with check (true);

-- Live updates across the team.
alter publication supabase_realtime add table public.leads;
