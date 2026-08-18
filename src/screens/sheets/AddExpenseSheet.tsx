import { useEffect, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useStore } from "../../state/store";
import { MEMBERS } from "../../data/mock";
import type { MemberId } from "../../data/types";
import { fmtEUR } from "../../data/balances";
import { Avatar, BottomSheet, PrimaryButton, Segmented } from "../../components/ui";

/** Canonical demo bill (screen 08). Committed expense is always the §7 dinner —
 *  toggles below are presentational, but every preview number is computed live. */
const ALL: MemberId[] = ["ari", "nic", "maya", "tomas", "zoe", "ren"];
const TOTAL = 186;
const BILL_ITEMS = [
  { key: "food", label: "Food & cover", amount: 138 },
  { key: "wine", label: "Wine", amount: 48 },
] as const;
type ItemKey = (typeof BILL_ITEMS)[number]["key"];
type SplitMode = "evenly" | "items" | "custom";

/** Preview order per spec: Ari 35 · Maya 35 · Tomás 35 · Zoe 35 · Nic 23 · Ren 23 */
const PREVIEW_ORDER: MemberId[] = ["ari", "maya", "tomas", "zoe", "nic", "ren"];

const fmtShare = (n: number) =>
  (Math.round(n * 100) / 100).toLocaleString("en-IE", { maximumFractionDigits: 2 });

function AvatarToggle({
  id,
  on,
  onToggle,
}: {
  id: MemberId;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: on ? 1 : 0.86, opacity: on ? 1 : 0.75 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      aria-pressed={on}
      aria-label={`${MEMBERS[id].name} ${on ? "included" : "excluded"}`}
    >
      <Avatar id={id} size={32} state={on ? "default" : "excluded"} />
    </motion.button>
  );
}

export default function AddExpenseSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "addExpense";

  const [mode, setMode] = useState<SplitMode>("items");
  const [linked, setLinked] = useState(true);
  /** DEMO STATE: everyone starts on both items; presenter taps Ren & Nic off wine. */
  const [shared, setShared] = useState<Record<ItemKey, MemberId[]>>({
    food: ALL,
    wine: ALL,
  });

  // Fresh draft each time the sheet opens
  useEffect(() => {
    if (open) {
      setMode("items");
      setLinked(true);
      setShared({ food: ALL, wine: ALL });
    }
  }, [open]);

  const toggle = (item: ItemKey, id: MemberId) => {
    setShared((prev) => {
      const cur = prev[item];
      if (cur.includes(id)) {
        if (cur.length <= 1) return prev; // never split by zero
        return { ...prev, [item]: cur.filter((m) => m !== id) };
      }
      return { ...prev, [item]: ALL.filter((m) => cur.includes(m) || m === id) };
    });
  };

  /** Live per-member share from current toggle state (real math, not mock). */
  const shareOf = (id: MemberId) =>
    mode === "evenly"
      ? TOTAL / ALL.length
      : BILL_ITEMS.reduce(
          (sum, it) =>
            shared[it.key].includes(id) ? sum + it.amount / shared[it.key].length : sum,
          0,
        );

  const itemsTotal = BILL_ITEMS.reduce((s, it) => s + it.amount, 0);
  const balanced = Math.abs(itemsTotal - TOTAL) < 0.005;

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })} full>
      <div className="flex min-h-full flex-col">
        <div className="flex-1 px-5 pt-1">
          {/* Context chip */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-100 px-3 py-1.5 text-xs font-medium text-ink-600">
              New expense{linked && (
                <>
                  {" "}· linked to <b className="font-bold text-ink-900">Maré Alta 20:45</b>
                  <button
                    onClick={() => setLinked(false)}
                    aria-label="Unlink from itinerary"
                    className="ml-0.5 text-ink-400"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </span>
          </div>

          {/* Amount hero */}
          <div className="mt-5 text-center">
            <div className="tabular text-[46px] font-extrabold leading-none tracking-[-1px] text-ink-900">
              € 186
            </div>
            <div className="mt-2 text-[15px] font-medium text-ink-600">Dinner @ Maré Alta</div>
            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line-300 bg-paper-0 py-1 pl-1.5 pr-3">
                <Avatar id="ari" size={20} />
                <span className="text-[13px] font-semibold text-ink-900">Paid by Ari</span>
              </span>
            </div>
          </div>

          {/* Split mode */}
          <div className="mt-5">
            <LayoutGroup id="expense-split-mode">
              <Segmented<SplitMode>
                options={[
                  { value: "evenly", label: "Evenly" },
                  { value: "items", label: "By items" },
                  { value: "custom", label: "Custom" },
                ]}
                value={mode}
                onChange={setMode}
              />
            </LayoutGroup>
          </div>

          {/* Items */}
          {mode === "items" && (
            <div className="mt-4 flex flex-col gap-3">
              {BILL_ITEMS.map((it) => {
                const n = shared[it.key].length;
                const each = it.amount / n;
                return (
                  <div
                    key={it.key}
                    className="rounded-2xl border border-line-200 bg-paper-0 p-4 shadow-elev-1"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-[15px] font-bold text-ink-900">{it.label}</span>
                      <span className="tabular text-[15px] font-bold text-ink-900">
                        {fmtEUR(it.amount)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        {ALL.map((id) => (
                          <AvatarToggle
                            key={id}
                            id={id}
                            on={shared[it.key].includes(id)}
                            onToggle={() => toggle(it.key, id)}
                          />
                        ))}
                      </div>
                      <motion.span
                        key={n}
                        initial={{ opacity: 0.4, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className="tabular shrink-0 text-[13px] font-semibold text-ink-600"
                      >
                        {fmtEUR(each)} each
                      </motion.span>
                    </div>
                  </div>
                );
              })}

              <button className="rounded-2xl border-2 border-dashed border-line-300 py-3.5 text-sm font-semibold text-ink-500 active:bg-paper-100">
                ＋ Add item
              </button>

              <p
                className={`tabular text-center text-[13px] font-medium ${
                  balanced ? "text-ink-500" : "text-warning-700"
                }`}
              >
                Items {fmtEUR(itemsTotal).replace(".00", "")} / Total {fmtEUR(TOTAL).replace(".00", "")}{" "}
                {balanced ? (
                  <Check size={13} strokeWidth={3} className="inline text-lagoon-700" />
                ) : (
                  "— check items"
                )}
              </p>
            </div>
          )}

          {mode === "evenly" && (
            <div className="mt-4 rounded-2xl border border-line-200 bg-paper-0 p-4 shadow-elev-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  {ALL.map((id) => (
                    <Avatar key={id} id={id} size={32} />
                  ))}
                </div>
                <span className="tabular shrink-0 text-[13px] font-semibold text-ink-600">
                  {fmtEUR(TOTAL / ALL.length)} each
                </span>
              </div>
            </div>
          )}

          {mode === "custom" && (
            <div className="mt-4 rounded-2xl border border-line-200 bg-paper-0 p-5 text-center shadow-elev-1">
              <p className="text-sm font-medium text-ink-500">
                Type each person's amount — try "By items" for tonight's bill.
              </p>
            </div>
          )}
        </div>

        {/* Live share preview + CTA, pinned */}
        <div className="sticky bottom-0 mt-4 border-t border-line-200 bg-paper-0 px-5 pb-8 pt-3">
          <div className="mb-3 rounded-2xl bg-paper-100 px-4 py-2.5 text-center">
            <div className="text-[11px] font-semibold text-ink-400">Live shares</div>
            <div className="tabular mt-0.5 text-[13px] font-semibold text-ink-900">
              {PREVIEW_ORDER.map((id, i) => (
                <span key={id}>
                  {i > 0 && <span className="text-ink-400"> · </span>}
                  {MEMBERS[id].name}{" "}
                  <motion.span
                    key={shareOf(id)}
                    initial={{ opacity: 0.4, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="inline-block"
                  >
                    {fmtShare(shareOf(id))}
                  </motion.span>
                </span>
              ))}
            </div>
          </div>
          <PrimaryButton full onClick={() => dispatch({ type: "ADD_DINNER_EXPENSE" })}>
            Add expense
          </PrimaryButton>
        </div>
      </div>
    </BottomSheet>
  );
}
