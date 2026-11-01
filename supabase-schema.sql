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
