import { createHash } from "node:crypto";
import type { VillageAgenda } from "../models/world.js";
export function routineRevision(agenda: VillageAgenda): string {
  return createHash("sha256")
    .update(JSON.stringify(agenda.week ?? null))
    .digest("hex");
}

/** A continuation belongs to one exact owned routine. */
export function routineRevisionMatches(agenda: VillageAgenda, revision: string): boolean {
  return revision === routineRevision(agenda);
}
