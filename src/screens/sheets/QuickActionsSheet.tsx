import { MapPin, Receipt, UserPlus, Vote } from "lucide-react";
import { BottomSheet } from "../../components/ui";
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
        {rows.map((r, i) => (
          <button
            key={r.label}
            onClick={r.act}
            className={`flex h-14 items-center gap-3 text-left ${
              i > 0 ? "border-t border-line-200" : ""
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-100">
              <r.icon size={20} strokeWidth={1.75} className="text-ink-600" />
            </span>
            <span className="text-base font-semibold text-ink-900">{r.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
