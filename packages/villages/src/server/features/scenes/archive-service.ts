import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_KIND, SESSION_PREFIX } from "../../adapters/storage/scene-store.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import type { VenueScene, VenueParticipant } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { pendingProgressTurns } from "../../domain/rules/scene-record.js";

export interface SceneArchivePorts {
  villagesDocuments(): Pick<CapabilityDocumentStore, "list" | "getById" | "remove">;
  readSession(id: string): Promise<VenueScene>;
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  processSavedProgressSubmission(sessionId: string, submissionId: string): Promise<void>;
  removeInterpretationDiagnostics(sessionId: string): Promise<void>;
}
/** Owns archive commands and their lazy connections. Construction performs no work. */
export function createSceneArchive({
  villagesDocuments,
  readSession,
  readVillageState,
  mutateVillageState,
  processSavedProgressSubmission,
  removeInterpretationDiagnostics,
}: SceneArchivePorts) {
  async function listVenueVisits(filter: { placeId?: string; characterId?: string } = {}): Promise<VenueScene[]> {
    const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
    return records
      .map((record) => coerceSession(record.data))
      .filter(
        (session) =>
          session.status === "closed" &&
          (!filter.placeId || session.placeId === filter.placeId) &&
          (!filter.characterId || session.participants.some((person) => person.characterId === filter.characterId)),
      )
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  async function readVenueVisit(id: string): Promise<VenueScene> {
    const session = await readSession(id);
    if (session.status !== "closed") throw notFound("That Scene is not in the archive.");
    return session;
  }

  async function listVenueVisitSummaries(
    filter: { placeId?: string; characterId?: string; offset?: number; limit?: number } = {},
  ): Promise<{
    visits: {
      id: string;
      placeId: string;
      placeName: string;
      startedAt: string;
      endedAt: string;
      endReason: VenueScene["endReason"];
      participants: VenueParticipant[];
      lineCount: number;
      memoryUnits: number;
      recollectionCount: number;
    }[];
    total: number;
  }> {
    await pruneVenueVisits();
    const visits = await listVenueVisits(filter);
    const offset = Number.isFinite(filter.offset) ? Math.max(0, Math.floor(filter.offset!)) : 0;
    const limit = Number.isFinite(filter.limit) ? Math.min(100, Math.max(1, Math.floor(filter.limit!))) : 20;
    return {
      total: visits.length,
      visits: visits.slice(offset, offset + limit).map((visit) => ({
        id: visit.id,
        placeId: visit.placeId,
        placeName: visit.placeName,
        startedAt: visit.startedAt,
        endedAt: visit.endedAt,
        endReason: visit.endReason,
        participants: visit.participants,
        lineCount: visit.lines.length,
        memoryUnits: 0,
        recollectionCount: visit.submissions.flatMap((turn) => turn.liveProposals?.memoryChanges ?? []).length,
      })),
    };
  }

  async function deleteVenueVisit(id: string): Promise<void> {
    const before = await readSession(id);
    if (before.submissions.some((turn) => turn.processing && unfinishedExchange(turn.processing)))
      throw conflict("This Scene has unfinished saved changes. Replay or explicitly resolve them before deletion.");
    for (const turn of pendingProgressTurns(before, (await readVillageState()).foundedAt))
      await processSavedProgressSubmission(id, turn.id);
    const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
    if (!document || coerceSession(document.data).status !== "closed")
      throw notFound("That Scene is not in the archive.");
    if (!(await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision)))
      throw conflict("The Scene changed while it was being deleted. Try again.");
  }

  async function deleteAllVenueVisits(): Promise<void> {
    const documents = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
    for (const document of documents)
      if (coerceSession(document.data).status === "closed") await deleteVenueVisit(coerceSession(document.data).id);
  }

  async function setVenueVisitRetention(value: unknown): Promise<void> {
    const input = asRecord(value);
    const mode = input.mode;
    const count = Number(input.value);
    if (mode !== "forever" && mode !== "count" && mode !== "days") throw badRequest("Choose a Scene retention mode.");
    if (mode === "count" && (!Number.isInteger(count) || count < 1 || count > 1_000))
      throw badRequest("Keep between 1 and 1,000 Scenes.");
    if (mode === "days" && (!Number.isInteger(count) || count < 30 || count > 3_650))
      throw badRequest("Retire Scenes after 30 to 3,650 days.");
    await mutateVillageState((state) => {
      state.visitRetention = mode === "forever" ? { mode, value: 0 } : { mode, value: count };
    });
    await pruneVenueVisits();
  }

  async function pruneVenueVisits(): Promise<void> {
    const village = await readVillageState();
    const retention = village.visitRetention;
    if (retention.mode === "forever") return;
    const documents = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
    const eligible = documents
      .map((document) => ({ document, session: coerceSession(document.data) }))
      .filter(
        ({ session }) =>
          session.status === "closed" &&
          !session.submissions.some((turn) => turn.processing && unfinishedExchange(turn.processing)) &&
          pendingProgressTurns(session, village.foundedAt).length === 0,
      )
      .sort((a, b) => b.session.startedAt.localeCompare(a.session.startedAt));
    const cutoff = Date.now() - retention.value * 86_400_000;
    const expired =
      retention.mode === "count"
        ? eligible.slice(retention.value)
        : eligible.filter(({ session }) => Date.parse(session.endedAt || session.startedAt) < cutoff);
    for (const { document, session } of expired) {
      if (await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision))
        await removeInterpretationDiagnostics(session.id);
    }
  }
  return {
    listVenueVisits,
    readVenueVisit,
    listVenueVisitSummaries,
    deleteVenueVisit,
    deleteAllVenueVisits,
    setVenueVisitRetention,
    pruneVenueVisits,
  };
}
export type SceneArchive = ReturnType<typeof createSceneArchive>;
