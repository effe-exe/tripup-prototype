import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../state/store";
import { MEMBERS } from "../../data/mock";
import type { MemberId } from "../../data/types";
import { fmtEUR, fmtEURWhole } from "../../data/balances";
import { AnimatedNumber, Avatar, BottomSheet, StatusBadge } from "../../components/ui";
import { rowEnter } from "../../components/motion";

const WRAP_AVATARS: MemberId[] = ["ari", "nic", "maya", "tomas", "zoe", "ren"];

/** 7 confetti pieces, one slow drift each — no loops, nothing flashes. */
const CONFETTI = [
  { left: "10%", delay: 0.15, color: "#FFFFFF", size: 8, drift: 26, rot: 130 },
  { left: "24%", delay: 0.45, color: "#FFE1DB", size: 7, drift: -18, rot: -110 },
  { left: "38%", delay: 0.05, color: "#FFF7E8", size: 9, drift: 14, rot: 95 },
  { left: "54%", delay: 0.6, color: "#FFFFFF", size: 6, drift: -22, rot: -140 },
  { left: "68%", delay: 0.3, color: "#EFFAF8", size: 8, drift: 20, rot: 120 },
  { left: "82%", delay: 0.5, color: "#FFE1DB", size: 7, drift: -14, rot: -100 },
  { left: "91%", delay: 0.2, color: "#FFFFFF", size: 8, drift: 10, rot: 85 },
];

function SettledDisc({ id }: { id: MemberId }) {
  const m = MEMBERS[id];
  return (
    <div
      className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold"
      style={{ color: m.fg }}
    >
      {m.initial}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-lagoon-500 text-[8px] font-bold text-white shadow-elev-1">
        ✓
      </span>
    </div>
  );
}

export default function SettleSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "settle";
  const paid = state.transfers.filter((t) => t.status === "paid").length;
  const total = state.transfers.length;
  const pct = total ? (paid / total) * 100 : 0;
  const tripTotal = state.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })} full>
      <div className="relative min-h-full">
        {/* Settle board */}
        <div className="px-5 pb-8 pt-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[20px] font-bold tracking-[-0.2px] text-ink-900">Settle board</h2>
            <span className="tabular text-[13px] font-semibold text-ink-500">
              <AnimatedNumber value={paid} /> of {total} settled
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-100">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 170, damping: 28 }}
              className="h-full rounded-full bg-lagoon-500"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {state.transfers.map((t, i) => (
              <motion.div
                key={t.from}
                layout
                {...rowEnter(i, 0.06)}
                className="flex items-center gap-3 rounded-2xl border border-line-200 bg-paper-0 p-3.5 shadow-elev-1"
              >
                <Avatar id={t.from} size={40} state={t.status === "paid" ? "settled" : "default"} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink-900">
                    {MEMBERS[t.from].name} → {MEMBERS[t.to].name}
                  </p>
                  {t.from === "ren" && (
                    <p className="text-xs font-medium text-ink-500">guest checkout · Apple Pay</p>
                  )}
                </div>
                <span className="tabular text-[15px] font-bold text-ink-900">{fmtEUR(t.amount)}</span>
                <StatusBadge status={t.status} />
              </motion.div>
            ))}
          </div>

          <p className="mt-4 text-center text-xs font-medium text-ink-500">
            Rows flip as friends pay — nothing else to do.
          </p>
        </div>

        {/* Wrap takeover — single pass once everyone is square */}
        <AnimatePresence>
          {state.allSquare && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 overflow-hidden rounded-t-3xl"
              style={{ background: "linear-gradient(160deg, #FF5A45 0%, #FFB43A 100%)" }}
            >
              {CONFETTI.map((c, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -30, x: 0, opacity: 0, rotate: 0 }}
                  animate={{ y: 560, x: c.drift, opacity: [0, 0.9, 0.4], rotate: c.rot }}
                  transition={{ duration: 2.8 + i * 0.2, delay: c.delay, ease: "easeIn" }}
                  className="absolute top-0 rounded-[2px]"
                  style={{ left: c.left, width: c.size, height: c.size, background: c.color }}
                />
              ))}

              <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                <motion.h2
                  initial={{ opacity: 0.4, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 30, delay: 0.1 }}
                  className="text-[30px] font-extrabold leading-9 tracking-[-0.5px] text-white"
                >
                  That's a wrap, Lisboa 🏁
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0.4, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 30, delay: 0.16 }}
                  className="tabular text-sm font-semibold text-white/95"
                >
                  {fmtEURWhole(tripTotal)} · 4 days · 6 friends · 0 debts
                </motion.p>
                <motion.div
                  initial={{ opacity: 0.4, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 30, delay: 0.22 }}
                  className="flex gap-1.5"
                >
                  {WRAP_AVATARS.map((id) => (
                    <SettledDisc key={id} id={id} />
                  ))}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0.4, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 30, delay: 0.28 }}
                  className="mt-3 flex flex-col items-center gap-2"
                >
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => dispatch({ type: "OPEN_MEMORIES" })}
                    className="h-12 rounded-full bg-white px-7 text-base font-semibold text-sunset-600 shadow-elev-2 active:bg-paper-50"
                  >
                    Relive the trip →
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => dispatch({ type: "NAV_HOME" })}
                    className="rounded-full px-5 py-2.5 text-base font-semibold text-white"
                  >
                    Back to trips
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  );
}
