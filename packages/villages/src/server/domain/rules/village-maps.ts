import type { VillageMap, VillageState } from "../models/world.js";
import { badRequest, conflict, notFound } from "./errors.js";

export function villageMap(state: Pick<VillageState, "maps">, id: unknown): VillageMap {
  const map = state.maps.find((entry) => entry.id === id);
  if (!map) throw notFound("Choose a saved map.");
  return map;
}

export function assertMapRevision(map: VillageMap, revision: unknown): void {
  if (revision !== map.revision) throw conflict("This map changed. Reload it before saving.");
}

export function mapName(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 80)
    throw badRequest("Use a map name between 1 and 80 characters.");
  return value.trim();
}
