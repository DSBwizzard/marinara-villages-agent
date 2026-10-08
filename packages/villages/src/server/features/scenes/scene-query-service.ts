import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_KIND } from "../../adapters/storage/scene-slots.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { notFound } from "../../domain/rules/errors.js";
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
    return {
      sessionId,
      venueId: session.placeId,
      zoneId,
      submissionId,
      mode: submission.mode,
      message: submission.message,
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
          (line) => !line.contactHidden && !line.contactReport && line.kind !== "side" && line.kind !== "whisper",
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
    const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
    return records.flatMap((record) => {
      const session = coerceSession(record.data);
      if (session.processingVersion === 1 && session.villageSeed !== village.seed) return [];
      return session.submissions
        .filter((turn) =>
          turn.processing
            ? unfinishedExchange(turn.processing)
            : pendingProgressTurns(session, village.foundedAt).includes(turn),
        )
        .map((turn) => ({
          sessionId: session.id,
          submissionId: turn.id,
          at: turn.at,
          error: turn.progressError ?? "",
        }));
    });
  }
  return { readProjectTurnEvidence, progressBacklog };
}
export type SceneQueryService = ReturnType<typeof createSceneQueryService>;
