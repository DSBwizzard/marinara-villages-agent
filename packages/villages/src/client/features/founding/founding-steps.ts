/** One ordered list for the phase rail and draft navigation. */
export const SETUP_STEPS = ["Setting", "People", "Maps", "Venues", "Zones", "Review"] as const;
export type FoundingPhase = (typeof SETUP_STEPS)[number];

export function savedFoundingStep({ step, phase }: { step: number; phase?: string }): number {
  const named = SETUP_STEPS.findIndex((label) => label === phase);
  if (named !== -1) return named;
  // Older drafts combined Maps, Venues and Zones at 2, with Review at 3.
  return Number.isInteger(step) ? (step >= 3 ? 5 : Math.max(0, step)) : 0;
}
