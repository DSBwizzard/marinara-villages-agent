import { calendarReplay } from "../../domain/rules/clock-recovery.js";
import { assertVillageClockWrite, villageNow } from "../../adapters/time/clock-gate.js";
import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import type {
  VillageChronicleEntry,
  VillageChronicleEntryView,
  VillageSnapshot,
  VillageVenue,
} from "../../domain/models/world.js";
import { asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, notFound } from "../../domain/rules/errors.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment, villageDateLabel } from "../../domain/rules/village-clock.js";
import { villagerPlaceView } from "../../domain/rules/village-projections.js";
import { wishExpired } from "../../domain/rules/wish-definition.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { sceneWishProtected, sceneWishProtectionFinished } from "../../domain/rules/scene-wish-protection.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import { backgroundRevision } from "../../domain/rules/background-revision.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { listVillagerCards } from "../../adapters/engine/catalog.js";
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
  reconcileDevelopment?: (now: Date) => Promise<void>;
  reconcileResidentPlanning?: (now: Date) => Promise<void>;
  processProjectWishOutbox?: typeof import("../residents/wishes/wish-progress.js").processProjectWishOutbox;
  readScene?: typeof import("../../adapters/storage/scene-store.js").readSession;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
  villagesLogger: typeof villagesLogger;
  listVillagerCards: typeof listVillagerCards;
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
  reconcileDevelopment,
  reconcileResidentPlanning,
  processProjectWishOutbox,
  readScene,
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  villagesLogger,
  listVillagerCards,
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
    await mutateVillageState((state) => {
      Object.assign(state, defaultVillageState());
    });
    return buildVillageSnapshot();
  }

  /**
   * Advance the village from its durable high-water mark to one exact instant.
   * Required local state is committed before optional narration is requested, so
   * an unavailable model can never stop time, schedules or wishes.
   */
  async function reconcileVillage(options: { now?: Date } = {}): Promise<VillageSnapshot> {
    await assertVillageClockWrite();
    const now = options.now ?? villageNow();
    let recorded = await readVillageState();
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
    await mutateVillageState((state) => {
      reconcileProjectLifecycles(state, now);
    });
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
    await mutateVillageState((state) => {
      const storedMs = Date.parse(state.simulatedThrough);
      if (!Number.isFinite(storedMs) || currentMs > storedMs) state.simulatedThrough = moment.instant;
      state.lastKnownTimeZone = moment.timeZone;
      const discoveries: VillageChronicleEntry[] = [];
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
              if (state.chronicle.some((entry) => entry.id === id)) continue;
              discoveries.push({
                id,
                dayIndex: moment.dayIndex,
                clock: moment.dayPhase,
                occurredAt: moment.instant,
                timePrecision: "exact",
                scope: "private",
                actors: [{ id: finder.characterId, name: finder.cardSnapshot.name }],
                kind: "chat",
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
      if (discoveries.length) state.chronicle = [...discoveries, ...state.chronicle];
    });

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
   * `at` travels untouched. It is shown and never read; see `VillageChronicleEntry`.
   */
  async function buildVillageStory(): Promise<VillageChronicleEntryView[]> {
    const [village, cards] = await Promise.all([readVillageState(), listVillagerCards()]);
    const names = new Map(cards.map((card) => [card.id, card.name]));
    return village.chronicle.map((entry) => ({
      ...entry,
      dateLabel: villageDateLabel(village.foundedAt, entry.dayIndex),
      actors: entry.actors.map((actor) => ({ ...actor, name: names.get(actor.id) ?? actor.name })),
    }));
  }

  /** A player-facing projection of durable, passing, and archived memory layers. */
  async function buildVillageMemories() {
    const [village, cards] = await Promise.all([readVillageState(), listVillagerCards()]);
    const names = new Map(cards.map((card) => [card.id, card.name]));
    for (const resident of village.villagers) names.set(resident.characterId, resident.cardSnapshot.name);
    const person = (id: string) => ({ id, name: names.get(id) ?? "Former resident" });
    const residents = village.villagers.map((resident) => person(resident.characterId));
    const now = villageNow().getTime();
    const durable = village.chronicle
      .filter((entry) => entry.kind !== "tick")
      .map((entry) => {
        const knownByIds =
          entry.scope === "village"
            ? residents.map((resident) => resident.id)
            : (entry.knownByCharacterIds ?? entry.actors.map((actor) => actor.id)).filter(Boolean);
        const subjectIds = (entry.subjectCharacterIds ?? entry.actors.map((actor) => actor.id)).filter(Boolean);
        return {
          ...entry,
          dateLabel: villageDateLabel(village.foundedAt, entry.dayIndex),
          subjects: [...new Set(subjectIds)].map(person),
          knownBy: [...new Set(knownByIds)].map(person),
          evidence: entry.sourceVisitId ? { visitId: entry.sourceVisitId, lineIds: entry.sourceLineIds ?? [] } : null,
          legacy: !entry.sourceVisitId && !entry.memoryCategory,
        };
      });
    const recollections = village.recollections
      .filter((entry) => Date.parse(entry.expiresAt) > now)
      .map((entry) => ({
        ...entry,
        subjects: entry.subjectCharacterIds.map(person),
        knownBy: entry.knownByCharacterIds.map(person),
      }));
    return {
      generatedAt: new Date(now).toISOString(),
      residents,
      durable,
      recollections,
      expiredRecollectionCount: village.recollections.length - recollections.length,
    };
  }

  /**
   * Forget one thing.
   *
   * Removed by id rather than by position, unlike a notice: the story tab shows
   * the list in the order the record holds it, but it is a long list a player
   * scrolls, and a delete press that landed against a stale render would take out
   * whichever memory had drifted into that row. The id is what the press was
   * aimed at.
   *
   * Throwing when nothing matched is deliberate — it is how the route answers 404
   * for a memory that was already removed in another tab, rather than reporting a
   * success that did nothing.
   */
  async function removeChronicleEntry(id: unknown): Promise<void> {
    const entryId = asTrimmedString(id);
    if (entryId.length === 0) throw badRequest("That is not a memory of this village.");
    await mutateVillageState((state) => {
      const next = state.chronicle.filter((entry) => entry.id !== entryId);
      if (next.length === state.chronicle.length) throw notFound("That memory is no longer kept here.");
      state.chronicle = next;
    });
  }

  async function removeVillageRecollection(id: unknown): Promise<void> {
    const entryId = asTrimmedString(id);
    if (!entryId) throw badRequest("That is not a passing recollection of this village.");
    await mutateVillageState((state) => {
      const next = state.recollections.filter((entry) => entry.id !== entryId);
      if (next.length === state.recollections.length) throw notFound("That recollection is no longer active.");
      state.recollections = next;
    });
  }
  return {
    resetVillage,
    reconcileVillage,
    buildVillageStory,
    buildVillageMemories,
    removeChronicleEntry,
    removeVillageRecollection,
  };
}
export type WorldCoordination = ReturnType<typeof createWorldCoordination>;
