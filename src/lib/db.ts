import { supabase } from "./supabase";
import type { Wallet, Transaction, Category, Budget, Goal } from "./types";

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ─── Mapping helpers (snake_case DB ↔ camelCase TS) ───────────────────────

function walletFromDB(r: Record<string, unknown>): Wallet {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as Wallet["type"],
    balance: Number(r.balance),
    currency: r.currency as string,
    color: r.color as string,
    icon: r.icon as string,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function walletToDB(w: Wallet, userId: string) {
  return {
    id: w.id,
    user_id: userId,
    name: w.name,
    type: w.type,
    balance: w.balance,
    currency: w.currency,
    color: w.color,
    icon: w.icon,
    created_at: w.createdAt,
    updated_at: w.updatedAt,
  };
}

function txFromDB(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    type: r.type as Transaction["type"],
    amount: Number(r.amount),
    currency: r.currency as string,
    walletId: r.wallet_id as string,
    toWalletId: r.to_wallet_id as string | undefined,
    categoryId: r.category_id as string,
    note: r.note as string | undefined,
    date: Number(r.date),
    tags: r.tags as string[] | undefined,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function txToDB(tx: Transaction, userId: string) {
  return {
    id: tx.id,
    user_id: userId,
    type: tx.type,
    amount: tx.amount,
    currency: tx.currency,
    wallet_id: tx.walletId,
    to_wallet_id: tx.toWalletId ?? null,
    category_id: tx.categoryId,
    note: tx.note ?? null,
    date: tx.date,
    tags: tx.tags ?? null,
    created_at: tx.createdAt,
    updated_at: tx.updatedAt,
  };
}

function categoryFromDB(r: Record<string, unknown>): Category {
  return {
    id: r.id as string,
    name: r.name as string,
    icon: r.icon as string,
    color: r.color as string,
    type: r.type as Category["type"],
    parentId: r.parent_id as string | undefined,
  };
}

function categoryToDB(c: Category, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type,
    parent_id: c.parentId ?? null,
  };
}

function budgetFromDB(r: Record<string, unknown>): Budget {
  return {
    id: r.id as string,
    categoryId: r.category_id as string,
    amount: Number(r.amount),
    currency: r.currency as string,
    period: r.period as Budget["period"],
    createdAt: Number(r.created_at),
  };
}

function budgetToDB(b: Budget, userId: string) {
  return {
    id: b.id,
    user_id: userId,
    category_id: b.categoryId,
    amount: b.amount,
    currency: b.currency,
    period: b.period,
    created_at: b.createdAt,
  };
}

function goalFromDB(r: Record<string, unknown>): Goal {
  return {
    id: r.id as string,
    name: r.name as string,
    targetAmount: Number(r.target_amount),
    currentAmount: Number(r.current_amount),
    currency: r.currency as string,
    deadline: r.deadline ? Number(r.deadline) : undefined,
    icon: r.icon as string,
    color: r.color as string,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function goalToDB(g: Goal, userId: string) {
  return {
    id: g.id,
    user_id: userId,
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount,
    currency: g.currency,
    deadline: g.deadline ?? null,
    icon: g.icon,
    color: g.color,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

// ─── Wallets ───────────────────────────────────────────────────────────────

export async function getWallets(): Promise<Wallet[]> {
  const { data, error } = await supabase.from("wallets").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => walletFromDB(r as Record<string, unknown>));
}

export async function saveWallet(wallet: Wallet) {
  const userId = await getUserId();
  const { error } = await supabase.from("wallets").upsert(walletToDB(wallet, userId));
  if (error) throw error;
}

export async function deleteWallet(id: string) {
  const { error } = await supabase.from("wallets").delete().eq("id", id);
  if (error) throw error;
}

// ─── Transactions ──────────────────────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => txFromDB(r as Record<string, unknown>));
}

export async function saveTransaction(tx: Transaction) {
  const userId = await getUserId();
  const { error } = await supabase.from("transactions").upsert(txToDB(tx, userId));
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// ─── Categories ────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => categoryFromDB(r as Record<string, unknown>));
}

export async function saveCategory(cat: Category) {
  const userId = await getUserId();
  const { error } = await supabase.from("categories").upsert(categoryToDB(cat, userId));
  if (error) throw error;
}

// ─── Budgets ───────────────────────────────────────────────────────────────

export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase.from("budgets").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => budgetFromDB(r as Record<string, unknown>));
}

export async function saveBudget(budget: Budget) {
  const userId = await getUserId();
  const { error } = await supabase.from("budgets").upsert(budgetToDB(budget, userId));
  if (error) throw error;
}

export async function deleteBudget(id: string) {
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) throw error;
}

// ─── Goals ─────────────────────────────────────────────────────────────────

export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabase.from("goals").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => goalFromDB(r as Record<string, unknown>));
}

export async function saveGoal(goal: Goal) {
  const userId = await getUserId();
  const { error } = await supabase.from("goals").upsert(goalToDB(goal, userId));
  if (error) throw error;
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}
