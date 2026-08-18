import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, MapPin, Plus, Search, Star } from "lucide-react";
import { BottomSheet, PrimaryButton } from "../../components/ui";
import { PLACES } from "../../data/mock";
import { useStore } from "../../state/store";

/** Faked map coordinates (percent of the panel) - stable, hand-placed. */
const PINS: { id: string; x: number; y: number }[] = [
  { id: "vintem", x: 32, y: 60 },
  { id: "marealta", x: 68, y: 42 },
  { id: "terraco", x: 46, y: 26 },
  { id: "azulejo", x: 20, y: 38 },
  { id: "tram28", x: 56, y: 74 },
  { id: "lxfactory", x: 80, y: 68 },
];

const fmtDistance = (m: number) => (m >= 1000 ? (m / 1000).toFixed(1) + " km" : m + " m");

export default function MapPickSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "mapPick";
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setPicked([]);
      setQuery("");
    }
  }, [open]);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const q = query.trim().toLowerCase();
  const results = Object.values(PLACES).filter((p) =>
    q ? p.name.toLowerCase().includes(q) || p.vibe.toLowerCase().includes(q) : true,
  );

  const confirm = () => {
    if (!picked.length) return;
    if (state.session) {
      picked.forEach((id) => dispatch({ type: "ADD_TO_SESSION", placeId: id }));
      dispatch({ type: "CLOSE_SHEET" });
      dispatch({
        type: "PUSH_BANNER",
        icon: "session",
        text: picked.length + (picked.length === 1 ? " spot" : " spots") + " added to the session",
      });
    } else {
      dispatch({ type: "START_SESSION", title: "Tonight", placeIds: picked });
    }
  };

  const cta = state.session
    ? "Add " + (picked.length || "") + (picked.length === 1 ? " spot" : " spots")
    : "Start match with " + (picked.length || "") + (picked.length === 1 ? " spot" : " spots");

  return (
    <BottomSheet open={open} full onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
      <div className="flex min-h-full flex-col">
        <div className="flex-1 px-5 pt-2">
          <h2 className="text-[20px] font-bold leading-6 tracking-[-0.2px] text-ink-900">
            Pick spots on the map
          </h2>
          <p className="mt-1 text-[13px] font-medium text-ink-500">
            Tap a pin, or search anything in Lisbon.
          </p>

          {/* Map panel - CSS-drawn streets, no tiles needed */}
          <div className="relative mt-3 h-52 overflow-hidden rounded-2xl border border-line-200 bg-paper-100">
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(#E9E5DF 1px, transparent 1px), linear-gradient(90deg, #E9E5DF 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            />
            {/* the river, roughly */}
            <div className="absolute -left-6 bottom-3 h-12 w-[130%] -rotate-6 bg-lagoon-50" aria-hidden />
            {PINS.map(({ id, x, y }) => {
              const place = PLACES[id];
              if (!place) return null;
              const on = picked.includes(id);
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggle(id)}
                  aria-pressed={on}
                  aria-label={place.name}
                  className="absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: x + "%", top: y + "%" }}
                >
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold shadow-elev-2 ${
                      on ? "bg-sunset-500 text-white" : "bg-paper-0 text-ink-600"
                    }`}
                  >
                    <MapPin size={11} strokeWidth={2.5} />
                    {place.name.split(" ")[0]}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Search */}
          <div className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-line-300 bg-paper-0 px-3.5 focus-within:border-sunset-500">
            <Search size={16} strokeWidth={2} className="shrink-0 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places in Lisbon"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-400"
            />
          </div>

          <div className="mt-3 flex flex-col gap-2 pb-4">
            {results.map((p) => {
              const on = picked.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-line-200 bg-paper-0 p-2.5"
                >
                  <img src={p.photo} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{p.name}</p>
                    <p className="mt-0.5 text-xs font-medium text-ink-500">
                      <Star
                        size={11}
                        strokeWidth={0}
                        className="mr-0.5 inline align-[-1px] fill-golden-400"
                      />
                      <span className="tabular">{p.rating.toFixed(1)}</span> · {p.price} ·{" "}
                      <span className="tabular">{fmtDistance(p.distanceM)}</span>
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggle(p.id)}
                    aria-pressed={on}
                    aria-label={(on ? "Remove " : "Add ") + p.name}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      on ? "bg-sunset-500 text-white" : "bg-paper-100 text-ink-600"
                    }`}
                  >
                    {on ? <Check size={15} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.25} />}
                  </motion.button>
                </div>
              );
            })}
            {!results.length && (
              <p className="py-6 text-center text-sm font-medium text-ink-500">
                Nothing matches that yet.
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-line-200 bg-paper-0 px-5 pb-8 pt-3">
          <PrimaryButton full disabled={!picked.length} onClick={confirm}>
            {cta}
          </PrimaryButton>
        </div>
      </div>
    </BottomSheet>
  );
}
