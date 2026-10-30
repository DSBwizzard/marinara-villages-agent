import { createExchangeProcessing } from "../decoding/exchange-codec.js";
import type { VenueScene } from "../models/scene-model.js";
import { notFound } from "./errors.js";
import { sceneFingerprint } from "./scene-record.js";
import { asRecord } from "./coerce.js";
import { isImmutableRelationshipState } from "./relationship-rules.js";
import { isImmutableSceneLine } from "./scene-transcript.js";
import { isImmutableSceneSubmission, mutableSceneSubmission } from "./scene-submissions.js";

function mutationSnapshot(session: VenueScene) {
  const bodies: object[] = [];
  function context(value: unknown) {
    const raw = asRecord(value),
      facts = asRecord(raw.facts);
    if (!isImmutableRelationshipState(facts.relationshipContext)) return value;
    bodies.push(facts.relationshipContext);
    return { ...raw, facts: { ...facts, relationshipContext: undefined } };
  }
  const snapshot = session.operation?.snapshot;
  const value = {
    ...session,
    lines: undefined,
    submissions: undefined,
    continuity: context(session.continuity),
    operation: session.operation
      ? {
          ...session.operation,
          snapshot: snapshot ? { ...snapshot, continuity: context(snapshot.continuity) } : snapshot,
        }
      : undefined,
  };
  return {
    text: JSON.stringify(value),
    bodies,
    lines: session.lines.map((line) => (isImmutableSceneLine(line) ? line : JSON.stringify(line))),
    submissions: session.submissions.map((row) => (isImmutableSceneSubmission(row) ? row : JSON.stringify(row))),
  };
}

/** Apply the saved Scene rules independently of document reads, writes, and CAS retries. */
export function applySceneMutation(
  session: VenueScene,
  id: string,
  change: (session: VenueScene) => void,
): void | false {
  if (session.id !== id) throw notFound("That Scene is no longer available.");
  const snapshot = mutationSnapshot(session);
  const before = sceneFingerprint(session);
  const priorChanges = new Map(
    session.submissions.map((turn) => [
      turn.id,
      {
        value: turn,
        text: isImmutableSceneSubmission(turn)
          ? undefined
          : JSON.stringify([turn.processing, turn.recordEvents, turn.liveProposals]),
      },
    ]),
  );
  change(session);
  if (session.processingVersion === 1 && session.villageSeed)
    session.submissions.forEach((turn, order) => {
      if (turn.movement || turn.processing || !turn.at) return;
      mutableSceneSubmission(session, turn.id)!.processing = createExchangeProcessing({
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
  for (const turn of session.submissions) {
    const prior = priorChanges.get(turn.id);
    if (prior?.value === turn && isImmutableSceneSubmission(turn)) continue;
    const original =
      prior?.text ??
      (prior && JSON.stringify([prior.value.processing, prior.value.recordEvents, prior.value.liveProposals]));
    if (original !== JSON.stringify([turn.processing, turn.recordEvents, turn.liveProposals]))
      mutableSceneSubmission(session, turn.id)!.changeSequence = session.changeSequence =
        (session.changeSequence ?? 0) + 1;
  }
  const fingerprint = sceneFingerprint(session);
  if (
    before[0] !== fingerprint[0] ||
    before[1].length !== fingerprint[1].length ||
    before[1].some((id, i) => id !== fingerprint[1][i])
  )
    session.sceneRevision += 1;
  const after = mutationSnapshot(session);
  if (
    snapshot.text === after.text &&
    snapshot.lines.length === after.lines.length &&
    snapshot.lines.every((line, i) => line === after.lines[i]) &&
    snapshot.submissions.length === after.submissions.length &&
    snapshot.submissions.every((row, i) => row === after.submissions[i]) &&
    snapshot.bodies.length === after.bodies.length &&
    snapshot.bodies.every((body, i) => body === after.bodies[i])
  )
    return false;
}
