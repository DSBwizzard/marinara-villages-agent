import type { VillageAgendaBlock } from "../models/world.js";

export const AGENDA_NAP_ACTIVITY = "Napping";
const LEGACY_NAP_ACTIVITY = "Sleeping (nap)";

export function normalizeAgendaNap(activity: string): string {
  return activity === LEGACY_NAP_ACTIVITY ? AGENDA_NAP_ACTIVITY : activity;
}

export function sleepingAgendaLabel(activity: string): boolean {
  return /\b(?:sleep(?:ing)?|asleep|hibernate|hibernating|dormant)\b/iu.test(activity);
}

export function restingAgendaBlock(block: Pick<VillageAgendaBlock, "activity"> | null): boolean {
  return block !== null && (block.activity === AGENDA_NAP_ACTIVITY || sleepingAgendaLabel(block.activity));
}

export function fixedRestAgendaBlock(block: VillageAgendaBlock): boolean {
  return (
    restingAgendaBlock(block) &&
    !(normalizeAgendaNap(block.activity) === AGENDA_NAP_ACTIVITY && flexibleAgendaBlock(block))
  );
}

/** Only optional, uncommitted village time may be reassigned. */
export function flexibleAgendaBlock(
  block: Pick<VillageAgendaBlock, "flexible" | "essential" | "commitmentId">,
): boolean {
  return block.flexible === true && !block.essential && !block.commitmentId;
}

export const scheduledAgendaActivity = (block: VillageAgendaBlock) =>
  !(!block.venueId && flexibleAgendaBlock(block) && block.activity === "Taking care of their own affairs");
