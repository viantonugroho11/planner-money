import { NextResponse } from "next/server";

const SQL = `
create table if not exists recurring_transactions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
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
alter table recurring_transactions enable row level security;
drop policy if exists "user_recurring" on recurring_transactions;
create policy "user_recurring" on recurring_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists iou_records (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  person_name text not null,
  phone_number text,
  direction text not null,
  total_amount numeric not null,
  remaining_amount numeric not null,
  description text,
  due_date bigint,
  status text not null default 'active',
  created_at bigint not null,
  updated_at bigint not null
);
alter table iou_records enable row level security;
drop policy if exists "user_iou" on iou_records;
create policy "user_iou" on iou_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists loans (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  principal numeric not null,
  annual_interest_rate numeric not null default 0,
  term_months int not null,
  start_date bigint not null,
  remaining_principal numeric not null,
  currency text not null default 'IDR',
  created_at bigint not null,
  updated_at bigint not null
);
alter table loans enable row level security;
drop policy if exists "user_loans" on loans;
create policy "user_loans" on loans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists investments (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null,
  ticker text,
  units numeric not null default 0,
  avg_price numeric not null default 0,
  current_price numeric not null default 0,
  currency text not null default 'IDR',
  created_at bigint not null,
  updated_at bigint not null
);
alter table investments enable row level security;
drop policy if exists "user_investments" on investments;
create policy "user_investments" on investments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists wishlist_items (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_price numeric not null,
  saved_amount numeric not null default 0,
  currency text not null default 'IDR',
  target_date bigint,
  priority text not null default 'medium',
  notes text,
  created_at bigint not null,
  updated_at bigint not null
);
alter table wishlist_items enable row level security;
drop policy if exists "user_wishlist" on wishlist_items;
create policy "user_wishlist" on wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists event_budgets (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  date bigint not null,
  total_budget numeric not null,
  currency text not null default 'IDR',
  items jsonb not null default '[]',
  created_at bigint not null,
  updated_at bigint not null
);
alter table event_budgets enable row level security;
drop policy if exists "user_events" on event_budgets;
create policy "user_events" on event_budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists utility_bills (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric not null,
  currency text not null default 'IDR',
  due_day int not null,
  category text not null,
  is_active boolean not null default true,
  last_paid_at bigint,
  created_at bigint not null,
  updated_at bigint not null
);
alter table utility_bills enable row level security;
drop policy if exists "user_utility" on utility_bills;
create policy "user_utility" on utility_bills for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
`;

export async function GET() {
  const { Client } = await import("pg");
  const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await db.connect();
    await db.query(SQL);
    await db.end();
    return NextResponse.json({ ok: true, message: "Migration done" });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
