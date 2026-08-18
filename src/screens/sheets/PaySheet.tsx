import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Banknote, Check, Landmark, ShieldCheck, Wallet } from "lucide-react";
import { Avatar, BottomSheet, PrimaryButton } from "../../components/ui";
import { useStore, type Sheet } from "../../state/store";
import { MEMBERS } from "../../data/mock";
import { expenseShares, fmtEUR, transferKey } from "../../data/balances";
import type { Transfer } from "../../data/types";

/** European rails a group of friends actually uses. */
const METHODS = [
  { id: "apple", label: "Apple Pay", detail: "Instant · confirm with Face ID", icon: Wallet },
  { id: "iban", label: "Bank transfer", detail: "IBAN ···1204 · same day", icon: Landmark },
  { id: "cash", label: "Mark as paid in cash", detail: "Nothing moves in the app", icon: Banknote },
] as const;

type MethodId = (typeof METHODS)[number]["id"];

export default function PaySheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "pay";

  // Keep the last transfer so content doesn't vanish during the close animation
  const lastRef = useRef<Transfer | null>(null);
  const live = open
    ? (state.transfers.find((x) => transferKey(x) === state.sheetPayload) ?? null)
    : null;
  if (live) lastRef.current = live;
  const t = live ?? lastRef.current;

  // Sheets are mutually exclusive, so remember where the tap came from and go
  // back there — a pay from the settle board returns to the settle board.
  const originRef = useRef<Sheet>(null);
  if (state.sheet !== "pay") originRef.current = state.sheet;

  const [method, setMethod] = useState<MethodId>("apple");
  const [confirming, setConfirming] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    if (open) {
      setMethod("apple");
      setConfirming(false);
    }
    return () => window.clearTimeout(timer.current);
  }, [open]);

  if (!t) return null;

  const payer = MEMBERS[t.from];
  const payee = MEMBERS[t.to];

  // What the payer is actually covering — real shares off the live ledger.
  const covers = state.expenses
    .map((e) => ({ id: e.id, title: e.title, share: expenseShares(e)[t.from] ?? 0 }))
    .filter((r) => r.share > 0.005);
  const credits = state.expenses.filter((e) => e.paidBy === t.from);
  // Anything this payer owes a *different* creditor is settled on its own row,
  // so it must come off this breakdown or the total wouldn't match the transfer.
  const elsewhere = state.transfers.filter((x) => x.from === t.from && x.to !== t.to);
  const net =
    Math.round(
      (covers.reduce((s, r) => s + r.share, 0) -
        credits.reduce((s, e) => s + e.amount, 0) -
        elsewhere.reduce((s, x) => s + x.amount, 0)) *
        100,
    ) / 100;
  if (import.meta.env.DEV) {
    console.assert(
      Math.abs(net - t.amount) < 0.005,
      `PaySheet breakdown ${net} != transfer ${t.amount} for ${t.from}`,
    );
  }

  const back = () =>
    originRef.current === "settle"
      ? dispatch({ type: "OPEN_SHEET", sheet: "settle" })
      : dispatch({ type: "CLOSE_SHEET" });

  const pay = () => {
    if (confirming || t.status === "paid") return;
    setConfirming(true);
    timer.current = window.setTimeout(() => {
      dispatch({ type: "MARK_PAID", from: t.from, to: t.to });
      dispatch({
        type: "PUSH_BANNER",
        icon: "money",
        text: `${payer.name} paid ${payee.name} ${fmtEUR(t.amount)}`,
      });
      dispatch({
        type: "PUSH_BUZZ",
        icon: "money",
        text: `${payer.name} paid ${payee.name} ${fmtEUR(t.amount)}`,
        time: "23:39",
      });
      back();
    }, 900);
  };

  return (
    <BottomSheet open={open} onClose={back} full>
      <div className="flex min-h-full flex-col">
        <div className="flex-1 px-5 pt-1">
          <h2 className="text-[20px] font-bold leading-6 tracking-[-0.2px] text-ink-900">
            Pay {payee.name}
          </h2>

          {/* payer → payee */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <Avatar id={t.from} size={48} />
              <span className="text-[11px] font-semibold text-ink-600">{payer.name}</span>
            </div>
            <ArrowRight size={18} strokeWidth={2.25} className="mb-4 text-ink-400" />
            <div className="flex flex-col items-center gap-1">
              <Avatar id={t.to} size={48} />
              <span className="text-[11px] font-semibold text-ink-600">{payee.name}</span>
            </div>
          </div>

          <p className="tabular mt-3 text-center text-[38px] font-extrabold leading-11 tracking-[-0.6px] text-ink-900">
            {fmtEUR(t.amount)}
          </p>
          <p className="mt-1 text-center text-xs font-medium text-ink-500">
            {elsewhere.length
              ? `Clears everything ${payer.name} owes ${payee.name}.`
              : `One payment clears everything ${payer.name} owes.`}
          </p>

          {/* what this covers — derived shares, never a mock list */}
          <div className="mt-5 rounded-2xl bg-paper-0 p-4 shadow-elev-1">
            <p className="text-[13px] font-semibold text-ink-500">What this covers</p>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {covers.map((r) => (
                <div key={r.id} className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-[13px] font-medium text-ink-600">
                    {r.title}
                  </span>
                  <span className="tabular shrink-0 text-[13px] font-semibold text-ink-900">
                    {fmtEUR(r.share)}
                  </span>
                </div>
              ))}
              {credits.map((e) => (
                <div key={e.id} className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-[13px] font-medium text-ink-600">
                    {payer.name} already paid · {e.title}
                  </span>
                  <span className="tabular shrink-0 text-[13px] font-semibold text-lagoon-700">
                    −{fmtEUR(e.amount)}
                  </span>
                </div>
              ))}
              {elsewhere.map((x) => (
                <div key={transferKey(x)} className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-[13px] font-medium text-ink-600">
                    Settled separately with {MEMBERS[x.to].name}
                  </span>
                  <span className="tabular shrink-0 text-[13px] font-semibold text-lagoon-700">
                    −{fmtEUR(x.amount)}
                  </span>
                </div>
              ))}
              <div className="mt-1.5 flex items-baseline justify-between gap-2 border-t border-line-200 pt-2">
                <span className="text-[13px] font-semibold text-ink-900">Total to {payee.name}</span>
                <span className="tabular text-[13px] font-bold text-ink-900">{fmtEUR(net)}</span>
              </div>
            </div>
          </div>

          {/* payment method */}
          <p className="mt-5 text-[13px] font-semibold text-ink-500">Pay with</p>
          <div className="mt-2 flex flex-col gap-2">
            {METHODS.map((m) => {
              const on = method === m.id;
              return (
                <motion.button
                  key={m.id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setMethod(m.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                    on
                      ? "border-[1.5px] border-sunset-500 bg-sunset-50"
                      : "border-line-300 bg-paper-0 active:bg-paper-100"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      on ? "bg-sunset-500 text-white" : "bg-paper-100 text-ink-600"
                    }`}
                  >
                    <m.icon size={17} strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink-900">
                      {m.label}
                    </span>
                    <span className="block truncate text-xs font-medium text-ink-500">
                      {m.detail}
                    </span>
                  </span>
                  {on && <Check size={17} strokeWidth={3} className="shrink-0 text-sunset-600" />}
                </motion.button>
              );
            })}
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-ink-500">
            <ShieldCheck size={13} strokeWidth={2} />
            Split by TripUp · settled outside the group chat
          </p>
        </div>

        {/* footer: pay, then a single-pass confirming state in its place */}
        <div className="sticky bottom-0 mt-5 border-t border-line-200 bg-paper-0 px-5 pb-8 pt-3">
          <AnimatePresence mode="wait" initial={false}>
            {confirming ? (
              <motion.div
                key="confirming"
                initial={{ opacity: 0.4, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className="relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-lagoon-50"
                style={{ height: 52 }}
              >
                <motion.span
                  initial={{ scale: 0.4, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-lagoon-500 text-white"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.span>
                <span className="text-[15px] font-semibold text-lagoon-700">
                  Sending {fmtEUR(t.amount)} to {payee.name}…
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, ease: "linear" }}
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-lagoon-500/40"
                />
              </motion.div>
            ) : (
              <motion.div key="pay" initial={false}>
                <PrimaryButton full onClick={pay}>
                  {method === "cash" ? `Mark ${fmtEUR(t.amount)} as paid` : `Pay ${fmtEUR(t.amount)}`}
                </PrimaryButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>
  );
}
