import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ChevronRight,
  Home as HomeIcon,
  Receipt,
  ShoppingBag,
  TrainFront,
  TramFront,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
  Calculator,
} from "lucide-react";
import { useStore } from "../state/store";
import { MEMBERS } from "../data/mock";
import type { Expense, MemberId } from "../data/types";
import { expenseShares, fmtEUR, fmtEURWhole } from "../data/balances";
import {
  AnimatedNumber,
  Avatar,
  GhostButton,
  HomeIndicator,
  PrimaryButton,
  Segmented,
  StatusBadge,
  StatusBar,
} from "../components/ui";
import { rowEnter, springFirm, tapCard } from "../components/motion";

const EXPENSE_ICONS: Record<string, LucideIcon> = {
  "e-airbnb": HomeIcon,
  "e-groceries": ShoppingBag,
  "e-sintra": TrainFront,
  "e-lunch": Utensils,
  "e-tram": TramFront,
  "e-dinner": UtensilsCrossed,
};

function ExpenseRow({ e, i, onOpen }: { e: Expense; i: number; onOpen: () => void }) {
  const Icon = EXPENSE_ICONS[e.id] ?? Receipt;
  const isDinner = e.id === "e-dinner";
  return (
    <motion.button
      {...rowEnter(i)}
      whileTap={tapCard}
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl bg-paper-0 p-3.5 text-left shadow-elev-1 active:bg-paper-100"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isDinner ? "bg-sunset-50 text-sunset-700" : "bg-paper-100 text-ink-600"
        }`}
      >
        <Icon size={19} strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-5 text-ink-900">{e.title}</p>
        <p className="text-xs font-medium text-ink-500">
          Paid by {MEMBERS[e.paidBy].name} · split {e.sharedBy.length} ways
        </p>
        {isDinner && (
          <span className="mt-1 inline-flex rounded-full bg-golden-50 px-2 py-0.5 text-[11px] font-semibold text-warning-700">
            wine excl. Ren &amp; Nic
          </span>
        )}
      </div>
      <span className="tabular text-[15px] font-bold text-ink-900">{fmtEUR(e.amount)}</span>
      <ChevronRight size={16} strokeWidth={2.25} className="-ml-1.5 shrink-0 text-ink-400" />
    </motion.button>
  );
}

export default function SplitTab() {
  const { state, dispatch, balances, iousBefore } = useStore();
  const [showMath, setShowMath] = useState(false);
  const [openMember, setOpenMember] = useState<MemberId | null>(null);

  const tripTotal = state.expenses.reduce((s, e) => s + e.amount, 0);
  const bal = (id: MemberId) => balances[id] ?? 0;
  const ariBal = bal("ari");
  const ariSquare = Math.abs(ariBal) < 0.005;

  const sorted = [...state.members].sort((a, b) => Math.abs(bal(b)) - Math.abs(bal(a)));
  const maxAbs = Math.max(...sorted.map((m) => Math.abs(bal(m))), 1);
  const hasTransfers = state.transfers.length > 0;
  const newestFirst = [...state.expenses].reverse();

  return (
    <div className="relative flex h-full flex-col bg-paper-50">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-2">
        <h1 className="min-w-0 flex-1 truncate text-[20px] font-bold tracking-[-0.2px] text-ink-900">
          Split · Lisboa com Amigos
        </h1>
        <span className="tabular shrink-0 rounded-full bg-paper-100 px-2.5 py-1.5 text-xs font-semibold text-ink-600">
          <AnimatedNumber value={tripTotal} format={fmtEURWhole} /> trip total
        </span>
      </div>

      <div className="px-5 pb-1 pt-1">
        <LayoutGroup id="split-segment">
          <Segmented<"expenses" | "balances">
            options={[
              { value: "expenses", label: "Expenses" },
              { value: "balances", label: "Balances" },
            ]}
            value={state.splitSegment}
            onChange={(segment) => dispatch({ type: "SET_SPLIT_SEGMENT", segment })}
          />
        </LayoutGroup>
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto px-5 pt-3 ${
          state.splitSegment === "balances" ? "pb-44" : "pb-32"
        }`}
      >
        {state.splitSegment === "expenses" ? (
          <div className="flex flex-col gap-2.5">
            {newestFirst.map((e, i) => (
              <ExpenseRow
                key={e.id}
                e={e}
                i={i}
                onOpen={() => dispatch({ type: "OPEN_SHEET", sheet: "expenseDetail", payload: e.id })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* My status hero */}
            <div className="rounded-3xl bg-sunset-50 px-5 py-6 text-center">
              <p className="text-[15px] font-semibold text-sunset-700">
                {ariSquare ? "You're all square" : ariBal < 0 ? "You owe" : "You're owed"}
              </p>
              <AnimatedNumber
                value={Math.abs(ariBal)}
                format={fmtEUR}
                className="mt-1 text-[34px] font-extrabold leading-10 tracking-[-0.5px] text-ink-900"
              />
            </div>

            {/* Balance list */}
            <div className="rounded-3xl bg-paper-0 p-4 shadow-elev-1">
              <div className="flex flex-col gap-3.5">
                {sorted.map((id, i) => {
                  const v = bal(id);
                  const zero = Math.abs(v) < 0.005;
                  const isOpen = openMember === id;
                  const paid = state.expenses.filter((e) => e.paidBy === id);
                  const owed = state.expenses
                    .map((e) => ({ e, share: expenseShares(e)[id] ?? 0 }))
                    .filter((r) => r.share > 0.005);
                  return (
                    <motion.div key={id} {...rowEnter(i)}>
                      <motion.button
                        whileTap={tapCard}
                        transition={springFirm}
                        onClick={() => setOpenMember(isOpen ? null : id)}
                        className="hit44 flex w-full items-center gap-2.5 text-left"
                      >
                        <Avatar id={id} size={36} />
                        <span className="w-14 shrink-0 truncate text-sm font-semibold text-ink-900">
                          {MEMBERS[id].name}
                        </span>
                        {MEMBERS[id].guest && (
                          <span className="shrink-0 rounded-full bg-paper-100 px-2 py-0.5 text-[10px] font-semibold text-ink-500">
                            guest
                          </span>
                        )}
                        <div className="flex-1">
                          {!zero && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max((Math.abs(v) / maxAbs) * 100, 8)}%` }}
                              transition={{ type: "spring", stiffness: 160, damping: 26 }}
                              className={`h-2 rounded-full ${v > 0 ? "bg-lagoon-500" : "bg-sunset-500"}`}
                            />
                          )}
                        </div>
                        {zero ? (
                          <span className="tabular shrink-0 text-sm font-semibold text-ink-500">
                            €0
                          </span>
                        ) : (
                          <AnimatedNumber
                            value={Math.abs(v)}
                            format={(n) => `${v < 0 ? "−" : "+"}${fmtEUR(n)}`}
                            className={`shrink-0 text-sm font-bold ${
                              v < 0 ? "text-error-600" : "text-lagoon-700"
                            }`}
                          />
                        )}
                      </motion.button>
                      {/* Inline contribution mini-list — one open at a time */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0.4 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0.4 }}
                            transition={{ type: "spring", stiffness: 220, damping: 30 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2">
                              <div className="ml-[46px] rounded-2xl bg-paper-50 px-3.5 py-3">
                                {paid.length > 0 && (
                                  <>
                                    <p className="text-[11px] font-bold text-ink-500">Paid</p>
                                    {paid.map((e) => (
                                      <div
                                        key={e.id}
                                        className="mt-1 flex items-baseline justify-between gap-2"
                                      >
                                        <span className="min-w-0 truncate text-xs font-medium text-ink-600">
                                          {e.title}
                                        </span>
                                        <span className="tabular shrink-0 text-xs font-semibold text-lagoon-700">
                                          +{fmtEUR(e.amount)}
                                        </span>
                                      </div>
                                    ))}
                                  </>
                                )}
                                <p
                                  className={`text-[11px] font-bold text-ink-500 ${
                                    paid.length ? "mt-2.5" : ""
                                  }`}
                                >
                                  {id === "ari" ? "Your share" : "Their share"}
                                </p>
                                {owed.map(({ e, share }) => (
                                  <div
                                    key={e.id}
                                    className="mt-1 flex items-baseline justify-between gap-2"
                                  >
                                    <span className="min-w-0 truncate text-xs font-medium text-ink-600">
                                      {e.title}
                                    </span>
                                    <span className="tabular shrink-0 text-xs font-semibold text-ink-600">
                                      −{fmtEUR(share)}
                                    </span>
                                  </div>
                                ))}
                                <div className="mt-2.5 flex items-baseline justify-between border-t border-line-200 pt-2">
                                  <span className="text-xs font-semibold text-ink-600">Net</span>
                                  <span
                                    className={`tabular text-xs font-bold ${
                                      zero
                                        ? "text-ink-500"
                                        : v < 0
                                          ? "text-error-600"
                                          : "text-lagoon-700"
                                    }`}
                                  >
                                    {zero ? "€0.00" : `${v < 0 ? "−" : "+"}${fmtEUR(Math.abs(v))}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Smart settle */}
            <div className="rounded-3xl bg-paper-0 p-4 shadow-elev-1">
              {hasTransfers ? (
                <>
                  <p className="text-[15px] font-bold text-ink-900">
                    <Calculator size={14} strokeWidth={2} className="mr-1 inline align-[-2px]" />Smart settle: <span className="tabular">{iousBefore}</span> IOUs →{" "}
                    <span className="tabular">{state.transfers.length}</span> payments
                  </p>
                  <div className="mt-3 flex flex-col gap-3">
                    {state.transfers.map((t, i) => {
                      const pending = t.status === "pending";
                      return (
                        <motion.button
                          key={t.from}
                          {...rowEnter(i, 0.06)}
                          whileTap={pending ? tapCard : undefined}
                          disabled={!pending}
                          onClick={() =>
                            dispatch({ type: "OPEN_SHEET", sheet: "pay", payload: t.from })
                          }
                          aria-label={
                            pending
                              ? `Pay ${MEMBERS[t.to].name} ${fmtEUR(t.amount)} for ${MEMBERS[t.from].name}`
                              : undefined
                          }
                          className="hit44 flex w-full items-center gap-2.5 text-left"
                        >
                          <Avatar id={t.from} size={28} state={t.status === "paid" ? "settled" : "default"} />
                          <span className="flex-1 text-sm font-semibold text-ink-900">
                            {MEMBERS[t.from].name} → {MEMBERS[t.to].name}
                          </span>
                          <span className="tabular text-sm font-bold text-ink-900">
                            {fmtEUR(t.amount)}
                          </span>
                          <StatusBadge status={t.status} />
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs font-medium text-ink-500">
                    Tap a row to pay. Everyone pays at most once — Nic receives everything.
                  </p>
                </>
              ) : (
                <p className="py-1 text-center text-sm font-medium text-ink-500">
                  Add tonight's dinner to settle the trip
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <GhostButton onClick={() => setShowMath((v) => !v)}>
                {showMath ? "Hide the math" : "See the math"}
              </GhostButton>
            </div>

            <AnimatePresence initial={false}>
              {showMath && (
                <motion.div
                  initial={{ height: 0, opacity: 0.4 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0.4 }}
                  transition={{ type: "spring", stiffness: 220, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2.5 rounded-3xl bg-paper-0 p-4 shadow-elev-1">
                    {state.expenses.map((e) => {
                      const shares = expenseShares(e);
                      return (
                        <div key={e.id} className="border-b border-line-200 pb-2.5 last:border-0 last:pb-0">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[13px] font-semibold text-ink-900">{e.title}</span>
                            <span className="tabular text-[13px] font-bold text-ink-900">
                              {fmtEUR(e.amount)}
                            </span>
                          </div>
                          <p className="tabular mt-0.5 text-[11px] font-medium leading-4 text-ink-500">
                            {Object.entries(shares)
                              .map(([m, s]) => `${MEMBERS[m].name} ${fmtEUR(s)}`)
                              .join(" · ")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Primary CTA rides above the tab bar so it is reachable without
          scrolling the balance list — same sticky-footer placement the
          sheets use. */}
      {state.splitSegment === "balances" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[88px] z-20 bg-gradient-to-t from-paper-50 via-paper-50 to-transparent px-5 pb-3 pt-6">
          <div className="pointer-events-auto">
            <PrimaryButton
              full
              disabled={!hasTransfers}
              onClick={() => dispatch({ type: "START_SETTLE" })}
            >
              Settle up
            </PrimaryButton>
          </div>
        </div>
      )}

      <HomeIndicator />
    </div>
  );
}
