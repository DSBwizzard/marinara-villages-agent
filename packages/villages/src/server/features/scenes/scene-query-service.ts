import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_KIND } from "../../adapters/storage/scene-slots.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import { readSceneIndex, readSceneWorkIndex } from "../../adapters/storage/scene-history.js";
import { notFound } from "../../domain/rules/errors.js";
import { pendingProgressTurns } from "../../domain/rules/scene-record.js";
import { projectMetadataRejected } from "../../domain/rules/semantic-continuity.js";
import { legacyZoneId } from "../../domain/rules/venue-zones.js";
export interface SceneQueryPorts {
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  villagesDocuments(): Pick<CapabilityDocumentStore, "list" | "getById">;
  readRetiredProjectScenes?(seed: string): Promise<import("../../domain/models/scene-model.js").VenueScene[]>;
}
/** Inert internal Scene evidence/backlog queries with explicit originating connections. */
export function createSceneQueryService({
  readSession,
  readVillageState,
  villagesDocuments,
  readRetiredProjectScenes,
}: SceneQueryPorts) {
  async function readProjectTurnEvidence(sessionId: string, submissionId: string) {
    const session = await readSession(sessionId).catch(async (error: unknown) => {
      if ((error as { statusCode?: number })?.statusCode !== 404 || !readRetiredProjectScenes) throw error;
      const seed = (await readVillageState()).seed;
      const saved = (await readRetiredProjectScenes(seed)).find((scene) => scene.id === sessionId);
      if (!saved) throw error;
      return saved;
    });
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
      villageSeed: session.villageSeed,
      semanticVersion: submission.semanticProvenance?.version,
      preservationVersion: submission.semanticProvenance?.preservationVersion,
      occurrenceVersion: submission.semanticProvenance?.occurrenceVersion,
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
      projectSpeech: projectMetadataRejected(submission) ? [] : (submission.projectSpeech ?? []),
      projectMetadataRejected: projectMetadataRejected(submission),
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

  async function progressBacklog() {
    const village = await readVillageState();
    const documents = villagesDocuments(),
      records = await documents.list(VILLAGES_PACKAGE_ID, SESSION_KIND);
    const backlog = [];
    for (const record of records) {
      const header = readSceneIndex(record.data);
      if (header.processingVersion === 1 && header.villageSeed !== village.seed) continue;
      const session = await readSceneWorkIndex(documents, record.data);
      const pending = new Set(pendingProgressTurns(session, village.foundedAt));
      backlog.push(
        ...session.submissions
          .filter(
            (turn) =>
              (turn.openingSignal && !turn.openingProcessedAt) ||
              (turn.processing ? unfinishedExchange(turn.processing) : pending.has(turn)),
          )
          .map((turn) => ({
            sessionId: session.id,
            submissionId: turn.id,
            at: turn.at,
            error: turn.progressError ?? "",
          })),
      );
    }
    return backlog;
  }
  return { readProjectTurnEvidence, progressBacklog };
}
export type SceneQueryService = ReturnType<typeof createSceneQueryService>;
