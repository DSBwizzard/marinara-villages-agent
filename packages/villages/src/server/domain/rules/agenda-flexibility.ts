import type { VillageAgendaBlock } from "../models/world.js";

/** Only optional, uncommitted village time may be reassigned. */
export function flexibleAgendaBlock(
  block: Pick<VillageAgendaBlock, "flexible" | "essential" | "commitmentId">,
): boolean {
  return block.flexible === true && !block.essential && !block.commitmentId;
}
