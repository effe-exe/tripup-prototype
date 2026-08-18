import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Clock, Heart, Info, MapPin, SlidersHorizontal, Sparkles, Star, Undo2, X } from "lucide-react";
import { Avatar, AvatarStack, Chip, GhostButton, PrimaryButton, StatusBar } from "../components/ui";
import { RESTAURANTS, useStore } from "../state/store";
import { MEMBERS } from "../data/mock";
import type { MemberId, Restaurant } from "../data/types";

const SHORT_NAME: Record<string, string> = {
  vintem: "Vintém",
  marealta: "Maré Alta",
  terraco: "Terraço",
};

function fmtReviews(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

/* ---------- Card detail data (back side of the flip) ---------- */

interface CardDetails {
  hours: string;
  menu: { label: string; price: string }[];
  reviews: { stars: number; text: string; by: string }[];
}

const CARD_DETAILS: Record<string, CardDetails> = {
  vintem: {
    hours: "18:00–01:00 · kitchen till 23:30",
    menu: [
      { label: "Petiscos", price: "€4–9" },
      { label: "Pica-pau", price: "€12" },
      { label: "Vinho verde", price: "€4/glass" },
    ],
    reviews: [
      { stars: 5, text: "Cried during the fado, ate the best pica-pau of my life.", by: "Beatriz" },
      { stars: 4, text: "Squeeze in before 21:30 or you'll miss the first set.", by: "Jonas" },
    ],
  },
  marealta: {
    hours: "18:30–23:30 · counter till 22:30",
    menu: [
      { label: "Oysters", price: "€3.50" },
      { label: "Seafood rice", price: "€19" },
      { label: "Natural wine", price: "€6/glass" },
    ],
    reviews: [
      { stars: 5, text: "The seafood rice is criminal. Book the counter seats.", by: "Inês" },
      { stars: 5, text: "Ask for whatever's on the chalkboard — always right.", by: "Marco" },
    ],
  },
  terraco: {
    hours: "16:00–00:00 · kitchen till 23:00",
    menu: [
      { label: "Sunset spritz", price: "€7" },
      { label: "Petiscos board", price: "€9–14" },
      { label: "Ginjinha", price: "€3" },
    ],
    reviews: [
      { stars: 4, text: "Went for one drink, stayed for the DJ. The view!!", by: "Sofia" },
      { stars: 4, text: "Come before 19:00 for the golden-hour tables.", by: "Leo" },
    ],
  },
};

/* ---------- Live ambient ticker (driven by state.swipeTicker) ---------- */

/**
 * The one allowed subtle loop. CSS-animated on purpose: an infinite framer
 * animation inside AnimatePresence keeps exiting bubbles alive forever.
 */
const TICKER_DOTS_CSS =
  "@keyframes tickerDot{0%,100%{transform:translateY(0);opacity:.6}50%{transform:translateY(-2px);opacity:1}}";

function TickerDots() {
  return (
    <span className="flex items-center gap-[3px] pl-0.5">
      <style>{TICKER_DOTS_CSS}</style>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-ink-500"
          style={{ animation: `tickerDot 1.2s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </span>
  );
}

function SwipeTickerBubble() {
  const { state } = useStore();
  const t = state.swipeTicker;
  const isLike = t.verb.startsWith("liked");
  const text = `${MEMBERS[t.member].name} ${t.verb.replace(/…\s*$/, "")}`;
  return (
    <div className="absolute right-2 top-[52px] z-20 overflow-hidden rounded-full bg-paper-0 shadow-elev-2">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={t.seq}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center gap-1.5 py-1 pl-1 pr-3"
        >
          <Avatar id={t.member} size={24} state="online" />
          <span className="whitespace-nowrap text-[13px] font-semibold text-ink-900">{text}</span>
          {isLike ? (
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="text-[13px] leading-none text-sunset-500"
            >
              <Heart size={11} strokeWidth={0} className="fill-sunset-500" />
            </motion.span>
          ) : (
            <TickerDots />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StarRow({ n }: { n: number }) {
  return (
    <span className="text-[12px] leading-none tracking-[1.5px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < n ? "text-golden-400" : "text-line-300"}>
          <Star size={11} strokeWidth={0} className="fill-golden-400" />
        </span>
      ))}
    </span>
  );
}

/* ---------- Card visuals (shared by top card + peeking stack) ---------- */

function CardFace({ rest }: { rest: Restaurant }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-paper-100 shadow-elev-3">
      <img
        src={rest.photo}
        alt={rest.name}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* bottom scrim: transparent → ink-900/45 → ink-900/85 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[62%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(28,25,23,0) 0%, rgba(28,25,23,0.45) 45%, rgba(28,25,23,0.85) 100%)",
        }}
      />
      <span className="absolute left-4 top-4 rounded-full bg-paper-0 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-elev-1">
        <Sparkles size={12} strokeWidth={2} className="mr-1 inline align-[-2px] text-sunset-500" />Picked for your group
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h2 className="text-[26px] font-bold leading-8 text-white">{rest.name}</h2>
        <p className="mt-0.5 text-sm font-medium leading-5 text-white/90">{rest.vibe}</p>
        <p className="mt-1.5 text-sm font-semibold text-white">
          <Star size={13} strokeWidth={0} className="mr-0.5 inline align-[-2px] fill-golden-400" />{rest.rating} ({fmtReviews(rest.reviews)}) ·{" "}
          {rest.price} · <span className="tabular">{rest.distanceM} m</span>
        </p>
        <p className="mt-3 rounded-2xl bg-white/[0.14] px-3.5 py-2.5 text-[13px] font-medium leading-[18px] text-white/95">
          {`“${rest.review}”`}
        </p>
      </div>
    </div>
  );
}

/* ---------- Card back (detail side of the flip) ---------- */

function CardBack({ rest, onFlipBack }: { rest: Restaurant; onFlipBack: () => void }) {
  const d = CARD_DETAILS[rest.id] ?? CARD_DETAILS.vintem;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-paper-0 p-5 shadow-elev-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[20px] font-bold leading-6 text-ink-900">{rest.name}</h2>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-600">
            <Clock size={13} strokeWidth={2.25} className="shrink-0" />
            <span className="tabular">{d.hours}</span>
          </p>
        </div>
        <img src={rest.photo} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
      </div>

      <p className="mt-4 text-xs font-bold text-ink-400">Sample menu</p>
      <div className="mt-1.5 flex flex-col gap-1.5">
        {d.menu.map((m) => (
          <div key={m.label} className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-ink-900">{m.label}</span>
            <span className="tabular text-sm font-semibold text-ink-600">{m.price}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs font-bold text-ink-400">What people say</p>
      <div className="mt-1.5 flex flex-col gap-2">
        {d.reviews.map((r) => (
          <div key={r.by} className="rounded-2xl bg-paper-50 px-3.5 py-2.5">
            <StarRow n={r.stars} />
            <p className="mt-1 text-[13px] font-medium leading-[18px] text-ink-900">{`“${r.text}”`}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-ink-500">{r.by}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <GhostButton>
          <span className="flex items-center gap-1.5">
            <MapPin size={16} strokeWidth={2.25} />
            Open in maps
          </span>
        </GhostButton>
        <GhostButton onClick={onFlipBack}>Flip back</GhostButton>
      </div>
    </div>
  );
}

/* ---------- Draggable top card with swipe physics + flip ---------- */

function TopCard({
  rest,
  pending,
  flipped,
  enterFrom,
  onFlipBack,
  onSettled,
}: {
  rest: Restaurant;
  /** programmatic swipe requested by the pass / like buttons */
  pending: "like" | "pass" | null;
  /** detail side showing — dragging disabled */
  flipped: boolean;
  /** set when this card returns via undo: springs back in from that side */
  enterFrom: "like" | "pass" | null;
  onFlipBack: () => void;
  onSettled: (dir: "like" | "pass") => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-160, 160], [-10, 10]);
  const likeOpacity = useTransform(x, [16, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -16], [1, 0]);
  const flyingRef = useRef(false);
  const [flying, setFlying] = useState(false);

  const fly = (dir: "like" | "pass", offY = 0) => {
    if (flyingRef.current) return;
    flyingRef.current = true;
    setFlying(true);
    const exitEase: [number, number, number, number] = [0.4, 0, 1, 1];
    animate(y, Math.max(-120, Math.min(160, offY)), { duration: 0.35, ease: exitEase });
    animate(x, dir === "like" ? 520 : -520, {
      duration: 0.35,
      ease: exitEase,
      onComplete: () => onSettled(dir),
    });
  };

  useEffect(() => {
    if (pending) fly(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  // Undo return: the card springs back in from the side it left through.
  useEffect(() => {
    if (enterFrom) {
      x.set(enterFrom === "like" ? 480 : -480);
      y.set(60);
      animate(x, 0, { type: "spring", stiffness: 220, damping: 28 });
      animate(y, 0, { type: "spring", stiffness: 220, damping: 28 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className={`absolute inset-0 ${flipped ? "" : "cursor-grab active:cursor-grabbing"}`}
      drag={flying || flipped ? false : "x"}
      dragSnapToOrigin
      dragTransition={{ bounceStiffness: 220, bounceDamping: 28 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) fly("like", info.offset.y * 1.2);
        else if (info.offset.x < -100) fly("pass", info.offset.y * 1.2);
      }}
      style={{ x, y, rotate }}
    >
      {/* Promotion: the newly-top card settles up from the stack position it
          held a moment ago (scale 0.95 → 1, y 8 → 0). Applied here rather than
          on the root so it can't fight the drag/fly motion values. */}
      <motion.div
        className="h-full w-full"
        style={{ perspective: 1200 }}
        initial={{ scale: 0.95, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <CardFace rest={rest} />
          </div>
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <CardBack rest={rest} onFlipBack={onFlipBack} />
          </div>
        </motion.div>
      </motion.div>
      <motion.span
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-5 top-16 -rotate-12 rounded-xl border-[3px] border-lagoon-500 bg-white/85 px-3 py-1 text-xl font-extrabold tracking-wide text-lagoon-500"
      >
        INTO IT
      </motion.span>
      <motion.span
        style={{ opacity: passOpacity }}
        className="pointer-events-none absolute right-5 top-16 rotate-12 rounded-xl border-[3px] border-ink-500 bg-white/85 px-3 py-1 text-xl font-extrabold tracking-wide text-ink-500"
      >
        PASS
      </motion.span>
    </motion.div>
  );
}

/* ---------- Screen ---------- */

export default function SwipeDeck() {
  const { state, dispatch } = useStore();
  const { swipe, poll } = state;
  const deck = RESTAURANTS.slice(swipe.index);
  const top = deck[0] ?? null;
  const [pending, setPending] = useState<"like" | "pass" | null>(null);
  const [match, setMatch] = useState<{ rest: Restaurant; others: MemberId[] } | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [undoDir, setUndoDir] = useState<"like" | "pass" | null>(null);

  const pollLive = poll.status !== "draft";

  const trayEntries = Object.entries(swipe.matches)
    .filter(([, members]) => members.length > 0)
    .map(([id, members]) => ({
      id,
      name: SHORT_NAME[id] ?? id,
      count: members.length + 1, // + Ari's side of the match
    }));
  const trayThumb = trayEntries.length
    ? RESTAURANTS.find((r) => r.id === trayEntries[0].id)
    : undefined;

  const onSettled = (dir: "like" | "pass") => {
    if (!top) return;
    const others = swipe.matches[top.id] ?? [];
    dispatch({ type: "SWIPE", dir });
    setPending(null);
    setFlipped(false);
    setUndoDir(null);
    if (dir === "like" && others.length > 0) setMatch({ rest: top, others });
  };

  const onUndo = () => {
    if (swipe.index === 0) return;
    const prev = RESTAURANTS[swipe.index - 1];
    setUndoDir(swipe.liked.includes(prev.id) ? "like" : "pass");
    setFlipped(false);
    setMatch(null);
    dispatch({ type: "SWIPE_UNDO" });
  };

  const swipeVia = (dir: "like" | "pass") => {
    if (!top || match) return;
    setFlipped(false);
    setPending(dir);
  };

  const openPoll = () => {
    setMatch(null);
    dispatch({ type: "OPEN_SHEET", sheet: "createPoll" });
  };

  return (
    <div className="relative flex h-full flex-col pb-[96px]">
      <StatusBar />

      {/* Header */}
      <div className="flex items-end justify-between px-5 pt-1">
        <h1 className="text-[24px] font-bold leading-7 tracking-[-0.3px] text-ink-900">
          Tonight near Alfama
        </h1>
        <span className="pb-0.5 text-[13px] font-semibold text-ink-500">12 spots</span>
      </div>

      {/* Filter chips — "Dinner" deliberately has no emoji (tofu risk) */}
      <div className="mt-3 flex gap-2 px-5">
        <button
          aria-label="Filters"
          onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "filters" })}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-300 bg-paper-0 text-ink-600 active:bg-paper-100"
        >
          <SlidersHorizontal size={15} strokeWidth={2.25} />
        </button>
        <Chip selected onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "filters" })}>
          Dinner
        </Chip>
        <Chip onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "filters" })}>≤ 1 km</Chip>
        <Chip onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "filters" })}>€€–€€€</Chip>
        <Chip onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "filters" })}>Open now</Chip>
      </div>

      {/* Card deck */}
      <div className="relative mx-5 mt-3.5 h-[470px]">
        {deck
          .slice(0, 3)
          .map((r, i) =>
            i === 0 ? null : (
              <motion.div
                key={r.id}
                className="absolute inset-0"
                initial={false}
                animate={{ scale: i === 1 ? 0.95 : 0.9, y: i === 1 ? 10 : 20, rotate: i === 1 ? 2 : -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <CardFace rest={r} />
              </motion.div>
            ),
          )
          .reverse()}
        {top ? (
          <TopCard
            key={top.id}
            rest={top}
            pending={pending}
            flipped={flipped}
            enterFrom={undoDir}
            onFlipBack={() => setFlipped(false)}
            onSettled={onSettled}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-paper-100 text-4xl">
              <Sparkles size={26} strokeWidth={1.75} className="text-sunset-500" />
            </div>
            <p className="mt-4 text-lg font-bold text-ink-900">That's the neighborhood!</p>
            <p className="mt-1 text-sm font-medium text-ink-600">
              Your group matches are waiting below
            </p>
            {!pollLive && (
              <div className="mt-4">
                <PrimaryButton compact onClick={openPoll}>
                  Make it a poll →
                </PrimaryButton>
              </div>
            )}
          </div>
        )}

        {/* Undo chip — appears once there's a swipe to rewind */}
        {swipe.index > 0 && !match && !flipped && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={onUndo}
            className="absolute left-2 top-[52px] z-20 flex items-center gap-1 rounded-full bg-paper-0 py-1.5 pl-2.5 pr-3 text-[13px] font-semibold text-ink-600 shadow-elev-2 active:bg-paper-100"
          >
            <Undo2 size={14} strokeWidth={2.25} />
            Undo
          </motion.button>
        )}

        {/* Live social ticker — ambient presence, re-animates on every seq bump */}
        {top && <SwipeTickerBubble />}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex items-center justify-center gap-5">
        <button
          aria-label="Pass"
          onClick={() => swipeVia("pass")}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-0 shadow-elev-2 active:bg-paper-100"
        >
          <X size={24} strokeWidth={2.25} className="text-ink-900" />
        </button>
        <button
          aria-label="Details"
          onClick={() => top && !match && setFlipped((v) => !v)}
          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-elev-2 ${
            flipped ? "bg-sunset-50 text-sunset-700" : "bg-paper-0 text-ink-600 active:bg-paper-100"
          }`}
        >
          <Info size={20} strokeWidth={2} />
        </button>
        <button
          aria-label="Into it"
          onClick={() => swipeVia("like")}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-0 shadow-elev-2 active:bg-paper-100"
        >
          <Heart size={24} strokeWidth={2} className="text-sunset-500" fill="#FF5A45" />
        </button>
      </div>

      {/* Matches tray */}
      {trayEntries.length > 0 && (
        <div className="mx-5 mt-auto flex items-center gap-3 rounded-2xl bg-paper-0 px-3 py-2.5 shadow-elev-2">
          {trayThumb && (
            <img
              src={trayThumb.photo}
              alt={trayThumb.name}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
            />
          )}
          <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-900">
            {trayEntries.map((e, i) => (
              <span key={e.id}>
                {i > 0 && " · "}
                {e.name} <Heart size={11} strokeWidth={0} className="inline align-[-1px] fill-sunset-500" />{" "}
                <span className="tabular">{e.count}</span>
              </span>
            ))}
          </p>
          {pollLive ? (
            <span className="shrink-0 text-[13px] font-semibold text-ink-500">
              In tonight's poll
            </span>
          ) : (
            <button
              onClick={openPoll}
              className="shrink-0 text-[13px] font-bold text-sunset-700 active:opacity-70"
            >
              Make it a poll →
            </button>
          )}
        </div>
      )}

      {/* Match moment takeover — single pass, nothing flashes */}
      <AnimatePresence>
        {match && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-[35] flex flex-col items-center justify-center px-6"
            style={{ background: "linear-gradient(180deg, #FF5A45 0%, #FF8A5C 100%)" }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.15 }}
              className="w-full rounded-3xl bg-paper-0 px-6 pb-6 pt-7 text-center shadow-elev-3"
            >
              {/* contents cascade 80ms apart — one pass, then everything rests */}
              <motion.h2
                initial={{ opacity: 0.4, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.26 }}
                className="text-[32px] font-extrabold leading-9 tracking-[-0.5px] text-ink-900"
              >
                It's a match!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0.4, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.34 }}
                className="mt-2 text-base font-medium text-ink-600"
              >
                You + {match.others.map((id) => MEMBERS[id].name).join(" + ")} are into{" "}
                {match.rest.name}
              </motion.p>
              <motion.div
                initial={{ opacity: 0.4, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.42 }}
                className="mt-4 flex justify-center"
              >
                <AvatarStack ids={["ari", ...match.others]} size={40} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0.4, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.5 }}
                className="mt-6"
              >
                <PrimaryButton full onClick={openPoll}>
                  Make it a poll →
                </PrimaryButton>
              </motion.div>
              <motion.div
                initial={{ opacity: 0.4, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.58 }}
                className="mt-2 flex justify-center"
              >
                <GhostButton onClick={() => setMatch(null)}>Keep swiping</GhostButton>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
