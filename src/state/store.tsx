/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import type {
  BuzzEvent,
  Expense,
  ItineraryItem,
  MemberId,
  Memory,
  Poll,
  Transfer,
  TripNote,
} from "../data/types";
import {
  MEMBERS,
  RESTAURANTS,
  dinnerExpense,
  initialBuzz,
  initialExpenses,
  initialItinerary,
  initialMemories,
  initialNotes,
  initialPoll,
} from "../data/mock";
import { computeBalances, minimizeTransfers, pairwiseIouCount } from "../data/balances";

/** Navigation model: root (home) OR trip context with tabs; sheets overlay. */
export type Tab = "hub" | "swipe" | "split" | "buzz";
export type Sheet =
  | null
  | "addMember"
  | "createPoll"
  | "pollVote"
  | "addExpense"
  | "settle"
  | "quickActions"
  | "pollResult"
  | "note"
  | "newTrip"
  | "tripSettings"
  | "itineraryDetail"
  | "profile"
  | "filters"
  | "expenseDetail"
  | "allMemories"
  | "film"
  | "aiPlan"
  | "mapPick";
export type Screen = "home" | "trip" | "memories";

export type BannerIcon = "join" | "poll" | "money" | "photo" | "session" | "done" | "info";

export interface Banner {
  id: number;
  icon: BannerIcon;
  text: string;
}

export interface SwipeState {
  index: number;
  liked: string[]; // restaurant ids Ari liked
  passed: string[];
  /** group matches: restaurantId -> member ids who liked it (Maya/Zoe pre-seeded by script) */
  matches: Record<string, MemberId[]>;
}

/**
 * A swipe session: the group is deciding one thing ("What do we do tonight?")
 * from a shortlist Ari assembled from AI proposals or the map. No session means
 * the deck is empty - nothing to swipe until somebody starts one.
 */
export interface Session {
  title: string;
  placeIds: string[];
  createdBy: MemberId;
}

/** Live ambient presence shown in the swipe ticker bubble. */
export interface SwipeTicker {
  member: MemberId;
  /** e.g. "is swiping…" or "liked Terraço" */
  verb: string;
  /** bump key so the component can re-animate on change */
  seq: number;
}

interface State {
  screen: Screen;
  tab: Tab;
  sheet: Sheet;
  /** context id for detail sheets (itinerary item id, expense id, …) */
  sheetPayload: string | null;
  renJoined: boolean;
  members: MemberId[]; // in display order
  poll: Poll;
  itinerary: ItineraryItem[];
  expenses: Expense[];
  transfers: Transfer[];
  splitSegment: "expenses" | "balances";
  buzz: BuzzEvent[];
  banners: Banner[];
  swipe: SwipeState;
  swipeTicker: SwipeTicker;
  session: Session | null;
  memories: Memory[];
  notes: TripNote[];
  settleStarted: boolean;
  allSquare: boolean;
  wrapSeen: boolean;
  buzzUnread: number;
}

const initialState: State = {
  screen: "home",
  tab: "hub",
  sheet: null,
  sheetPayload: null,
  renJoined: false,
  members: ["ari", "nic", "maya", "tomas", "zoe"],
  poll: initialPoll,
  itinerary: initialItinerary,
  expenses: initialExpenses,
  transfers: [],
  splitSegment: "expenses",
  buzz: initialBuzz,
  banners: [],
  swipe: { index: 0, liked: [], passed: [], matches: {} },
  session: null,
  swipeTicker: { member: "maya", verb: "is swiping…", seq: 0 },
  memories: initialMemories,
  notes: initialNotes,
  settleStarted: false,
  allSquare: false,
  wrapSeen: false,
  buzzUnread: 3,
};

type Action =
  | { type: "NAV_HOME" }
  | { type: "OPEN_TRIP" }
  | { type: "SET_TAB"; tab: Tab }
  | { type: "OPEN_SHEET"; sheet: Sheet; payload?: string }
  | { type: "CLOSE_SHEET" }
  | { type: "OPEN_MEMORIES" }
  | { type: "REN_JOINS" }
  | { type: "SWIPE"; dir: "like" | "pass" }
  | { type: "SWIPE_UNDO" }
  | { type: "START_SESSION"; title: string; placeIds: string[] }
  | { type: "ADD_TO_SESSION"; placeId: string }
  | { type: "SET_TICKER"; member: MemberId; verb: string }
  | { type: "AMBIENT_LIKE"; member: MemberId; restaurantId: string; label: string }
  | { type: "SEND_POLL" }
  | { type: "VOTE"; member: MemberId; restaurantId: string }
  | { type: "CLOSE_POLL" }
  | { type: "ADD_DINNER_EXPENSE" }
  | { type: "START_SETTLE" }
  | { type: "MARK_PAID"; from: MemberId }
  | { type: "SET_SPLIT_SEGMENT"; segment: "expenses" | "balances" }
  | { type: "PUSH_BANNER"; icon: BannerIcon; text: string }
  | { type: "POP_BANNER"; id: number }
  | { type: "PUSH_BUZZ"; icon: BuzzEvent["icon"]; text: string; time: string }
  | { type: "ADD_MEMORY"; photo: string }
  | { type: "ADD_NOTE"; text: string }
  | { type: "MARK_WRAP_SEEN" };

let bannerId = 1;
let buzzId = 100;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "NAV_HOME":
      return { ...state, screen: "home", sheet: null };
    case "OPEN_TRIP":
      return { ...state, screen: "trip", tab: "hub", sheet: null };
    case "SET_TAB":
      return { ...state, tab: action.tab, sheet: null, buzzUnread: action.tab === "buzz" ? 0 : state.buzzUnread };
    case "OPEN_SHEET":
      return { ...state, sheet: action.sheet, sheetPayload: action.payload ?? null };
    case "CLOSE_SHEET":
      return { ...state, sheet: null, sheetPayload: null };
    case "OPEN_MEMORIES":
      return { ...state, screen: "memories", sheet: null };
    case "REN_JOINS":
      if (state.renJoined) return state;
      return { ...state, renJoined: true, members: [...state.members, "ren"] };
    case "START_SESSION": {
      if (!action.placeIds.length) return state;
      // A session is a group event: seed the poll from the same shortlist so a
      // "make it a poll" hand-off carries the places the group actually swiped.
      const options = action.placeIds.slice(0, 3).map((id) => ({ restaurantId: id, votes: [] }));
      return {
        ...state,
        session: { title: action.title, placeIds: action.placeIds, createdBy: "ari" },
        tab: "swipe",
        sheet: null,
        sheetPayload: null,
        swipe: { index: 0, liked: [], passed: [], matches: {} },
        poll:
          state.poll.status === "draft"
            ? { ...state.poll, title: action.title, options }
            : state.poll,
        banners: [
          ...state.banners.slice(-1),
          { id: bannerId++, icon: "session" as const, text: action.title + " - swipe session open" },
        ],
        buzz: [
          {
            id: "b" + buzzId++,
            icon: "poll" as const,
            text: "Ari started a swipe session: " + action.title,
            time: "19:55",
          },
          ...state.buzz,
        ],
        buzzUnread: state.buzzUnread + 1,
      };
    }
    case "ADD_TO_SESSION": {
      if (!state.session || state.session.placeIds.includes(action.placeId)) return state;
      return {
        ...state,
        session: { ...state.session, placeIds: [...state.session.placeIds, action.placeId] },
      };
    }
    case "SET_TICKER":
      return {
        ...state,
        swipeTicker: { member: action.member, verb: action.verb, seq: state.swipeTicker.seq + 1 },
      };
    case "AMBIENT_LIKE": {
      const prev = state.swipe.matches[action.restaurantId] ?? [];
      const matches = prev.includes(action.member)
        ? state.swipe.matches
        : { ...state.swipe.matches, [action.restaurantId]: [...prev, action.member] };
      return {
        ...state,
        swipe: { ...state.swipe, matches },
        swipeTicker: {
          member: action.member,
          verb: "liked " + action.label,
          seq: state.swipeTicker.seq + 1,
        },
      };
    }
    case "SWIPE_UNDO": {
      if (state.swipe.index === 0) return state;
      const prevRest = RESTAURANTS[state.swipe.index - 1];
      return {
        ...state,
        swipe: {
          ...state.swipe,
          index: state.swipe.index - 1,
          liked: state.swipe.liked.filter((id) => id !== prevRest.id),
          passed: state.swipe.passed.filter((id) => id !== prevRest.id),
        },
      };
    }
    case "SWIPE": {
      const rest = RESTAURANTS[state.swipe.index];
      if (!rest) return state;
      const swipe = { ...state.swipe, index: state.swipe.index + 1 };
      if (action.dir === "like") {
        swipe.liked = [...swipe.liked, rest.id];
        const prev = swipe.matches[rest.id] ?? [];
        swipe.matches = { ...swipe.matches, [rest.id]: prev };
      } else {
        swipe.passed = [...swipe.passed, rest.id];
      }
      return { ...state, swipe };
    }
    case "SEND_POLL":
      return { ...state, sheet: null, poll: { ...state.poll, status: "open" } };
    case "VOTE": {
      if (state.poll.status !== "open") return state;
      const options = state.poll.options.map((o) => ({
        ...o,
        votes: o.votes.filter((v) => v !== action.member),
      }));
      const target = options.find((o) => o.restaurantId === action.restaurantId);
      if (target) target.votes = [...target.votes, action.member];
      return { ...state, poll: { ...state.poll, options } };
    }
    case "CLOSE_POLL": {
      if (state.poll.status !== "open") return state;
      const winner = [...state.poll.options].sort((a, b) => b.votes.length - a.votes.length)[0];
      const rest = RESTAURANTS.find((r) => r.id === winner.restaurantId)!;
      const itinerary = state.itinerary.map((it) =>
        it.id === "it-dinner"
          ? {
              ...it,
              title: rest.name,
              subtitle: "Cais do Sodré · 900 m · from poll",
              photo: rest.photo,
              state: "planned" as const,
              fromPollId: state.poll.id,
            }
          : it,
      );
      return {
        ...state,
        poll: { ...state.poll, status: "closed", winnerId: winner.restaurantId },
        itinerary,
        sheet: "pollResult",
      };
    }
    case "ADD_DINNER_EXPENSE": {
      if (state.expenses.some((e) => e.id === "e-dinner")) return { ...state, sheet: null };
      const dinnerBuzz: BuzzEvent = {
        id: "b" + buzzId++,
        icon: "money",
        text: "Ari added Dinner @ Maré Alta · €186.00",
        time: "23:12",
      };
      return {
        ...state,
        buzz: [dinnerBuzz, ...state.buzz],
        buzzUnread: state.buzzUnread + 1,
        sheet: null,
        tab: "split",
        splitSegment: "balances",
        expenses: [...state.expenses, dinnerExpense],
        transfers: minimizeTransfers(computeBalances([...state.expenses, dinnerExpense])),
      };
    }
    case "START_SETTLE":
      return { ...state, settleStarted: true, sheet: "settle" };
    case "MARK_PAID": {
      const transfers = state.transfers.map((t) =>
        t.from === action.from ? { ...t, status: "paid" as const } : t,
      );
      const allSquare = transfers.every((t) => t.status === "paid");
      return { ...state, transfers, allSquare };
    }
    case "SET_SPLIT_SEGMENT":
      return { ...state, splitSegment: action.segment };
    case "PUSH_BANNER":
      return {
        ...state,
        banners: [...state.banners.slice(-1), { id: bannerId++, icon: action.icon, text: action.text }],
      };
    case "POP_BANNER":
      return { ...state, banners: state.banners.filter((b) => b.id !== action.id) };
    case "PUSH_BUZZ":
      return {
        ...state,
        buzz: [{ id: "b" + buzzId++, icon: action.icon, text: action.text, time: action.time }, ...state.buzz],
        buzzUnread: state.tab === "buzz" ? 0 : state.buzzUnread + 1,
      };
    case "ADD_MEMORY":
      return {
        ...state,
        memories: [...state.memories, { id: "m" + Date.now(), photo: action.photo, by: "ari" }],
      };
    case "ADD_NOTE":
      return { ...state, sheet: null, notes: [...state.notes, { id: "n" + Date.now(), by: "ari", text: action.text }] };
    case "MARK_WRAP_SEEN":
      return { ...state, wrapSeen: true };
    default:
      return state;
  }
}

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
  /** derived */
  balances: Record<MemberId, number>;
  iousBefore: number;
  voteCount: number;
}

const StoreCtx = createContext<Ctx | null>(null);

/**
 * Deterministic demo timeline (§4.3 of the UX spec).
 * Every simulated event is triggered by a user action, never by wall-clock —
 * the demo cannot soft-lock.
 */
function loggingReducer(s: State, a: Action): State {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((window as any).__actions ??= []).push(a.type + (a.type === "OPEN_SHEET" ? ":" + (a as { sheet: Sheet }).sheet : ""));
  }
  return reducer(s, a);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(loggingReducer, initialState);
  const timers = useRef<number[]>([]);
  const ranRef = useRef<Set<string>>(new Set());

  const once = (key: string, fn: () => void) => {
    if (ranRef.current.has(key)) return;
    ranRef.current.add(key);
    fn();
  };
  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // Ren joins ~3s after the invite sheet is opened
  useEffect(() => {
    if (state.sheet === "addMember" && !state.renJoined) {
      once("ren", () =>
        after(3000, () => {
          dispatch({ type: "REN_JOINS" });
          dispatch({ type: "PUSH_BANNER", icon: "join", text: "Ren joined the trip - dinner only" });
          dispatch({ type: "PUSH_BUZZ", icon: "join", text: "Ren joined the trip", time: "19:52" });
        }),
      );
    }
  }, [state.sheet, state.renJoined]);

  // Scripted votes after the poll is sent
  useEffect(() => {
    if (state.poll.status === "open") {
      once("votes", () => {
        after(2000, () => dispatch({ type: "VOTE", member: "nic", restaurantId: "vintem" }));
        after(4000, () => {
          dispatch({ type: "VOTE", member: "maya", restaurantId: "marealta" });
          dispatch({ type: "VOTE", member: "tomas", restaurantId: "terraco" });
        });
        after(7000, () => dispatch({ type: "VOTE", member: "zoe", restaurantId: "marealta" }));
        after(10000, () => dispatch({ type: "VOTE", member: "ren", restaurantId: "marealta" }));
      });
    }
  }, [state.poll.status]);

  // Auto-close at 6/6 (waits for Ari's own vote — presenter can't be skipped)
  const voteCount = state.poll.options.reduce((n, o) => n + o.votes.length, 0);
  useEffect(() => {
    if (state.poll.status === "open" && voteCount >= 6) {
      once("close", () =>
        after(1500, () => {
          dispatch({ type: "CLOSE_POLL" });
          dispatch({ type: "PUSH_BANNER", icon: "poll", text: "Maré Alta won - added to tonight, 20:45" });
          dispatch({ type: "PUSH_BUZZ", icon: "poll", text: "Poll closed: Maré Alta won 4–1–1", time: "20:15" });
        }),
      );
    }
  }, [voteCount, state.poll.status]);

  // Settle: friends pay one by one once the settle board is open
  useEffect(() => {
    if (state.settleStarted) {
      once("settle", () => {
        after(3000, () => {
          dispatch({ type: "MARK_PAID", from: "ren" });
          dispatch({ type: "PUSH_BUZZ", icon: "money", text: "Ren paid Nic €23.00", time: "23:41" });
        });
        after(6000, () => {
          dispatch({ type: "MARK_PAID", from: "tomas" });
          dispatch({ type: "PUSH_BUZZ", icon: "money", text: "Tomás paid Nic €96.00", time: "23:44" });
        });
        after(9000, () => {
          dispatch({ type: "MARK_PAID", from: "zoe" });
          dispatch({ type: "PUSH_BUZZ", icon: "money", text: "Zoe paid Nic €126.00", time: "23:47" });
        });
        after(12000, () => {
          dispatch({ type: "MARK_PAID", from: "maya" });
          dispatch({ type: "PUSH_BANNER", icon: "done", text: "Everyone is square - that is a wrap" });
          dispatch({ type: "PUSH_BUZZ", icon: "money", text: "Maya paid Nic €141.00 — all settled", time: "23:52" });
        });
      });
    }
  }, [state.settleStarted]);

  // Ambient liveness: friends acting in near-real-time after the trip opens
  useEffect(() => {
    if (state.screen === "trip") {
      once("ambient", () => {
        after(12000, () => {
          dispatch({ type: "PUSH_BANNER", icon: "photo", text: "Maya added 2 photos from Miradouro" });
          dispatch({ type: "PUSH_BUZZ", icon: "itinerary", text: "Maya added 2 photos from Miradouro da Graça", time: "19:58" });
        });
        after(26000, () => {
          dispatch({ type: "PUSH_BUZZ", icon: "vote", text: "Tomás is checking tonight's menus", time: "20:01" });
        });
      });
    }
  }, [state.screen]);

  // Live swipe ticker: presence + likes cycling while the user is on Swipe
  useEffect(() => {
    if (state.screen === "trip" && state.tab === "swipe") {
      once("ticker", () => {
        after(4000, () => dispatch({ type: "SET_TICKER", member: "zoe", verb: "is swiping…" }));
        after(8000, () => dispatch({ type: "AMBIENT_LIKE", member: "zoe", restaurantId: "terraco", label: "Terraço" }));
        after(13000, () => dispatch({ type: "SET_TICKER", member: "nic", verb: "is swiping…" }));
        after(18000, () => dispatch({ type: "AMBIENT_LIKE", member: "nic", restaurantId: "vintem", label: "the tasca" }));
        after(24000, () => dispatch({ type: "SET_TICKER", member: "maya", verb: "is swiping…" }));
      });
    }
  }, [state.screen, state.tab]);

  // Auto-dismiss banners after 4s
  useEffect(() => {
    if (state.banners.length) {
      const b = state.banners[state.banners.length - 1];
      after(4000, () => dispatch({ type: "POP_BANNER", id: b.id }));
    }
  }, [state.banners]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const balances = computeBalances(state.expenses);
  const iousBefore = pairwiseIouCount(state.expenses);

  // Dev-only hook for automated walkthrough testing
  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__tripup = { state, dispatch, balances, iousBefore, voteCount };
  }

  return (
    <StoreCtx.Provider value={{ state, dispatch, balances, iousBefore, voteCount }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore(): Ctx {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

export { MEMBERS, RESTAURANTS };
