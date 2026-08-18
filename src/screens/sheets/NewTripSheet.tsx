import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Link2, Plus, Check, X } from "lucide-react";
import { Avatar, BottomSheet, Chip, PrimaryButton } from "../../components/ui";
import { MEMBERS } from "../../data/mock";
import type { MemberId } from "../../data/types";
import { useStore } from "../../state/store";

const FRIENDS: MemberId[] = ["nic", "maya", "tomas", "zoe", "ren"];
const DATE_CHIPS = ["This weekend", "Next month", "Pick dates"] as const;

export default function NewTripSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "newTrip";

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [dateChip, setDateChip] = useState<string | null>(null);
  const [picked, setPicked] = useState<MemberId[]>(["nic", "maya"]);
  const [guestName, setGuestName] = useState("");
  const [guests, setGuests] = useState<string[]>([]);

  const addGuest = () => {
    const n = guestName.trim();
    if (!n || guests.includes(n)) return;
    setGuests((g) => [...g, n]);
    setGuestName("");
  };

  const toggleFriend = (id: MemberId) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const create = () => {
    const tripName = name.trim() || "Ibiza Sept";
    dispatch({ type: "CLOSE_SHEET" });
    dispatch({ type: "PUSH_BANNER", icon: "info", text: `${tripName} is waiting — trip created` });
    setName("");
    setDestination("");
    setDateChip(null);
    setPicked(["nic", "maya"]);
    setGuests([]);
    setGuestName("");
  };

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })} full>
      <div className="flex flex-col gap-4 px-5 pb-8 pt-3">
        <h2 className="text-[20px] font-bold leading-6 tracking-[-0.2px] text-ink-900">
          Start a new trip
        </h2>

        {/* Trip name */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink-500">Trip name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ibiza Sept"
            className="h-12 rounded-xl border border-line-300 bg-paper-0 px-4 text-[15px] font-medium text-ink-900 outline-none placeholder:text-ink-500 focus:border-sunset-500"
          />
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
              className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink-900 outline-none placeholder:text-ink-500"
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
                        <Check size={11} strokeWidth={3.5} />
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

        {/* Grow the group: invite link or add someone by name */}
        <div className="flex flex-col gap-2.5 rounded-2xl border border-line-200 bg-paper-0 p-3.5">
          <button
            onClick={() =>
              dispatch({
                type: "PUSH_BANNER",
                icon: "join",
                text: "Invite link copied — send it to anyone",
              })
            }
            className="hit44 flex items-center gap-3 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunset-50 text-sunset-700">
              <Link2 size={17} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink-900">Share invite link</span>
              <span className="block text-xs font-medium text-ink-500">
                Anyone with the link can join
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGuest()}
              placeholder="Or add by name"
              className="h-10 min-w-0 flex-1 rounded-xl border border-line-300 bg-paper-0 px-3 text-sm font-medium text-ink-900 outline-none placeholder:text-ink-500 focus:border-sunset-500"
            />
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={addGuest}
              className="hit44 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sunset-500 text-white"
            >
              <Plus size={18} strokeWidth={2.25} />
            </motion.button>
          </div>

          {guests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {guests.map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1 rounded-full bg-paper-100 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-ink-600"
                >
                  {g}
                  <button onClick={() => setGuests((x) => x.filter((n) => n !== g))}>
                    <X size={12} strokeWidth={2.5} className="text-ink-400" />
                  </button>
                </span>
              ))}
            </div>
          )}
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
