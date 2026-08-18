# TripUp — group travel, decided together

An interactive prototype of a redesigned group-travel app: collaborative itinerary,
group decisions by swipe and poll, and expense splitting that ends with everyone
actually square.

**Live prototype → https://tripup-prototype.netlify.app**
(best on a phone; on desktop it renders inside an iPhone 16 frame)

---

## The scenario it demos

Ari, last evening of a Lisbon trip with five friends. She opens TripUp to sort dinner.

1. **Home** — her trips, with the live one front and centre
2. **Trip hub** — today's plan, the group, and a dinner slot nobody has filled
3. **Add Ren** — a friend joining for the final dinner only, by link or QR
4. **Ask AI / the map** — she asks "something chill for 4 tonight"; TripUp proposes
   three nearby spots with reasons, and starting a session notifies the group
5. **Swipe** — everyone swipes the same shortlist; matches surface live
6. **Poll** — matches become a poll in one tap; votes arrive in real time and the
   lead changes; at 6/6 it closes itself
7. **The winner lands in the plan** — Maré Alta, 20:45, no admin
8. **Split the bill** — €186, wine excluded for the two who didn't drink
9. **Settle** — 11 IOUs consolidated into 4 payments, then everyone pays in-app
10. **Memories** — photos, notes and an auto-cut trip film

## Demo script (about 3 minutes)

| Step | Do this | What to watch for |
|---|---|---|
| 1 | Tap the live **Lisboa com Amigos** card | Trip hub: group, today's plan, empty dinner slot |
| 2 | Tap the dashed **+** in the group strip | Ren joins after ~3s — avatar pops in, banner + Buzz fire |
| 3 | Tap the **nudge card** ("What are we doing tonight?") | The AI planner opens |
| 4 | Type or tap **"Something chill for 4 tonight"** → *Find ideas* | It "thinks", then proposes three spots, each with a reason for *this* group |
| 5 | **Start a group match** | Session opens, group notified, deck seeded |
| 6 | Swipe right on **Maré Alta** (drag it, don't just tap) | Card physics, stamps, then the match moment |
| 7 | **Make it a poll** → *Send to the group* | Votes arrive on a timer; the crown jumps as the lead changes |
| 8 | Vote yourself → poll hits 6/6 | Auto-closes, winner flies into the 20:45 slot |
| 9 | Hub → **"Add the Maré Alta bill?"** | Expense sheet, €186 |
| 10 | On the **Wine** row, tap **Nic** and **Ren** off | Their shares recompute live: 35 → 23 |
| 11 | **Add expense** → Balances | "You're all square", and **11 IOUs → 4 payments** |
| 12 | **Settle up** → tap a pending row | The payment sheet: what it covers, Apple Pay / IBAN / cash, then the row settles |
| 12b | Let the rest land | Friends pay one by one, then the wrap screen |
| 13 | **Relive the trip** | Memories: film, photo grid, notes |

Everything is mock data on a scripted timeline — no backend, no network. The timeline
is triggered by your actions rather than the clock, so the demo can't run ahead of you
or get stuck.

## What's beyond the brief

- **Swipe sessions + AI planning.** The deck starts empty on purpose: a session is
  something you *start*, for a question you actually have ("what do we do tomorrow?").
  Proposals come with a reason tied to the group's tastes, or you pick spots from a map.
- **Trip memories.** The trip ends on photos and an auto-cut film instead of a balance
  sheet — the part people actually want to share.
- **Real settlement.** Splitwise tells you who owes what; this moves the money. Tap
  any pending transfer to open the payment sheet — it shows exactly which expenses
  the amount covers, offers Apple Pay / IBAN / cash, and marks the debt settled.

## Design decisions worth knowing

- **Polls over chat.** There is deliberately no chat tab — every decision surfaces as
  something you can act on in one tap, and every result lands in the itinerary itself.
- **The undecided slot.** The plan shows its own gaps, so making a poll feels like
  finishing the plan rather than doing admin.
- **Money screens go quiet.** No emoji, no celebration, tabular figures — playfulness
  is spent on discovery, not on someone's €141.
- **Nothing flashes.** All motion is single-pass and gentle; `prefers-reduced-motion`
  is honoured. (Accessibility requirement, not a style choice.)
- **No emoji anywhere.** They render differently per device — every icon is a vector.

## Credits

**Design, art direction and UX — Federico Vietti.**
The product direction, the visual language ("gen-Z Airbnb"), the design system
(colour, type, spacing, elevation, components and their states), the wireflow, the
high-fidelity screens, the interaction and motion decisions, and the scenario content
were all designed in Figma before any code existed.

**Frontend development — Claude Code** (Anthropic's agentic CLI), the brief's
"AI-assisted code generation tool". It implemented the React application against
those designs: components built to the Figma design system, the state machine and
scripted demo timeline, and the balance/debt-minimisation maths.

Design first, then code. The Figma file is the source of truth for every token and
component in `src/components/ui.tsx`; the code mirrors it name for name.

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · framer-motion · lucide-react · boring-avatars

- `src/state/store.tsx` — reducer, and the scripted timeline that fakes the group
- `src/data/` — types, the mock ledger, and the balance/debt-minimisation maths
  (`balances.ts` computes the 11 → 4 consolidation generically; the numbers in the
  demo are derived, not hardcoded)
- `src/components/ui.tsx` — the shared component library (the code twin of the Figma
  design system)
- `src/screens/` — six screens, eighteen sheets

## Run it

```bash
npm install
npm run dev
```

Built for **iPhone 16 (393 × 852)**. On a phone it fills the screen and defers to the
device's own status bar; on desktop it renders in a phone frame.
