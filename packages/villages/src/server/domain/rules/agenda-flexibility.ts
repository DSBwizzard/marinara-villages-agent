import type { AgendaPurpose, VillageAgendaBlock } from "../models/world.js";

export function readAgendaPurpose(value: unknown): AgendaPurpose | undefined {
  return value === "ordinary" || value === "rest" || value === "work" || value === "repair" || value === "unplanned"
    ? value
    : undefined;
}

export function restingAgendaBlock(block: Pick<VillageAgendaBlock, "activity" | "purpose"> | null): boolean {
  if (block?.purpose) return block.purpose === "rest";
  // Keep the saved meaning for blocks written before the typed purpose existed.
  return /\b(?:sleep(?:ing)?|asleep|hibernate|hibernating|dormant)\b/iu.test(block?.activity ?? "");
}

/** Only optional, uncommitted village time may be reassigned. */
export function flexibleAgendaBlock(
  block: Pick<VillageAgendaBlock, "flexible" | "essential" | "commitmentId">,
): boolean {
  return block.flexible === true && !block.essential && !block.commitmentId;
}
