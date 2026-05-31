-- Run this in Supabase SQL Editor

create table if not exists tipsy_reads (
  id                uuid primary key default gen_random_uuid(),
  url               text not null unique,
  title             text not null,
  publication       text,
  description       text,
  og_image          text,
  category          text default 'markets',

  -- AI-generated fields
  bourbon_take      text,
  proof_score       int  default 0,
  market_impact     int  default 0,
  geo_impact        int  default 0,
  tech_disruption   int  default 0,
  regulatory_weight int  default 0,
  bourbon_strength  int  default 0,

  -- Source metadata
  source_authority  int  default 70,
  article_date      timestamptz,

  -- Workflow
  status            text not null default 'suggested'
                    check (status in ('suggested', 'published', 'discarded')),
  analyzed          boolean default false,
  published_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Auto-set published_at
create or replace function set_tipsy_published_at()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'published' and (OLD.status is null or OLD.status <> 'published') then
    NEW.published_at := now();
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_tipsy_published_at on tipsy_reads;
create trigger trg_tipsy_published_at
  before insert or update on tipsy_reads
  for each row execute function set_tipsy_published_at();

-- RLS
alter table tipsy_reads enable row level security;

create policy "Public read published tipsy reads"
  on tipsy_reads for select
  using (status = 'published');

-- Auto-cleanup: discard suggested articles older than 48 hours
-- (run this as a scheduled function or call from cron)
create or replace function discard_stale_suggestions()
returns void language plpgsql as $$
begin
  update tipsy_reads
  set status = 'discarded'
  where status = 'suggested'
    and created_at < now() - interval '48 hours';
end;
$$;
