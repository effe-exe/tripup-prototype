import { motion } from "framer-motion";
import { ChevronRight, MapPin, Receipt } from "lucide-react";
import { AvatarStack, BottomSheet, GhostButton } from "../../components/ui";
import { useStore } from "../../state/store";

/** Per-spot flavor data — display-only, keyed by itinerary item id. */
const LOCATIONS: Record<string, string> = {
  "it-market": "Campo de Santa Clara · 650 m away",
  "it-lunch": "Mercado da Ribeira · 1.2 km away",
  "it-sunset": "Largo da Graça · 400 m away",
  "it-dinner": "Cais do Sodré · 900 m away",
};

const NOTES: Record<string, string> = {
  "it-market": "Bring cash — half the stalls don't take card.",
  "it-lunch": "Long shared tables, easy to squeeze everyone in.",
  "it-sunset": "Golden hour peaks around 19:40 — arrive early.",
  "it-dinner": "Counter seats under Ari · walk-ins until 21:00.",
};

export default function ItineraryDetailSheet() {
  const { state, dispatch } = useStore();
  const item = state.itinerary.find((i) => i.id === state.sheetPayload);
  const open = state.sheet === "itineraryDetail" && !!item;

  const linkedExpense = item
    ? state.expenses.find((e) =>
        item.expenseId ? e.id === item.expenseId : e.linkedItineraryId === item.id,
      )
    : undefined;
  const going = linkedExpense?.sharedBy ?? state.members;

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
      {item && (
        <div className="flex flex-col gap-4 px-5 pb-8 pt-3">
          {/* Photo header */}
          {item.photo && (
            <img
              src={item.photo}
              alt=""
              className="h-40 w-full rounded-2xl object-cover"
            />
          )}

          {/* Title + time + day */}
          <div>
            <h2 className="text-[20px] font-bold leading-6 tracking-[-0.2px] text-ink-900">
              {item.title}
            </h2>
            <p className="mt-1 text-[13px] font-medium tabular text-ink-500">
              Today · Aug 17 · {item.time}
            </p>
          </div>

          {/* Map placeholder */}
          <div className="rounded-2xl bg-paper-100 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-0">
                <MapPin size={19} strokeWidth={1.75} className="text-sunset-500" />
              </span>
              <p className="min-w-0 flex-1 text-sm font-semibold tabular text-ink-900">
                {LOCATIONS[item.id] ?? "Lisbon · nearby"}
              </p>
              <GhostButton>Open in Maps</GhostButton>
            </div>
          </div>

          {/* Who's going */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-600">Who's going</p>
            <AvatarStack ids={going} size={28} />
          </div>

          {/* Linked expense */}
          {linkedExpense && (
            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={() =>
                dispatch({ type: "OPEN_SHEET", sheet: "expenseDetail", payload: linkedExpense.id })
              }
              className="flex w-full items-center gap-3 rounded-2xl bg-paper-0 p-3 text-left shadow-elev-1"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunset-50">
                <Receipt size={19} strokeWidth={1.75} className="text-sunset-700" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink-900">
                  {linkedExpense.title}
                </span>
                <span className="block text-xs font-medium tabular text-ink-500">
                  €{linkedExpense.amount.toFixed(2)} · split {linkedExpense.sharedBy.length} ways
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-ink-400" />
            </motion.button>
          )}

          {/* Notes */}
          <p className="text-[13px] font-medium leading-5 text-ink-500">
            📝 {NOTES[item.id] ?? "No notes yet — add one from the plan."}
          </p>

          <div className="flex justify-center">
            <GhostButton destructive>Remove from plan</GhostButton>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
