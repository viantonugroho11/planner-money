-- Finance AI Journal - Supabase Schema
-- Run this in Supabase SQL Editor

create table if not exists wallets (
  id text primary key,
  name text not null,
  type text not null,
  balance numeric not null default 0,
  currency text not null default 'IDR',
  color text not null default '#22c55e',
  icon text not null default '💰',
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists categories (
  id text primary key,
  name text not null,
  icon text not null,
  color text not null,
  type text not null,
  parent_id text references categories(id)
);

create table if not exists transactions (
  id text primary key,
  type text not null,
  amount numeric not null,
  currency text not null default 'IDR',
  wallet_id text not null references wallets(id) on delete cascade,
  to_wallet_id text references wallets(id) on delete set null,
  category_id text not null references categories(id),
  note text,
  date bigint not null,
  tags text[],
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists budgets (
  id text primary key,
  category_id text not null references categories(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'IDR',
  period text not null default 'monthly',
  created_at bigint not null
);

create table if not exists goals (
  id text primary key,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  currency text not null default 'IDR',
  deadline bigint,
  icon text not null default '🎯',
  color text not null default '#22c55e',
  created_at bigint not null,
  updated_at bigint not null
);

-- Disable RLS for personal app (enable + add policies if multi-user needed)
alter table wallets disable row level security;
alter table categories disable row level security;
alter table transactions disable row level security;
alter table budgets disable row level security;
alter table goals disable row level security;

-- Index for transaction queries
create index if not exists transactions_date_idx on transactions(date desc);
create index if not exists transactions_wallet_id_idx on transactions(wallet_id);
create index if not exists transactions_category_id_idx on transactions(category_id);

-- ============================================================
-- Households (family sharing) — RLS without recursion
-- households policies may read household_members, but
-- household_members policies must never read households directly.
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_owned_household_ids()
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$ SELECT id FROM households WHERE owner_id = auth.uid(); $$;

DROP POLICY IF EXISTS households_owner_all ON households;
DROP POLICY IF EXISTS households_member_read ON households;
DROP POLICY IF EXISTS household_members_owner_manage ON household_members;
DROP POLICY IF EXISTS household_members_self_read ON household_members;
DROP POLICY IF EXISTS household_members_self_update ON household_members;

CREATE POLICY households_owner_all ON households
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY households_member_read ON households
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM household_members hm
    WHERE hm.household_id = households.id AND hm.user_id = auth.uid() AND hm.status = 'active'));
CREATE POLICY household_members_owner_manage ON household_members
  FOR ALL USING (household_id IN (SELECT get_my_owned_household_ids()));
CREATE POLICY household_members_self_read ON household_members
  FOR SELECT USING (user_id = auth.uid() OR invited_email = (auth.jwt() ->> 'email'));
CREATE POLICY household_members_self_update ON household_members
  FOR UPDATE USING (user_id = auth.uid() OR invited_email = (auth.jwt() ->> 'email'));

-- ============================================================
-- Feature tables (per-user, RLS: auth.uid() = user_id)
-- ============================================================
create table if not exists recurring_transactions (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  amount numeric not null,
  type text not null,
  category_id text not null,
  wallet_id text not null,
  description text not null default '',
  frequency text not null,
  next_occurrence bigint not null,
  start_date bigint,
  is_active boolean not null default true,
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists iou_records (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  person_name text not null,
  phone_number text,
  direction text not null,
  total_amount numeric not null,
  remaining_amount numeric not null,
  description text,
  due_date bigint,
  status text not null,
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists loans (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  principal numeric not null,
  annual_interest_rate numeric not null,
  term_months integer not null,
  start_date bigint not null,
  remaining_principal numeric not null,
  currency text not null default 'IDR',
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists investments (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  ticker text,
  units numeric not null,
  avg_price numeric not null,
  current_price numeric not null,
  currency text not null default 'IDR',
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists wishlist_items (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  target_price numeric not null,
  saved_amount numeric not null default 0,
  currency text not null default 'IDR',
  target_date bigint,
  priority text not null,
  notes text,
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists event_budgets (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  date bigint not null,
  total_budget numeric not null,
  currency text not null default 'IDR',
  items jsonb not null default '[]'::jsonb,
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists utility_bills (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null,
  currency text not null default 'IDR',
  due_day integer not null,
  category text not null,
  is_active boolean not null default true,
  last_paid_at bigint,
  created_at bigint not null,
  updated_at bigint not null
);

do $$
declare t text;
begin
  foreach t in array array['recurring_transactions','iou_records','loans','investments','wishlist_items','event_budgets','utility_bills']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists %I on %I', t || '_own', t);
    execute format('create policy %I on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_own', t);
    execute format('create index if not exists %I on %I(user_id)', t || '_user_idx', t);
  end loop;
end $$;

notify pgrst, 'reload schema';
