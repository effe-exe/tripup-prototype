import { AnimatePresence, motion } from "framer-motion";
import { StoreProvider, useStore } from "./state/store";
import { BannerHost, TabBar } from "./components/ui";
import { EASE_STD } from "./components/motion";
import Home from "./screens/Home";
import TripHub from "./screens/TripHub";
import SwipeDeck from "./screens/SwipeDeck";
import SplitTab from "./screens/SplitTab";
import BuzzTab from "./screens/BuzzTab";
import Memories from "./screens/Memories";
import AddMemberSheet from "./screens/sheets/AddMemberSheet";
import CreatePollSheet from "./screens/sheets/CreatePollSheet";
import PollVoteSheet from "./screens/sheets/PollVoteSheet";
import PollResultTakeover from "./screens/sheets/PollResultTakeover";
import AddExpenseSheet from "./screens/sheets/AddExpenseSheet";
import SettleSheet from "./screens/sheets/SettleSheet";
import QuickActionsSheet from "./screens/sheets/QuickActionsSheet";
import NoteSheet from "./screens/sheets/NoteSheet";
import NewTripSheet from "./screens/sheets/NewTripSheet";
import TripSettingsSheet from "./screens/sheets/TripSettingsSheet";
import ItineraryDetailSheet from "./screens/sheets/ItineraryDetailSheet";
import ProfileSheet from "./screens/sheets/ProfileSheet";
import FiltersSheet from "./screens/sheets/FiltersSheet";
import ExpenseDetailSheet from "./screens/sheets/ExpenseDetailSheet";
import AllMemoriesSheet from "./screens/sheets/AllMemoriesSheet";
import FilmSheet from "./screens/sheets/FilmSheet";
import AiPlanSheet from "./screens/sheets/AiPlanSheet";

function Phone() {
  const { state } = useStore();
  const inTrip = state.screen === "trip";
  return (
    <div
      className="relative flex flex-col overflow-hidden bg-paper-50 max-[450px]:h-dvh max-[450px]:w-full min-[451px]:h-[852px] min-[451px]:w-[393px] min-[451px]:rounded-[54px] min-[451px]:border-[10px] min-[451px]:border-[#2A2624] min-[451px]:shadow-2xl"
      id="phone"
    >
      {/* Screen-level push: the arriving screen slides in from the right and
          fades up while the leaving one fades out beneath it. Layers are
          absolute + opaque so the two never show through one another during
          the 160ms overlap, and the newest layer always paints on top. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={state.screen}
          initial={{ opacity: 0.4, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.16, ease: EASE_STD } }}
          transition={{ duration: 0.3, ease: EASE_STD }}
          className="absolute inset-0 flex flex-col bg-paper-50"
        >
          {state.screen === "home" && <Home />}
          {state.screen === "memories" && <Memories />}
          {inTrip && (
            /* Tab-level crossfade: gentler 12px lift, no horizontal travel. */
            <AnimatePresence initial={false}>
              <motion.div
                key={state.tab}
                initial={{ opacity: 0.4, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE_STD } }}
                transition={{ duration: 0.25, ease: EASE_STD }}
                className="absolute inset-0 flex flex-col bg-paper-50"
              >
                {state.tab === "hub" && <TripHub />}
                {state.tab === "swipe" && <SwipeDeck />}
                {state.tab === "split" && <SplitTab />}
                {state.tab === "buzz" && <BuzzTab />}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </AnimatePresence>
      {/* TabBar sits outside the transition so it stays put between tabs */}
      {inTrip && <TabBar />}
      {/* Sheets & takeovers */}
      <AddMemberSheet />
      <CreatePollSheet />
      <PollVoteSheet />
      <PollResultTakeover />
      <AddExpenseSheet />
      <SettleSheet />
      <QuickActionsSheet />
      <NoteSheet />
      <NewTripSheet />
      <TripSettingsSheet />
      <ItineraryDetailSheet />
      <ProfileSheet />
      <FiltersSheet />
      <ExpenseDetailSheet />
      <AllMemoriesSheet />
      <FilmSheet />
      <AiPlanSheet />
      <BannerHost />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="flex min-h-dvh items-center justify-center bg-[#1C1917] min-[451px]:py-6">
        <Phone />
      </div>
    </StoreProvider>
  );
}
