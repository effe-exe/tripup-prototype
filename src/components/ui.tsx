import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Layers, Plus, Coins, Bell, ChevronLeft } from "lucide-react";
import { MEMBERS } from "../data/mock";
import type { MemberId } from "../data/types";
import { useStore, type Tab } from "../state/store";

/* ---------- Avatar (mirrors Figma Avatar/40 variant set) ---------- */

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
        className="flex h-full w-full items-center justify-center rounded-full font-semibold"
        style={{
          background: excluded ? "#F4F2EE" : m.bg,
          color: excluded ? "#A39D93" : m.fg,
          fontSize: size * 0.4,
          boxShadow: ring ? "0 0 0 2px #FFFFFF" : undefined,
        }}
      >
        {m.initial}
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
          className="absolute flex items-center justify-center rounded-full bg-lagoon-500 font-bold text-white"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            right: -2,
            bottom: -2,
            fontSize: size * 0.26,
            boxShadow: "0 0 0 1.5px #FFFFFF",
          }}
        >
          ✓
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
      className={`rounded-full px-5 py-2.5 text-base font-semibold active:bg-sunset-50 ${
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
    <button
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
        selected
          ? "border-[1.5px] border-sunset-500 bg-sunset-50 text-sunset-700"
          : "border border-line-300 bg-paper-0 text-ink-600 active:bg-paper-100"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Badge/Status (Paid/Pending) ---------- */

export function StatusBadge({ status }: { status: "paid" | "pending" }) {
  return status === "paid" ? (
    <span className="rounded-full bg-lagoon-50 px-2.5 py-1 text-xs font-semibold text-lagoon-700">
      paid ✓
    </span>
  ) : (
    <span className="rounded-full bg-paper-100 px-2.5 py-1 text-xs font-semibold text-ink-500">
      pending
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
  return (
    <div className="flex rounded-full bg-paper-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`relative flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
            value === o.value ? "text-white" : "text-ink-600"
          }`}
        >
          {value === o.value && (
            <motion.span
              layoutId="seg"
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

export function StatusBar({ light }: { light?: boolean }) {
  const c = light ? "#FFFFFF" : "#1C1917";
  return (
    <div className="relative z-30 flex h-[54px] shrink-0 items-end justify-between px-10 pb-1.5">
      <span className="text-[17px] font-semibold" style={{ color: c }}>
        9:41
      </span>
      <div className="absolute left-1/2 top-[11px] h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-[#050505]" />
      <svg width="78" height="14" viewBox="0 0 78 14" fill="none">
        <rect x="0" y="8" width="3" height="5" rx="1" fill={c} />
        <rect x="5" y="6" width="3" height="7" rx="1" fill={c} />
        <rect x="10" y="4" width="3" height="9" rx="1" fill={c} />
        <rect x="15" y="2" width="3" height="11" rx="1" fill={c} />
        <path d="M31 5.5C33.5 3 37.5 3 40 5.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M33.2 8.2C34.7 6.8 36.3 6.8 37.8 8.2" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="35.5" cy="11" r="1.4" fill={c} />
        <rect x="52" y="2" width="22" height="11" rx="3.5" stroke={c} strokeWidth="1.2" />
        <rect x="54" y="4" width="15" height="7" rx="1.8" fill={c} />
        <path d="M76 5.5V9.5C77 9.2 77.6 8.2 77.6 7.5C77.6 6.8 77 5.8 76 5.5Z" fill={c} />
      </svg>
    </div>
  );
}

export function HomeIndicator({ light }: { light?: boolean }) {
  return (
    <div className="pointer-events-none absolute bottom-2 left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 rounded-full"
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
        <button onClick={onBack} className="-ml-1.5 flex items-center gap-0.5 py-1 pr-1 text-ink-900">
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
  const buzzUnread = 0; // badge driven by store if needed
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "hub", label: "Hub", icon: <Home size={24} strokeWidth={1.75} /> },
    { key: "swipe", label: "Swipe", icon: <Layers size={24} strokeWidth={1.75} /> },
    { key: "split", label: "Split", icon: <Coins size={24} strokeWidth={1.75} /> },
    { key: "buzz", label: "Buzz", icon: <Bell size={24} strokeWidth={1.75} /> },
  ];
  const render = (t: (typeof tabs)[number]) => {
    const active = state.tab === t.key;
    return (
      <button
        key={t.key}
        onClick={() => dispatch({ type: "SET_TAB", tab: t.key })}
        className="relative flex w-14 flex-col items-center gap-1"
        style={{ color: active ? "#FF5A45" : "#767066" }}
      >
        {t.icon}
        <span className="text-[11px] font-semibold" style={{ color: active ? "#C4331F" : "#767066" }}>
          {t.label}
        </span>
        {t.key === "buzz" && buzzUnread > 0 && (
          <span className="absolute -top-1 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-600 px-1 text-[10px] font-bold text-white">
            {buzzUnread}
          </span>
        )}
      </button>
    );
  };
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 border-t border-line-200 bg-paper-0 pb-6">
      <div className="flex h-16 items-center justify-between px-6">
        {render(tabs[0])}
        {render(tabs[1])}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => dispatch({ type: "OPEN_SHEET", sheet: "quickActions" })}
          className="-mt-2 flex h-11 w-11 items-center justify-center rounded-full bg-sunset-500 text-white shadow-elev-3"
        >
          <Plus size={22} strokeWidth={2.25} />
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
            className="absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-paper-0 shadow-elev-sheet"
            style={{ maxHeight: full ? "92%" : "60%", minHeight: full ? "92%" : undefined }}
          >
            <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-300" />
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- In-app banner ---------- */

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
            className="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-paper-0 px-4 py-3 text-left shadow-elev-3"
          >
            <span className="text-lg">{b.emoji}</span>
            <span className="text-sm font-semibold text-ink-900">{b.text}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
