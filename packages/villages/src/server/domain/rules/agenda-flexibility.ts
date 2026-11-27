import type { VillageAgendaBlock } from "../models/world.js";

export const AGENDA_NAP_ACTIVITY = "Sleeping (nap)";

export function restingAgendaBlock(block: Pick<VillageAgendaBlock, "activity"> | null): boolean {
  return /\b(?:sleep(?:ing)?|asleep|hibernate|hibernating|dormant)\b/iu.test(block?.activity ?? "");
}

export function fixedRestAgendaBlock(block: VillageAgendaBlock): boolean {
  return restingAgendaBlock(block) && !(block.activity === AGENDA_NAP_ACTIVITY && flexibleAgendaBlock(block));
}

/** Only optional, uncommitted village time may be reassigned. */
export function flexibleAgendaBlock(
  block: Pick<VillageAgendaBlock, "flexible" | "essential" | "commitmentId">,
): boolean {
  return block.flexible === true && !block.essential && !block.commitmentId;
}
