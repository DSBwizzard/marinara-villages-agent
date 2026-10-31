import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { z } from "zod";
import type { SceneHistoryPage } from "../../../shared/contracts/scene-history.js";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_KIND } from "../../adapters/storage/scene-slots.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import { readSceneIndex, readSceneWorkIndex } from "../../adapters/storage/scene-history.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";
import {
  readSceneTranscriptHead,
  readSceneTranscriptPositions,
} from "../../adapters/storage/scene-transcript-pages.js";
import { readSceneSubmissionHead } from "../../adapters/storage/scene-submission-pages.js";
import {
  readScenePublicHistoryHead,
  readScenePublicHistoryRange,
  projectSceneHistoryPage,
} from "../../adapters/storage/scene-public-history.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { pendingProgressTurns } from "../../domain/rules/scene-record.js";
import { projectMetadataRejected } from "../../domain/rules/semantic-continuity.js";
import { legacyZoneId } from "../../domain/rules/venue-zones.js";
import { withRepairWork } from "../../adapters/storage/repair-gate.js";
import { readVillageRoot } from "../../adapters/storage/village-repository.js";
export interface SceneQueryPorts {
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  villagesDocuments(): Pick<CapabilityDocumentStore, "list" | "getById">;
  readRetiredProjectScenes?(seed: string): Promise<import("../../domain/models/scene-model.js").VenueScene[]>;
}
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const historyQuery = z.object({ scope: hash, cursor: z.string().min(1).max(4096).optional() }).strict();
const historyCursor = z
  .object({
    v: z.literal(1),
    scope: hash,
    sceneId: z.string().min(1).max(180),
    version: hash,
    direction: z.enum(["older", "newer"]),
    anchor: z.number().int().nonnegative().safe(),
  })
  .strict();
const HISTORY_ROWS = 40,
  HISTORY_BYTES = 128 * 1024 - 2048;
/** Inert internal Scene evidence/backlog queries with explicit originating connections. */
export function createSceneQueryService({
  readSession,
  readVillageState,
  villagesDocuments,
  readRetiredProjectScenes,
}: SceneQueryPorts) {
  async function readHistoryPage(id: string, value: unknown): Promise<SceneHistoryPage> {
    const parsed = historyQuery.safeParse(value);
    if (!parsed.success) throw badRequest("Invalid Scene history query.");
    const query = parsed.data;
    const documents = villagesDocuments();
    const rawWorld = readVillageRoot(await documents.getById(VILLAGES_PACKAGE_ID, "villages-village"));
    if (!rawWorld) throw notFound("That Village is no longer available.");
    const world = z.object({ seed: z.string().min(1), setupAt: z.string() }).parse(rawWorld),
      scope = villageWorldScope(world);
    if (query.scope !== scope) throw conflict("That Village changed. Reopen the Scene.");
    const row = await documents.getById(VILLAGES_PACKAGE_ID, "villages-venue-visit-" + id);
    if (
      !row ||
      row.id !== "villages-venue-visit-" + id ||
      row.packageId !== VILLAGES_PACKAGE_ID ||
      row.kind !== SESSION_KIND
    )
      throw notFound("That Scene is no longer available.");
    const scene = readSceneIndex(row.data),
      raw = asRecord(row.data),
      continuity = asRecord(raw.continuity);
    if (
      scene.id !== id ||
      scene.villageSeed !== world.seed ||
      continuity.seed !== world.seed ||
      continuity.setupAt !== world.setupAt
    )
      throw notFound("That Scene is no longer available.");
    const transcript = readSceneTranscriptHead(raw.transcript, scene),
      submissions = readSceneSubmissionHead(raw.submissionHistory, scene);
    const head = readScenePublicHistoryHead(raw.publicHistory, scene, transcript, submissions);
    let direction: "older" | "newer" = "older",
      anchor = head.count;
    if (query.cursor) {
      let cursor: z.infer<typeof historyCursor>;
      try {
        cursor = historyCursor.parse(JSON.parse(Buffer.from(query.cursor, "base64url").toString("utf8")));
      } catch {
        throw badRequest("Invalid Scene history cursor.");
      }
      if (
        cursor.scope !== scope ||
        cursor.sceneId !== id ||
        cursor.version !== head.publicVersion ||
        cursor.anchor > head.count
      )
        throw conflict("Scene history changed. Refresh it to continue.");
      ({ direction, anchor } = cursor);
    }
    let start = direction === "older" ? Math.max(0, anchor - HISTORY_ROWS) : anchor;
    let end = direction === "older" ? anchor : Math.min(head.count, anchor + HISTORY_ROWS);
    const entries = await readScenePublicHistoryRange(documents, head, transcript.count, start, end);
    const source = await readSceneTranscriptPositions(
      documents,
      transcript,
      scene,
      entries.map((entry) => entry.position),
    );
    const projected = projectSceneHistoryPage(source, entries, scene.participants, head.privateHearing);
    let first = 0,
      last = projected.length,
      bytes = 0;
    // Keep one oversized exact entry readable; remaining entries stay behind their ordinary page cursors.
    if (direction === "older") {
      for (let index = projected.length - 1; index >= 0; index--) {
        const size = Buffer.byteLength(JSON.stringify(projected[index]), "utf8") + 1;
        if (bytes + size > HISTORY_BYTES && index < projected.length - 1) {
          first = index + 1;
          break;
        }
        bytes += size;
      }
    } else {
      for (let index = 0; index < projected.length; index++) {
        const size = Buffer.byteLength(JSON.stringify(projected[index]), "utf8") + 1;
        if (bytes + size > HISTORY_BYTES && index > 0) {
          last = index;
          break;
        }
        bytes += size;
      }
    }
    start += first;
    end = start + last - first;
    const cursor = (direction: "older" | "newer", anchor: number) =>
      Buffer.from(
        JSON.stringify({ v: 1, scope, sceneId: id, version: head.publicVersion, direction, anchor }),
      ).toString("base64url");
    return {
      sceneId: id,
      scope,
      version: head.publicVersion,
      lines: projected.slice(first, last),
      ...(start > 0 ? { olderCursor: cursor("older", start) } : {}),
      ...(end < head.count ? { newerCursor: cursor("newer", end) } : {}),
    };
  }
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
  return {
    readProjectTurnEvidence,
    progressBacklog: () => withRepairWork(progressBacklog),
    readHistoryPage: (id: string, query: unknown) => withRepairWork(() => readHistoryPage(id, query)),
  };
}
export type SceneQueryService = ReturnType<typeof createSceneQueryService>;
