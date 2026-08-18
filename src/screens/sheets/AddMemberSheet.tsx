import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { Avatar, BottomSheet, Chip, PrimaryButton } from "../../components/ui";
import { useStore } from "../../state/store";

const spring = { type: "spring", stiffness: 280, damping: 24 } as const;

/** Deterministic fake QR pattern — 13×13, finder squares + fixed pseudo-noise. */
const QR_SIZE = 13;
const QR_CELLS: boolean[] = (() => {
  const cells: boolean[] = [];
  const inFinder = (r: number, c: number) =>
    (r < 5 && c < 5) || (r < 5 && c >= QR_SIZE - 5) || (r >= QR_SIZE - 5 && c < 5);
  for (let r = 0; r < QR_SIZE; r++) {
    for (let c = 0; c < QR_SIZE; c++) {
      if (inFinder(r, c)) {
        const rr = r >= QR_SIZE - 5 ? r - (QR_SIZE - 5) : r;
        const cc = c >= QR_SIZE - 5 ? c - (QR_SIZE - 5) : c;
        cells.push(rr === 0 || rr === 4 || cc === 0 || cc === 4 || (rr === 2 && cc === 2));
      } else {
        cells.push((r * 31 + c * 17 + ((r * c) % 7)) % 5 < 2);
      }
    }
  }
  return cells;
})();

/** Ari's phone book — invites are mock, so no store change on tap. */
const CONTACTS = [
  { name: "Bea", handle: "bea.almeida", bg: "#FFE1DB", fg: "#C4331F" },
  { name: "Diogo", handle: "dioguinho", bg: "#EFFAF8", fg: "#0B7566" },
  { name: "Inês", handle: "ines.rmd", bg: "#F3EBFF", fg: "#7A4FC0" },
  { name: "Luca", handle: "luca.vsc", bg: "#FFF7E8", fg: "#9A6700" },
  { name: "Sofia", handle: "sofia.mtz", bg: "#EDFAF2", fg: "#178A50" },
  { name: "Marta", handle: "marta.gv", bg: "#EAF3FF", fg: "#1D5FBF" },
];

export default function AddMemberSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "addMember";
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"trip" | "today">("today");
  const q = query.trim().toLowerCase();
  // fold accents so "ines" finds Inês
  const flat = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const matches = q ? CONTACTS.filter((c) => flat(c.name + c.handle).includes(flat(q))) : CONTACTS;

  // Ren joined while the sheet is open → celebrate, then auto-close after 1.5s
  useEffect(() => {
    if (open && state.renJoined) {
      const t = window.setTimeout(() => dispatch({ type: "CLOSE_SHEET" }), 1500);
      return () => window.clearTimeout(t);
    }
  }, [open, state.renJoined, dispatch]);

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
      <div className="flex flex-col gap-4 px-5 pb-8 pt-3">
        <h2 className="text-[20px] font-bold leading-6 tracking-[-0.2px] text-ink-900">
          Add someone to Lisboa com Amigos
        </h2>

        <AnimatePresence>
          {state.renJoined && (
            <motion.div
              key="ren-joined"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={spring}
              className="flex items-center gap-3 rounded-2xl bg-success-50 p-3"
            >
              <motion.div
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Avatar id="ren" size={40} />
              </motion.div>
              <p className="text-[15px] font-bold text-ink-900">Ren joined</p>
            </motion.div>
          )}
        </AnimatePresence>

        <PrimaryButton
          full
          onClick={() =>
            dispatch({
              type: "PUSH_BANNER",
              icon: "join",
              text: "Invite link copied - send it to anyone",
            })
          }
        >
          Share link via…
        </PrimaryButton>

        <div className="flex flex-col items-center gap-2 py-1">
          <div className="h-[140px] w-[140px] rounded-2xl border border-line-200 bg-paper-0 p-2.5">
            <div
              className="grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${QR_SIZE}, 1fr)`,
                gap: 1,
              }}
            >
              {/* Squares draw in on a diagonal sweep — one fast pass on open */}
              {QR_CELLS.map((on, i) =>
                on ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.4, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.22,
                      ease: [0.2, 0, 0, 1],
                      delay:
                        ((Math.floor(i / QR_SIZE) + (i % QR_SIZE)) / (2 * QR_SIZE - 2)) * 0.34,
                    }}
                    className="bg-ink-900"
                  />
                ) : (
                  <div key={i} />
                ),
              )}
            </div>
          </div>
          <p className="text-xs font-medium text-ink-500">Or let them scan this</p>
        </div>

        <div>
          <div className="flex h-12 items-center gap-2.5 rounded-xl border border-line-300 bg-paper-0 px-4 focus-within:border-sunset-300">
            <Search size={18} strokeWidth={1.75} className="shrink-0 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts"
              aria-label="Search contacts"
              className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-500 focus:outline-none"
            />
          </div>

          <div className="mt-2 flex flex-col">
            {matches.map((c) => (
              <motion.button
                key={c.name}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  dispatch({ type: "PUSH_BANNER", icon: "join", text: `Invite sent to ${c.name}` })
                }
                className="hit44 flex items-center gap-3 rounded-xl px-1.5 py-2 text-left active:bg-paper-100"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: c.bg, color: c.fg }}
                >
                  {c.name[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink-900">
                    {c.name}
                  </span>
                  <span className="block truncate text-xs font-medium text-ink-500">{c.handle}</span>
                </span>
                <span className="shrink-0 text-[13px] font-semibold text-sunset-700">Invite</span>
              </motion.button>
            ))}
            {!matches.length && (
              <p className="px-1.5 py-2 text-xs font-medium text-ink-500">No contacts match</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Chip selected={scope === "trip"} onClick={() => setScope("trip")}>
            Whole trip
          </Chip>
          <Chip selected={scope === "today"} onClick={() => setScope("today")}>
            From today ▸
          </Chip>
        </div>
        <p className="text-xs font-medium leading-4 text-ink-500">
          {scope === "today"
            ? "Ren will only see plans & expenses from Aug 17 onward."
            : "Ren will see the whole trip's plans and expenses, including the days before they joined."}
        </p>
      </div>
    </BottomSheet>
  );
}
