import { StoreProvider, useStore } from "./state/store";
import { BannerHost, TabBar } from "./components/ui";
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
      {state.screen === "home" && <Home />}
      {state.screen === "memories" && <Memories />}
      {inTrip && (
        <>
          {state.tab === "hub" && <TripHub />}
          {state.tab === "swipe" && <SwipeDeck />}
          {state.tab === "split" && <SplitTab />}
          {state.tab === "buzz" && <BuzzTab />}
          <TabBar />
        </>
      )}
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
