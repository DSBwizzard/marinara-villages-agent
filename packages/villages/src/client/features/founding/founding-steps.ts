/** One ordered list for the phase strip, draft navigation and resume labels. */
export const SETUP_STEPS = ["Setting", "People", "Venues and Map", "Review"] as const;
export type FoundingPhase = (typeof SETUP_STEPS)[number];

/** Only the fresh draft contract reaches this navigation helper. */
export function savedFoundingStep(draft?: {
  step: number;
  phase?: FoundingPhase;
  mapSource?: string;
  mapImage?: string;
}): number {
  if (!draft) return 0;
  return Number.isInteger(draft.step) ? Math.max(0, Math.min(3, draft.step)) : 0;
}
