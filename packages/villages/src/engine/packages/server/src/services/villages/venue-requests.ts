import { boundText, MAX_VENUE_NAME_LENGTH, MAX_VENUE_NOTE_LENGTH } from "./prompt-preset.js";
import type { VillageChatMessage, VillageVenueDraft } from "./types.js";

export type VenueRequestCore = Pick<VillageVenueDraft, "name" | "purpose" | "category">;

/** Model output is optional. Refuse malformed requests rather than inventing a place. */
export function readVenueRequestCore(value: unknown): VenueRequestCore | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.name !== "string" || typeof raw.purpose !== "string") return null;
  if (raw.category !== undefined && typeof raw.category !== "string") return null;
  const name = raw.name.trim();
  const purpose = raw.purpose.trim();
  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  if (
    !name ||
    !purpose ||
    name.length > MAX_VENUE_NAME_LENGTH ||
    purpose.length > MAX_VENUE_NOTE_LENGTH ||
    category.length > MAX_VENUE_NOTE_LENGTH
  )
    return null;
  return { name: boundText(name, MAX_VENUE_NAME_LENGTH), purpose: boundText(purpose, MAX_VENUE_NOTE_LENGTH), category };
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
    description: "",
    position: { x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  };
}
