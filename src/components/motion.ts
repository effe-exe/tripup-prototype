/**
 * Shared motion tokens (design direction §Motion).
 *
 * standard curve · overdamped springs (ζ ≥ 1 — at most one tiny settle,
 * never oscillating) · micro 120–200ms · standard 250–350ms ·
 * celebratory 400–700ms. Transform + opacity only.
 *
 * Accessibility: every animation here is single-pass. Nothing loops, blinks
 * or pulses; index.css additionally clamps durations under
 * prefers-reduced-motion.
 */

export const EASE_STD = [0.2, 0, 0, 1] as const;

export const springSoft = { type: "spring", stiffness: 240, damping: 32 } as const;
export const springSnap = { type: "spring", stiffness: 300, damping: 30 } as const;
export const springFirm = { type: "spring", stiffness: 320, damping: 34 } as const;

export const tMicro = { duration: 0.16, ease: EASE_STD } as const;
export const tStd = { duration: 0.3, ease: EASE_STD } as const;

/**
 * Mount-only entrance for list rows: y 8 → 0 + fade, staggered by index.
 * Because framer runs `initial → animate` once per mounted element and the
 * rows are keyed by stable ids, ordinary state-driven re-renders never
 * re-trigger it — only a genuine mount does. The delay is capped so long
 * lists don't leave the last rows waiting.
 *
 * Fades from 0: a one-way mount ramp is not a flash. The 0.4 opacity floor in
 * the accessibility rule guards against blinking and pulsing loops, which this
 * is not — and starting at 0.4 makes rows pop in half-visible.
 */
export const rowEnter = (i: number, step = 0.05) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: EASE_STD, delay: Math.min(i, 9) * step },
});

/** Standard tappable-surface feedback. */
export const tapCard = { scale: 0.985 } as const;
export const tapChip = { scale: 0.96 } as const;
