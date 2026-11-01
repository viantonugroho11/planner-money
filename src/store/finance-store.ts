"use client";
import { create } from "zustand";
import type { Wallet, Transaction, Category, Budget, Goal, RecurringTransaction, IouRecord, Loan, Investment, WishlistItem, EventBudget, UtilityBill, TravelPlan, CategorizationRule } from "@/lib/types";
import * as db from "@/lib/db";
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS, generateSeedTransactions } from "@/lib/seed";

interface FinanceStore {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  recurring: RecurringTransaction[];
  iouRecords: IouRecord[];
  loans: Loan[];
  investments: Investment[];
  wishlistItems: WishlistItem[];
  eventBudgets: EventBudget[];
  utilityBills: UtilityBill[];
  travelPlans: TravelPlan[];
  categorizationRules: CategorizationRule[];
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

  // Categories
  addCategory: (cat: Category) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;

  // Budgets
  addBudget: (budget: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;

  // Goals
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;

  // Recurring
  addRecurring: (rt: RecurringTransaction) => Promise<void>;
  updateRecurring: (rt: RecurringTransaction) => Promise<void>;
  removeRecurring: (id: string) => Promise<void>;

  // IOU
  addIouRecord: (iou: IouRecord) => Promise<void>;
  updateIouRecord: (iou: IouRecord) => Promise<void>;
  removeIouRecord: (id: string) => Promise<void>;

  // Loans
  addLoan: (loan: Loan) => Promise<void>;
  updateLoan: (loan: Loan) => Promise<void>;
  removeLoan: (id: string) => Promise<void>;

  // Investments
  addInvestment: (inv: Investment) => Promise<void>;
  updateInvestment: (inv: Investment) => Promise<void>;
  removeInvestment: (id: string) => Promise<void>;

  // Wishlist
  addWishlistItem: (item: WishlistItem) => Promise<void>;
  updateWishlistItem: (item: WishlistItem) => Promise<void>;
  removeWishlistItem: (id: string) => Promise<void>;

  // Event Budgets
  addEventBudget: (ev: EventBudget) => Promise<void>;
  updateEventBudget: (ev: EventBudget) => Promise<void>;
  removeEventBudget: (id: string) => Promise<void>;

  // Utility Bills
  addUtilityBill: (bill: UtilityBill) => Promise<void>;
  updateUtilityBill: (bill: UtilityBill) => Promise<void>;
  removeUtilityBill: (id: string) => Promise<void>;
  markUtilityPaid: (id: string) => Promise<void>;

  // Travel Plans
  addTravelPlan: (plan: TravelPlan) => Promise<void>;
  updateTravelPlan: (plan: TravelPlan) => Promise<void>;
  removeTravelPlan: (id: string) => Promise<void>;

  // Categorization Rules
  addCategorizationRule: (rule: CategorizationRule) => Promise<void>;
  updateCategorizationRule: (rule: CategorizationRule) => Promise<void>;
  removeCategorizationRule: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  wallets: [],
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  recurring: [],
  iouRecords: [],
  loans: [],
  investments: [],
  wishlistItems: [],
  eventBudgets: [],
  utilityBills: [],
  travelPlans: [],
  categorizationRules: [],
  initialized: false,

  reset: () => {
    set({ wallets: [], transactions: [], categories: [], budgets: [], goals: [], recurring: [], iouRecords: [], loans: [], investments: [], wishlistItems: [], eventBudgets: [], utilityBills: [], travelPlans: [], categorizationRules: [], initialized: false });
  },

  init: async () => {
    if (get().initialized) return;

    let [wallets, transactions, categories, budgets, goals, recurring, iouRecords, loans, investments, wishlistItems, eventBudgets, utilityBills, travelPlans, categorizationRules] = await Promise.all([
      db.getWallets(),
      db.getTransactions(),
      db.getCategories(),
      db.getBudgets(),
      db.getGoals(),
      db.getRecurring(),
      db.getIouRecords(),
      db.getLoans(),
      db.getInvestments(),
      db.getWishlistItems(),
      db.getEventBudgets(),
      db.getUtilityBills(),
      db.getTravelPlans(),
      db.getCategorizationRules(),
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

    set({ wallets, transactions, categories, budgets, goals, recurring, iouRecords, loans, investments, wishlistItems, eventBudgets, utilityBills, travelPlans, categorizationRules, initialized: true });
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

  addCategory: async (cat) => {
    await db.saveCategory(cat);
    set((s) => ({ categories: [...s.categories, cat] }));
  },
  updateCategory: async (cat) => {
    await db.saveCategory(cat);
    set((s) => ({ categories: s.categories.map((c) => (c.id === cat.id ? cat : c)) }));
  },
  removeCategory: async (id) => {
    const { error } = await import("@/lib/supabase").then(m => m.supabase.from("categories").delete().eq("id", id));
    if (error) throw error;
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
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

  addRecurring: async (rt) => {
    await db.saveRecurring(rt);
    set((s) => ({ recurring: [rt, ...s.recurring] }));
  },
  updateRecurring: async (rt) => {
    await db.saveRecurring(rt);
    set((s) => ({ recurring: s.recurring.map((r) => (r.id === rt.id ? rt : r)) }));
  },
  removeRecurring: async (id) => {
    await db.deleteRecurring(id);
    set((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) }));
  },

  addIouRecord: async (iou) => {
    await db.saveIouRecord(iou);
    set((s) => ({ iouRecords: [iou, ...s.iouRecords] }));
  },
  updateIouRecord: async (iou) => {
    await db.saveIouRecord(iou);
    set((s) => ({ iouRecords: s.iouRecords.map((r) => (r.id === iou.id ? iou : r)) }));
  },
  removeIouRecord: async (id) => {
    await db.deleteIouRecord(id);
    set((s) => ({ iouRecords: s.iouRecords.filter((r) => r.id !== id) }));
  },

  addLoan: async (loan) => {
    await db.saveLoan(loan);
    set((s) => ({ loans: [loan, ...s.loans] }));
  },
  updateLoan: async (loan) => {
    await db.saveLoan(loan);
    set((s) => ({ loans: s.loans.map((l) => (l.id === loan.id ? loan : l)) }));
  },
  removeLoan: async (id) => {
    await db.deleteLoan(id);
    set((s) => ({ loans: s.loans.filter((l) => l.id !== id) }));
  },

  addInvestment: async (inv) => {
    await db.saveInvestment(inv);
    set((s) => ({ investments: [inv, ...s.investments] }));
  },
  updateInvestment: async (inv) => {
    await db.saveInvestment(inv);
    set((s) => ({ investments: s.investments.map((i) => (i.id === inv.id ? inv : i)) }));
  },
  removeInvestment: async (id) => {
    await db.deleteInvestment(id);
    set((s) => ({ investments: s.investments.filter((i) => i.id !== id) }));
  },

  addWishlistItem: async (item) => {
    await db.saveWishlistItem(item);
    set((s) => ({ wishlistItems: [item, ...s.wishlistItems] }));
  },
  updateWishlistItem: async (item) => {
    await db.saveWishlistItem(item);
    set((s) => ({ wishlistItems: s.wishlistItems.map((w) => (w.id === item.id ? item : w)) }));
  },
  removeWishlistItem: async (id) => {
    await db.deleteWishlistItem(id);
    set((s) => ({ wishlistItems: s.wishlistItems.filter((w) => w.id !== id) }));
  },

  addEventBudget: async (ev) => {
    await db.saveEventBudget(ev);
    set((s) => ({ eventBudgets: [ev, ...s.eventBudgets] }));
  },
  updateEventBudget: async (ev) => {
    await db.saveEventBudget(ev);
    set((s) => ({ eventBudgets: s.eventBudgets.map((e) => (e.id === ev.id ? ev : e)) }));
  },
  removeEventBudget: async (id) => {
    await db.deleteEventBudget(id);
    set((s) => ({ eventBudgets: s.eventBudgets.filter((e) => e.id !== id) }));
  },

  addUtilityBill: async (bill) => {
    await db.saveUtilityBill(bill);
    set((s) => ({ utilityBills: [bill, ...s.utilityBills] }));
  },
  updateUtilityBill: async (bill) => {
    await db.saveUtilityBill(bill);
    set((s) => ({ utilityBills: s.utilityBills.map((b) => (b.id === bill.id ? bill : b)) }));
  },
  removeUtilityBill: async (id) => {
    await db.deleteUtilityBill(id);
    set((s) => ({ utilityBills: s.utilityBills.filter((b) => b.id !== id) }));
  },
  markUtilityPaid: async (id) => {
    await db.markUtilityBillPaid(id);
    set((s) => ({
      utilityBills: s.utilityBills.map((b) => b.id === id ? { ...b, lastPaidAt: Date.now() } : b)
    }));
  },

  addTravelPlan: async (plan) => {
    await db.saveTravelPlan(plan);
    set((s) => ({ travelPlans: [plan, ...s.travelPlans] }));
  },
  updateTravelPlan: async (plan) => {
    await db.saveTravelPlan(plan);
    set((s) => ({ travelPlans: s.travelPlans.map((p) => (p.id === plan.id ? plan : p)) }));
  },
  removeTravelPlan: async (id) => {
    await db.deleteTravelPlan(id);
    set((s) => ({ travelPlans: s.travelPlans.filter((p) => p.id !== id) }));
  },

  addCategorizationRule: async (rule) => {
    await db.saveCategorizationRule(rule);
    set((s) => ({ categorizationRules: [...s.categorizationRules, rule].sort((a, b) => a.priority - b.priority) }));
  },
  updateCategorizationRule: async (rule) => {
    await db.saveCategorizationRule(rule);
    set((s) => ({ categorizationRules: s.categorizationRules.map((r) => (r.id === rule.id ? rule : r)) }));
  },
  removeCategorizationRule: async (id) => {
    await db.deleteCategorizationRule(id);
    set((s) => ({ categorizationRules: s.categorizationRules.filter((r) => r.id !== id) }));
  },
}));
