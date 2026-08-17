import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, Info, X } from "lucide-react";
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
        ✨ Picked for your group
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h2 className="text-[26px] font-bold leading-8 text-white">{rest.name}</h2>
        <p className="mt-0.5 text-sm font-medium leading-5 text-white/90">{rest.vibe}</p>
        <p className="mt-1.5 text-sm font-semibold text-white">
          <span className="text-golden-400">★</span> {rest.rating} ({fmtReviews(rest.reviews)}) ·{" "}
          {rest.price} · <span className="tabular">{rest.distanceM} m</span>
        </p>
        <p className="mt-3 rounded-2xl bg-white/[0.14] px-3.5 py-2.5 text-[13px] font-medium leading-[18px] text-white/95">
          {`“${rest.review}”`}
        </p>
      </div>
    </div>
  );
}

/* ---------- Draggable top card with swipe physics ---------- */

function TopCard({
  rest,
  pending,
  onSettled,
}: {
  rest: Restaurant;
  /** programmatic swipe requested by the ✕ / ♥ buttons */
  pending: "like" | "pass" | null;
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

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      drag={flying ? false : "x"}
      dragSnapToOrigin
      dragTransition={{ bounceStiffness: 220, bounceDamping: 28 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) fly("like", info.offset.y * 1.2);
        else if (info.offset.x < -100) fly("pass", info.offset.y * 1.2);
      }}
      style={{ x, y, rotate }}
    >
      <CardFace rest={rest} />
      <motion.span
        style={{ opacity: likeOpacity }}
        className="absolute left-5 top-16 -rotate-12 rounded-xl border-[3px] border-lagoon-500 bg-white/85 px-3 py-1 text-xl font-extrabold tracking-wide text-lagoon-500"
      >
        INTO IT
      </motion.span>
      <motion.span
        style={{ opacity: passOpacity }}
        className="absolute right-5 top-16 rotate-12 rounded-xl border-[3px] border-ink-500 bg-white/85 px-3 py-1 text-xl font-extrabold tracking-wide text-ink-500"
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
    if (dir === "like" && others.length > 0) setMatch({ rest: top, others });
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
        <Chip selected>Dinner</Chip>
        <Chip>≤ 1 km</Chip>
        <Chip>€€–€€€</Chip>
        <Chip>Open now</Chip>
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
          <TopCard key={top.id} rest={top} pending={pending} onSettled={onSettled} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-paper-100 text-4xl">
              ✨
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

        {/* Live social ticker */}
        {top && (
          <div className="absolute right-2 top-[52px] z-20 flex items-center gap-1.5 rounded-full bg-paper-0 py-1 pl-1 pr-3 shadow-elev-2">
            <Avatar id="maya" size={24} state="online" />
            <span className="text-[13px] font-semibold text-ink-900">Maya is swiping…</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex items-center justify-center gap-5">
        <button
          aria-label="Pass"
          onClick={() => top && !match && setPending("pass")}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-0 shadow-elev-2 active:bg-paper-100"
        >
          <X size={24} strokeWidth={2.25} className="text-ink-900" />
        </button>
        <button
          aria-label="Details"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-0 shadow-elev-2 active:bg-paper-100"
        >
          <Info size={20} strokeWidth={2} className="text-ink-600" />
        </button>
        <button
          aria-label="Into it"
          onClick={() => top && !match && setPending("like")}
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
                {e.name} <span className="text-sunset-500">♥</span>{" "}
                <span className="tabular">{e.count}</span>
              </span>
            ))}
          </p>
          {pollLive ? (
            <span className="shrink-0 text-[13px] font-semibold text-ink-500">
              In tonight's poll 🗳
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
              <h2 className="text-[32px] font-extrabold leading-9 tracking-[-0.5px] text-ink-900">
                It's a match! 🔥
              </h2>
              <p className="mt-2 text-base font-medium text-ink-600">
                You + {match.others.map((id) => MEMBERS[id].name).join(" + ")} are into{" "}
                {match.rest.name}
              </p>
              <div className="mt-4 flex justify-center">
                <AvatarStack ids={["ari", ...match.others]} size={40} />
              </div>
              <div className="mt-6">
                <PrimaryButton full onClick={openPoll}>
                  Make it a poll →
                </PrimaryButton>
              </div>
              <div className="mt-2 flex justify-center">
                <GhostButton onClick={() => setMatch(null)}>Keep swiping</GhostButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
