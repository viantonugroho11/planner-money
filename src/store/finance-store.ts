"use client";
import { create } from "zustand";
import type { Wallet, Transaction, Category, Budget, Goal } from "@/lib/types";
import * as db from "@/lib/db";
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS, generateSeedTransactions } from "@/lib/seed";

interface FinanceStore {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  initialized: boolean;

  init: () => Promise<void>;
  reset: () => void;

  // Wallets
  addWallet: (wallet: Wallet) => Promise<void>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  removeWallet: (id: string) => Promise<void>;

  // Transactions
  addTransaction: (tx: Transaction) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;

  // Budgets
  addBudget: (budget: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;

  // Goals
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  wallets: [],
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  initialized: false,

  reset: () => {
    set({ wallets: [], transactions: [], categories: [], budgets: [], goals: [], initialized: false });
  },

  init: async () => {
    if (get().initialized) return;

    let [wallets, transactions, categories, budgets, goals] = await Promise.all([
      db.getWallets(),
      db.getTransactions(),
      db.getCategories(),
      db.getBudgets(),
      db.getGoals(),
    ]);

    // Seed defaults on first run
    if (categories.length === 0) {
      await Promise.all(DEFAULT_CATEGORIES.map((c) => db.saveCategory(c)));
      categories = DEFAULT_CATEGORIES;
    }
    if (wallets.length === 0) {
      await Promise.all(DEFAULT_WALLETS.map((w) => db.saveWallet(w)));
      wallets = DEFAULT_WALLETS;
    }
    if (transactions.length === 0) {
      const seed = generateSeedTransactions();
      await Promise.all(seed.map((t) => db.saveTransaction(t)));
      transactions = seed.sort((a, b) => b.date - a.date);
    }

    set({ wallets, transactions, categories, budgets, goals, initialized: true });
  },

  addWallet: async (wallet) => {
    await db.saveWallet(wallet);
    set((s) => ({ wallets: [...s.wallets, wallet] }));
  },
  updateWallet: async (wallet) => {
    await db.saveWallet(wallet);
    set((s) => ({ wallets: s.wallets.map((w) => (w.id === wallet.id ? wallet : w)) }));
  },
  removeWallet: async (id) => {
    await db.deleteWallet(id);
    set((s) => ({ wallets: s.wallets.filter((w) => w.id !== id) }));
  },

  addTransaction: async (tx) => {
    await db.saveTransaction(tx);
    // Update wallet balance
    const wallets = get().wallets;
    const wallet = wallets.find((w) => w.id === tx.walletId);
    if (wallet) {
      const delta = tx.type === "income" ? tx.amount : tx.type === "expense" ? -tx.amount : -tx.amount;
      const updated = { ...wallet, balance: wallet.balance + delta, updatedAt: Date.now() };
      await db.saveWallet(updated);
      set((s) => ({
        transactions: [tx, ...s.transactions],
        wallets: s.wallets.map((w) => (w.id === updated.id ? updated : w)),
      }));
    } else {
      set((s) => ({ transactions: [tx, ...s.transactions] }));
    }
  },
  updateTransaction: async (tx) => {
    await db.saveTransaction(tx);
    set((s) => ({ transactions: s.transactions.map((t) => (t.id === tx.id ? tx : t)) }));
  },
  removeTransaction: async (id) => {
    await db.deleteTransaction(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  addBudget: async (budget) => {
    await db.saveBudget(budget);
    set((s) => ({ budgets: [...s.budgets, budget] }));
  },
  removeBudget: async (id) => {
    await db.deleteBudget(id);
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
  },

  addGoal: async (goal) => {
    await db.saveGoal(goal);
    set((s) => ({ goals: [...s.goals, goal] }));
  },
  updateGoal: async (goal) => {
    await db.saveGoal(goal);
    set((s) => ({ goals: s.goals.map((g) => (g.id === goal.id ? goal : g)) }));
  },
  removeGoal: async (id) => {
    await db.deleteGoal(id);
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
  },
}));
