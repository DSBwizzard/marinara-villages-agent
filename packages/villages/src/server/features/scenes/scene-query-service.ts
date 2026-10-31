import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { z } from "zod";
import type { SceneHistoryPage } from "../../../shared/contracts/scene-history.js";
import type { ScenePlaybackWindow, ScenePlaybackMoment } from "../../../shared/contracts/scene-playback.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import { publicSceneAuthority } from "../../domain/rules/scene-public.js";
import { operationSummary } from "../../adapters/operations/operation-context.js";
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
import { readSceneMomentFrames, readSceneMomentRange } from "../../adapters/storage/scene-presentation-pages.js";
export interface SceneQueryPorts {
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  villagesDocuments(): Pick<CapabilityDocumentStore, "list" | "getById">;
  readRetiredProjectScenes?(seed: string): Promise<import("../../domain/models/scene-model.js").VenueScene[]>;
}
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const historyQuery = z.object({ scope: hash, cursor: z.string().min(1).max(4096).optional() }).strict();
const playbackQuery = historyQuery
  .extend({ first: z.literal("1").optional() })
  .refine((value) => !(value.first && value.cursor));
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
const playbackCursor = z
  .object({
    v: z.literal(1),
    scope: hash,
    sceneId: z.string().min(1).max(180),
    direction: z.enum(["older", "newer", "around"]),
    index: z.number().int().nonnegative().safe(),
    id: z.string().min(1),
    digest: hash,
  })
  .strict();
/** Inert internal Scene evidence/backlog queries with explicit originating connections. */
export function createSceneQueryService({
  readSession,
  readVillageState,
  villagesDocuments,
  readRetiredProjectScenes,
}: SceneQueryPorts) {
  async function readPublicOwner(id: string, requestedScope?: string) {
    const documents = villagesDocuments();
    const rawWorld = readVillageRoot(await documents.getById(VILLAGES_PACKAGE_ID, "villages-village"));
    if (!rawWorld) throw notFound("That Village is no longer available.");
    const world = z.object({ seed: z.string().min(1), setupAt: z.string() }).parse(rawWorld),
      scope = villageWorldScope(world);
    if (requestedScope !== undefined && requestedScope !== scope)
      throw conflict("That Village changed. Reopen the Scene.");
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
    return { documents, scope, scene, transcript, head };
  }
  async function readHistoryPage(id: string, value: unknown): Promise<SceneHistoryPage> {
    const parsed = historyQuery.safeParse(value);
    if (!parsed.success) throw badRequest("Invalid Scene history query.");
    const query = parsed.data;
    const { documents, scope, scene, transcript, head } = await readPublicOwner(id, query.scope);
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
  async function readPlaybackPage(id: string, value: unknown): Promise<ScenePlaybackWindow> {
    const parsed = playbackQuery.safeParse(value);
    if (!parsed.success) throw badRequest("Invalid Scene playback query.");
    return playbackWindow(await readPublicOwner(id, parsed.data.scope), parsed.data.cursor, parsed.data.first === "1");
  }
  async function projectSceneResponse(value: Record<string, unknown>) {
    let scene = value as VenueScene;
    let owner = await readPublicOwner(scene.id);
    if (owner.scene.sceneRevision !== scene.sceneRevision) {
      scene = await readSession(scene.id);
      owner = await readPublicOwner(scene.id);
      if (owner.scene.sceneRevision !== scene.sceneRevision)
        throw conflict("The Scene changed. Check the saved reply.");
    }
    const { lines, participants, ...playback } = await playbackWindow(owner);
    const cast = new Set([...scene.activeIds, ...participants.map((person) => person.characterId)]);
    return {
      ...publicSceneAuthority(scene),
      lines,
      playback,
      participants: scene.participants.filter((person) => cast.has(person.characterId)),
      operation: operationSummary(scene.operation, scene.rejectedSubmissions),
    };
  }
  async function playbackWindow(
    { documents, scope, scene, transcript, head }: Awaited<ReturnType<typeof readPublicOwner>>,
    encodedCursor?: string,
    fromBeginning = false,
  ): Promise<ScenePlaybackWindow> {
    const id = scene.id;
    const presentation = head.presentation;
    let direction: "older" | "newer" | "around" = fromBeginning ? "newer" : "older",
      anchor = fromBeginning ? 0 : presentation.count;
    if (encodedCursor) {
      let cursor: z.infer<typeof playbackCursor>;
      try {
        cursor = playbackCursor.parse(JSON.parse(Buffer.from(encodedCursor, "base64url").toString("utf8")));
      } catch {
        throw badRequest("Invalid Scene playback cursor.");
      }
      if (cursor.scope !== scope || cursor.sceneId !== id || cursor.index >= presentation.count)
        throw conflict("That reading position changed. Reopen the Scene.");
      const [saved] = await readSceneMomentRange(
        documents,
        presentation,
        transcript.count,
        cursor.index,
        cursor.index + 1,
      );
      if (saved.id !== cursor.id || saved.publicDigest !== cursor.digest)
        throw conflict("That reading position changed. Reopen the Scene.");
      direction = cursor.direction;
      anchor = cursor.index + (direction === "newer" ? 1 : 0);
    }
    const start = direction === "older" ? Math.max(0, anchor - HISTORY_ROWS) : anchor;
    const end = direction === "older" ? anchor : Math.min(presentation.count, anchor + HISTORY_ROWS);
    const entries = await readSceneMomentRange(documents, presentation, transcript.count, start, end);
    const frames = await readSceneMomentFrames(documents, presentation, entries, scene);
    const positions = entries.flatMap((entry) => entry.lines);
    const lines = await readSceneTranscriptPositions(
      documents,
      transcript,
      scene,
      positions.map((entry) => entry.position),
    );
    const projected = projectSceneHistoryPage(lines, positions, scene.participants, head.privateHearing);
    const byId = new Map(projected.map((line) => [line.id, line]));
    const cursor = (direction: "older" | "newer" | "around", index: number) => {
      const entry = entries[index - start];
      return Buffer.from(
        JSON.stringify({ v: 1, scope, sceneId: id, direction, index, id: entry.id, digest: entry.publicDigest }),
      ).toString("base64url");
    };
    const moments: ScenePlaybackMoment[] = entries.map((entry, offset) => ({
      id: entry.id,
      index: start + offset,
      paragraphStart: entry.paragraphStart,
      paragraphs: entry.paragraphs,
      lineIds: entry.lines.map((line) => line.id),
      anchorCursor: cursor("around", start + offset),
      ...frames[offset],
    }));
    const momentLines = entries.map((entry) => entry.lines.map((line) => byId.get(line.id)!));
    const participants = new Map(scene.participants.map((person) => [person.characterId, person]));
    const sizes = moments.map((moment, index) => {
      const ids = new Set([
        ...moment.start.activeIds,
        ...moment.end.activeIds,
        ...momentLines[index].flatMap((line) => [line.speakerId, ...(line.targetId ? [line.targetId] : [])]),
      ]);
      return Buffer.byteLength(
        JSON.stringify({
          moment,
          lines: momentLines[index],
          participants: [...ids].flatMap((id) => (participants.has(id) ? [participants.get(id)] : [])),
        }),
        "utf8",
      );
    });
    let first = 0,
      last = entries.length,
      bytes = 0;
    if (direction === "older") {
      for (let index = sizes.length - 1; index >= 0; index--) {
        if (bytes + sizes[index] > HISTORY_BYTES && index < sizes.length - 1) {
          first = index + 1;
          break;
        }
        bytes += sizes[index];
      }
    } else {
      for (let index = 0; index < sizes.length; index++) {
        if (bytes + sizes[index] > HISTORY_BYTES && index > 0) {
          last = index;
          break;
        }
        bytes += sizes[index];
      }
    }
    const visibleMoments = moments.slice(first, last),
      visibleLines = momentLines.slice(first, last).flat();
    const cast = new Set([
      ...visibleMoments.flatMap((moment) => [...moment.start.activeIds, ...moment.end.activeIds]),
      ...visibleLines.flatMap((line) => [line.speakerId, ...(line.targetId ? [line.targetId] : [])]),
    ]);
    const olderCursor = start + first > 0 ? cursor("older", start + first) : undefined;
    const newerCursor = last > first ? cursor("newer", start + last - 1) : undefined;
    return {
      sceneId: id,
      scope,
      version: presentation.publicVersion,
      total: presentation.count,
      totalParagraphs: presentation.paragraphs,
      moments: visibleMoments,
      lines: visibleLines,
      participants: scene.participants.filter((person) => cast.has(person.characterId)),
      ...(olderCursor ? { olderCursor } : {}),
      ...(newerCursor ? { newerCursor } : {}),
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
    readPlaybackPage: (id: string, query: unknown) => withRepairWork(() => readPlaybackPage(id, query)),
    projectSceneResponse: (scene: Record<string, unknown>) => withRepairWork(() => projectSceneResponse(scene)),
  };
}
export type SceneQueryService = ReturnType<typeof createSceneQueryService>;
