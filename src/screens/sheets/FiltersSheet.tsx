import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BottomSheet, Chip, PrimaryButton, Segmented } from "../../components/ui";
import { useStore } from "../../state/store";

const CATEGORIES = ["Dinner", "Drinks", "Brunch", "Activity", "Late night"];
const PRICES = ["€", "€€", "€€€"] as const;
const VIBES = ["Live music", "Rooftop", "Hidden gem", "Big group ok"];
type Distance = "500" | "1000" | "2000";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label="Open now"
      onClick={onToggle}
      className={`hit44 flex h-7 w-12 shrink-0 items-center rounded-full px-1 transition-colors ${
        on ? "justify-end bg-sunset-500" : "justify-start bg-line-300"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="h-5 w-5 rounded-full bg-white shadow-elev-1"
      />
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[13px] font-semibold text-ink-500">{children}</p>;
}

export default function FiltersSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "filters";

  // Local mock filters — the deck itself stays scripted for the demo
  const [category, setCategory] = useState("Dinner");
  const [distance, setDistance] = useState<Distance>("1000");
  const [prices, setPrices] = useState<string[]>(["€€", "€€€"]);
  const [openNow, setOpenNow] = useState(true);
  const [vibes, setVibes] = useState<string[]>([]);

  const togglePrice = (p: string) =>
    setPrices((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  const toggleVibe = (v: string) =>
    setVibes((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  const close = () => dispatch({ type: "CLOSE_SHEET" });

  return (
    <BottomSheet open={open} onClose={close}>
      <div className="flex min-h-full flex-col px-5 pt-2">
        <h2 className="text-[22px] font-bold leading-7 text-ink-900">Filters</h2>
        <p className="mt-0.5 text-xs font-medium text-ink-500">Tonight near Alfama</p>

        <div className="mt-4">
          <SectionLabel>What kind of night</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <SectionLabel>Distance</SectionLabel>
          <Segmented<Distance>
            options={[
              { value: "500", label: "≤ 500 m" },
              { value: "1000", label: "≤ 1 km" },
              { value: "2000", label: "≤ 2 km" },
            ]}
            value={distance}
            onChange={setDistance}
          />
        </div>

        <div className="mt-5">
          <SectionLabel>Price</SectionLabel>
          <div className="flex gap-2">
            {PRICES.map((p) => (
              <Chip key={p} selected={prices.includes(p)} onClick={() => togglePrice(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-ink-900">Open now</p>
          <Toggle on={openNow} onToggle={() => setOpenNow((v) => !v)} />
        </div>

        <div className="mt-5">
          <SectionLabel>Vibes</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <Chip key={v} selected={vibes.includes(v)} onClick={() => toggleVibe(v)}>
                {v}
              </Chip>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 -mx-5 mt-auto bg-paper-0 px-5 pb-8 pt-4">
          <PrimaryButton full onClick={close}>
            Show 12 spots
          </PrimaryButton>
        </div>
      </div>
    </BottomSheet>
  );
}
