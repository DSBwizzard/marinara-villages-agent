import { rememberDomainFact } from "../../domain/rules/domain-memories.js";
import type {
  MemoryLibrary,
  MemoryInspection,
  MemoryListEntry,
  MemoryForgetRequest,
} from "../../../shared/contracts/village.js";
import type { MemoryCandidate } from "../../domain/models/memories.js";
import { inspectMemoryCandidates, projectMemories } from "../../domain/rules/memory-views.js";
import { forgetVillageMemory as applyForget } from "../../domain/rules/village-memories.js";
import { memoryTerms } from "../../domain/rules/memory-protection.js";
import { calendarReplay } from "../../domain/rules/clock-recovery.js";
import {
  advanceVillageClock,
  assertVillageClockWrite,
  villageNow,
  villageTimeAdvanceSettled,
} from "../../adapters/time/clock-gate.js";
import type { VillageTimeAdvance } from "../../../shared/contracts/clock.js";
import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageVenue } from "../../domain/models/world.js";
import { badRequest, notFound, conflict } from "../../domain/rules/errors.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { villagerPlaceView } from "../../domain/rules/village-projections.js";
import { wishExpired } from "../../domain/rules/wish-definition.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { sceneWishProtected, sceneWishProtectionFinished } from "../../domain/rules/scene-wish-protection.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import { backgroundRevision } from "../../domain/rules/background-revision.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { outsideVenueOperation } from "../../adapters/operations/operation-context.js";
import type { completeVillageResidence, retryResidencePrivateSpaceAdaptation } from "../venues/residences.js";
import type { backfillAgendas, refreshVillagerRemaps } from "../residents/resident-agendas.js";
import type { preparePrivateSpaces } from "../../jobs/private-space-preparation.js";
import type { reconcileProjectLifecycles } from "../../domain/rules/project-lifecycle-rules.js";
import type { rollActiveAgendas } from "../residents/resident-agendas.js";
import type { expireResidentWishes } from "../../domain/rules/wish-lifecycle-rules.js";
import type { reconcileWishLifecycle } from "../residents/wishes/wish-lifecycle.js";
import type { respondDueVenueMail } from "../venues/venue-mailbox.js";
import type { buildVillageSnapshot } from "./snapshot.js";
import type { readVillageState, mutateVillageState } from "./village-store.js";

export interface WorldCoordinationPorts {
  readVillageAuthority: typeof import("./village-store.js").readVillageAuthority;
  reconcileDevelopment?: (now: Date) => Promise<void>;
  reconcileResidentPlanning?: (now: Date) => Promise<void>;
  processProjectWishOutbox?: typeof import("../residents/wishes/wish-progress.js").processProjectWishOutbox;
  readScene?: typeof import("../../adapters/storage/scene-store.js").readSession;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
  villagesLogger: typeof villagesLogger;
  outsideVenueOperation: typeof outsideVenueOperation;
  completeVillageResidence: typeof completeVillageResidence;
  retryResidencePrivateSpaceAdaptation: typeof retryResidencePrivateSpaceAdaptation;
  backfillAgendas: typeof backfillAgendas;
  refreshVillagerRemaps: typeof refreshVillagerRemaps;
  preparePrivateSpaces: typeof preparePrivateSpaces;
  reconcileProjectLifecycles: typeof reconcileProjectLifecycles;
  rollActiveAgendas: typeof rollActiveAgendas;
  expireResidentWishes: typeof expireResidentWishes;
  reconcileWishLifecycle: typeof reconcileWishLifecycle;
  respondDueVenueMail: typeof respondDueVenueMail;
}

/** Owns world advancement and history connections. Construction never reads, writes or dispatches work. */
export function createWorldCoordination({
  readVillageAuthority,
  reconcileDevelopment,
  reconcileResidentPlanning,
  processProjectWishOutbox,
  readScene,
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  villagesLogger,
  outsideVenueOperation,
  completeVillageResidence,
  retryResidencePrivateSpaceAdaptation,
  backfillAgendas,
  refreshVillagerRemaps,
  preparePrivateSpaces,
  reconcileProjectLifecycles,
  rollActiveAgendas,
  expireResidentWishes,
  reconcileWishLifecycle,
  respondDueVenueMail,
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
      { memories: true },
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
    if (options.advanceTime) await advanceVillageClock(options.advanceTime);
    let recorded = await readVillageState();
    const now = options.now ?? villageNow();
    if (!isVillageFounded(recorded)) return buildVillageSnapshot(now);
    if (recorded.foundingPreparation && recorded.foundingPreparation.status !== "ready")
      return buildVillageSnapshot(now);
    // Recover a crash between Scene closure/removal and release of its hold.
    // Unknown read failures preserve the hold for a later pass.
    if (readScene) {
      const releasable: string[] = [];
      for (const [id, protection] of Object.entries(recorded.sceneWishProtections ?? {})) {
        if (protection.seed !== recorded.seed) {
          releasable.push(id);
          continue;
        }
        try {
          const scene = await readScene(id);
          if (scene.villageSeed !== recorded.seed || sceneWishProtectionFinished(scene, recorded.foundedAt))
            releasable.push(id);
        } catch (error) {
          if (asRecord(error).statusCode === 404) releasable.push(id);
        }
      }
      if (releasable.length)
        await mutateVillageState((state) => {
          if (state.seed === recorded.seed) for (const id of releasable) delete state.sceneWishProtections?.[id];
        });
    }
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
    await processProjectWishOutbox?.();
    recorded = await readVillageState();
    const moment = deriveVillageMoment({
      foundedAt: recorded.foundedAt,
      seed: recorded.seed,
      timeZone: recorded.timeZone || undefined,
      now,
    });
    const currentMs = Date.parse(moment.instant);
    // These are deterministic reconciliation rules. They run for both the live
    // timer and restart catch-up, irrespective of background pace.
    await mutateVillageState((state) => {
      for (const resident of state.villagers) {
        const expired =
          resident.agenda?.wishes.filter(
            (wish) => wishExpired(wish, now.getTime()) && !sceneWishProtected(state, resident.characterId, wish),
          ) ?? [];
        if (expired.length)
          state.wishRefillIntents[resident.characterId] = {
            id: backgroundRevision(expired.map((wish) => wish.id)),
            settled: expired.map((wish) => wish.wish).join("; "),
          };
        expireResidentWishes(resident, now, state);
      }
    });
    await rollActiveAgendas(now);
    await mutateVillageState(
      (state) => {
        const storedMs = Date.parse(state.simulatedThrough);
        if (!Number.isFinite(storedMs) || currentMs > storedMs) state.simulatedThrough = moment.instant;
        state.lastKnownTimeZone = moment.timeZone;
        for (const venue of state.venues) {
          for (const zone of venueZones(venue)) {
            const remaining = [] as NonNullable<VillageVenue["state"]["traces"]>;
            for (const trace of zone.state.traces ?? []) {
              if (trace.expiresAt && Date.parse(trace.expiresAt) <= currentMs) continue;
              if (trace.kind === "scene-note") {
                remaining.push(trace);
                continue;
              }
              const created = Date.parse(trace.createdAt);
              if (!Number.isFinite(created) || currentMs - created < 60_000) {
                remaining.push(trace);
                continue;
              }
              const present = state.villagers.filter((villager) => {
                const destination = villagerPlaceView(state, villager, null, moment.minuteOfDay, now);
                return destination?.id === venue.id && destination.zoneId === zone.id;
              });
              const finders = present.filter((villager) =>
                trace.kind === "note"
                  ? villager.characterId === trace.recipientId
                  : !(trace.seenBy ?? []).includes(villager.characterId),
              );
              for (const finder of finders) {
                const id = `${trace.id}:found:${finder.characterId}`;
                rememberDomainFact(state, {
                  id,
                  at: moment.instant,
                  recordedAt: moment.instant,
                  subjects: [finder.characterId],
                  knowers: [finder.characterId],
                  text:
                    trace.kind === "note"
                      ? `${finder.cardSnapshot.name} found a note at ${venue.name}: ${trace.text}`
                      : `${finder.cardSnapshot.name} noticed ${trace.text} at ${venue.name}.`,
                });
              }
              if (trace.kind !== "note" || finders.length === 0)
                remaining.push({
                  ...trace,
                  seenBy: [...new Set([...(trace.seenBy ?? []), ...finders.map((finder) => finder.characterId)])],
                });
            }
            zone.state.traces = remaining;
          }
        }
      },
      {
        memories: (world) =>
          world.venues.some((venue) => venueZones(venue).some((zone) => !!zone.state.traces?.length)),
      },
    );

    if (calendarReplay(await readVillageState(), now)) return buildVillageSnapshot(now);
    // Discover optional paid work only after deterministic advancement has committed.
    await reconcileDevelopment?.(now);
    await respondDueVenueMail(now);
    // Initial space preparation retains the founding generation path; begin it only after local advancement.
    outsideVenueOperation(() => {
      void preparePrivateSpaces().catch(() => {});
    });
    const pendingRooms = (await readVillageState()).venues.flatMap(
      (venue) => venue.privateSpaces?.filter((room) => room.adaptationPending).map((room) => room.ownerId) ?? [],
    );
    for (const characterId of new Set(pendingRooms)) await retryResidencePrivateSpaceAdaptation(characterId);
    const withAgendas = await backfillAgendas(await readVillageState(), now);
    await refreshVillagerRemaps(withAgendas, now);
    await reconcileWishLifecycle(now);
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
      entry: memoryEntry(state, selected),
      knowers: Object.entries(knowers).map(([knower, value]) => ({
        person: memoryPerson(state, knower),
        basis: value.basis,
        ...(value.attributedTo ? { attributedTo: value.attributedTo } : {}),
        learnedAt: value.learnedAt,
        reinforcedAt: value.reinforcedAt,
        forgotten: !!root.knowers[knower]?.forgotten,
        playerCorrection: !!root.knowers[knower]?.repair,
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
    if (
      !input ||
      input.target?.id !== id ||
      !input.operationId ||
      !Array.isArray(input.knowers) ||
      !input.knowers.length
    )
      throw badRequest("Choose existing memory knowers.");
    await mutateVillageState(
      (state) => {
        if (state.seed !== input.seed) throw conflict("Village identity changed.");
        try {
          applyForget(
            state,
            {
              operationId: input.operationId,
              expectedCollectionRevision: input.expectedCollectionRevision,
              target: input.target,
              knowers: input.knowers,
              action: "forget",
            },
            villageNow().toISOString(),
          );
        } catch (error) {
          throw conflict(error instanceof Error ? error.message : "The memory changed.");
        }
      },
      { memories: true },
    );
  }

  return {
    resetVillage,
    reconcileVillage,
    buildVillageMemories,
    readVillageMemoryEvidence,
    forgetMemory,
  };
}
export type WorldCoordination = ReturnType<typeof createWorldCoordination>;
