import { openDB, type IDBPDatabase } from "idb";
import type { Wallet, Transaction, Category, Budget, Goal } from "./types";

const DB_NAME = "finance-ai-journal";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("wallets")) {
        db.createObjectStore("wallets", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("transactions")) {
        const txStore = db.createObjectStore("transactions", { keyPath: "id" });
        txStore.createIndex("date", "date");
        txStore.createIndex("walletId", "walletId");
        txStore.createIndex("categoryId", "categoryId");
      }
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("budgets")) {
        db.createObjectStore("budgets", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("goals")) {
        db.createObjectStore("goals", { keyPath: "id" });
      }
    },
  });
  return dbInstance;
}

// Wallets
export async function getWallets(): Promise<Wallet[]> {
  const db = await getDB();
  return db.getAll("wallets");
}
export async function saveWallet(wallet: Wallet) {
  const db = await getDB();
  await db.put("wallets", wallet);
}
export async function deleteWallet(id: string) {
  const db = await getDB();
  await db.delete("wallets", id);
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  const all = await db.getAll("transactions");
  return all.sort((a, b) => b.date - a.date);
}
export async function saveTransaction(tx: Transaction) {
  const db = await getDB();
  await db.put("transactions", tx);
}
export async function deleteTransaction(id: string) {
  const db = await getDB();
  await db.delete("transactions", id);
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const db = await getDB();
  return db.getAll("categories");
}
export async function saveCategory(cat: Category) {
  const db = await getDB();
  await db.put("categories", cat);
}

// Budgets
export async function getBudgets(): Promise<Budget[]> {
  const db = await getDB();
  return db.getAll("budgets");
}
export async function saveBudget(budget: Budget) {
  const db = await getDB();
  await db.put("budgets", budget);
}
export async function deleteBudget(id: string) {
  const db = await getDB();
  await db.delete("budgets", id);
}

// Goals
export async function getGoals(): Promise<Goal[]> {
  const db = await getDB();
  return db.getAll("goals");
}
export async function saveGoal(goal: Goal) {
  const db = await getDB();
  await db.put("goals", goal);
}
export async function deleteGoal(id: string) {
  const db = await getDB();
  await db.delete("goals", id);
}
