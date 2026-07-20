-- Reader accounts → paper-trading foundation
-- Run once in Supabase SQL Editor. Uses built-in Supabase Auth (auth.users).
--
-- Also do these two dashboard steps (Authentication → settings):
--   1. URL Configuration → Site URL: https://www.bourbonsip.com
--      and add https://www.bourbonsip.com/account to Redirect URLs
--   2. Ensure "Confirm email" is ON (default) so signups get a confirmation email.

-- ── Paper trading account: one per user, $100k virtual starting cash ──
create table if not exists paper_accounts (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  cash       numeric not null default 100000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table paper_accounts enable row level security;

create policy "read own paper account"
  on paper_accounts for select
  using (auth.uid() = user_id);

create policy "create own paper account"
  on paper_accounts for insert
  with check (auth.uid() = user_id and cash = 100000);

-- Balance changes will go through server-side (service-role) logic when the
-- trading engine lands — users cannot update their own cash directly.

-- ── Trade log (schema ready for the mock-trading engine) ──
create table if not exists paper_trades (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  symbol      text not null,
  side        text not null check (side in ('buy', 'sell')),
  qty         numeric not null check (qty > 0),
  price       numeric not null check (price > 0),
  executed_at timestamptz not null default now()
);

create index if not exists paper_trades_user_idx on paper_trades (user_id, executed_at desc);

alter table paper_trades enable row level security;

create policy "read own trades"
  on paper_trades for select
  using (auth.uid() = user_id);

-- Inserts happen via service-role API routes only (price must come from the
-- server-side market-data feed, never the client) — so no insert policy here.

-- ── Auto-provision a paper account on signup ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.paper_accounts (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Atomic cash debit for buys ──
-- Single-statement check-and-debit: returns true and debits only when funds
-- cover the amount, so concurrent buys can never overspend.
create or replace function public.paper_debit_cash(p_user_id uuid, p_amount numeric)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  updated integer;
begin
  update paper_accounts
     set cash = cash - p_amount,
         updated_at = now()
   where user_id = p_user_id
     and cash >= p_amount;
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;
