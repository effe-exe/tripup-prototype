import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Croissant,
  Fish,
  Heart,
  Music2,
  Palette,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Star,
  Sunset,
  TramFront,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BottomSheet, Chip, GhostButton, PrimaryButton } from "../../components/ui";
import { useStore } from "../../state/store";
import { AI_PROPOSALS, PLACES } from "../../data/mock";

/** Fake-AI planner (flagship demo). Three phases, no network — all copy is scripted. */
type Phase = "ask" | "thinking" | "results";

const EXAMPLES = [
  "Something chill for 4 tonight",
  "What do we do tomorrow?",
  "Rainy morning backup",
  "Big group dinner under €20pp",
];

interface Suggestion {
  id: string;
  Icon: LucideIcon;
  name: string;
  rating: string;
  reviews: string;
  price: string;
  distance: string;
  why: string;
}

/** Per-place icon + the "why this group" line the fake AI claims to have reasoned. */
const PLACE_ICON: Record<string, LucideIcon> = {
  vintem: Music2,
  marealta: Fish,
  terraco: Sunset,
  lxfactory: ShoppingBag,
  belem: Croissant,
  kayak: Waves,
  azulejo: Palette,
  tram28: TramFront,
};
const PLACE_WHY: Record<string, string> = {
  vintem: "Live fado at 21:30 - Maya has been asking all trip",
  marealta: "Counter seats for 6 and natural wine for the drinkers",
  terraco: "Sunset over the Tejo, and Zoe wants a rooftop",
  lxfactory: "Maya + Zoe will love the vintage stalls",
  belem: "Warm pasteis at opening time - no queue before 9",
  kayak: "Active start - Tomas's kind of morning",
  azulejo: "Rain-proof and small-group friendly",
  tram28: "Three minutes from the flat, classic Lisbon",
};

type Intent = keyof typeof AI_PROPOSALS;

/** Reads the prompt the way the demo script expects - never fails, always plausible. */
function intentFor(prompt: string): Intent {
  const p = prompt.toLowerCase();
  if (p.includes("rain")) return "rainy";
  if (p.includes("tomorrow") || p.includes("morning")) return "tomorrow";
  return "tonight";
}

/** The title the session and poll inherit. */
function titleFor(intent: Intent): string {
  if (intent === "tomorrow") return "Tomorrow morning";
  if (intent === "rainy") return "Rainy backup";
  return "Dinner tonight";
}

function suggestionsFor(intent: Intent): Suggestion[] {
  return AI_PROPOSALS[intent]
    .map((id) => PLACES[id])
    .filter(Boolean)
    .map((pl) => ({
      id: pl.id,
      Icon: PLACE_ICON[pl.id] ?? Sparkles,
      name: pl.name,
      rating: pl.rating.toFixed(1),
      reviews: pl.reviews >= 1000 ? (pl.reviews / 1000).toFixed(1) + "k" : String(pl.reviews),
      price: pl.price,
      distance: pl.distanceM >= 1000 ? (pl.distanceM / 1000).toFixed(1) + " km" : pl.distanceM + " m",
      why: PLACE_WHY[pl.id] ?? "Fits what the group has liked so far",
    }));
}

const EASE_OUT = [0.22, 0.9, 0.3, 1] as const;

export default function AiPlanSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "aiPlan";

  const [phase, setPhase] = useState<Phase>("ask");
  const [prompt, setPrompt] = useState("");
  const [hearted, setHearted] = useState<string[]>([]);

  const intent = intentFor(prompt);
  const suggestions = suggestionsFor(intent);
  const selected = hearted.filter((id) => suggestions.some((s) => s.id === id));

  // Fresh ask every time the sheet opens
  useEffect(() => {
    if (open) {
      setPhase("ask");
      setPrompt("");
      setHearted([]);
    }
  }, [open]);

  // Fake think, then reveal — single pass, cleaned up on close
  useEffect(() => {
    if (!open || phase !== "thinking") return;
    const t = window.setTimeout(() => {
      setPhase("results");
      setHearted(suggestionsFor(intentFor(prompt)).map((s) => s.id));
    }, 1800);
    return () => clearTimeout(t);
  }, [open, phase]);

  const toggleHeart = (id: string) =>
    setHearted((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const close = () => dispatch({ type: "CLOSE_SHEET" });

  /** Starting a session IS the notify-everyone moment (banner + Buzz in the reducer). */
  const startMatch = () => {
    const ids = selected.length ? selected : suggestions.map((s) => s.id);
    dispatch({ type: "START_SESSION", title: titleFor(intent), placeIds: ids });
  };

  return (
    <BottomSheet open={open} full onClose={close}>
      <AnimatePresence mode="wait" initial={false}>
        {/* ---------- Phase 1 · ask ---------- */}
        {phase === "ask" && (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="flex min-h-full flex-col"
          >
            <div className="flex-1 px-5 pt-2">
              <p className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-sunset-700">
                <Sparkles size={14} strokeWidth={2} />
                Ask TripUp AI
              </p>
              <h2 className="mt-3 text-[26px] font-bold leading-8 tracking-[-0.3px] text-ink-900">
                What's the plan?
              </h2>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Tell me the vibe, the time, the budget…"
                className="mt-4 w-full resize-none rounded-2xl border border-line-300 bg-paper-0 px-4 py-3.5 text-base font-medium leading-6 text-ink-900 placeholder:font-normal placeholder:text-ink-500 focus:border-sunset-300 focus:outline-none"
              />

              <p className="mt-4 text-[13px] font-semibold text-ink-600">Try one of these</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <Chip key={ex} selected={prompt === ex} onClick={() => setPrompt(ex)}>
                    {ex}
                  </Chip>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-sunset-50 px-4 py-3">
                <p className="text-[13px] font-medium leading-5 text-sunset-700">
                  TripUp AI knows your group: Maya loves rooftops, Nic skips wine, Zoe's a nightowl
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 mt-6 border-t border-line-200 bg-paper-0 px-5 pb-8 pt-3">
              <PrimaryButton
                full
                disabled={prompt.trim().length === 0}
                onClick={() => setPhase("thinking")}
              >
                Find ideas
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {/* ---------- Phase 2 · thinking ---------- */}
        {phase === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="flex min-h-full flex-col items-center justify-center px-8 py-16 text-center"
          >
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-sunset-50"
            >
              <Sparkles size={28} strokeWidth={1.75} className="text-sunset-500" />
            </motion.span>

            <p className="mt-5 max-w-[16rem] text-[15px] font-semibold leading-6 text-ink-600">
              Checking maps, reviews &amp; the group's taste…
            </p>

            <div className="mt-4 flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.22,
                  }}
                  className="h-2 w-2 rounded-full bg-sunset-300"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ---------- Phase 3 · results ---------- */}
        {phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="flex min-h-full flex-col"
          >
            <div className="flex-1 px-5 pt-2">
              <p className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-sunset-700">
                <Sparkles size={14} strokeWidth={2} />
                TripUp AI
              </p>
              <h2 className="mt-2 text-[22px] font-bold leading-7 tracking-[-0.2px] text-ink-900">
                {titleFor(intent)} · for 6
              </h2>
              <p className="mt-1 truncate text-[13px] font-medium text-ink-500">“{prompt.trim()}”</p>

              <div className="mt-4 flex flex-col gap-3">
                {suggestions.map((s, i) => {
                  const on = hearted.includes(s.id);
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.32,
                        ease: EASE_OUT,
                        delay: 0.06 * i,
                      }}
                      className="flex items-start gap-3 rounded-2xl border border-line-200 bg-paper-0 p-3.5 shadow-elev-1"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sunset-50 text-[22px] leading-none">
                        <s.Icon size={18} strokeWidth={1.75} className="text-sunset-600" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold leading-5 text-ink-900">{s.name}</p>
                        <p className="mt-1 text-xs font-medium text-ink-500">
                          <Star size={12} strokeWidth={0} className="mr-0.5 inline align-[-2px] fill-golden-400" />{" "}
                          <span className="tabular">{s.rating}</span> ({s.reviews}) · {s.price} ·{" "}
                          <span className="tabular">{s.distance}</span>
                        </p>
                        <p className="mt-1.5 text-[12.5px] font-medium italic leading-4 text-sunset-700">
                          <Sparkles size={11} strokeWidth={2} className="mr-1 inline align-[-1px]" />{s.why}
                        </p>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => toggleHeart(s.id)}
                        aria-pressed={on}
                        aria-label={`${on ? "Unsave" : "Save"} ${s.name}`}
                        className="hit44 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full active:bg-paper-100"
                      >
                        <Heart
                          size={20}
                          strokeWidth={1.75}
                          className={on ? "text-sunset-500" : "text-ink-400"}
                          fill={on ? "#FF5A45" : "none"}
                        />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setPhase("ask")}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-ink-500 active:bg-paper-100"
                >
                  <RotateCcw size={14} strokeWidth={2} />
                  Ask something else
                </button>
              </div>
            </div>

            {/* Sticky hand-off — straight into the group's swipe session */}
            <div className="sticky bottom-0 mt-4 border-t border-line-200 bg-paper-0 px-5 pb-8 pt-3">
              <PrimaryButton full onClick={startMatch}>
                Start a group match ({selected.length || suggestions.length})
              </PrimaryButton>
              <div className="mt-1 flex justify-center">
                <GhostButton
                  onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "createPoll" } as const)}
                >
                  Make it a poll instead
                </GhostButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}
