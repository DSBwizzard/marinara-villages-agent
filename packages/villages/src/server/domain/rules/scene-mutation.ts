import { createExchangeProcessing } from "../decoding/exchange-codec.js";
import type { VenueScene } from "../models/scene-model.js";
import { notFound } from "./errors.js";
import { sceneFingerprint } from "./scene-record.js";

/** Apply the saved Scene rules independently of document reads, writes, and CAS retries. */
export function applySceneMutation(
  session: VenueScene,
  id: string,
  change: (session: VenueScene) => void,
): void | false {
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
  if (snapshot === JSON.stringify(session)) return false;
}
