import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import { useStore } from "../../state/store";
import { photos } from "../../data/mock";
import { HomeIndicator, PrimaryButton, StatusBar } from "../../components/ui";

const SLIDE_MS = 3000;

const SLIDES = [
  { photo: photos.alfama, caption: "Day 1 — we landed hungry" },
  { photo: photos.fado, caption: "The fado night" },
  { photo: photos.miradouro, caption: "Golden hour, every hour" },
  { photo: photos.seafood, caption: "€1,141 later…" },
  { photo: photos.tram, caption: "0 debts. All love." },
];

export default function FilmSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "film";
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Restart from the top every time the premiere opens
  useEffect(() => {
    if (open) {
      setIndex(0);
      setPlaying(true);
    }
  }, [open]);

  // Advance slides while playing — cleared on pause/close
  useEffect(() => {
    if (!open || !playing) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [open, playing]);

  const close = () => dispatch({ type: "CLOSE_SHEET" });
  const share = () =>
    dispatch({ type: "PUSH_BANNER", icon: "info", text: "Link copied — send it to the group" });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="absolute inset-0 z-50 flex flex-col bg-ink-900"
        >
          <StatusBar light />

          {/* Title + close */}
          <div className="flex items-center justify-between px-5 py-1">
            <div>
              <p className="text-base font-bold text-white">The Lisboa film</p>
              <p className="text-xs font-medium text-white/60">23 clips · auto-cut by TripUp</p>
            </div>
            <button
              onClick={close}
              aria-label="Close film"
              className="hit44 -mr-1.5 flex h-9 w-9 items-center justify-center rounded-full text-white/80 active:bg-white/10"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* 9:16-ish stage — slow Ken Burns, 600ms crossfade */}
          <div className="relative mx-5 mt-1 min-h-0 flex-1 overflow-hidden rounded-3xl bg-black">
            <AnimatePresence>
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <motion.img
                  src={SLIDES[index].photo}
                  alt=""
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.06 }}
                  transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Caption scrim + line, one gentle rise per slide */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
            />
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 28 }}
                className="absolute inset-x-0 bottom-4 px-5 text-center text-[17px] font-bold text-white"
              >
                {SLIDES[index].caption}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress dots + play/pause */}
          <div className="flex items-center justify-center gap-3 px-5 pt-3.5">
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? 20 : 6,
                    background: i === index ? "#FFFFFF" : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause film" : "Play film"}
              className="hit44 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white active:bg-white/25"
            >
              {playing ? (
                <Pause size={15} className="fill-white" />
              ) : (
                <Play size={15} className="ml-0.5 fill-white" />
              )}
            </button>
          </div>

          <div className="px-5 pb-9 pt-3.5">
            <PrimaryButton full onClick={share}>
              Share film
            </PrimaryButton>
          </div>

          <HomeIndicator light />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
