import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Avatar, BottomSheet, Chip, PrimaryButton } from "../../components/ui";
import { MEMBERS } from "../../data/mock";
import type { MemberId } from "../../data/types";
import { useStore } from "../../state/store";

const EMOJI_SUGGESTIONS = ["🏝", "🎿", "🎉", "🍜"];
const FRIENDS: MemberId[] = ["nic", "maya", "tomas", "zoe", "ren"];
const DATE_CHIPS = ["This weekend", "Next month", "Pick dates"] as const;

export default function NewTripSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "newTrip";

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [dateChip, setDateChip] = useState<string | null>(null);
  const [picked, setPicked] = useState<MemberId[]>(["nic", "maya"]);

  const toggleFriend = (id: MemberId) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const create = () => {
    const tripName = name.trim() || "Ibiza Sept";
    dispatch({ type: "CLOSE_SHEET" });
    dispatch({ type: "PUSH_BANNER", emoji: "✨", text: `${tripName} is waiting — trip created` });
    setName("");
    setDestination("");
    setDateChip(null);
    setPicked(["nic", "maya"]);
  };

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })} full>
      <div className="flex flex-col gap-4 px-5 pb-8 pt-3">
        <h2 className="text-[20px] font-bold leading-6 tracking-[-0.2px] text-ink-900">
          Start a new trip
        </h2>

        {/* Trip name + emoji suggestions */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink-500">Trip name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ibiza Sept"
            className="h-12 rounded-xl border border-line-300 bg-paper-0 px-4 text-[15px] font-medium text-ink-900 outline-none placeholder:text-ink-400 focus:border-sunset-500"
          />
          <div className="flex gap-2">
            {EMOJI_SUGGESTIONS.map((e) => (
              <motion.button
                key={e}
                whileTap={{ scale: 0.9 }}
                onClick={() => setName((n) => (n.includes(e) ? n : `${n.trimEnd()} ${e}`.trim()))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-100 text-lg active:bg-sunset-50"
              >
                {e}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Destination */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink-500">Destination</label>
          <div className="flex h-12 items-center gap-2.5 rounded-xl border border-line-300 bg-paper-0 px-4 focus-within:border-sunset-500">
            <MapPin size={18} strokeWidth={1.75} className="shrink-0 text-ink-400" />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where to?"
              className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink-900 outline-none placeholder:text-ink-400"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink-500">When</label>
          <div className="flex gap-2">
            {DATE_CHIPS.map((c) => (
              <Chip key={c} selected={dateChip === c} onClick={() => setDateChip(c)}>
                {c === "Pick dates" ? "Pick dates ▸" : c}
              </Chip>
            ))}
          </div>
        </div>

        {/* Friends picker */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink-500">
            Bring the group · {picked.length} picked
          </label>
          <div className="flex gap-3">
            {FRIENDS.map((id) => {
              const sel = picked.includes(id);
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleFriend(id)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className={`relative rounded-full p-0.5 ${sel ? "ring-2 ring-sunset-500" : "opacity-55"}`}>
                    <Avatar id={id} size={44} />
                    {sel && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sunset-500 text-[10px] font-bold text-white" style={{ width: 18, height: 18, boxShadow: "0 0 0 1.5px #FFFFFF" }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold ${sel ? "text-ink-900" : "text-ink-500"}`}>
                    {MEMBERS[id].name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-1">
          <PrimaryButton full onClick={create}>
            Create trip
          </PrimaryButton>
        </div>
        <p className="-mt-1 text-center text-xs font-medium text-ink-500">
          You can tweak everything later
        </p>
      </div>
    </BottomSheet>
  );
}
