import { useRef } from "react";
import {
  Home as HomeIcon,
  Receipt,
  ShoppingBag,
  TrainFront,
  TramFront,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Avatar, BottomSheet, GhostButton } from "../../components/ui";
import { useStore } from "../../state/store";
import { MEMBERS } from "../../data/mock";
import type { Expense, MemberId } from "../../data/types";
import { expenseShares, fmtEUR, fmtEURWhole } from "../../data/balances";

const EXPENSE_ICONS: Record<string, LucideIcon> = {
  "e-airbnb": HomeIcon,
  "e-groceries": ShoppingBag,
  "e-sintra": TrainFront,
  "e-lunch": Utensils,
  "e-tram": TramFront,
  "e-dinner": UtensilsCrossed,
};

export default function ExpenseDetailSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "expenseDetail";
  const live = state.expenses.find((x) => x.id === state.sheetPayload) ?? null;
  // Keep the last expense around so content doesn't vanish during the close animation
  const lastRef = useRef<Expense | null>(null);
  if (live) lastRef.current = live;
  const e = live ?? lastRef.current;

  const close = () => dispatch({ type: "CLOSE_SHEET" });

  const Icon = e ? (EXPENSE_ICONS[e.id] ?? Receipt) : Receipt;
  const shares = e ? expenseShares(e) : ({} as Record<MemberId, number>);
  // Itemized expenses show every trip member (excluded ones greyed at €0.00);
  // even splits only list who shared it.
  const rows: MemberId[] = e ? (e.items ? state.members : e.sharedBy) : [];

  return (
    <BottomSheet open={open && !!e} onClose={close}>
      {e && (
        <div className="flex min-h-full flex-col px-5 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                e.id === "e-dinner" ? "bg-sunset-50 text-sunset-700" : "bg-paper-100 text-ink-600"
              }`}
            >
              <Icon size={22} strokeWidth={1.9} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[20px] font-bold leading-6 text-ink-900">{e.title}</h2>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-ink-500">
                <span>{e.date}</span>
                <span>·</span>
                <span>Paid by</span>
                <Avatar id={e.paidBy} size={18} />
                <span className="font-semibold text-ink-600">{MEMBERS[e.paidBy].name}</span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <p className="tabular mt-4 text-center text-[34px] font-extrabold leading-10 tracking-[-0.5px] text-ink-900">
            {fmtEUR(e.amount)}
          </p>

          {/* Item groups (itemized only) */}
          {e.items && (
            <div className="mt-4 flex flex-col gap-1.5 rounded-2xl bg-paper-100 px-4 py-3">
              {e.items.map((it) => {
                const everyone = it.sharedBy.length === e.sharedBy.length;
                const excl = e.sharedBy.filter((m) => !it.sharedBy.includes(m));
                return (
                  <p key={it.label} className="text-[13px] font-medium leading-[18px] text-ink-600">
                    <span className="font-semibold text-ink-900">{it.label}</span>{" "}
                    <span className="tabular">{fmtEURWhole(it.amount)}</span> ·{" "}
                    {everyone ? "everyone" : "excl. " + excl.map((m) => MEMBERS[m].name).join(" & ")}
                  </p>
                );
              })}
            </div>
          )}

          {/* Per-person breakdown */}
          <div className="mt-4 rounded-2xl bg-paper-0 p-4 shadow-elev-1">
            <p className="text-[13px] font-semibold text-ink-500">Who owes what</p>
            <div className="mt-3 flex flex-col gap-3">
              {rows.map((id) => {
                const share = shares[id] ?? 0;
                const excluded = share < 0.005;
                return (
                  <div key={id} className="flex items-center gap-2.5">
                    <Avatar id={id} size={32} state={excluded ? "excluded" : "default"} />
                    <span
                      className={`flex-1 truncate text-sm font-semibold ${
                        excluded ? "text-ink-500" : "text-ink-900"
                      }`}
                    >
                      {MEMBERS[id].name}
                      {id === e.paidBy && (
                        <span className="ml-1.5 rounded-full bg-lagoon-50 px-2 py-0.5 text-[10px] font-semibold text-lagoon-700">
                          paid
                        </span>
                      )}
                    </span>
                    <span
                      className={`tabular shrink-0 text-sm font-bold ${
                        excluded ? "text-ink-500" : "text-ink-900"
                      }`}
                    >
                      {fmtEUR(share)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer actions (mock) */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <GhostButton>Edit split</GhostButton>
            <GhostButton destructive>Delete expense</GhostButton>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
