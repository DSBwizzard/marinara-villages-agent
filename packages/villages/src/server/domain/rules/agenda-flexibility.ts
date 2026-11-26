import type { AgendaPurpose, VillageAgendaBlock } from "../models/world.js";

export function readAgendaPurpose(value: unknown): AgendaPurpose | undefined {
  return value === "ordinary" || value === "rest" || value === "work" || value === "repair" || value === "unplanned"
    ? value
    : undefined;
}

export function restingAgendaBlock(block: Pick<VillageAgendaBlock, "activity" | "purpose"> | null): boolean {
  if (block?.purpose) return block.purpose === "rest";
  // Older blocks lack a purpose. Recognize only common explicit legacy rest labels.
  return /^(?:sleep(?:ing)?|asleep|hibernat(?:e|ing)|dormant)(?:$|\s+(?:in|at|until|through|for)\b)/iu.test(
    block?.activity.trim() ?? "",
  );
}

/** Only optional, uncommitted village time may be reassigned. */
export function flexibleAgendaBlock(
  block: Pick<VillageAgendaBlock, "flexible" | "essential" | "commitmentId">,
): boolean {
  return block.flexible === true && !block.essential && !block.commitmentId;
}
