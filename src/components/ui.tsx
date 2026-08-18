import React from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  Home,
  Layers,
  Plus,
  Coins,
  Bell,
  ChevronLeft,
  Check,
  UserPlus,
  Vote,
  Image as ImageIcon,
  Flame,
  PartyPopper,
  Info,
} from "lucide-react";
import BoringAvatar from "boring-avatars";
import { MEMBERS } from "../data/mock";
import type { MemberId } from "../data/types";
import { useStore, type Tab, type BannerIcon } from "../state/store";
import { EASE_STD, springFirm, springSnap, tapChip } from "./motion";

/* ---------- Avatar (mirrors Figma Avatar/40 variant set) ---------- */

/** Brand-tinted generated faces (boring-avatars "beam"), seeded per member. */
const AVATAR_COLORS = ["#FF5A45", "#FFB43A", "#0E9384", "#FFE1DB", "#1C1917"];

export function Avatar({
  id,
  size = 40,
  state = "default",
  ring = false,
}: {
  id: MemberId;
  size?: number;
  state?: "default" | "online" | "settled" | "excluded";
  ring?: boolean;
}) {
  const m = MEMBERS[id];
  const excluded = state === "excluded";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="overflow-hidden rounded-full"
        style={{
          width: size,
          height: size,
          boxShadow: ring ? "0 0 0 2px #FFFFFF" : undefined,
          filter: excluded ? "grayscale(1)" : undefined,
          opacity: excluded ? 0.45 : 1,
        }}
      >
        <BoringAvatar size={size} name={m.name} variant="beam" colors={AVATAR_COLORS} />
      </div>
      {state === "online" && (
        <span
          className="absolute rounded-full bg-lagoon-500"
          style={{
            width: size * 0.25,
            height: size * 0.25,
            right: 0,
            bottom: 0,
            boxShadow: "0 0 0 1.5px #FFFFFF",
          }}
        />
      )}
      {state === "settled" && (
        <span
          className="absolute flex items-center justify-center rounded-full bg-lagoon-500 text-white"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            right: -2,
            bottom: -2,
            boxShadow: "0 0 0 1.5px #FFFFFF",
          }}
        >
          <Check size={Math.max(8, size * 0.26)} strokeWidth={3.5} />
        </span>
      )}
      {excluded && (
        <span
          className="absolute left-1/2 top-1/2 rounded-full bg-ink-400"
          style={{
            width: size * 0.9,
            height: 2,
            transform: "translate(-50%, -50%) rotate(-45deg)",
          }}
        />
      )}
    </div>
  );
}

/** Avatar with the member's name beneath it. Generated faces aren't
 *  self-identifying, so anywhere the user must pick a person, label it. */
export function AvatarLabeled({
  id,
  size = 40,
  state = "default",
  onClick,
}: {
  id: MemberId;
  size?: number;
  state?: "default" | "online" | "settled" | "excluded";
  onClick?: () => void;
}) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      onClick={onClick}
      whileTap={onClick ? { scale: 0.94 } : undefined}
      className="flex shrink-0 flex-col items-center gap-1"
    >
      <Avatar id={id} size={size} state={state} />
      <span
        className="max-w-[52px] truncate text-[10px] font-semibold leading-3 text-ink-600"
        title={MEMBERS[id].name}
      >
        {MEMBERS[id].name}
      </span>
    </Tag>
  );
}

export function AvatarStack({ ids, size = 28 }: { ids: MemberId[]; size?: number }) {
  return (
    <div className="flex" style={{ paddingLeft: size * 0.25 }}>
      {ids.map((id) => (
        <div key={id} style={{ marginLeft: -size * 0.25 }}>
          <Avatar id={id} size={size} ring />
        </div>
      ))}
    </div>
  );
}

/* ---------- Animated number ----------
   Counts to a new value over 500ms on the standard curve. The motion value is
   rounded to whole units while in flight (no sub-decimal jitter / flicker) and
   snaps to the exact value on completion. Reduced motion → instant. */

export function AnimatedNumber({
  value,
  format = (n: number) => String(n),
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const [shown, setShown] = React.useState(value);
  const flying = React.useRef(false);

  React.useEffect(() => {
    if (reduce) {
      mv.set(value);
      setShown(value);
      return;
    }
    flying.current = true;
    const controls = animate(mv, value, {
      duration: 0.5,
      ease: EASE_STD,
      onComplete: () => {
        flying.current = false;
        setShown(value);
      },
    });
    return () => controls.stop();
  }, [value, mv, reduce]);

  React.useEffect(
    () =>
      mv.on("change", (v) => {
        if (!flying.current) return;
        const step = Math.round(v);
        setShown((prev) => (step === prev ? prev : step));
      }),
    [mv],
  );

  return <span className={`tabular inline-block ${className ?? ""}`}>{format(shown)}</span>;
}

/* ---------- Buttons (Figma Button/Primary·Secondary·Ghost, all states) ---------- */

export function PrimaryButton({
  children,
  onClick,
  disabled,
  full,
  compact,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
  compact?: boolean;
}) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${full ? "w-full" : ""} ${compact ? "h-11 px-5 text-[15px]" : "h-13 px-6 text-base"}
        rounded-full font-semibold text-white transition-colors
        ${disabled ? "bg-paper-100 text-ink-400" : "bg-sunset-500 hover:bg-sunset-600 active:bg-sunset-600"}`}
      style={{ height: compact ? 44 : 52 }}
    >
      {children}
    </motion.button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  full,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  full?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${full ? "w-full" : ""} h-13 rounded-full border-[1.5px] border-ink-900 bg-paper-0 px-6 text-base font-semibold text-ink-900 active:bg-paper-100`}
      style={{ height: 52 }}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({
  children,
  onClick,
  destructive,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-base font-semibold active:bg-sunset-50 ${
        destructive ? "text-error-600" : "text-sunset-700"
      }`}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Chip (Figma Chip set: Default/Selected/Pressed/Disabled) ---------- */

export function Chip({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={tapChip}
      transition={springFirm}
      onClick={onClick}
      className={`hit44 h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
        selected
          ? "border-[1.5px] border-sunset-500 bg-sunset-50 text-sunset-700"
          : "border border-line-300 bg-paper-0 text-ink-600 active:bg-paper-100"
      }`}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Badge/Status (Paid/Pending) ---------- */

/** Gentle badge swap: the old state crossfades out (popped from flow) while the
 *  new one scales in. No colour flash, single pass. */
export function StatusBadge({ status }: { status: "paid" | "pending" }) {
  return (
    <span className="inline-flex shrink-0">
      {/* popLayout pops the outgoing badge out of flow, so the row never
          collapses mid-swap — and no `layout` projection to distort the text */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={springFirm}
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
            status === "paid"
              ? "bg-lagoon-50 text-lagoon-700"
              : "bg-paper-100 text-ink-500"
          }`}
        >
          {status === "paid" ? (
            <span className="inline-flex items-center gap-1">
              <Check size={12} strokeWidth={3} /> paid
            </span>
          ) : (
            "pending"
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const layoutId = React.useId();
  return (
    <div className="flex rounded-full bg-paper-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`hit44 flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
            value === o.value ? "text-white" : "text-ink-600"
          }`}
        >
          {value === o.value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-sunset-500"
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Status bar + home indicator (StatusBar/HiFi) ---------- */

/** On a real phone (≤450px, full-bleed) the device draws its own status bar —
 *  the faux one collapses to a safe-area spacer instead. */
/* iOS 17/18 status bar at Apple's real proportions: time optically centred in
   the left ear, 125x37 Dynamic Island, then cellular (4 bars) / wi-fi (3 arcs
   + dot) / battery (capsule, fill, contact tip). Hidden on real phones
   (<=450px), where the device draws its own. */
export function StatusBar({ light }: { light?: boolean }) {
  const c = light ? "#FFFFFF" : "#1C1917";
  return (
    <div className="relative z-30 flex h-[54px] shrink-0 items-center justify-between px-[27px] max-[450px]:h-[env(safe-area-inset-top)] max-[450px]:px-0">
      <span
        className="w-[54px] text-center text-[17px] font-semibold leading-[22px] tracking-[0.1px] max-[450px]:hidden"
        style={{ color: c }}
      >
        9:41
      </span>

      <div className="absolute left-1/2 top-[11px] h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-[#050505] max-[450px]:hidden" />

      <div className="flex items-center gap-[7px] max-[450px]:hidden">
        {/* cellular: 4 bars, 3pt wide, 1pt radius, 2pt gaps */}
        <svg width="19" height="12" viewBox="0 0 19 12" fill="none" aria-hidden>
          <rect x="0" y="7.5" width="3" height="4.5" rx="1" fill={c} />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill={c} />
          <rect x="10" y="3" width="3" height="9" rx="1" fill={c} />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" fill={c} />
        </svg>

        {/* wi-fi: three concentric arcs and the dot */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden>
          <path
            d="M8.5 3.4c2.06 0 3.94.79 5.35 2.08a.62.62 0 0 0 .87-.03l.79-.82a.63.63 0 0 0-.02-.9A10.4 10.4 0 0 0 8.5 1a10.4 10.4 0 0 0-6.99 2.73.63.63 0 0 0-.02.9l.79.82c.23.24.62.25.87.03A7.87 7.87 0 0 1 8.5 3.4Z"
            fill={c}
          />
          <path
            d="M8.5 7.05c1.06 0 2.03.38 2.78 1.01.26.22.64.2.88-.04l.78-.79a.63.63 0 0 0-.03-.91A6.85 6.85 0 0 0 8.5 4.7a6.85 6.85 0 0 0-4.41 1.62.63.63 0 0 0-.03.91l.78.79c.24.24.62.26.88.04A4.29 4.29 0 0 1 8.5 7.05Z"
            fill={c}
          />
          <path
            d="M10.2 9.63a.62.62 0 0 0 .04-.89A2.6 2.6 0 0 0 8.5 8.1c-.68 0-1.3.25-1.74.64a.62.62 0 0 0 .04.89l1.26 1.26c.24.25.64.25.88 0l1.26-1.26Z"
            fill={c}
          />
        </svg>

        {/* battery: 25x13 capsule at 35%, 21x9 fill, contact tip at 40% */}
        <svg width="28" height="13" viewBox="0 0 28 13" fill="none" aria-hidden>
          <rect
            x="0.5"
            y="0.5"
            width="24"
            height="12"
            rx="4"
            stroke={c}
            strokeOpacity="0.35"
            fill="none"
          />
          <rect x="2" y="2" width="21" height="9" rx="2.5" fill={c} />
          <path
            d="M26.2 4.4v4.2c.86-.36 1.3-1.02 1.3-2.1s-.44-1.74-1.3-2.1Z"
            fill={c}
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}

export function HomeIndicator({ light }: { light?: boolean }) {
  return (
    <div className="pointer-events-none absolute bottom-2 left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 rounded-full max-[450px]:hidden"
      style={{ background: light ? "#FFFFFF" : "#1C1917" }}
    />
  );
}

/* ---------- Screen header ---------- */

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel,
  trailing,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-5 py-1.5">
      {onBack && (
        <button onClick={onBack} className="hit44 -ml-1.5 flex items-center gap-0.5 py-1 pr-1 text-ink-900">
          <ChevronLeft size={24} strokeWidth={2} />
          {backLabel && <span className="text-base font-semibold">{backLabel}</span>}
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[22px] font-bold leading-7 tracking-[-0.2px] text-ink-900">{title}</h1>
        {subtitle && <p className="text-xs font-medium leading-4 text-ink-500">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  );
}

/* ---------- Tab bar (TabBar/Trip) ---------- */

export function TabBar() {
  const { state, dispatch } = useStore();
  const buzzUnread = state.buzzUnread;
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "hub", label: "Hub", icon: <Home size={24} strokeWidth={1.75} /> },
    { key: "swipe", label: "Swipe", icon: <Layers size={24} strokeWidth={1.75} /> },
    { key: "split", label: "Split", icon: <Coins size={24} strokeWidth={1.75} /> },
    { key: "buzz", label: "Buzz", icon: <Bell size={24} strokeWidth={1.75} /> },
  ];
  const quickOpen = state.sheet === "quickActions";
  const render = (t: (typeof tabs)[number]) => {
    const active = state.tab === t.key;
    return (
      <motion.button
        key={t.key}
        whileTap={{ scale: 0.94 }}
        transition={springFirm}
        onClick={() => dispatch({ type: "SET_TAB", tab: t.key })}
        className="relative flex w-14 flex-col items-center gap-1"
        style={{ color: active ? "#FF5A45" : "#767066" }}
      >
        {/* icon settles into place when the tab becomes active */}
        <motion.span
          initial={false}
          animate={{ scale: active ? 1 : 0.9 }}
          transition={springSnap}
          className="block"
        >
          {t.icon}
        </motion.span>
        <span className="text-[11px] font-semibold" style={{ color: active ? "#C4331F" : "#767066" }}>
          {t.label}
        </span>
        {/* shared-layout indicator slides between tabs */}
        {active && (
          <motion.span
            layoutId="tab-indicator"
            transition={springSnap}
            className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-sunset-500"
          />
        )}
        {t.key === "buzz" && buzzUnread > 0 && (
          <span className="absolute -top-1 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-600 px-1 text-[10px] font-bold text-white">
            {buzzUnread}
          </span>
        )}
      </motion.button>
    );
  };
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 border-t border-line-200 bg-paper-0 pb-6 max-[450px]:pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="flex h-16 items-center justify-between px-6">
        {render(tabs[0])}
        {render(tabs[1])}
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={springFirm}
          onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "quickActions" })}
          className="-mt-2 flex h-11 w-11 items-center justify-center rounded-full bg-sunset-500 text-white shadow-elev-3"
        >
          {/* plus turns into a close-ish glyph while the quick-actions sheet is up */}
          <motion.span
            initial={false}
            animate={{ rotate: quickOpen ? 90 : 0 }}
            transition={springSnap}
            className="block"
          >
            <Plus size={22} strokeWidth={2.25} />
          </motion.span>
        </motion.button>
        {render(tabs[2])}
        {render(tabs[3])}
      </div>
    </div>
  );
}

/* ---------- Bottom sheet ---------- */

export function BottomSheet({
  open,
  onClose,
  children,
  full,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  full?: boolean;
}) {
  const dragControls = useDragControls();
  /** Armed at pointer-down only while the body is scrolled to the very top;
   *  a downward move then hands the gesture over to the sheet. While the body
   *  is scrolled, it never arms — so native scrolling is untouched.
   *  (framer only stamps `touch-action` when dragListener !== false, so with
   *  controls-driven drag the inner scroller keeps its own touch behaviour.) */
  const armed = React.useRef(false);
  const originY = React.useRef(0);

  const arm = (e: React.PointerEvent<HTMLDivElement>) => {
    armed.current = e.currentTarget.scrollTop <= 0;
    originY.current = e.clientY;
  };
  const maybeTakeOver = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!armed.current || e.clientY - originY.current < 8) return;
    armed.current = false;
    dragControls.start(e);
  };
  const disarm = () => {
    armed.current = false;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-ink-900/40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            /* Swipe-down-to-dismiss from anywhere on the sheet. Downward drag
               follows the finger 1:1; upward rubber-bands against the top edge
               and springs home. Release past 120px or over 500px/s → close. */
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            dragSnapToOrigin
            dragTransition={{ bounceStiffness: 300, bounceDamping: 32 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) onClose();
            }}
            className="absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-paper-0 shadow-elev-sheet"
            style={{ maxHeight: full ? "92%" : "60%", minHeight: full ? "92%" : undefined }}
          >
            {/* Grabber — always draggable, even when the body is scrolled */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="-mb-2 flex shrink-0 cursor-grab justify-center pb-2 pt-2 active:cursor-grabbing"
              style={{ touchAction: "none" }}
            >
              <div className="h-1 w-9 rounded-full bg-line-300" />
            </div>
            <div
              onPointerDown={arm}
              onPointerMove={maybeTakeOver}
              onPointerUp={disarm}
              onPointerCancel={disarm}
              className="min-h-0 flex-1 overflow-y-auto"
              style={{ overscrollBehavior: "contain" }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- In-app banner ---------- */

const BANNER_ICON: Record<BannerIcon, React.ReactNode> = {
  join: <UserPlus size={15} strokeWidth={2} />,
  poll: <Vote size={15} strokeWidth={2} />,
  money: <Coins size={15} strokeWidth={2} />,
  photo: <ImageIcon size={15} strokeWidth={2} />,
  session: <Flame size={15} strokeWidth={2} />,
  done: <PartyPopper size={15} strokeWidth={2} />,
  info: <Info size={15} strokeWidth={2} />,
};

export function BannerHost() {
  const { state, dispatch } = useStore();
  return (
    <div className="pointer-events-none absolute inset-x-3 top-14 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {state.banners.map((b) => (
          <motion.button
            key={b.id}
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={() => dispatch({ type: "POP_BANNER", id: b.id })}
            className="pointer-events-auto relative flex items-center gap-2.5 overflow-hidden rounded-2xl bg-paper-0 px-4 py-3 text-left shadow-elev-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sunset-50 text-sunset-700">
              {BANNER_ICON[b.icon]}
            </span>
            <span className="text-sm font-semibold text-ink-900">{b.text}</span>
            {/* auto-dismiss runway — drains once over the banner's 4s life */}
            <motion.span
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: "linear" }}
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-ink-900/20"
            />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
