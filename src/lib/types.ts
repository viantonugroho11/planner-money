export type TransactionType = "income" | "expense" | "transfer";

export type WalletType = "cash" | "bank" | "ewallet" | "investment" | "other";

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  parentId?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  walletId: string;
  toWalletId?: string;
  categoryId: string;
  note?: string;
  date: number;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
  period: "monthly" | "weekly" | "yearly";
  createdAt: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: number;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  recentTransactions: Transaction[];
  cashflowByDay: { date: string; income: number; expense: number }[];
  topCategories: { categoryId: string; name: string; amount: number; color: string }[];
}
