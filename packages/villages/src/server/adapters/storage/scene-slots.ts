import { coerceActive, coerceSession } from "../../domain/decoding/scene-codec.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { DocumentSlot, HydratedDocumentSlot } from "./document-store.js";
import { createSceneHistory } from "./scene-history.js";
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
export function sessionSlot(documents: CapabilityDocumentStore): HydratedDocumentSlot<VenueScene> {
  const history = createSceneHistory(documents);
  let previous: unknown;
  return {
    kind: SESSION_KIND,
    name: "Scene",
    description: "The player's exact record of one Scene, indexed by Venue and participant.",
    coerce: async (value: unknown) => {
      previous = value;
      return value === undefined ? coerceSession({ version: 3 }) : history.decode(value);
    },
    encode: (value) => history.encode(value, previous),
    label: (session) => session.placeName || "Scene",
  };
}
