import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Play,
  Plus,
  Share,
  Check,
  Zap,
  CreditCard,
  Sparkles,
  Camera,
} from "lucide-react";
import { useStore } from "../state/store";
import { MEMBERS, photos } from "../data/mock";
import type { MemberId } from "../data/types";
import { fmtEURWhole } from "../data/balances";
import { Avatar, HomeIndicator, StatusBar } from "../components/ui";

const WRAP_AVATARS: MemberId[] = ["ari", "nic", "maya", "tomas", "zoe", "ren"];

/** Trip superlatives — identity tokens, no streaks (UX retention spec §5). */
const SUPERLATIVES = [
  { Icon: Zap, label: "First to vote", who: "Zoe" },
  { Icon: CreditCard, label: "Wallet hero", who: "Nic" },
  { Icon: Sparkles, label: "Vibe curator", who: "Maya" },
  { Icon: Camera, label: "Paparazzo", who: "Tomás" },
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
        <Check size={9} strokeWidth={3.5} />
      </span>
    </div>
  );
}

export default function Memories() {
  const { state, dispatch } = useStore();
  const [film, setFilm] = useState<"idle" | "cutting" | "done">("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const tripTotal = state.expenses.reduce((s, e) => s + e.amount, 0);
  const photoCount = 18 + state.memories.length;

  const createFilm = () => {
    setFilm("cutting");
    timer.current = window.setTimeout(() => setFilm("done"), 2500);
  };

  return (
    <div className="relative flex h-full flex-col bg-paper-50">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2">
        <button
          onClick={() => dispatch({ type: "NAV_HOME" })}
          className="hit44 flex items-center gap-0.5 py-1 pr-2 text-ink-900"
        >
          <ChevronLeft size={22} strokeWidth={2} />
          <span className="text-base font-semibold">All trips</span>
        </button>
        <button
          onClick={() =>
            dispatch({ type: "PUSH_BANNER", icon: "photo", text: "Recap link copied - share the trip" })
          }
          className="hit44 p-1.5 text-ink-900"
          aria-label="Share recap"
        >
          <Share size={20} strokeWidth={1.9} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-14">
        {/* Wrap hero */}
        <div
          className="rounded-3xl px-5 py-6"
          style={{ background: "linear-gradient(135deg, #FF5A45 0%, #FFB43A 100%)" }}
        >
          <h1 className="text-[26px] font-extrabold leading-8 tracking-[-0.4px] text-white">
            That's a wrap, Lisboa
          </h1>
          <p className="tabular mt-1 text-[13px] font-semibold text-white/95">
            {fmtEURWhole(tripTotal)} · 4 days · 6 friends · 0 debts
          </p>
          <div className="mt-3.5 flex gap-1.5">
            {WRAP_AVATARS.map((id) => (
              <SettledDisc key={id} id={id} />
            ))}
          </div>
        </div>

        {/* Trip superlatives — streak-free identity tokens (UX retention spec §5) */}
        <div
          className="hscroll -mx-5 mt-3 flex gap-2 px-5 pb-1.5 pt-0.5"
        >
          {SUPERLATIVES.map((s) => (
            <span
              key={s.label}
              className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line-200 bg-paper-0 px-3.5 text-[13px] font-semibold text-ink-600 shadow-elev-1"
            >
              <s.Icon size={14} strokeWidth={2} className="text-sunset-600" />
              {s.label} — {s.who}
            </span>
          ))}
        </div>

        {/* The Lisboa film */}
        <div className="mt-4 rounded-2xl bg-paper-0 p-3.5 shadow-elev-1">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <img src={photos.miradouro} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90">
                  <Play size={11} className="ml-0.5 fill-sunset-500 text-sunset-500" />
                </span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-ink-900">The Lisboa film</p>
              <p className="text-xs font-medium leading-4 text-ink-500">
                {film === "idle" && "Auto-cut from everyone's photos & notes"}
                {film === "cutting" && "Cutting your film… 23 clips"}
                {film === "done" && "Premiere ready"}
              </p>
            </div>
            {film === "idle" && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={createFilm}
                className="hit44 h-9 shrink-0 rounded-full bg-sunset-500 px-4 text-sm font-semibold text-white active:bg-sunset-600"
              >
                Create
              </motion.button>
            )}
            {film === "done" && (
              <motion.button
                initial={{ opacity: 0.4, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "film" })}
                className="hit44 h-9 shrink-0 rounded-full bg-sunset-500 px-4 text-sm font-semibold text-white active:bg-sunset-600"
              >
                Watch
              </motion.button>
            )}
          </div>
          {film === "cutting" && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-paper-100">
              <motion.div
                initial={{ width: "4%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.4, ease: "easeInOut" }}
                className="h-full rounded-full bg-sunset-500"
              />
            </div>
          )}
        </div>

        {/* Memories grid */}
        <div className="mt-4 flex items-baseline justify-between px-0.5">
          <p className="tabular text-[13px] font-bold text-ink-900">Memories · {photoCount} photos</p>
          <button
            onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "allMemories" })}
            className="hit44 text-[13px] font-semibold text-sunset-700"
          >
            See all →
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {state.memories.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0.4, scale: 0.82, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30, delay: Math.min(i, 9) * 0.045 }}
              className="relative aspect-square overflow-hidden rounded-2xl"
            >
              <img src={m.photo} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-1.5 left-1.5">
                <Avatar id={m.by} size={18} ring />
              </span>
            </motion.div>
          ))}
          <motion.button
            initial={{ opacity: 0.4, scale: 0.82, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
              delay: Math.min(state.memories.length, 9) * 0.045,
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => dispatch({ type: "ADD_MEMORY", photo: photos.tram })}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-sunset-300 bg-sunset-50/60"
          >
            <Plus size={20} className="text-sunset-500" />
            <span className="text-xs font-semibold text-sunset-700">Add yours</span>
          </motion.button>
        </div>

        {/* Notes for the film */}
        <div className="mt-4 flex flex-col gap-2.5">
          {state.notes.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0.4, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30, delay: Math.min(i, 9) * 0.05 }}
              className="flex items-start gap-3 rounded-2xl bg-paper-0 p-4 shadow-elev-1"
            >
              <Avatar id={n.by} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-snug text-ink-900">
                  &ldquo;{n.text}&rdquo;
                </p>
                {i === 0 ? (
                  <button
                    onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "note" })}
                    className="hit44 mt-1.5 text-[13px] font-medium text-ink-500 active:text-ink-600"
                  >
                    {MEMBERS[n.by].name} · leave your note →
                  </button>
                ) : (
                  <p className="mt-1.5 text-[13px] font-medium text-ink-500">{MEMBERS[n.by].name}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quiet link back into the trip */}
        <div className="mt-5 flex justify-center pb-2">
          <button
            onClick={() => dispatch({ type: "OPEN_TRIP" })}
            className="hit44 text-[13px] font-semibold text-ink-500 active:text-ink-600"
          >
            Trip details →
          </button>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
