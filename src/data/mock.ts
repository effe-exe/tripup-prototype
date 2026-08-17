import type {
  Member,
  Restaurant,
  Poll,
  ItineraryItem,
  Expense,
  Transfer,
  BuzzEvent,
  Memory,
  TripNote,
} from "./types";
import fado from "../assets/fado.jpg";
import seafood from "../assets/seafood.jpg";
import miradouro from "../assets/miradouro.jpg";
import alfama from "../assets/alfama.jpg";
import market from "../assets/market.jpg";
import timeout from "../assets/timeout.jpg";
import tram from "../assets/tram.jpg";

export const photos = { fado, seafood, miradouro, alfama, market, timeout, tram };

/** The cast. Per-user avatar tints are data-driven (assigned by hash in a real app). */
export const MEMBERS: Record<string, Member> = {
  ari: { id: "ari", name: "Ari", initial: "A", bg: "#FFE1DB", fg: "#C4331F", online: true },
  nic: { id: "nic", name: "Nic", initial: "N", bg: "#EFFAF8", fg: "#0B7566", online: true },
  maya: { id: "maya", name: "Maya", initial: "M", bg: "#F3EBFF", fg: "#7A4FC0", online: true },
  tomas: { id: "tomas", name: "Tomás", initial: "T", bg: "#FFF7E8", fg: "#9A6700", online: false },
  zoe: { id: "zoe", name: "Zoe", initial: "Z", bg: "#EDFAF2", fg: "#178A50", online: false },
  ren: {
    id: "ren",
    name: "Ren",
    initial: "R",
    bg: "#EAF3FF",
    fg: "#1D5FBF",
    online: false,
    joinedFrom: "2026-08-17",
    guest: true,
  },
};

export const TRIP = {
  id: "lisboa",
  name: "Lisboa com Amigos",
  dates: "Aug 14–17",
  location: "Lisbon",
  day: "Day 4 of 4",
  cover: alfama,
};

export const RESTAURANTS: Restaurant[] = [
  {
    id: "vintem",
    name: "Tasca do Vintém",
    vibe: "Fado tasca in Alfama · live music 21:30",
    rating: 4.7,
    reviews: 1200,
    price: "€€",
    distanceM: 350,
    photo: fado,
    review: "Cried during the fado, ate the best pica-pau of my life.",
    openInfo: "Open until 01:00",
  },
  {
    id: "marealta",
    name: "Maré Alta",
    vibe: "Modern seafood counter · natural wine",
    rating: 4.6,
    reviews: 860,
    price: "€€€",
    distanceM: 900,
    photo: seafood,
    review: "The seafood rice is criminal. Book the counter seats.",
    openInfo: "Walk-ins until 21:00",
  },
  {
    id: "terraco",
    name: "Terraço Santa Clara",
    vibe: "Rooftop over the Tejo · sunset spritzes",
    rating: 4.4,
    reviews: 2100,
    price: "€€",
    distanceM: 550,
    photo: alfama,
    review: "Went for one drink, stayed for the DJ. The view!!",
    openInfo: "Open until 00:00",
  },
];

export const initialPoll: Poll = {
  id: "dinner-poll",
  title: "Dinner tonight",
  createdBy: "ari",
  endsAt: "20:15",
  status: "draft",
  options: [
    { restaurantId: "vintem", votes: [] },
    { restaurantId: "marealta", votes: [] },
    { restaurantId: "terraco", votes: [] },
  ],
};

export const initialItinerary: ItineraryItem[] = [
  {
    id: "it-market",
    time: "10:30",
    title: "Feira da Ladra",
    subtitle: "Flea market · Alfama",
    photo: market,
    state: "done",
  },
  {
    id: "it-lunch",
    time: "13:00",
    title: "Time Out Market",
    subtitle: "Lunch · €100 · split 5 ways",
    photo: timeout,
    state: "done",
    expenseId: "e-lunch",
  },
  {
    id: "it-sunset",
    time: "17:00",
    title: "Miradouro da Graça",
    subtitle: "Golden hour over the Tejo",
    photo: miradouro,
    state: "done",
  },
  {
    id: "it-dinner",
    time: "20:45",
    title: "Dinner: up for vote",
    subtitle: "3 options · poll closes 20:15",
    state: "undecided",
  },
];

/** §7 ledger — expenses 1–5 (pre-dinner). All amounts EUR. */
export const initialExpenses: Expense[] = [
  {
    id: "e-airbnb",
    title: "Airbnb Alfama · 3 nights",
    paidBy: "nic",
    amount: 600,
    date: "Aug 14",
    sharedBy: ["ari", "nic", "maya", "tomas", "zoe"],
  },
  {
    id: "e-groceries",
    title: "Groceries + pastéis run",
    paidBy: "maya",
    amount: 85,
    date: "Aug 15",
    sharedBy: ["ari", "nic", "maya", "tomas", "zoe"],
  },
  {
    id: "e-sintra",
    title: "Sintra day (train + Pena)",
    paidBy: "tomas",
    amount: 130,
    date: "Aug 16",
    sharedBy: ["ari", "nic", "maya", "tomas", "zoe"],
  },
  {
    id: "e-lunch",
    title: "Lunch @ Time Out Market",
    paidBy: "zoe",
    amount: 100,
    date: "Aug 17",
    sharedBy: ["ari", "nic", "maya", "tomas", "zoe"],
    linkedItineraryId: "it-lunch",
  },
  {
    id: "e-tram",
    title: "Tram 28 + miradouro drinks",
    paidBy: "ari",
    amount: 40,
    date: "Aug 17",
    sharedBy: ["ari", "nic", "maya", "tomas", "zoe"],
  },
];

/** The demo dinner — added during the flow (screen 08). Wine excludes Ren & Nic. */
export const dinnerExpense: Expense = {
  id: "e-dinner",
  title: "Dinner @ Maré Alta",
  paidBy: "ari",
  amount: 186,
  date: "Aug 17",
  sharedBy: ["ari", "nic", "maya", "tomas", "zoe", "ren"],
  items: [
    {
      label: "Food & cover",
      amount: 138,
      sharedBy: ["ari", "nic", "maya", "tomas", "zoe", "ren"],
    },
    { label: "Wine", amount: 48, sharedBy: ["ari", "maya", "tomas", "zoe"] },
  ],
  linkedItineraryId: "it-dinner",
};

/** §7.4 consolidated transfers after the dinner lands. */
export const consolidatedTransfers: Transfer[] = [
  { from: "maya", to: "nic", amount: 141, status: "pending" },
  { from: "zoe", to: "nic", amount: 126, status: "pending" },
  { from: "tomas", to: "nic", amount: 96, status: "pending" },
  { from: "ren", to: "nic", amount: 23, status: "pending" },
];

export const initialBuzz: BuzzEvent[] = [
  { id: "b1", icon: "itinerary", text: "Tomás checked off Miradouro da Graça", time: "17:40" },
  { id: "b2", icon: "money", text: "Zoe added Lunch @ Time Out Market · €100", time: "14:05" },
  { id: "b3", icon: "itinerary", text: "Maya added Feira da Ladra to today", time: "09:12" },
];

export const initialMemories: Memory[] = [
  { id: "m1", photo: fado, by: "maya" },
  { id: "m2", photo: alfama, by: "ari" },
  { id: "m3", photo: tram, by: "zoe" },
  { id: "m4", photo: seafood, by: "nic" },
  { id: "m5", photo: market, by: "tomas" },
];

export const initialNotes: TripNote[] = [
  { id: "n1", by: "maya", text: "Fado made me cry and I'd do it all again tomorrow." },
];

export const TRIP_TOTAL = 1141; // €1,141 = 600+85+130+100+40+186
