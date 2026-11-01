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

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  walletId: string;
  description: string;
  frequency: RecurringFrequency;
  nextOccurrence: number;
  startDate?: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export type IouDirection = "lent" | "borrowed";
export type IouStatus = "active" | "settled" | "cancelled";

export interface IouRecord {
  id: string;
  personName: string;
  phoneNumber?: string;
  direction: IouDirection;
  totalAmount: number;
  remainingAmount: number;
  description?: string;
  dueDate?: number;
  status: IouStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  annualInterestRate: number;
  termMonths: number;
  startDate: number;
  remainingPrincipal: number;
  currency: string;
  createdAt: number;
  updatedAt: number;
}

export type InvestmentType = "stock" | "crypto" | "mutual_fund" | "gold" | "property" | "other";

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  ticker?: string;
  units: number;
  avgPrice: number;
  currentPrice: number;
  currency: string;
  createdAt: number;
  updatedAt: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  targetPrice: number;
  savedAmount: number;
  currency: string;
  targetDate?: number;
  priority: "low" | "medium" | "high";
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EventBudgetItem {
  name: string;
  budget: number;
  spent: number;
}

export interface EventBudget {
  id: string;
  name: string;
  date: number;
  totalBudget: number;
  currency: string;
  items: EventBudgetItem[];
  createdAt: number;
  updatedAt: number;
}

export type UtilityBillCategory = "electricity" | "water" | "internet" | "phone" | "gas" | "other";

export interface UtilityBill {
  id: string;
  name: string;
  amount: number;
  currency: string;
  dueDay: number;
  category: UtilityBillCategory;
  isActive: boolean;
  lastPaidAt?: number;
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
