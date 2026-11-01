-- Process Reimagination: one row per session (team board + coach chat history).
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
create table if not exists public.sessions (
  id          uuid primary key,
  team        text,
  mode        text,
  process     text,
  stage       int,
  state       jsonb not null,               -- the whole board: notes, steps, scenario, votes, prompt fields, ...
  chat        jsonb not null default '[]',  -- coach conversation [{ role, content }]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists sessions_updated_at on public.sessions (updated_at desc);

-- Only the server (service_role / secret key, set as an env var on Vercel) may read or write.
-- Row level security with no policies blocks the public anon key entirely.
alter table public.sessions enable row level security;