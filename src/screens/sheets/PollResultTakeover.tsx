import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GhostButton, PrimaryButton, StatusBar } from "../../components/ui";
import { RESTAURANTS, useStore } from "../../state/store";
import type { Tab } from "../../state/store";

const SHORT_NAME: Record<string, string> = {
  vintem: "Vintém",
  marealta: "Maré Alta",
  terraco: "Terraço",
};
const WIN_EMOJI: Record<string, string> = {
  vintem: "🎶",
  marealta: "🐟",
  terraco: "🌇",
};

/** 8 confetti pieces drifting down once — slow, no twinkle, no blink. */
const CONFETTI = [
  { left: "10%", size: 10, color: "#FFFFFF", delay: 0.1, drift: 26, rot: 140 },
  { left: "22%", size: 8, color: "#FFB43A", delay: 0.3, drift: -20, rot: -110 },
  { left: "34%", size: 12, color: "#FFE1DB", delay: 0.05, drift: 14, rot: 90 },
  { left: "48%", size: 9, color: "#FFFFFF", delay: 0.4, drift: -12, rot: -160 },
  { left: "60%", size: 11, color: "#FFF7E8", delay: 0.2, drift: 22, rot: 120 },
  { left: "72%", size: 8, color: "#FFB43A", delay: 0.35, drift: -24, rot: -80 },
  { left: "84%", size: 10, color: "#FFFFFF", delay: 0.15, drift: 16, rot: 100 },
  { left: "92%", size: 9, color: "#FFE1DB", delay: 0.45, drift: -14, rot: -130 },
];

export default function PollResultTakeover() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "pollResult";
  const [flown, setFlown] = useState(false);

  // After the reveal settles, the winner card shrinks-and-flies down into the plan (once).
  useEffect(() => {
    if (!open) return;
    setFlown(false);
    const t = window.setTimeout(() => setFlown(true), 1700);
    return () => window.clearTimeout(t);
  }, [open]);

  const winnerId = state.poll.winnerId ?? "marealta";
  const winner = RESTAURANTS.find((r) => r.id === winnerId)!;
  const winnerVotes =
    state.poll.options.find((o) => o.restaurantId === winnerId)?.votes.length ?? 0;
  const runners = state.poll.options
    .filter((o) => o.restaurantId !== winnerId)
    .sort((a, b) => b.votes.length - a.votes.length);

  const go = (tab: Tab) => {
    dispatch({ type: "CLOSE_SHEET" });
    dispatch({ type: "SET_TAB", tab });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-[70] flex flex-col overflow-hidden"
          style={{ background: "linear-gradient(180deg, #FF5A45 0%, #FF8A5C 100%)" }}
        >
          <StatusBar light />

          {/* Confetti — one slow downward pass */}
          {CONFETTI.map((c, i) => (
            <motion.span
              key={i}
              className="absolute rounded-[2px]"
              style={{ left: c.left, top: 64, width: c.size, height: c.size, background: c.color }}
              initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
              animate={{ y: 420, x: c.drift, rotate: c.rot, opacity: [1, 1, 0] }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                delay: c.delay,
                opacity: { duration: 1.2, ease: "easeOut", delay: c.delay, times: [0, 0.7, 1] },
              }}
            />
          ))}

          {/* Winner card */}
          <div className="relative flex flex-1 flex-col items-center justify-center px-8">
            <motion.div
              initial={{ scale: 0.8, y: 24, opacity: 0 }}
              animate={
                flown
                  ? { scale: 0.22, y: 330, opacity: 0 }
                  : { scale: 1, y: 0, opacity: 1 }
              }
              transition={
                flown
                  ? { duration: 0.6, ease: [0.4, 0, 1, 1] }
                  : { type: "spring", stiffness: 260, damping: 28, delay: 0.15 }
              }
              className="w-full max-w-[300px] overflow-hidden rounded-3xl bg-paper-0 shadow-elev-3"
            >
              <img src={winner.photo} alt={winner.name} className="h-44 w-full object-cover" />
              <div className="px-5 pb-5 pt-4 text-center">
                <h2 className="text-[28px] font-extrabold leading-8 tracking-[-0.4px] text-ink-900">
                  {winner.name} wins! {WIN_EMOJI[winnerId] ?? "🎉"}
                </h2>
                <p className="mt-1 text-sm font-medium text-ink-600">
                  <span className="tabular">{winnerVotes}</span> of 6 votes
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  {runners.map((o) => (
                    <span
                      key={o.restaurantId}
                      className="rounded-full bg-paper-100 px-2.5 py-1 text-xs font-semibold text-ink-600"
                    >
                      {SHORT_NAME[o.restaurantId] ?? o.restaurantId}{" "}
                      <span className="tabular">{o.votes.length}</span>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer panel — where the card lands */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.35 }}
            className="rounded-t-3xl bg-paper-0 px-5 pb-10 pt-5 shadow-elev-sheet"
          >
            <p className="text-center text-sm font-semibold text-ink-600">
              Added to tonight · 20:45
            </p>
            <div className="mt-3">
              <PrimaryButton full onClick={() => go("hub")}>
                See it in the plan
              </PrimaryButton>
            </div>
            <div className="mt-1 flex justify-center">
              <GhostButton onClick={() => go("buzz")}>View results in Buzz</GhostButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
