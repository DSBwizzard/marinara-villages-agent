import { createExchangeProcessing } from "../../domain/decoding/exchange-codec.js";
import { coerceActive, coerceSession } from "../../domain/decoding/scene-codec.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import { notFound } from "../../domain/rules/errors.js";
import { sceneFingerprint } from "../../domain/rules/scene-record.js";
import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../engine/runtime-host.js";
import { type DocumentSlot, mutateDocument } from "./document-store.js";

/** One document is both the active transcript and the player's durable Scene archive. */

/** Compatibility name for existing package integrations and saved Scene workflows. */

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
    if (session.id !== id) throw notFound("That Scene is no longer available.");
    const snapshot = JSON.stringify(session);
    const before = sceneFingerprint(session);
    const priorChanges = new Map(
      session.submissions.map((turn) => [
        turn.id,
        JSON.stringify([turn.processing, turn.recordEvents, turn.liveProposals]),
      ]),
    );
    change(session);
    if (session.processingVersion === 1 && session.villageSeed)
      session.submissions.forEach((turn, order) => {
        if (turn.movement || turn.processing || !turn.at || (turn.mode === "act" && !turn.actionReplyDone)) return;
        turn.processing = createExchangeProcessing({
          seed: session.villageSeed!,
          sceneId: id,
          submissionId: turn.id,
          order,
          lineIds: session.lines
            .filter((line) => turn.replyLineIds?.includes(line.id) || (line.role === "user" && line.at === turn.at))
            .map((line) => line.id),
          actionReceiptIds: turn.action?.happened
            ? [turn.physicalOutcomeVersion ? `venue-chat:${id}:${turn.id}` : `venue-action:${turn.id}`]
            : [],
        });
      });
    for (const turn of session.submissions)
      if (priorChanges.get(turn.id) !== JSON.stringify([turn.processing, turn.recordEvents, turn.liveProposals]))
        turn.changeSequence = session.changeSequence = (session.changeSequence ?? 0) + 1;
    if (before !== sceneFingerprint(session)) session.sceneRevision += 1;
    result = session;
    if (snapshot === JSON.stringify(session)) return false;
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
