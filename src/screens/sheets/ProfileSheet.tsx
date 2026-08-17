import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronRight, CreditCard, Shield, type LucideIcon } from "lucide-react";
import { Avatar, BottomSheet, GhostButton } from "../../components/ui";
import { useStore } from "../../state/store";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-block h-7 w-12 shrink-0 rounded-full transition-colors ${
        on ? "bg-lagoon-500" : "bg-line-300"
      }`}
    >
      <motion.span
        animate={{ x: on ? 20 : 0 }}
        transition={spring}
        className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-elev-1"
      />
    </span>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  trailing,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  trailing?: ReactNode;
}) {
  return (
    <button className="flex w-full items-center gap-3 px-1 py-3.5 text-left active:bg-paper-100">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-100">
        <Icon size={19} strokeWidth={1.75} className="text-ink-600" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink-900">{label}</span>
        {value && <span className="block truncate text-xs font-medium text-ink-500">{value}</span>}
      </span>
      {trailing ?? <ChevronRight size={18} className="shrink-0 text-ink-400" />}
    </button>
  );
}

export default function ProfileSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "profile";

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
      <div className="flex flex-col px-5 pb-8 pt-3">
        {/* Identity */}
        <div className="flex flex-col items-center gap-2 py-2">
          <Avatar id="ari" size={72} state="online" />
          <div className="text-center">
            <p className="text-[20px] font-bold tracking-[-0.2px] text-ink-900">Ari</p>
            <p className="text-[13px] font-medium text-ink-500">3 trips · 12 friends</p>
          </div>
        </div>

        {/* Stat chips */}
        <div className="mt-2 flex justify-center gap-2">
          <span className="rounded-full bg-lagoon-50 px-3.5 py-2 text-[13px] font-semibold tabular text-lagoon-700">
            €2,340 settled all-time
          </span>
          <span className="rounded-full bg-sunset-50 px-3.5 py-2 text-[13px] font-semibold tabular text-sunset-700">
            148 spots swiped
          </span>
        </div>

        {/* Settings */}
        <div className="mt-4 divide-y divide-line-200">
          <SettingsRow icon={Bell} label="Notifications" trailing={<Toggle on />} />
          <SettingsRow icon={CreditCard} label="Payment methods" value="Apple Pay ᯤ · IBAN ···1204" />
          <SettingsRow icon={Shield} label="Privacy" />
        </div>

        <div className="mt-2 flex justify-center">
          <GhostButton destructive>Log out</GhostButton>
        </div>
      </div>
    </BottomSheet>
  );
}
