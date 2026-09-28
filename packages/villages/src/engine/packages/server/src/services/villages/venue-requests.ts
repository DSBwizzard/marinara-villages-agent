import { boundText, MAX_VENUE_NAME_LENGTH } from "./prompt-preset.js";
import type { VillageChatMessage, VillageVenueDraft } from "./types.js";

export type VenueRequestCore = Pick<VillageVenueDraft, "name" | "classes">;

/** Model output is optional. Refuse malformed requests rather than inventing a place. */
export function readVenueRequestCore(value: unknown): VenueRequestCore | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.name !== "string" || !Array.isArray(raw.classes)) return null;
  const name = raw.name.trim();
  const validClasses = ["residence", "gathering", "workplace", "other"];
  if (!name || name.length > MAX_VENUE_NAME_LENGTH || raw.classes.length < 1 || raw.classes.length > 2) return null;
  if (raw.classes.some((value) => typeof value !== "string" || !validClasses.includes(value))) return null;
  if (new Set(raw.classes).size !== raw.classes.length) return null;
  return { name: boundText(name, MAX_VENUE_NAME_LENGTH), classes: raw.classes as VillageVenueDraft["classes"] };
}

/** A chat request needs a verbatim piece of this villager's own speech as evidence. */
export function readConversationVenueRequest(
  value: unknown,
  messages: readonly VillageChatMessage[],
): VenueRequestCore | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const core = readVenueRequestCore(raw);
  const quote = typeof raw.quote === "string" ? raw.quote.trim() : "";
  if (!core || quote.length < 8) return null;
  const needle = quote.replace(/\s+/gu, " ").toLowerCase();
  const saidByThisVillager = messages.some(
    (message) =>
      message.role === "assistant" &&
      !message.speakerId &&
      message.content.replace(/\s+/gu, " ").toLowerCase().includes(needle),
  );
  return saidByThisVillager ? core : null;
}

export function venueRequestDraft(core: VenueRequestCore): VillageVenueDraft {
  return {
    ...core,
    category: "",
    description: "",
    position: { x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  };
}
