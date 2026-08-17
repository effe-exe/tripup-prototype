export type MemberId = "ari" | "nic" | "maya" | "tomas" | "zoe" | "ren";

export interface Member {
  id: MemberId;
  name: string;
  initial: string;
  /** avatar tint (bg) and text color — assigned per-user, data-driven */
  bg: string;
  fg: string;
  online: boolean;
  /** mid-trip joiner scope: ISO date the member joined from */
  joinedFrom?: string;
  guest?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  vibe: string;
  rating: number;
  reviews: number;
  price: "€" | "€€" | "€€€";
  distanceM: number;
  photo: string;
  review: string;
  openInfo: string;
}

export interface PollOption {
  restaurantId: string;
  votes: MemberId[];
}

export type PollStatus = "draft" | "open" | "closed";

export interface Poll {
  id: string;
  title: string;
  createdBy: MemberId;
  endsAt: string; // display only
  status: PollStatus;
  options: PollOption[];
  winnerId?: string;
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  photo?: string;
  state: "done" | "now" | "undecided" | "planned";
  expenseId?: string;
  fromPollId?: string;
}

export interface ExpenseItem {
  label: string;
  amount: number;
  sharedBy: MemberId[];
}

export interface Expense {
  id: string;
  title: string;
  paidBy: MemberId;
  amount: number;
  date: string;
  items?: ExpenseItem[]; // itemized; absent = even split
  sharedBy: MemberId[]; // for even split
  linkedItineraryId?: string;
}

export interface Transfer {
  from: MemberId;
  to: MemberId;
  amount: number;
  status: "pending" | "paid";
}

export interface BuzzEvent {
  id: string;
  icon: "vote" | "join" | "itinerary" | "money" | "poll";
  text: string;
  time: string;
}

export interface Memory {
  id: string;
  photo: string;
  by: MemberId;
}

export interface TripNote {
  id: string;
  by: MemberId;
  text: string;
}
