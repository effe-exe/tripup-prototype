import { AnimatePresence, motion } from "framer-motion";
import { Avatar, BottomSheet, GhostButton } from "../../components/ui";
import { RESTAURANTS, useStore } from "../../state/store";

const TOTAL_VOTERS = 6;

export default function PollVoteSheet() {
  const { state, dispatch, voteCount } = useStore();
  const { options } = state.poll;

  const max = Math.max(...options.map((o) => o.votes.length));
  const leaderId =
    max > 0 ? options.find((o) => o.votes.length === max)!.restaurantId : null;

  return (
    <BottomSheet
      open={state.sheet === "pollVote"}
      full
      onClose={() => dispatch({ type: "CLOSE_SHEET" })}
    >
      <div className="flex min-h-full flex-col">
        <div className="px-5 pt-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-[22px] font-bold leading-7 text-ink-900">
              Dinner tonight 🍽
            </h2>
            <span className="tabular shrink-0 rounded-full bg-sunset-50 px-2.5 py-1 text-xs font-bold text-sunset-700">
              ⏱ 12:41
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-ink-500">by Ari</p>

          {/* Option rows */}
          <div className="mt-4 space-y-3">
            {options.map((o) => {
              const rest = RESTAURANTS.find((r) => r.id === o.restaurantId)!;
              const leading = o.restaurantId === leaderId;
              const mine = o.votes.includes("ari");
              return (
                <button
                  key={o.restaurantId}
                  onClick={() =>
                    dispatch({ type: "VOTE", member: "ari", restaurantId: o.restaurantId })
                  }
                  className={`relative w-full rounded-2xl p-3 text-left transition-colors ${
                    leading
                      ? "border-[1.5px] border-sunset-500 bg-sunset-50"
                      : "border border-line-200 bg-paper-0"
                  }`}
                >
                  {/* Crown flies between options as the lead changes */}
                  {leading && (
                    <motion.span
                      layoutId="crown"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="absolute -top-3 right-4 z-10 text-xl"
                    >
                      👑
                    </motion.span>
                  )}
                  <div className="flex items-center gap-3">
                    <img
                      src={rest.photo}
                      alt={rest.name}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-base font-semibold leading-5 text-ink-900">
                          {rest.name}
                        </p>
                        <span className="tabular shrink-0 text-base font-bold text-ink-900">
                          {o.votes.length}
                        </span>
                      </div>
                      {/* Animated vote bar */}
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-100">
                        <motion.div
                          className={`h-full rounded-full ${
                            leading ? "bg-sunset-500" : "bg-line-300"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(o.votes.length / TOTAL_VOTERS) * 100}%` }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      </div>
                      {/* Voter chips fly in */}
                      <div className="mt-1.5 flex h-5 items-center">
                        <div className="flex -space-x-1">
                          <AnimatePresence>
                            {o.votes.map((v) => (
                              <motion.span
                                key={v}
                                initial={{ scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.4, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                              >
                                <Avatar id={v} size={20} ring />
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    {/* Radio — Ari's vote, changeable until close */}
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        mine
                          ? "bg-sunset-500 text-white"
                          : "border-[1.5px] border-line-300 bg-paper-0"
                      }`}
                    >
                      {mine ? "✓" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Participation strip */}
          <div className="mt-4 rounded-2xl bg-paper-100 px-4 py-3">
            <p className="text-[13px] font-semibold text-ink-600">
              <span className="tabular">
                {voteCount}/{TOTAL_VOTERS}
              </span>{" "}
              voted
            </p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-200">
              <motion.div
                className="h-full rounded-full bg-sunset-500"
                initial={{ width: 0 }}
                animate={{ width: `${(voteCount / TOTAL_VOTERS) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-5 pb-8 pt-4 text-center">
          <p className="text-xs font-medium text-ink-500">Change your vote anytime until close</p>
          <div className="mt-1 flex justify-center">
            <GhostButton onClick={() => dispatch({ type: "CLOSE_POLL" })}>Close early</GhostButton>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
