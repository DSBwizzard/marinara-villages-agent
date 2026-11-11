import { foundingReadyForPlay } from "../../domain/rules/founding-tasks.js";
import type { VillageTimeAdvance } from "../../../shared/contracts/clock.js";
import type {
  MemoryCorrectRequest,
  MemoryForgetRequest,
  MemoryInspection,
  MemoryLibrary,
} from "../../../shared/contracts/village.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { outsideVenueOperation } from "../../adapters/operations/operation-context.js";
import { advanceVillageClock, villageNow, villageTimeAdvanceSettled } from "../../adapters/time/clock-gate.js";
import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageState } from "../../domain/models/world.js";
import { calendarReplay } from "../../domain/rules/clock-state.js";
import { conflict } from "../../domain/rules/errors.js";
import { captureReturnContext } from "../../domain/rules/return-catchup-capture.js";
import { returnCaptureRevision } from "../../domain/rules/return-capture-revision.js";
import { discoverReturnBatch, recordReturnVisibility } from "../../domain/rules/return-catchup-state.js";
import type { reconcileProjectLifecycles } from "../../domain/rules/project-lifecycle-rules.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import {
  continuityMemoryLibrary,
  inspectContinuityMemory,
  changeContinuityMemory,
  type MemoryQuery,
} from "../../domain/rules/continuity-library.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import type { preparePrivateSpaces } from "../../jobs/private-space-preparation.js";
import type {
  queuePendingAgendas,
  refreshScheduleInfluence,
  rollActiveAgendas,
} from "../residents/resident-agendas.js";
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
  queuePendingAgendas: typeof queuePendingAgendas;
  refreshScheduleInfluence: typeof refreshScheduleInfluence;
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
  queuePendingAgendas,
  refreshScheduleInfluence,
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
    if (!options.advanceTime) await reconcileNarrative?.(options.now ?? villageNow());
    if (options.advanceTime) {
      const request = options.advanceTime;
      const departure = await readVillageAuthority({ memories: true });
      await advanceVillageClock(request, (state, from, until) => {
        const captured = captureReturnContext(state, from);
        if (returnCaptureRevision(captured) !== returnCaptureRevision(captureReturnContext(departure, from)))
          throw conflict("The Village changed. Refresh before advancing time.");
        const batch = state.returnCatchup?.batch;
        if (batch && !["completed", "cancelled"].includes(batch.status))
          throw conflict("Finish Village catch-up before advancing time.");
        state.returnCatchup ??= {};
        state.returnCatchup.capture = captured;
        discoverReturnBatch(state, until, request.actionId);
        if (until.getTime() - from.getTime() < 60 * 60_000) recordReturnVisibility(state, until);
      });
    }
    let recorded = await readVillageState();
    const now = options.now ?? villageNow();
    if (!isVillageFounded(recorded)) return buildVillageSnapshot(now);
    if (!foundingReadyForPlay(recorded)) return buildVillageSnapshot(now);
    let completedMove = false;
    for (const residence of recorded.residences) {
      if (residence.status !== "moving" || Date.parse(residence.completesAt ?? "") > now.getTime()) continue;
      try {
        await completeVillageResidence(residence.characterId, false, now);
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
              ((project.kind === "establishment" && project.establishment?.physical) ||
                Date.parse(project.lifecycle?.workOrder?.completesAt ?? "") <= now.getTime()),
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
    // Founding owns its optional requests; ordinary pulses must not retry them.
    if (recorded.foundingPreparation && recorded.foundingPreparation.status !== "ready")
      return buildVillageSnapshot(now);
    // Discover optional paid work only after deterministic advancement has committed.
    // Initial space preparation retains the founding generation path; begin it only after local advancement.
    outsideVenueOperation(() => {
      void preparePrivateSpaces().catch(() => {});
    });
    const withAgendas = await queuePendingAgendas(await readVillageState(), now);
    await refreshScheduleInfluence(withAgendas, now);
    await reconcileResidentPlanning?.(now);
    return buildVillageSnapshot(now);
  }

  async function buildVillageMemories(input: MemoryQuery = {}): Promise<MemoryLibrary> {
    const state = await readVillageAuthority({ memories: true });
    return continuityMemoryLibrary(state, input, villageNow(state.clock?.advanceMs ?? 0).toISOString());
  }
  async function readVillageMemoryEvidence(
    id: string,
    inspection = false,
    characterId = "player",
  ): Promise<MemoryInspection> {
    const state = await readVillageAuthority({ memories: true });
    return inspectContinuityMemory(
      state,
      id,
      characterId,
      inspection,
      villageNow(state.clock?.advanceMs ?? 0).toISOString(),
    );
  }
  async function forgetMemory(id: string, input: MemoryForgetRequest) {
    return mutateMemory(id, input, "forget");
  }
  async function correctMemory(id: string, input: MemoryCorrectRequest) {
    return mutateMemory(id, input, "repair");
  }
  async function mutateMemory(
    id: string,
    input: MemoryForgetRequest | MemoryCorrectRequest,
    action: "forget" | "repair",
  ) {
    await mutateMemoryAuthority((state) => {
      try {
        state.continuity = changeContinuityMemory(
          state,
          id,
          input,
          action,
          villageNow(state.clock?.advanceMs ?? 0).toISOString(),
        );
      } catch (error) {
        throw conflict(error instanceof Error ? error.message : "The continuity changed.");
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
