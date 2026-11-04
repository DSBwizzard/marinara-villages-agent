import { createHash } from "node:crypto";
import type { VillageAgenda } from "../models/world.js";
export function routineRevision(agenda: VillageAgenda): string {
  return createHash("sha256")
    .update(JSON.stringify([agenda.week, agenda.scheduleWeek]))
    .digest("hex");
}

/** Legacy social continuations remain valid only for the exact migrated routine. */
export function routineRevisionMatches(agenda: VillageAgenda, revision: string): boolean {
  const current = routineRevision(agenda);
  return (
    revision === current ||
    (revision === agenda.legacyRoutineRevision?.previous && current === agenda.legacyRoutineRevision.current)
  );
}
