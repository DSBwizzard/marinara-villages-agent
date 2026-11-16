/** One ordered list for the phase rail and draft navigation. */
export const SETUP_STEPS = ["Setting", "People", "Venues and Map", "Review"] as const;
export type FoundingPhase = (typeof SETUP_STEPS)[number];

export function savedFoundingStep({ step }: { step: number }): number {
  return Number.isInteger(step) ? Math.max(0, Math.min(SETUP_STEPS.length - 1, step)) : 0;
}
