import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useStore } from "../../state/store";
import { photos } from "../../data/mock";
import type { MemberId } from "../../data/types";
import { Avatar, BottomSheet } from "../../components/ui";

interface DayPhoto {
  photo: string;
  by: MemberId;
  /** object-position crop so repeated photos read as different shots */
  pos?: string;
}

/** Days 1–3 of the trip — static roll. Day 4 renders live from state.memories. */
const DAYS: { label: string; items: DayPhoto[] }[] = [
  {
    label: "Thu Aug 14",
    items: [
      { photo: photos.alfama, by: "ari" },
      { photo: photos.tram, by: "zoe", pos: "30% 20%" },
      { photo: photos.market, by: "maya" },
      { photo: photos.timeout, by: "nic", pos: "70% 50%" },
      { photo: photos.miradouro, by: "tomas" },
    ],
  },
  {
    label: "Fri Aug 15",
    items: [
      { photo: photos.seafood, by: "nic" },
      { photo: photos.fado, by: "maya", pos: "20% 30%" },
      { photo: photos.alfama, by: "zoe", pos: "80% 60%" },
      { photo: photos.market, by: "tomas", pos: "40% 75%" },
      { photo: photos.tram, by: "ari" },
      { photo: photos.timeout, by: "maya", pos: "25% 40%" },
    ],
  },
  {
    label: "Sat Aug 16",
    items: [
      { photo: photos.miradouro, by: "zoe", pos: "60% 30%" },
      { photo: photos.fado, by: "tomas" },
      { photo: photos.seafood, by: "ari", pos: "30% 60%" },
      { photo: photos.market, by: "nic", pos: "75% 25%" },
      { photo: photos.alfama, by: "maya", pos: "50% 80%" },
      { photo: photos.tram, by: "tomas", pos: "65% 45%" },
      { photo: photos.timeout, by: "zoe", pos: "45% 20%" },
    ],
  },
];

const STATIC_COUNT = DAYS.reduce((n, d) => n + d.items.length, 0); // 18

function PhotoTile({ photo, by, pos }: DayPhoto) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl">
      <img
        src={photo}
        alt=""
        className="h-full w-full object-cover"
        style={pos ? { objectPosition: pos } : undefined}
      />
      <span className="absolute bottom-1.5 left-1.5">
        <Avatar id={by} size={16} ring />
      </span>
    </div>
  );
}

function DaySection({
  label,
  count,
  children,
  delay,
}: {
  label: string;
  count: number;
  children: ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0.4, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay }}
      className="mt-4 first:mt-0"
    >
      <div className="flex items-baseline justify-between px-0.5">
        <h3 className="text-[13px] font-bold text-ink-900">{label}</h3>
        <span className="tabular text-xs font-medium text-ink-500">{count} photos</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">{children}</div>
    </motion.section>
  );
}

export default function AllMemoriesSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "allMemories";
  const total = STATIC_COUNT + state.memories.length;
  const close = () => dispatch({ type: "CLOSE_SHEET" });

  return (
    <BottomSheet open={open} onClose={close} full>
      <div className="flex items-center justify-between px-5 pb-1 pt-2">
        <h2 className="tabular text-[20px] font-bold tracking-[-0.2px] text-ink-900">
          All memories · {total} photos
        </h2>
        <button
          onClick={close}
          aria-label="Close"
          className="-mr-1.5 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-paper-100"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="px-5 pb-10 pt-1">
        {DAYS.map((day, i) => (
          <DaySection key={day.label} label={day.label} count={day.items.length} delay={i * 0.06}>
            {day.items.map((p, j) => (
              <PhotoTile key={day.label + j} {...p} />
            ))}
          </DaySection>
        ))}

        {/* Day 4 — live from state, plus the add tile */}
        <DaySection label="Sun Aug 17" count={state.memories.length} delay={DAYS.length * 0.06}>
          {state.memories.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0.4, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <PhotoTile photo={m.photo} by={m.by} />
            </motion.div>
          ))}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => dispatch({ type: "ADD_MEMORY", photo: photos.tram })}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-sunset-300 bg-sunset-50/60"
          >
            <Plus size={20} className="text-sunset-500" />
            <span className="text-xs font-semibold text-sunset-700">Add yours</span>
          </motion.button>
        </DaySection>
      </div>
    </BottomSheet>
  );
}
