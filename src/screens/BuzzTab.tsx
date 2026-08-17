import { BarChart3, CalendarCheck, Coins, UserPlus, Vote, type LucideIcon } from "lucide-react";
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

export default function BuzzTab() {
  const { state } = useStore();

  return (
    <div className="relative flex h-full flex-col bg-paper-50">
      <StatusBar />
      <div className="px-5 py-1.5">
        <h1 className="text-[22px] font-bold leading-7 tracking-[-0.2px] text-ink-900">Buzz</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-32">
        <div className="divide-y divide-line-200">
          {state.buzz.map((b) => {
            const Icon = ICONS[b.icon];
            return (
              <div key={b.id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-100">
                  <Icon size={20} strokeWidth={1.75} className="text-ink-600" />
                </span>
                <p className="min-w-0 flex-1 text-sm font-medium tabular text-ink-900">{b.text}</p>
                <span className="shrink-0 text-xs font-medium tabular text-ink-500">{b.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
