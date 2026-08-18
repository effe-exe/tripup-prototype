import { useEffect } from "react";
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

export default function AddMemberSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "addMember";

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

        <div className="flex h-12 items-center gap-2.5 rounded-xl border border-line-300 bg-paper-0 px-4">
          <Search size={18} strokeWidth={1.75} className="text-ink-400" />
          <span className="text-[15px] text-ink-500">Search contacts</span>
        </div>

        <div className="flex gap-2">
          <Chip>Whole trip</Chip>
          <Chip selected>From today ▸</Chip>
        </div>
        <p className="text-xs font-medium leading-4 text-ink-500">
          Ren will only see plans &amp; expenses from Aug 17 onward.
        </p>
      </div>
    </BottomSheet>
  );
}
