/** One ordered list for the phase strip, draft navigation and resume labels. */
export const SETUP_STEPS = ["People", "Place", "Map", "Venues", "Review"] as const;
export type FoundingPhase = (typeof SETUP_STEPS)[number];

/** Older drafts numbered Venues as 2 and Review as 3, before Map became a phase. */
export function savedFoundingStep(draft?: {
  step: number;
  phase?: FoundingPhase;
  mapSource?: string;
  mapImage?: string;
}): number {
  if (!draft) return 0;
  const phase = draft.phase === undefined ? -1 : SETUP_STEPS.indexOf(draft.phase);
  const legacy = Number.isInteger(draft.step) ? Math.max(0, Math.min(3, draft.step)) : 0;
  const step = phase >= 0 ? phase : legacy >= 2 ? legacy + 1 : legacy;
  return draft.mapSource === "none" && !draft.mapImage && step > 2 ? 2 : step;
}
