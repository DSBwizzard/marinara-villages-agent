import type { VillageTimeAdvance } from "../../../shared/contracts/clock.js";
import type {
  MemoryCorrectRequest,
  MemoryForgetRequest,
  MemoryInspection,
  MemoryLibrary,
  MemoryListEntry,
} from "../../../shared/contracts/village.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { outsideVenueOperation } from "../../adapters/operations/operation-context.js";
import {
  advanceVillageClock,
  assertVillageClockWrite,
  villageNow,
  villageTimeAdvanceSettled,
} from "../../adapters/time/clock-gate.js";
import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import type { MemoryCandidate } from "../../domain/models/memories.js";
import type { VillageSnapshot, VillageState } from "../../domain/models/world.js";
import { calendarReplay } from "../../domain/rules/clock-recovery.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { MEMORY_TEXT_LIMIT } from "../../domain/rules/memory-integrity.js";
import { memoryTerms } from "../../domain/rules/memory-protection.js";
import { captureReturnContext } from "../../domain/rules/return-catchup-capture.js";
import { discoverReturnBatch, recordReturnVisibility } from "../../domain/rules/return-catchup-state.js";
import { inspectMemoryCandidates, projectMemories } from "../../domain/rules/memory-views.js";
import type { reconcileProjectLifecycles } from "../../domain/rules/project-lifecycle-rules.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import {
  correctVillageMemory as applyCorrection,
  forgetVillageMemory as applyForget,
} from "../../domain/rules/village-memories.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import type { preparePrivateSpaces } from "../../jobs/private-space-preparation.js";
import type { backfillAgendas, refreshVillagerRemaps, rollActiveAgendas } from "../residents/resident-agendas.js";
import type { completeVillageResidence } from "../venues/residences.js";
import type { buildVillageSnapshot } from "./snapshot.js";
import type { mutateVillageState, readVillageState } from "./village-store.js";

export interface WorldCoordinationPorts {
  readVillageAuthority: typeof import("./village-store.js").readVillageAuthority;
  mutateMemoryAuthority: (update: (state: VillageState) => void) => Promise<void>;
  reconcileResidentPlanning?: (now: Date) => Promise<void>;
  reconcileNarrative?: (now: Date) => Promise<void>;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
  villagesLogger: typeof villagesLogger;
  outsideVenueOperation: typeof outsideVenueOperation;
  completeVillageResidence: typeof completeVillageResidence;
  backfillAgendas: typeof backfillAgendas;
  refreshVillagerRemaps: typeof refreshVillagerRemaps;
  preparePrivateSpaces: typeof preparePrivateSpaces;
  reconcileProjectLifecycles: typeof reconcileProjectLifecycles;
  rollActiveAgendas: typeof rollActiveAgendas;
}

/** Owns world advancement and history connections. Construction never reads, writes or dispatches work. */
export function createWorldCoordination({
  readVillageAuthority,
  mutateMemoryAuthority,
  reconcileResidentPlanning,
  reconcileNarrative,
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  villagesLogger,
  outsideVenueOperation,
  completeVillageResidence,
  backfillAgendas,
  refreshVillagerRemaps,
  preparePrivateSpaces,
  reconcileProjectLifecycles,
  rollActiveAgendas,
}: WorldCoordinationPorts) {
  /**
   * Put the village back to how it was before it was founded.
   *
   * This is the destructive half of the pair the General settings panel offers,
   * and it is deliberately total: homes, villagers, their conversations, the
   * places, the notices, the narration style, the player's own details and the
   * uploaded map all go, and the clock starts over from the founding day. A
   * "start over" that quietly kept some of it would be worse than not offering it.
   */
  async function resetVillage(): Promise<VillageSnapshot> {
    await mutateVillageState(
      (state) => {
        Object.assign(state, defaultVillageState());
      },
      { memories: true, wishes: true },
    );
    return buildVillageSnapshot();
  }

  /**
   * Advance the village from its durable high-water mark to one exact instant.
   * Required local state is committed before optional narration is requested, so
   * an unavailable model can never stop time, schedules or wishes.
   */
  let reconciliation: Promise<unknown> = Promise.resolve();
  function reconcileVillage(options: { now?: Date; advanceTime?: VillageTimeAdvance } = {}): Promise<VillageSnapshot> {
    const result = reconciliation.then(async () => {
      try {
        return await reconcileAt(options);
      } finally {
        if (options.advanceTime) villageTimeAdvanceSettled();
      }
    });
    reconciliation = result.catch(() => {});
    return result;
  }
  async function reconcileAt(options: { now?: Date; advanceTime?: VillageTimeAdvance }): Promise<VillageSnapshot> {
    await assertVillageClockWrite();
    if (!options.advanceTime) await reconcileNarrative?.(options.now ?? villageNow());
    if (options.advanceTime) {
      const request = options.advanceTime;
      const departure = await readVillageAuthority({ memories: true, wishes: true });
      const hydrated = await readVillageState({ memories: true, wishes: true });
      await advanceVillageClock(request, (state, from, until) => {
        if (
          state.seed !== departure.seed ||
          state.setupAt !== departure.setupAt ||
          state.memories.revision !== departure.memories.revision
        )
          throw conflict("The Village changed. Refresh before advancing time.");
        const batch = state.returnCatchup?.batch;
        if (batch && !["completed", "cancelled"].includes(batch.status))
          throw conflict("Finish Village catch-up before advancing time.");
        const previousRelationships = state.relationshipContext;
        try {
          // Root authority must still match the saved departure. Relationship
          // authority is checked again by the opportunity admission path.
          departure.relationshipContext = undefined;
          state.relationshipContext = undefined;
          if (
            JSON.stringify(captureReturnContext(state, from).world) !==
            JSON.stringify(captureReturnContext(departure, from).world)
          )
            throw conflict("The Village changed. Refresh before advancing time.");
          state.relationshipContext = hydrated.relationshipContext;
          state.returnCatchup ??= {};
          state.returnCatchup.capture = captureReturnContext(state, from);
          const captured = state.returnCatchup.capture;
          discoverReturnBatch(state, until, request.actionId);
          // Even an empty selection must verify the separately stored relationship
          // authority before it is allowed to complete.
          if (state.returnCatchup.batch?.id === request.actionId && state.returnCatchup.batch.status === "completed") {
            state.returnCatchup.capture = captured;
            state.returnCatchup.batch.status = "queued";
          }
          if (until.getTime() - from.getTime() < 60 * 60_000) recordReturnVisibility(state, until);
        } finally {
          state.relationshipContext = previousRelationships;
        }
      });
    }
    let recorded = await readVillageState();
    const now = options.now ?? villageNow();
    if (!isVillageFounded(recorded)) return buildVillageSnapshot(now);
    if (recorded.foundingPreparation && recorded.foundingPreparation.status !== "ready")
      return buildVillageSnapshot(now);
    let completedMove = false;
    for (const residence of recorded.residences) {
      if (residence.status !== "moving" || Date.parse(residence.completesAt ?? "") > now.getTime()) continue;
      try {
        await completeVillageResidence(residence.characterId, false, now, false);
        completedMove = true;
      } catch (error) {
        villagesLogger().warn("[villages] pending move could not complete: %s", String(error));
      }
    }
    if (completedMove) recorded = await readVillageState();
    await mutateVillageState(
      (state) => {
        reconcileProjectLifecycles(state, now);
      },
      {
        memories: (world) =>
          world.projects.some(
            (project) =>
              project.status === "working" &&
              Date.parse(project.lifecycle?.workOrder?.completesAt ?? "") <= now.getTime(),
          ),
      },
    );
    recorded = await readVillageState();
    const moment = deriveVillageMoment({
      foundedAt: recorded.foundedAt,
      environment: recorded.narrative,
      seed: recorded.seed,
      timeZone: recorded.timeZone || undefined,
      now,
    });
    const currentMs = Date.parse(moment.instant);
    // These are deterministic reconciliation rules. They run for both the live
    // timer and restart catch-up, irrespective of background pace.
    await rollActiveAgendas(now);
    await mutateVillageState((state) => {
      const storedMs = Date.parse(state.simulatedThrough);
      if (!Number.isFinite(storedMs) || currentMs > storedMs) state.simulatedThrough = moment.instant;
      state.lastKnownTimeZone = moment.timeZone;
    });

    if (calendarReplay(await readVillageState(), now)) return buildVillageSnapshot(now);
    // Discover optional paid work only after deterministic advancement has committed.
    // Initial space preparation retains the founding generation path; begin it only after local advancement.
    outsideVenueOperation(() => {
      void preparePrivateSpaces().catch(() => {});
    });
    const withAgendas = await backfillAgendas(await readVillageState(), now);
    await refreshVillagerRemaps(withAgendas, now);
    await reconcileResidentPlanning?.(now);
    return buildVillageSnapshot(now);
  }

  /**
   * The whole of what the village remembers, newest first, as the story tab draws
   * it.
   *
   * Read on its own route rather than folded into the snapshot, for the same
   * reason the town map is: the snapshot is read on every chat send and on every
   * pulse, and a story that grows forever has no business being re-sent with it.
   *
   * Two things are resolved here and nowhere else. The calendar date is derived
   * from `foundedAt` so the tab never does clock arithmetic, and each actor's name
   * is read back off the live card, falling back to the name the village wrote
   * down — the same rule `projectVillager` and `projectHomes` follow, so a
   * villager's own memory does not go nameless when their card is deleted.
   *
   * `at` travels untouched. It is shown and never read.
   */
  type MemoryQuery = {
    inspection?: boolean;
    characterId?: string;
    query?: string;
    limit?: number;
    cursor?: { revision: number; afterId: string };
  };
  const memoryPerson = (state: import("../../domain/models/world.js").VillageState, id: string) => ({
    id,
    name:
      id === "player"
        ? state.playerName || "You"
        : (state.villagers.find((row) => row.characterId === id)?.cardSnapshot.name ?? "Former resident"),
  });
  function memoryEntry(
    state: import("../../domain/models/world.js").VillageState,
    row: MemoryCandidate,
  ): MemoryListEntry {
    const knowledge = Object.values(row.knowers);
    return {
      id: row.id,
      rootId: row.rootId,
      revision: row.revision,
      rootRevision: row.rootRevision,
      kind: row.kind,
      text: row.text,
      occurredAt: row.occurredAt,
      recordedAt: row.recordedAt,
      subjects: row.subjects.map((id) => memoryPerson(state, id)),
      knownBy: Object.keys(row.knowers).map((id) => memoryPerson(state, id)),
      forgotten: knowledge.some((row) => !!row.forgotten),
      playerCorrection: knowledge.some((row) => !!row.repair),
    };
  }
  async function buildVillageMemories(input: MemoryQuery = {}): Promise<MemoryLibrary> {
    const state = await readVillageAuthority();
    const characterId = input.inspection ? input.characterId || "player" : "player";
    const limit = input.limit ?? 50,
      query = (input.query ?? "").trim();
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || query.length > 400)
      throw badRequest("Invalid memory page.");
    if (input.cursor && input.cursor.revision !== state.memories.revision)
      throw conflict("Memories changed. Refresh the list.");
    const terms = memoryTerms(query);
    const candidates = input.inspection
      ? inspectMemoryCandidates(state.memories, characterId)
      : projectMemories(state.memories, ["player"]);
    const rows = candidates
      .filter((row) => {
        const text = [
          row.text,
          row.id,
          row.rootId,
          ...row.subjects,
          ...Object.values(row.knowers).flatMap((knower) => knower.support.map((e) => e.excerpt)),
        ]
          .join(" ")
          .toLocaleLowerCase("en-US");
        return terms.every((term) => text.includes(term));
      })
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id));
    const after = input.cursor ? rows.findIndex((row) => row.id === input.cursor!.afterId) : -1;
    if (input.cursor && after < 0) throw conflict("The memory page changed. Refresh the list.");
    const selected = rows.slice(after + 1, after + 1 + limit);
    return {
      inspection: input.inspection === true,
      seed: state.seed,
      revision: state.memories.revision,
      characterId,
      query,
      residents: [memoryPerson(state, "player"), ...state.villagers.map((row) => memoryPerson(state, row.characterId))],
      entries: selected.map((row) => memoryEntry(state, row)),
      total: rows.length,
      next:
        after + 1 + limit < rows.length ? { revision: state.memories.revision, afterId: selected.at(-1)!.id } : null,
    };
  }
  async function readVillageMemoryEvidence(
    id: string,
    inspection = false,
    characterId = "player",
  ): Promise<MemoryInspection> {
    const state = await readVillageAuthority();
    const audience = inspection ? characterId : "player";
    const selected = (
      inspection ? inspectMemoryCandidates(state.memories, audience) : projectMemories(state.memories, ["player"])
    ).find((row) => row.id === id || row.rootId === id);
    if (!selected) throw notFound("That memory is unavailable.");
    const stored = state.memories.records.find((row) => row.id === selected.id)!;
    const root = state.memories.records.find((row) => row.id === stored.rootId)!;
    const knowers = inspection ? stored.knowers : selected.knowers;
    return {
      seed: state.seed,
      revision: state.memories.revision,
      entry: memoryEntry(state, selected),
      knowers: Object.entries(knowers).map(([knower, value]) => ({
        person: memoryPerson(state, knower),
        basis: value.basis,
        ...(value.attributedTo ? { attributedTo: value.attributedTo } : {}),
        learnedAt: value.learnedAt,
        reinforcedAt: value.reinforcedAt,
        forgotten: !!root.knowers[knower]?.forgotten,
        playerCorrection: !!root.knowers[knower]?.repair,
        text: root.knowers[knower]?.repair?.text ?? stored.text,
        support: value.support.map((e) => ({
          sourceId: e.source.id,
          ...(e.source.sceneId ? { sceneId: e.source.sceneId } : {}),
          lineId: e.lineId,
          excerpt: e.excerpt,
        })),
      })),
    };
  }
  async function forgetMemory(id: string, input: MemoryForgetRequest) {
    return mutateMemory(id, input, "forget");
  }
  async function correctMemory(id: string, input: MemoryCorrectRequest) {
    if (
      typeof input?.text !== "string" ||
      !input.text.trim() ||
      Buffer.byteLength(input.text, "utf8") > MEMORY_TEXT_LIMIT
    )
      throw badRequest("Enter a shorter, non-empty correction.");
    return mutateMemory(id, input, "repair");
  }
  async function mutateMemory(
    id: string,
    input: MemoryForgetRequest | MemoryCorrectRequest,
    action: "forget" | "repair",
  ) {
    if (
      !input ||
      input.target?.id !== id ||
      !input.operationId ||
      !Array.isArray(input.knowers) ||
      !input.knowers.length
    )
      throw badRequest("Choose existing memory knowers.");
    await mutateMemoryAuthority((state) => {
      if (state.seed !== input.seed) throw conflict("Village identity changed.");
      try {
        (action === "forget" ? applyForget : applyCorrection)(
          state,
          {
            operationId: input.operationId,
            expectedCollectionRevision: input.expectedCollectionRevision,
            target: input.target,
            knowers: input.knowers,
            action,
            ...(action === "repair" ? { text: (input as MemoryCorrectRequest).text } : {}),
          },
          villageNow(state.clock?.advanceMs ?? 0).toISOString(),
        );
      } catch (error) {
        throw conflict(error instanceof Error ? error.message : "The memory changed.");
      }
    });
  }

  return {
    resetVillage,
    reconcileVillage,
    buildVillageMemories,
    readVillageMemoryEvidence,
    forgetMemory,
    correctMemory,
  };
}
export type WorldCoordination = ReturnType<typeof createWorldCoordination>;
