import type { VillageVenueDraft } from "../models/world.js";
import { boundText, MAX_VENUE_NAME_LENGTH } from "./prompt-preset.js";

export type VenueRequestCore = Pick<VillageVenueDraft, "name">;

/** Model output is optional. Refuse malformed requests rather than inventing a place. */
export function readVenueRequestCore(value: unknown): VenueRequestCore | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.name !== "string") return null;
  const name = raw.name.trim();
  if (!name || name.length > MAX_VENUE_NAME_LENGTH) return null;
  return { name: boundText(name, MAX_VENUE_NAME_LENGTH) };
}

export function venueRequestDraft(core: VenueRequestCore): VillageVenueDraft {
  return {
    ...core,
    category: "",
    description: "",
    position: { x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],
  };
}
