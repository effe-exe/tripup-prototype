import { motion } from "framer-motion";
import { MapPin, Receipt, Sparkles, UserPlus, Vote } from "lucide-react";
import { BottomSheet } from "../../components/ui";
import { rowEnter, tapCard } from "../../components/motion";
import { useStore } from "../../state/store";

export default function QuickActionsSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "quickActions";

  const rows = [
    {
      icon: Vote,
      label: "New poll",
      act: () => dispatch({ type: "OPEN_SHEET", sheet: "createPoll" } as const),
    },
    {
      icon: Receipt,
      label: "Add expense",
      act: () => dispatch({ type: "OPEN_SHEET", sheet: "addExpense" } as const),
    },
    {
      icon: MapPin,
      label: "Add spot",
      act: () => dispatch({ type: "SET_TAB", tab: "swipe" } as const),
    },
    {
      icon: UserPlus,
      label: "Add person",
      act: () => dispatch({ type: "OPEN_SHEET", sheet: "addMember" } as const),
    },
  ];

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
      <div className="flex flex-col px-5 pb-8 pt-2">
        {/* Flagship: fake-AI planner — visually lifted out of the plain row list */}
        <motion.button
          {...rowEnter(0)}
          whileTap={tapCard}
          onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "aiPlan" } as const)}
          className="mb-2 flex h-14 items-center gap-3 rounded-2xl bg-sunset-50 px-3 text-left active:bg-sunset-100"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunset-100">
            <Sparkles size={20} strokeWidth={1.75} className="text-sunset-600" />
          </span>
          <span className="text-base font-semibold text-ink-900">
            Ask AI — what should we do?
          </span>
        </motion.button>

        {rows.map((r, i) => (
          <motion.button
            key={r.label}
            {...rowEnter(i + 1)}
            whileTap={tapCard}
            onClick={r.act}
            className={`flex h-14 items-center gap-3 text-left ${
              i > 0 ? "border-t border-line-200" : ""
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-100">
              <r.icon size={20} strokeWidth={1.75} className="text-ink-600" />
            </span>
            <span className="text-base font-semibold text-ink-900">{r.label}</span>
          </motion.button>
        ))}
      </div>
    </BottomSheet>
  );
}
