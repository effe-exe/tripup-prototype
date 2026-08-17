import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarCheck,
  ChevronRight,
  Coins,
  UserPlus,
  Vote,
  type LucideIcon,
} from "lucide-react";
import { HomeIndicator, StatusBar } from "../components/ui";
import type { BuzzEvent } from "../data/types";
import { useStore } from "../state/store";

const ICONS: Record<BuzzEvent["icon"], LucideIcon> = {
  vote: BarChart3,
  join: UserPlus,
  itinerary: CalendarCheck,
  money: Coins,
  poll: Vote,
};

/** Earlier-in-the-trip recap — display-only, local to this tab. */
const EARLIER: BuzzEvent[] = [
  { id: "eb1", icon: "money", text: "Tomás added Sintra day (train + Pena) · €130", time: "Aug 16" },
  { id: "eb2", icon: "itinerary", text: "Maya planned Bairro Alto night", time: "Aug 15" },
  { id: "eb3", icon: "join", text: "Zoe joined the trip", time: "Aug 14" },
];

export default function BuzzTab() {
  const { state, dispatch } = useStore();

  const onRowTap = (b: BuzzEvent) => {
    switch (b.icon) {
      case "poll":
      case "vote":
        if (state.poll.status === "open") dispatch({ type: "OPEN_SHEET", sheet: "pollVote" });
        else dispatch({ type: "SET_TAB", tab: "hub" });
        break;
      case "money":
        dispatch({ type: "SET_TAB", tab: "split" });
        break;
      default:
        dispatch({ type: "SET_TAB", tab: "hub" });
    }
  };

  const renderRow = (b: BuzzEvent) => {
    const Icon = ICONS[b.icon];
    return (
      <motion.button
        key={b.id}
        whileTap={{ scale: 0.99 }}
        onClick={() => onRowTap(b)}
        className="flex w-full items-center gap-3 py-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-100">
          <Icon size={20} strokeWidth={1.75} className="text-ink-600" />
        </span>
        <p className="min-w-0 flex-1 text-sm font-medium tabular text-ink-900">{b.text}</p>
        <span className="shrink-0 text-xs font-medium tabular text-ink-500">{b.time}</span>
        <ChevronRight size={16} className="shrink-0 text-ink-400" />
      </motion.button>
    );
  };

  return (
    <div className="relative flex h-full flex-col bg-paper-50">
      <StatusBar />
      <div className="px-5 py-1.5">
        <h1 className="text-[22px] font-bold leading-7 tracking-[-0.2px] text-ink-900">Buzz</h1>
        <p className="text-xs font-medium leading-4 text-ink-500">
          Everything the group's up to — you're all caught up
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-32">
        <p className="pt-2 text-sm font-semibold text-ink-600">Today</p>
        <div className="divide-y divide-line-200">{state.buzz.map(renderRow)}</div>

        <p className="pt-5 text-sm font-semibold text-ink-600">Earlier</p>
        <div className="divide-y divide-line-200">{EARLIER.map(renderRow)}</div>
      </div>

      <HomeIndicator />
    </div>
  );
}
