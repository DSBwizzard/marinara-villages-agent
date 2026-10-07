import { coerceActive, coerceSession } from "../../domain/decoding/scene-codec.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import type { DocumentSlot } from "./document-store.js";
export const ACTIVE_ID = "villages-active-venue";
export const SESSION_PREFIX = "villages-venue-visit-";
export const SESSION_KIND = "venue-visit";
export const activeSlot: DocumentSlot<ActiveVenue> = {
  kind: "venue-active",
  name: "Active Scene",
  description: "The one Scene the player is in.",
  coerce: coerceActive,
  label: () => "Active Scene",
};
export const sessionSlot: DocumentSlot<VenueScene> = {
  kind: SESSION_KIND,
  name: "Scene",
  description: "The player's exact record of one Scene, indexed by Venue and participant.",
  coerce: coerceSession,
  label: (session) => session.placeName || "Scene",
};
