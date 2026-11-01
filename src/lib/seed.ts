import type { Wallet, Category, Transaction } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense
  { id: "food", name: "Food & Drink", icon: "🍜", color: "#f97316", type: "expense" },
  { id: "transport", name: "Transport", icon: "🚗", color: "#3b82f6", type: "expense" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#a855f7", type: "expense" },
  { id: "health", name: "Health", icon: "💊", color: "#ef4444", type: "expense" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#ec4899", type: "expense" },
  { id: "bills", name: "Bills & Utilities", icon: "💡", color: "#eab308", type: "expense" },
  { id: "education", name: "Education", icon: "📚", color: "#06b6d4", type: "expense" },
  { id: "other_exp", name: "Other", icon: "📦", color: "#6b7280", type: "expense" },
  // Income
  { id: "salary", name: "Salary", icon: "💼", color: "#4ade80", type: "income" },
  { id: "freelance", name: "Freelance", icon: "💻", color: "#34d399", type: "income" },
  { id: "investment_inc", name: "Investment", icon: "📈", color: "#6ee7b7", type: "income" },
  { id: "other_inc", name: "Other Income", icon: "💰", color: "#a7f3d0", type: "income" },
];

export const DEFAULT_WALLETS: Wallet[] = [
  { id: "cash", name: "Cash", type: "cash", balance: 500000, currency: "IDR", color: "#4ade80", icon: "💵", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "bca", name: "BCA", type: "bank", balance: 5000000, currency: "IDR", color: "#3b82f6", icon: "🏦", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "gopay", name: "GoPay", type: "ewallet", balance: 250000, currency: "IDR", color: "#22d3ee", icon: "📱", createdAt: Date.now(), updatedAt: Date.now() },
];

function randomDate(daysAgo: number): number {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 22) + 1, Math.floor(Math.random() * 59));
  return d.getTime();
}

export function generateSeedTransactions(): Transaction[] {
  const wallets = ["cash", "bca", "gopay"];
  const expenseCats = ["food", "transport", "shopping", "health", "entertainment", "bills", "education", "other_exp"];
  const incomeCats = ["salary", "freelance", "investment_inc"];

  const txs: Transaction[] = [];
  const now = Date.now();

  // Monthly salary
  txs.push({
    id: `tx_salary_${now}`,
    type: "income",
    amount: 8000000,
    currency: "IDR",
    walletId: "bca",
    categoryId: "salary",
    note: "Monthly salary",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime(),
    createdAt: now,
    updatedAt: now,
  });

  // 30 random expenses
  for (let i = 0; i < 30; i++) {
    const id = `tx_exp_${i}_${now}`;
    txs.push({
      id,
      type: "expense",
      amount: Math.floor(Math.random() * 200000) + 10000,
      currency: "IDR",
      walletId: wallets[Math.floor(Math.random() * wallets.length)],
      categoryId: expenseCats[Math.floor(Math.random() * expenseCats.length)],
      note: "",
      date: randomDate(30),
      createdAt: now,
      updatedAt: now,
    });
  }

  // 5 extra incomes
  for (let i = 0; i < 5; i++) {
    const id = `tx_inc_${i}_${now}`;
    txs.push({
      id,
      type: "income",
      amount: Math.floor(Math.random() * 1000000) + 200000,
      currency: "IDR",
      walletId: "bca",
      categoryId: incomeCats[Math.floor(Math.random() * incomeCats.length)],
      date: randomDate(30),
      createdAt: now,
      updatedAt: now,
    });
  }

  return txs;
}
