import { effectId } from "../../domain/rules/wish-progress-rules.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_KIND } from "../../adapters/storage/scene-slots.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { wishFingerprint } from "../../domain/rules/wish-interpretation-rules.js";
import { semanticContinued } from "../../domain/rules/semantic-continuity.js";
import type { InterpretationEvidence } from "../../domain/models/interpretation-check-model.js";
import { conflict, notFound } from "../../domain/rules/errors.js";
import { pendingProgressTurns } from "../../domain/rules/scene-record.js";
import { legacyZoneId } from "../../domain/rules/venue-zones.js";
export interface SceneQueryPorts {
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  villagesDocuments(): Pick<CapabilityDocumentStore, "list">;
}
/** Inert internal Scene evidence/backlog queries with explicit originating connections. */
export function createSceneQueryService({ readSession, readVillageState, villagesDocuments }: SceneQueryPorts) {
  async function readProjectTurnEvidence(sessionId: string, submissionId: string) {
    const session = await readSession(sessionId);
    const submission = session.submissions.find((entry) => entry.id === submissionId);
    if (!submission) throw notFound("That roleplay turn was not recorded.");
    const venue = (await readVillageState()).venues.find((entry) => entry.id === session.placeId);
    const zoneId =
      submission.zoneIdAtTurn ??
      session.zoneId ??
      (venue
        ? legacyZoneId(
            venue,
            submission.areaAtTurn ?? session.area,
            session.spaceClass,
            submission.privateOwnerIdAtTurn ?? session.privateOwnerId,
          )
        : undefined);
    const playerSources = session.lines.filter(
      (line) =>
        line.role === "user" &&
        (line.id === submission.liveProposals?.playerLineId ||
          (line.attentionEvidence && submission.replyLineIds?.includes(line.id))),
    );
    const playerMessagesByActor = Object.fromEntries(
      [...new Set(playerSources.flatMap((line) => line.heardBy))].map((actor) => [
        actor,
        playerSources
          .filter((line) => line.heardBy.includes(actor))
          .map((line) => line.content)
          .join("\n"),
      ]),
    );
    return {
      sessionId,
      semanticVersion: submission.semanticProvenance?.version,
      venueId: session.placeId,
      zoneId,
      submissionId,
      mode: submission.mode,
      message: submission.message,
      ...(submission.attention || submission.zoneEventsVersion === 1 ? { playerMessagesByActor } : {}),
      at: submission.at ?? "",
      areaAtTurn: submission.areaAtTurn ?? session.area,
      activeIdsAtTurn: [
        ...new Set([
          ...(submission.activeIdsAtTurn ?? session.participants.map((participant) => participant.characterId)),
          ...(submission.speechIdsAtTurn ?? []),
        ]),
      ],
      action: submission.action ?? null,
      projectContexts: submission.projectContexts ?? [],
      projectSpeech: submission.projectSpeech ?? [],
      contextualInterpretation: submission.projectInterpretationVersion === 1,
      contextLines: session.lines
        .slice(
          0,
          Math.max(
            0,
            session.lines.findIndex((line) => submission.replyLineIds?.includes(line.id)),
          ),
        )
        .filter(
          (line) =>
            (!line.contactHidden || line.attentionEvidence) &&
            !line.contactReport &&
            line.kind !== "side" &&
            line.kind !== "whisper",
        ),
      lines: session.lines.filter((line) =>
        submission.replyLineIds?.length
          ? submission.replyLineIds.includes(line.id) &&
            line.role === "assistant" &&
            (submission.activeIdsAtTurn?.includes(line.speakerId) ||
              submission.speechIdsAtTurn?.includes(line.speakerId)) &&
            !line.contactHidden &&
            !line.contactReport
          : line.at === submission.at &&
            line.role === "assistant" &&
            !line.contactHidden &&
            !line.contactReport &&
            session.participants.some((participant) => participant.characterId === line.speakerId),
      ),
    };
  }

  /** Restore only already accepted, actor-witnessed Wish proof; this never discloses a Wish. */
  async function readWishTurnEvidence(input: {
    receiptId: string;
    seed: string;
    actorId: string;
    wishId: string;
    fingerprint: string;
    at: string;
  }): Promise<InterpretationEvidence[]> {
    const state = await readVillageState();
    const receipt = state.exchangeReceipts[input.receiptId];
    const wish = state.villagers
      .find((entry) => entry.characterId === input.actorId)
      ?.agenda?.wishes.find((entry) => entry.id === input.wishId);
    if (
      state.seed !== input.seed ||
      !wish ||
      wishFingerprint(wish) !== input.fingerprint ||
      !receipt ||
      receipt.id !== input.receiptId ||
      receipt.domain !== "wishes" ||
      receipt.status !== "applied" ||
      receipt.actorId !== input.actorId ||
      receipt.wishId !== input.wishId ||
      !receipt.at ||
      receipt.at > input.at ||
      (wish.addedAt && receipt.at < wish.addedAt) ||
      receipt.evidenceIds.length > 16 ||
      semanticContinued(state, receipt.sceneId, receipt.submissionId, "wishes")
    )
      return [];
    const session = await readSession(receipt.sceneId);
    const turn = session.submissions.find((entry) => entry.id === receipt.submissionId);
    if (
      session.id !== receipt.sceneId ||
      session.villageSeed !== input.seed ||
      !turn ||
      turn.at !== receipt.at ||
      !turn.wishProposals?.some(
        (proposal) =>
          proposal.actorId === input.actorId &&
          proposal.wishId === input.wishId &&
          proposal.fingerprint === input.fingerprint &&
          ["progress", "check"].includes(proposal.intent) &&
          receipt.id === effectId(session.id, turn.id, proposal),
      )
    )
      return [];
    const sourceIds = new Set([...(turn.replyLineIds ?? []), ...(turn.processing?.lineIds ?? [])]);
    const rows = session.lines
      .filter(
        (line) =>
          receipt.evidenceIds.includes(line.id) &&
          sourceIds.has(line.id) &&
          line.heardBy.includes(input.actorId) &&
          !line.contactReport &&
          line.kind !== "side" &&
          (!line.contactHidden || (line.role === "user" && line.attentionEvidence)) &&
          line.at &&
          line.at <= receipt.at &&
          (!wish.addedAt || line.at >= wish.addedAt),
      )
      .map((line) => ({
        id: line.id,
        speakerId: line.role === "user" ? "player" : line.speakerId,
        name: line.name,
        content: line.content,
        kind: line.kind,
        at: line.at,
        current: false,
      }));
    if (Buffer.byteLength(JSON.stringify(rows), "utf8") > 12000)
      throw conflict("Saved Wish evidence exceeds the check allowance. The conversation is preserved.");
    return rows;
  }

  async function progressBacklog() {
    const village = await readVillageState();
    const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
    return records.flatMap((record) => {
      const session = coerceSession(record.data);
      if (session.processingVersion === 1 && session.villageSeed !== village.seed) return [];
      return session.submissions
        .filter(
          (turn) =>
            (turn.openingSignal && !turn.openingProcessedAt) ||
            (turn.processing
              ? unfinishedExchange(turn.processing)
              : pendingProgressTurns(session, village.foundedAt).includes(turn)),
        )
        .map((turn) => ({
          sessionId: session.id,
          submissionId: turn.id,
          at: turn.at,
          error: turn.progressError ?? "",
        }));
    });
  }
  return { readProjectTurnEvidence, readWishTurnEvidence, progressBacklog };
}
export type SceneQueryService = ReturnType<typeof createSceneQueryService>;
