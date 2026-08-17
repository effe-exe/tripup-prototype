import { X } from "lucide-react";
import { BottomSheet, Chip, PrimaryButton } from "../../components/ui";
import { RESTAURANTS, useStore } from "../../state/store";

export default function CreatePollSheet() {
  const { state, dispatch } = useStore();

  return (
    <BottomSheet
      open={state.sheet === "createPoll"}
      full
      onClose={() => dispatch({ type: "CLOSE_SHEET" })}
    >
      <div className="flex min-h-full flex-col">
        <div className="flex-1 px-5 pt-2">
          <p className="text-center text-[13px] font-semibold text-ink-500">New poll</p>

          {/* Title — input-styled, pre-filled */}
          <div className="mt-3 flex h-[52px] items-center rounded-xl border border-line-300 bg-paper-0 px-4 text-base font-semibold text-ink-900">
            Dinner tonight 🍽
          </div>

          {/* Options pre-filled from Swipe */}
          <div className="mt-4 space-y-3">
            {RESTAURANTS.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-2xl border border-line-200 bg-paper-0 p-3"
              >
                <img
                  src={r.photo}
                  alt={r.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold leading-5 text-ink-900">{r.name}</p>
                  <p className="truncate text-[13px] leading-4 text-ink-600">{r.vibe}</p>
                  <p className="mt-0.5 text-xs font-medium text-ink-500">
                    <span className="text-golden-400">★</span> {r.rating} · {r.price} ·{" "}
                    <span className="tabular">{r.distanceM} m</span>
                  </p>
                </div>
                <button
                  aria-label={`Remove ${r.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 active:bg-paper-100"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            ))}
            <button className="flex h-14 w-full items-center justify-center rounded-2xl border border-dashed border-line-300 text-sm font-semibold text-ink-500 active:bg-paper-100">
              ＋ Add option
            </button>
          </div>

          {/* Smart defaults */}
          <p className="mt-5 text-[13px] font-semibold text-ink-600">Poll settings</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip selected>⏱ Ends in 30 min</Chip>
            <Chip selected>Votes visible live</Chip>
            <Chip selected>🎯 Winner → itinerary 20:45</Chip>
          </div>
        </div>

        {/* Sticky footer CTA */}
        <div className="sticky bottom-0 mt-6 border-t border-line-200 bg-paper-0 px-5 pb-8 pt-3">
          <PrimaryButton full onClick={() => dispatch({ type: "SEND_POLL" })}>
            Send to the group 🗳
          </PrimaryButton>
        </div>
      </div>
    </BottomSheet>
  );
}
