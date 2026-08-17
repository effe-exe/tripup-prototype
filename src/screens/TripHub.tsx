import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Plus, Receipt, Sparkles } from "lucide-react";
import {
  Avatar,
  HomeIndicator,
  PrimaryButton,
  ScreenHeader,
  StatusBar,
} from "../components/ui";
import { photos, RESTAURANTS } from "../data/mock";
import type { ItineraryItem } from "../data/types";
import { useStore } from "../state/store";

const spring = { type: "spring", stiffness: 260, damping: 30 } as const;

export default function TripHub() {
  const { state, dispatch, voteCount } = useStore();
  const dinner = state.itinerary.find((i) => i.id === "it-dinner");
  const dinnerExpensed = state.expenses.some((e) => e.id === "e-dinner");

  const sorted = [...state.poll.options].sort((a, b) => b.votes.length - a.votes.length);
  const leadName = RESTAURANTS.find((r) => r.id === sorted[0]?.restaurantId)?.name;
  const leadText =
    voteCount === 0 ? "3 options · 0/6 voted" : `${leadName} leads · ${voteCount}/6 voted`;

  const onDinnerTap = () => {
    if (state.poll.status === "open") dispatch({ type: "OPEN_SHEET", sheet: "pollVote" });
    else if (state.poll.status === "draft") dispatch({ type: "OPEN_SHEET", sheet: "createPoll" });
  };

  return (
    <div className="relative flex h-full flex-col bg-paper-50">
      <StatusBar />
      <ScreenHeader
        title="Lisboa com Amigos"
        subtitle="Day 4 of 4 · Aug 14–17 · Lisbon"
        onBack={() => dispatch({ type: "NAV_HOME" })}
        backLabel="Trips"
        trailing={
          <button className="p-1 text-ink-900">
            <MoreVertical size={22} strokeWidth={1.75} />
          </button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-32">
        {/* Group strip */}
        <div className="flex items-center gap-3 py-3">
          {state.members
            .filter((id) => id !== "ren")
            .map((id) => (
              <Avatar
                key={id}
                id={id}
                size={40}
                state={id === "nic" || id === "maya" ? "online" : "default"}
              />
            ))}
          <AnimatePresence>
            {state.renJoined && (
              <motion.div
                key="ren"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative"
              >
                <Avatar id="ren" size={40} />
                <span className="absolute -right-1.5 -top-1 rounded-full bg-sunset-500 px-1.5 py-0.5 text-[9px] font-bold leading-3 text-white">
                  NEW
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "addMember" })}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-line-300 text-ink-500"
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Live poll slot (state-driven) */}
        <AnimatePresence initial={false} mode="popLayout">
          {state.poll.status === "draft" && (
            <motion.button
              key="poll-nudge"
              layout
              exit={{ opacity: 0, y: -8 }}
              transition={spring}
              onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "createPoll" })}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl border border-sunset-100 bg-sunset-50 p-4 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-0">
                <Sparkles size={20} strokeWidth={1.75} className="text-sunset-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-900">3 group matches from Swipe</p>
                <p className="text-xs font-semibold text-sunset-700">Make it a poll →</p>
              </div>
            </motion.button>
          )}
          {state.poll.status === "open" && (
            <motion.div
              key="poll-live"
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring}
              className="mt-1 rounded-2xl bg-paper-0 p-4 shadow-elev-2"
            >
              <div className="mb-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sunset-500" />
                <span className="text-xs font-bold text-sunset-700">Live poll · ends 20:15</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={photos.seafood}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-ink-900">Dinner tonight</p>
                  <p className="truncate text-xs font-medium text-ink-500">{leadText}</p>
                </div>
                <PrimaryButton
                  compact
                  onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "pollVote" })}
                >
                  Vote
                </PrimaryButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Itinerary — Today */}
        <p className="mb-3 mt-6 text-sm font-semibold text-ink-600">Today · Aug 17</p>
        <div className="flex flex-col gap-3">
          {state.itinerary.map((it) =>
            it.id === "it-dinner" ? (
              <DinnerRow key="it-dinner" it={it} pollOpen={state.poll.status === "open"} onTap={onDinnerTap} />
            ) : (
              <DoneRow key={it.id} it={it} />
            ),
          )}
        </div>

        {/* Post-poll expense suggestion */}
        <AnimatePresence>
          {dinner?.state === "planned" && !dinnerExpensed && (
            <motion.button
              key="bill-chip"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={spring}
              onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "addExpense" })}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-sunset-100 bg-sunset-50 px-4 py-2.5 text-[13px] font-semibold text-sunset-700"
            >
              <Receipt size={16} strokeWidth={1.75} />
              Add the Maré Alta bill? →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <HomeIndicator />
    </div>
  );
}

/* Done itinerary row — dimmed 55% photo + green check */
function DoneRow({ it }: { it: ItineraryItem }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-paper-0 p-3 shadow-elev-1">
      {it.photo && (
        <img src={it.photo} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover opacity-55" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tabular text-ink-500">{it.time}</p>
        <p className="text-[15px] font-bold text-ink-900">{it.title}</p>
        <p className="truncate text-xs font-medium tabular text-ink-500">{it.subtitle}</p>
      </div>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-50 text-[13px] font-bold text-success-600">
        ✓
      </span>
    </div>
  );
}

/* Dinner slot — dashed/undecided ⇄ solid/planned, single-pass layout spring */
function DinnerRow({
  it,
  pollOpen,
  onTap,
}: {
  it: ItineraryItem;
  pollOpen: boolean;
  onTap: () => void;
}) {
  return (
    <motion.div layout transition={spring}>
      <AnimatePresence initial={false} mode="popLayout">
        {it.state !== "planned" ? (
          <motion.button
            key="undecided"
            layout
            exit={{ opacity: 0.4, scale: 0.98 }}
            transition={spring}
            onClick={onTap}
            className="flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-line-300 p-3 text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-paper-100 text-base font-bold text-ink-400">
              ?
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tabular text-ink-500">{it.time}</p>
              <p className="text-[15px] font-bold text-ink-900">{it.title}</p>
              <p className="truncate text-xs font-medium tabular text-ink-500">{it.subtitle}</p>
            </div>
            {pollOpen && (
              <span className="shrink-0 text-[13px] font-bold text-sunset-700">Vote →</span>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="planned"
            layout
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring}
            className="rounded-2xl bg-paper-0 p-3 shadow-elev-2"
          >
            <div className="flex items-center gap-3">
              {it.photo && (
                <img src={it.photo} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tabular text-ink-500">{it.time}</p>
                <p className="text-[15px] font-bold text-ink-900">{it.title}</p>
                <p className="truncate text-xs font-medium tabular text-ink-500">
                  {it.subtitle.replace(/\s·\sfrom poll$/, "")}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex gap-2 pl-14">
              <span className="rounded-full bg-sunset-50 px-2.5 py-1 text-xs font-semibold tabular text-sunset-700">
                🗳 won 4–1–1
              </span>
              <span className="rounded-full bg-paper-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
                🧭 Directions
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
