-- Run this in Supabase Dashboard → SQL Editor

create table if not exists weekly_signals (
  id            uuid default gen_random_uuid() primary key,
  week_of       date not null unique,          -- Friday of that week
  signal_text   text not null,
  data_snapshot jsonb,                          -- all market data used to generate
  regime        text not null,                  -- risk-on | risk-off | reflation | deflation
  status        text default 'draft',           -- draft | published | discarded
  generated_at  timestamptz default now(),
  published_at  timestamptz,
  updated_at    timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_weekly_signals_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger weekly_signals_updated_at
  before update on weekly_signals
  for each row execute function update_weekly_signals_updated_at();

-- RLS: public can read published signals only
alter table weekly_signals enable row level security;

create policy "Public read published signals"
  on weekly_signals for select
  using (status = 'published');

create policy "Service role full access"
  on weekly_signals for all
  using (true)
  with check (true);
