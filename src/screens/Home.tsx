import { motion } from "framer-motion";
import { ChevronRight, Plus } from "lucide-react";
import { Avatar, AvatarStack, HomeIndicator, StatusBar } from "../components/ui";
import { TRIP } from "../data/mock";
import { useStore } from "../state/store";

const spring = { type: "spring", stiffness: 260, damping: 30 } as const;

const UP_NEXT = [
  { id: "ibiza", emoji: "🌴", name: "Ibiza Sept", meta: "Sep 12–15 · 4 friends" },
  { id: "ski", emoji: "🎿", name: "Ski? 🎿", meta: "Draft · pick dates" },
];

export default function Home() {
  const { state, dispatch, voteCount } = useStore();
  const dinner = state.itinerary.find((i) => i.id === "it-dinner");

  const nudge =
    state.poll.status === "open"
      ? `Poll ending soon — ${voteCount}/6 voted`
      : dinner?.state === "planned"
        ? "Tonight: Maré Alta 20:45"
        : "Tonight: dinner undecided 🍽";

  return (
    <div className="relative flex h-full flex-col bg-paper-50">
      <StatusBar />

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-1">
        <h1 className="text-[26px] font-extrabold tracking-[-0.4px] text-ink-900">Hey Ari 👋</h1>
        <Avatar id="ari" size={40} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-24">
        {/* Live trip hero card (~60% viewport) */}
        <div className="px-5">
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => dispatch({ type: "OPEN_TRIP" })}
            className="relative block h-[470px] w-full overflow-hidden rounded-[24px] text-left shadow-elev-2"
          >
            <img src={TRIP.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {/* warm gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(28,25,23,0.32) 0%, rgba(28,25,23,0.02) 28%, rgba(28,25,23,0.06) 48%, rgba(60,26,16,0.74) 100%)",
              }}
            />

            {/* LIVE pill — gentle 2s breathe on the dot, never flashes */}
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-ink-900/45 px-3 py-1.5 backdrop-blur-sm">
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-1.5 w-1.5 rounded-full bg-sunset-300"
              />
              <span className="text-xs font-bold text-white">LIVE — {TRIP.day}</span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[28px] font-extrabold leading-8 tracking-[-0.4px] text-white">
                {TRIP.name}
              </p>
              <p className="mt-0.5 text-sm font-medium text-white/85">
                {TRIP.dates} · {TRIP.location}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <AvatarStack ids={state.members} size={28} />
                <span className="rounded-full bg-white/15 px-3.5 py-2 text-[13px] font-semibold text-white backdrop-blur-sm">
                  {nudge}
                </span>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Up next */}
        <div className="mt-7 px-5">
          <h2 className="mb-3 text-lg font-bold text-ink-900">Up next</h2>
          <div className="flex gap-3 overflow-x-auto">
            {UP_NEXT.map((t) => (
              <div key={t.id} className="w-[172px] shrink-0 rounded-2xl bg-paper-0 p-3 shadow-elev-1">
                <div className="flex h-24 items-center justify-center rounded-xl bg-paper-100 text-3xl">
                  {t.emoji}
                </div>
                <p className="mt-2.5 text-[15px] font-bold text-ink-900">{t.name}</p>
                <p className="text-xs font-medium text-ink-500">{t.meta}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Past trips */}
        <div className="mt-5 px-5">
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => dispatch({ type: "OPEN_MEMORIES" })}
            className="flex w-full items-center justify-between rounded-2xl bg-paper-0 px-4 py-4 shadow-elev-1"
          >
            <span className="text-[15px] font-semibold text-ink-900">3 past trips</span>
            <ChevronRight size={18} className="text-ink-400" />
          </motion.button>
        </div>
      </div>

      {/* New trip floating pill */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        transition={spring}
        className="absolute bottom-9 right-5 z-20 flex h-13 items-center gap-1.5 rounded-full bg-sunset-500 px-5 font-semibold text-white shadow-elev-3"
        style={{ height: 52 }}
      >
        <Plus size={18} strokeWidth={2.25} />
        New trip
      </motion.button>

      <HomeIndicator />
    </div>
  );
}
