import { supabase } from "./supabase";
import type { Wallet, Transaction, Category, Budget, Goal, RecurringTransaction, IouRecord, Loan, Investment, WishlistItem, EventBudget, UtilityBill, TravelPlan, CategorizationRule, Household, HouseholdMember } from "./types";

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

// ─── Recurring Transactions ────────────────────────────────────────────────

function recurringFromDB(r: Record<string, unknown>): RecurringTransaction {
  return {
    id: r.id as string,
    amount: Number(r.amount),
    type: r.type as RecurringTransaction["type"],
    categoryId: r.category_id as string,
    walletId: r.wallet_id as string,
    description: r.description as string,
    frequency: r.frequency as RecurringTransaction["frequency"],
    nextOccurrence: Number(r.next_occurrence),
    startDate: r.start_date ? Number(r.start_date) : undefined,
    isActive: Boolean(r.is_active),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function recurringToDB(rt: RecurringTransaction, userId: string) {
  return {
    id: rt.id, user_id: userId, amount: rt.amount, type: rt.type,
    category_id: rt.categoryId, wallet_id: rt.walletId,
    description: rt.description, frequency: rt.frequency,
    next_occurrence: rt.nextOccurrence, start_date: rt.startDate ?? null,
    is_active: rt.isActive, created_at: rt.createdAt, updated_at: rt.updatedAt,
  };
}

export async function getRecurring(): Promise<RecurringTransaction[]> {
  const { data, error } = await supabase.from("recurring_transactions").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => recurringFromDB(r as Record<string, unknown>));
}

export async function saveRecurring(rt: RecurringTransaction) {
  const userId = await getUserId();
  const { error } = await supabase.from("recurring_transactions").upsert(recurringToDB(rt, userId));
  if (error) throw error;
}

export async function deleteRecurring(id: string) {
  const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
  if (error) throw error;
}

// ─── IOU Records ──────────────────────────────────────────────────────────

function iouFromDB(r: Record<string, unknown>): IouRecord {
  return {
    id: r.id as string,
    personName: r.person_name as string,
    phoneNumber: r.phone_number as string | undefined,
    direction: r.direction as IouRecord["direction"],
    totalAmount: Number(r.total_amount),
    remainingAmount: Number(r.remaining_amount),
    description: r.description as string | undefined,
    dueDate: r.due_date ? Number(r.due_date) : undefined,
    status: r.status as IouRecord["status"],
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function iouToDB(iou: IouRecord, userId: string) {
  return {
    id: iou.id, user_id: userId, person_name: iou.personName,
    phone_number: iou.phoneNumber ?? null, direction: iou.direction,
    total_amount: iou.totalAmount, remaining_amount: iou.remainingAmount,
    description: iou.description ?? null, due_date: iou.dueDate ?? null,
    status: iou.status, created_at: iou.createdAt, updated_at: iou.updatedAt,
  };
}

export async function getIouRecords(): Promise<IouRecord[]> {
  const { data, error } = await supabase.from("iou_records").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => iouFromDB(r as Record<string, unknown>));
}

export async function saveIouRecord(iou: IouRecord) {
  const userId = await getUserId();
  const { error } = await supabase.from("iou_records").upsert(iouToDB(iou, userId));
  if (error) throw error;
}

export async function deleteIouRecord(id: string) {
  const { error } = await supabase.from("iou_records").delete().eq("id", id);
  if (error) throw error;
}

// ─── Loans ────────────────────────────────────────────────────────────────

function loanFromDB(r: Record<string, unknown>): Loan {
  return {
    id: r.id as string, name: r.name as string,
    principal: Number(r.principal), annualInterestRate: Number(r.annual_interest_rate),
    termMonths: Number(r.term_months), startDate: Number(r.start_date),
    remainingPrincipal: Number(r.remaining_principal), currency: r.currency as string,
    createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  };
}

function loanToDB(loan: Loan, userId: string) {
  return {
    id: loan.id, user_id: userId, name: loan.name, principal: loan.principal,
    annual_interest_rate: loan.annualInterestRate, term_months: loan.termMonths,
    start_date: loan.startDate, remaining_principal: loan.remainingPrincipal,
    currency: loan.currency, created_at: loan.createdAt, updated_at: loan.updatedAt,
  };
}

export async function getLoans(): Promise<Loan[]> {
  const { data, error } = await supabase.from("loans").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => loanFromDB(r as Record<string, unknown>));
}

export async function saveLoan(loan: Loan) {
  const userId = await getUserId();
  const { error } = await supabase.from("loans").upsert(loanToDB(loan, userId));
  if (error) throw error;
}

export async function deleteLoan(id: string) {
  const { error } = await supabase.from("loans").delete().eq("id", id);
  if (error) throw error;
}

// ─── Investments ──────────────────────────────────────────────────────────

function investmentFromDB(r: Record<string, unknown>): Investment {
  return {
    id: r.id as string, name: r.name as string,
    type: r.type as Investment["type"], ticker: r.ticker as string | undefined,
    units: Number(r.units), avgPrice: Number(r.avg_price),
    currentPrice: Number(r.current_price), currency: r.currency as string,
    createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  };
}

function investmentToDB(inv: Investment, userId: string) {
  return {
    id: inv.id, user_id: userId, name: inv.name, type: inv.type,
    ticker: inv.ticker ?? null, units: inv.units, avg_price: inv.avgPrice,
    current_price: inv.currentPrice, currency: inv.currency,
    created_at: inv.createdAt, updated_at: inv.updatedAt,
  };
}

export async function getInvestments(): Promise<Investment[]> {
  const { data, error } = await supabase.from("investments").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => investmentFromDB(r as Record<string, unknown>));
}

export async function saveInvestment(inv: Investment) {
  const userId = await getUserId();
  const { error } = await supabase.from("investments").upsert(investmentToDB(inv, userId));
  if (error) throw error;
}

export async function deleteInvestment(id: string) {
  const { error } = await supabase.from("investments").delete().eq("id", id);
  if (error) throw error;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────

function wishlistFromDB(r: Record<string, unknown>): WishlistItem {
  return {
    id: r.id as string, name: r.name as string,
    targetPrice: Number(r.target_price), savedAmount: Number(r.saved_amount),
    currency: r.currency as string, targetDate: r.target_date ? Number(r.target_date) : undefined,
    priority: r.priority as WishlistItem["priority"], notes: r.notes as string | undefined,
    createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  };
}

function wishlistToDB(item: WishlistItem, userId: string) {
  return {
    id: item.id, user_id: userId, name: item.name, target_price: item.targetPrice,
    saved_amount: item.savedAmount, currency: item.currency,
    target_date: item.targetDate ?? null, priority: item.priority,
    notes: item.notes ?? null, created_at: item.createdAt, updated_at: item.updatedAt,
  };
}

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const { data, error } = await supabase.from("wishlist_items").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => wishlistFromDB(r as Record<string, unknown>));
}

export async function saveWishlistItem(item: WishlistItem) {
  const userId = await getUserId();
  const { error } = await supabase.from("wishlist_items").upsert(wishlistToDB(item, userId));
  if (error) throw error;
}

export async function deleteWishlistItem(id: string) {
  const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
  if (error) throw error;
}

// ─── Event Budgets ────────────────────────────────────────────────────────

function eventBudgetFromDB(r: Record<string, unknown>): EventBudget {
  return {
    id: r.id as string, name: r.name as string, date: Number(r.date),
    totalBudget: Number(r.total_budget), currency: r.currency as string,
    items: (r.items as EventBudget["items"]) ?? [],
    createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  };
}

function eventBudgetToDB(ev: EventBudget, userId: string) {
  return {
    id: ev.id, user_id: userId, name: ev.name, date: ev.date,
    total_budget: ev.totalBudget, currency: ev.currency, items: ev.items,
    created_at: ev.createdAt, updated_at: ev.updatedAt,
  };
}

export async function getEventBudgets(): Promise<EventBudget[]> {
  const { data, error } = await supabase.from("event_budgets").select("*").order("date", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => eventBudgetFromDB(r as Record<string, unknown>));
}

export async function saveEventBudget(ev: EventBudget) {
  const userId = await getUserId();
  const { error } = await supabase.from("event_budgets").upsert(eventBudgetToDB(ev, userId));
  if (error) throw error;
}

export async function deleteEventBudget(id: string) {
  const { error } = await supabase.from("event_budgets").delete().eq("id", id);
  if (error) throw error;
}

// ─── Utility Bills ────────────────────────────────────────────────────────

function utilityFromDB(r: Record<string, unknown>): UtilityBill {
  return {
    id: r.id as string, name: r.name as string, amount: Number(r.amount),
    currency: r.currency as string, dueDay: Number(r.due_day),
    category: r.category as UtilityBill["category"], isActive: Boolean(r.is_active),
    lastPaidAt: r.last_paid_at ? Number(r.last_paid_at) : undefined,
    createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  };
}

function utilityToDB(bill: UtilityBill, userId: string) {
  return {
    id: bill.id, user_id: userId, name: bill.name, amount: bill.amount,
    currency: bill.currency, due_day: bill.dueDay, category: bill.category,
    is_active: bill.isActive, last_paid_at: bill.lastPaidAt ?? null,
    created_at: bill.createdAt, updated_at: bill.updatedAt,
  };
}

export async function getUtilityBills(): Promise<UtilityBill[]> {
  const { data, error } = await supabase.from("utility_bills").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => utilityFromDB(r as Record<string, unknown>));
}

export async function saveUtilityBill(bill: UtilityBill) {
  const userId = await getUserId();
  const { error } = await supabase.from("utility_bills").upsert(utilityToDB(bill, userId));
  if (error) throw error;
}

export async function deleteUtilityBill(id: string) {
  const { error } = await supabase.from("utility_bills").delete().eq("id", id);
  if (error) throw error;
}

export async function markUtilityBillPaid(id: string) {
  const userId = await getUserId();
  const { error } = await supabase
    .from("utility_bills")
    .update({ last_paid_at: Date.now(), updated_at: Date.now() })
    .eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

// ─── Travel Plans ──────────────────────────────────────────────────────────

function travelPlanFromDB(r: Record<string, unknown>): TravelPlan {
  return {
    id: r.id as string,
    name: r.name as string,
    destination: (r.destination as string) ?? "",
    startDate: (r.start_date as string) ?? "",
    endDate: (r.end_date as string) ?? "",
    totalBudget: Number(r.total_budget),
    items: (r.items as TravelPlan["items"]) ?? [],
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function travelPlanToDB(plan: TravelPlan, userId: string) {
  return {
    id: plan.id, user_id: userId, name: plan.name,
    destination: plan.destination, start_date: plan.startDate, end_date: plan.endDate,
    total_budget: plan.totalBudget, items: plan.items,
    created_at: plan.createdAt, updated_at: plan.updatedAt,
  };
}

export async function getTravelPlans(): Promise<TravelPlan[]> {
  const { data, error } = await supabase.from("travel_plans").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => travelPlanFromDB(r as Record<string, unknown>));
}

export async function saveTravelPlan(plan: TravelPlan) {
  const userId = await getUserId();
  const { error } = await supabase.from("travel_plans").upsert(travelPlanToDB(plan, userId));
  if (error) throw error;
}

export async function deleteTravelPlan(id: string) {
  const { error } = await supabase.from("travel_plans").delete().eq("id", id);
  if (error) throw error;
}

// ─── Categorization Rules ─────────────────────────────────────────────────

function ruleFromDB(r: Record<string, unknown>): CategorizationRule {
  return {
    id: r.id as string,
    keyword: r.keyword as string,
    categoryId: r.category_id as string,
    matchType: r.match_type as CategorizationRule["matchType"],
    priority: Number(r.priority),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function ruleToDB(rule: CategorizationRule, userId: string) {
  return {
    id: rule.id, user_id: userId, keyword: rule.keyword,
    category_id: rule.categoryId, match_type: rule.matchType,
    priority: rule.priority, created_at: rule.createdAt, updated_at: rule.updatedAt,
  };
}

export async function getCategorizationRules(): Promise<CategorizationRule[]> {
  const { data, error } = await supabase.from("categorization_rules").select("*").order("priority", { ascending: true });
  if (error) return [];
  return (data ?? []).map((r) => ruleFromDB(r as Record<string, unknown>));
}

export async function saveCategorizationRule(rule: CategorizationRule) {
  const userId = await getUserId();
  const { error } = await supabase.from("categorization_rules").upsert(ruleToDB(rule, userId));
  if (error) throw error;
}

export async function deleteCategorizationRule(id: string) {
  const { error } = await supabase.from("categorization_rules").delete().eq("id", id);
  if (error) throw error;
}

// ── Households ──────────────────────────────────────────────────────────────

function householdFromDB(r: Record<string, unknown>): Household {
  return {
    id: r.id as string,
    name: r.name as string,
    ownerId: r.owner_id as string,
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  };
}

function memberFromDB(r: Record<string, unknown>): HouseholdMember {
  return {
    id: r.id as string,
    householdId: r.household_id as string,
    userId: r.user_id as string | undefined,
    invitedEmail: r.invited_email as string | undefined,
    role: r.role as HouseholdMember["role"],
    status: r.status as HouseholdMember["status"],
    createdAt: new Date(r.created_at as string).getTime(),
  };
}

export async function getMyHousehold(): Promise<Household | null> {
  const userId = await getUserId();
  const { data, error } = await supabase.from("households").select("*").eq("owner_id", userId).maybeSingle();
  if (error) throw error;
  return data ? householdFromDB(data) : null;
}

export async function getHouseholdImMemberOf(): Promise<Household | null> {
  const { data, error } = await supabase
    .from("household_members").select("household_id, households(*)")
    .eq("status", "active").maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const h = (data as Record<string, unknown>).households;
  return h ? householdFromDB(h as Record<string, unknown>) : null;
}

export async function createHousehold(name: string): Promise<Household> {
  const userId = await getUserId();
  const { data, error } = await supabase.from("households")
    .insert({ name, owner_id: userId }).select().single();
  if (error) throw error;
  return householdFromDB(data);
}

export async function updateHouseholdName(id: string, name: string) {
  const { error } = await supabase.from("households").update({ name, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function deleteHousehold(id: string) {
  const { error } = await supabase.from("households").delete().eq("id", id);
  if (error) throw error;
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const { data, error } = await supabase.from("household_members").select("*").eq("household_id", householdId);
  if (error) throw error;
  return (data ?? []).map(memberFromDB);
}

export async function inviteMember(householdId: string, email: string): Promise<HouseholdMember> {
  const { data, error } = await supabase.from("household_members")
    .insert({ household_id: householdId, invited_email: email, role: "member", status: "pending" })
    .select().single();
  if (error) throw error;
  return memberFromDB(data);
}

export async function removeMember(memberId: string) {
  const { error } = await supabase.from("household_members").delete().eq("id", memberId);
  if (error) throw error;
}

export async function getPendingInvites(): Promise<(HouseholdMember & { householdName: string })[]> {
  const { data, error } = await supabase
    .from("household_members").select("*, households(name)")
    .eq("status", "pending");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...memberFromDB(r),
    householdName: (r.households as Record<string, unknown>)?.name as string ?? "",
  }));
}

export async function respondToInvite(memberId: string, accept: boolean): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase.from("household_members")
    .update({ status: accept ? "active" : "declined", user_id: accept ? userId : null })
    .eq("id", memberId);
  if (error) throw error;
}
