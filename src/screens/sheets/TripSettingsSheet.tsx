import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BellOff, ChevronRight, Coins, Image, PenLine, Users, type LucideIcon } from "lucide-react";
import { BottomSheet, GhostButton } from "../../components/ui";
import { TRIP } from "../../data/mock";
import { useStore } from "../../state/store";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`hit44 h-7 w-12 shrink-0 rounded-full transition-colors ${
        on ? "bg-lagoon-500" : "bg-line-300"
      }`}
    >
      <motion.span
        animate={{ x: on ? 20 : 0 }}
        transition={spring}
        className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-elev-1"
      />
    </button>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  trailing,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  trailing?: ReactNode;
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-100">
        <Icon size={19} strokeWidth={1.75} className="text-ink-600" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink-900">{label}</span>
        {value && <span className="block truncate text-xs font-medium text-ink-500">{value}</span>}
      </span>
    </>
  );
  if (trailing)
    return (
      <div className="flex w-full items-center gap-3 px-1 py-3.5">
        {inner}
        {trailing}
      </div>
    );
  return (
    <button className="flex w-full items-center gap-3 px-1 py-3.5 text-left active:bg-paper-100">
      {inner}
      <ChevronRight size={18} className="shrink-0 text-ink-400" />
    </button>
  );
}

export default function TripSettingsSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "tripSettings";
  const [muted, setMuted] = useState(false);

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
      <div className="flex flex-col px-5 pb-8 pt-3">
        <h2 className="text-[20px] font-bold leading-6 tracking-[-0.2px] text-ink-900">
          Trip settings
        </h2>

        {/* Cover preview */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-paper-100 p-3">
          <img src={TRIP.cover} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-ink-900">{TRIP.name}</p>
            <p className="text-xs font-medium text-ink-500">
              {TRIP.dates} · {TRIP.location}
            </p>
          </div>
        </div>

        <div className="mt-1 divide-y divide-line-200">
          <Row icon={PenLine} label="Trip name" value={TRIP.name} />
          <Row icon={Image} label="Cover photo" />
          <Row icon={Users} label={`Members (${state.members.length})`} />
          <Row icon={Coins} label="Currency" value="EUR" />
          <Row
            icon={BellOff}
            label="Mute notifications"
            trailing={<Toggle on={muted} onChange={setMuted} />}
          />
        </div>

        <div className="mt-2 flex justify-center">
          <GhostButton destructive>Leave trip</GhostButton>
        </div>
      </div>
    </BottomSheet>
  );
}
