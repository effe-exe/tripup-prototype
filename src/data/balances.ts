import type { Expense, MemberId, Transfer } from "./types";

/** Per-member share of one expense (itemized or even). */
export function expenseShares(e: Expense): Record<MemberId, number> {
  const shares = {} as Record<MemberId, number>;
  if (e.items && e.items.length) {
    for (const item of e.items) {
      const each = item.amount / item.sharedBy.length;
      for (const m of item.sharedBy) shares[m] = (shares[m] ?? 0) + each;
    }
  } else {
    const each = e.amount / e.sharedBy.length;
    for (const m of e.sharedBy) shares[m] = (shares[m] ?? 0) + each;
  }
  return shares;
}

/** Net balance per member: paid − owed. Positive = is owed money. */
export function computeBalances(expenses: Expense[]): Record<MemberId, number> {
  const net = {} as Record<MemberId, number>;
  for (const e of expenses) {
    net[e.paidBy] = (net[e.paidBy] ?? 0) + e.amount;
    const shares = expenseShares(e);
    for (const [m, s] of Object.entries(shares)) {
      net[m as MemberId] = (net[m as MemberId] ?? 0) - s;
    }
  }
  // clamp float noise
  for (const k of Object.keys(net)) net[k as MemberId] = Math.round(net[k as MemberId] * 100) / 100;
  return net;
}

/** Count of nonzero pairwise IOUs if debts were settled per-expense (the "before" number). */
export function pairwiseIouCount(expenses: Expense[]): number {
  const pair = new Map<string, number>();
  for (const e of expenses) {
    const shares = expenseShares(e);
    for (const [m, s] of Object.entries(shares)) {
      if (m === e.paidBy) continue;
      const key = m < e.paidBy ? `${m}|${e.paidBy}` : `${e.paidBy}|${m}`;
      const sign = m < e.paidBy ? s : -s;
      pair.set(key, (pair.get(key) ?? 0) + sign);
    }
  }
  let count = 0;
  for (const v of pair.values()) if (Math.abs(v) > 0.005) count++;
  return count;
}

/** Greedy min-cash-flow consolidation: largest debtor pays largest creditor. */
export function minimizeTransfers(net: Record<MemberId, number>): Transfer[] {
  const debtors = Object.entries(net)
    .filter(([, v]) => v < -0.005)
    .map(([m, v]) => ({ m: m as MemberId, v: -v }));
  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0.005)
    .map(([m, v]) => ({ m: m as MemberId, v }));
  debtors.sort((a, b) => b.v - a.v);
  creditors.sort((a, b) => b.v - a.v);
  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].v, creditors[j].v);
    transfers.push({
      from: debtors[i].m,
      to: creditors[j].m,
      amount: Math.round(pay * 100) / 100,
      status: "pending",
    });
    debtors[i].v -= pay;
    creditors[j].v -= pay;
    if (debtors[i].v < 0.005) i++;
    if (creditors[j].v < 0.005) j++;
  }
  return transfers;
}

export const fmtEUR = (n: number) =>
  "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtEURWhole = (n: number) => "€" + n.toLocaleString("en-IE");
