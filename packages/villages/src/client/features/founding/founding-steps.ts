/** One ordered list for the phase rail and draft navigation. */
export const FOUNDING_STEP = { Setting: 0, People: 1, Maps: 2, Venues: 3, Review: 4 } as const;
export type FoundingPhase = keyof typeof FOUNDING_STEP;
export const SETUP_STEPS = Object.keys(FOUNDING_STEP) as FoundingPhase[];

export function savedFoundingStep({ step, phase }: { step: number; phase?: string }): number {
  if (phase === "Zones") return FOUNDING_STEP.Venues;
  const named = SETUP_STEPS.findIndex((label) => label === phase);
  if (named !== -1) return named;
  // Older drafts without a phase used People at 1, Maps at 2 and Review at 3.
  if (!Number.isInteger(step) || step < 1) return FOUNDING_STEP.Setting;
  if (step === 1) return FOUNDING_STEP.People;
  if (step === 2) return FOUNDING_STEP.Maps;
  return FOUNDING_STEP.Review;
}
