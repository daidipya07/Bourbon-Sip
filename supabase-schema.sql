-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)

-- ── Articles table ─────────────────────────────────────────────────────────
create table if not exists articles (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  subtitle         text,
  excerpt          text,
  body_html        text,
  category         text,
  category_label   text,
  read_time        text default '5 min',
  proof_score      int  default 85,
  data_density     int  default 85,
  cross_refs       int  default 80,
  recency_weight   int  default 85,
  cover_image      text,
  sources          text,   -- newline-separated URLs
  status           text not null default 'draft' check (status in ('draft', 'published')),
  published_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Auto-set published_at when status flips to published
create or replace function set_published_at()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'published' and (OLD.status is null or OLD.status <> 'published') then
    NEW.published_at := now();
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_published_at on articles;
create trigger trg_published_at
  before insert or update on articles
  for each row execute function set_published_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table articles enable row level security;

-- Public can read published articles
create policy "Public read published"
  on articles for select
  using (status = 'published');

-- Service role (admin) bypasses RLS — no additional policy needed

-- ── Storage bucket for images ───────────────────────────────────────────────
-- In Supabase dashboard: Storage → New Bucket
-- Name: article-images
-- Public: YES (toggle on so images are publicly accessible)
--
-- Or run this (requires Storage extension to be enabled):
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

-- Allow public read on article-images
create policy "Public image read"
  on storage.objects for select
  using (bucket_id = 'article-images');

-- Allow service role to upload (handled server-side via admin client, bypasses RLS)
