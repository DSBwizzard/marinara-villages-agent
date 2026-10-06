import { coerceActive, coerceSession } from "../../domain/decoding/scene-codec.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import { notFound } from "../../domain/rules/errors.js";
import { applySceneMutation } from "../../domain/rules/scene-mutation.js";
import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../engine/runtime-host.js";
import { type DocumentSlot, mutateDocument } from "./document-store.js";

/** Scene document identifiers and revision-safe storage operations. */

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
export async function readActive(): Promise<ActiveVenue> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, ACTIVE_ID);
  return coerceActive(record?.data);
}
export async function readSession(id: string): Promise<VenueScene> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
  if (!record) throw notFound("That Scene is no longer available.");
  return coerceSession(record.data);
}
export async function changeSession(id: string, change: (session: VenueScene) => void): Promise<VenueScene> {
  let result: VenueScene | null = null;
  await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, (session) => {
    const changed = applySceneMutation(session, id, change);
    result = session;
    return changed;
  });
  return result!;
}
export async function clearActivePointer(id: string): Promise<void> {
  await mutateDocument(ACTIVE_ID, activeSlot, (state) => {
    if (state.sessionId === id) {
      state.sessionId = "";
      state.placeId = "";
    }
  });
}
