import type { VillageSnapshot } from "../../domain/models/world.js";
import { conflict, safeFailureMessage } from "../../domain/rules/errors.js";
import { randomVillageSeed } from "../../domain/rules/village-clock.js";
import { privatePreparationRooms } from "../../jobs/private-space-preparation.js";
import type { preparePrivateSpaces } from "../../jobs/private-space-preparation.js";
import type {
  backgroundStatus,
  backgroundWorkSummaries,
  retryBackgroundJob,
  settleBackgroundWork,
} from "../../jobs/background-work.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { readVillageState, mutateVillageState } from "../world/village-store.js";
import type { buildVillageSnapshot } from "../world/snapshot.js";
import type { seedFoundingVenueDetails } from "./founding-drafts.js";
import type { reportFoundingProgress } from "./founding-progress.js";
export interface FoundingPreparationPorts {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
  villagesLogger: typeof villagesLogger;
  seedFoundingVenueDetails: typeof seedFoundingVenueDetails;
  reportFoundingProgress: typeof reportFoundingProgress;
  preparePrivateSpaces: typeof preparePrivateSpaces;
  backgroundStatus: typeof backgroundStatus;
  backgroundWorkSummaries: typeof backgroundWorkSummaries;
  retryBackgroundJob: typeof retryBackgroundJob;
  settleBackgroundWork: typeof settleBackgroundWork;
  queueVillagerAgenda(characterId: string, finite?: boolean): Promise<void>;
}
/** One application owns the first-founding sequence and its deliberate retries. */
export function createFoundingPreparation(ports: FoundingPreparationPorts) {
  const {
    readVillageState,
    mutateVillageState,
    buildVillageSnapshot,
    villagesLogger,
    seedFoundingVenueDetails,
    reportFoundingProgress,
    preparePrivateSpaces,
    backgroundStatus,
    backgroundWorkSummaries,
    retryBackgroundJob,
    settleBackgroundWork,
    queueVillagerAgenda,
  } = ports;
  let foundingWork: Promise<void> | null = null;
  function prepareFoundedVillage(): Promise<void> {
    if (foundingWork) return foundingWork;
    let seed: string | undefined;
    foundingWork = (async () => {
      const initial = await readVillageState();
      seed = initial.seed;
      if (initial.foundingPreparation?.status !== "pending") return;
      if (!initial.foundingPreparation.venueDetailsSeeded) {
        try {
          await reportFoundingProgress(initial.seed, {
            phase: "venues",
            stage: "lore",
            currentId: "",
            currentVenueId: "",
            currentZoneId: "",
          });
          const details = await seedFoundingVenueDetails(initial, (progress) =>
            reportFoundingProgress(initial.seed, progress),
          );
          await reportFoundingProgress(initial.seed, { stage: "saving" });
          await mutateVillageState((state) => {
            if (
              state.seed !== initial.seed ||
              state.foundingPreparation?.status !== "pending" ||
              state.foundingPreparation.venueDetailsSeeded
            )
              return;
            for (const venue of state.venues) {
              const seed = details[venue.id];
              if (!seed) continue;
              const space = venue.spaces?.[0] ?? venue.zones?.find((zone) => zone.kind === "exterior");
              if (!space) continue;
              const features = seed.features.map((text) => ({
                id: randomVillageSeed(),
                text,
                sourceCharacterId: "",
                locked: false,
                updatedAt: "",
              }));
              space.state = {
                ...space.state,
                condition: seed.condition,
                items: seed.items,
                publicFacts: seed.publicFacts,
                features,
              };
              venue.state = {
                ...venue.state,
                condition: seed.condition,
                furniture: seed.items,
                publicFacts: seed.publicFacts,
                features,
              };
            }
            state.foundingPreparation.venueDetailsSeeded = true;
          });
        } catch (error) {
          villagesLogger().warn("[villages] initial venue details unavailable: %s", String(error));
          await mutateVillageState((state) => {
            if (state.seed === initial.seed && state.foundingPreparation?.status === "pending")
              state.foundingPreparation.venueDetailsSeeded = true;
          });
        }
      }
      try {
        if ((await readVillageState()).seed !== initial.seed) return;
        await reportFoundingProgress(initial.seed, {
          phase: "private-spaces",
          stage: "queued",
          currentId: "",
          attempt: undefined,
        });
        await preparePrivateSpaces();
        const prepared = await readVillageState();
        if (prepared.seed !== initial.seed) return;
        const blocked = privatePreparationRooms(prepared).find(({ zone }) => zone.preparation?.status !== "ready");
        if (blocked)
          throw new Error(
            blocked.zone.preparation?.error || `${blocked.zone.name} needs preparation. Retry to continue.`,
          );
      } catch (error) {
        await mutateVillageState((state) => {
          if (state.seed === initial.seed && state.foundingPreparation?.status === "pending") {
            state.foundingPreparation.status = "failed";
            state.foundingPreparation.error = safeFailureMessage(error).slice(0, 300);
          }
        });
        return;
      }
      for (const villager of initial.villagers) {
        const latest = await readVillageState();
        if (latest.seed !== initial.seed || latest.foundingPreparation?.status !== "pending") return;
        if (latest.foundingPreparation.completedIds.includes(villager.characterId)) continue;
        const adopted = latest.villagers.find((resident) => resident.characterId === villager.characterId)?.agenda;
        if (adopted && !adopted.personalizationPending) {
          await mutateVillageState((state) => {
            const marker = state.foundingPreparation;
            if (
              state.seed === initial.seed &&
              marker?.status === "pending" &&
              !marker.completedIds.includes(villager.characterId)
            )
              marker.completedIds.push(villager.characterId);
          });
          continue;
        }
        await reportFoundingProgress(initial.seed, {
          phase: "residents",
          currentId: villager.characterId,
          currentVenueId: "",
          currentZoneId: "",
          stage: "reading",
          attempt: undefined,
          modelName: undefined,
          loreEntryCount: undefined,
        });
        await queueVillagerAgenda(villager.characterId, true);
        await settleBackgroundWork();
        const saved = await readVillageState();
        if (saved.seed !== initial.seed) return;
        const resident = saved.villagers.find((entry) => entry.characterId === villager.characterId);
        if (
          !resident?.agenda?.generatedAt ||
          resident.agenda.personalizationPending ||
          (await backgroundStatus("agenda", villager.characterId)) !== "completed"
        ) {
          const failure = (await backgroundWorkSummaries()).find(
            (job) => job.kind === "agenda" && job.subjectId === villager.characterId,
          )?.error;
          await mutateVillageState((state) => {
            if (state.seed === initial.seed && state.foundingPreparation?.status === "pending") {
              state.foundingPreparation.status = "failed";
              state.foundingPreparation.error = failure
                ? safeFailureMessage(new Error(failure)).slice(0, 300)
                : "Routine preparation stopped. Saved responses are retained; retry deliberately.";
            }
          });
          return;
        }
        await mutateVillageState((state) => {
          const marker = state.foundingPreparation;
          if (
            state.seed === initial.seed &&
            marker?.status === "pending" &&
            !marker.completedIds.includes(villager.characterId)
          )
            marker.completedIds.push(villager.characterId);
        });
      }
      await mutateVillageState((state) => {
        if (state.seed === initial.seed && state.foundingPreparation?.status === "pending") {
          state.foundingPreparation.status = "ready";
          state.foundingPreparation.currentId = "";
          state.foundingPreparation.stage = undefined;
        }
      });
    })()
      .catch(async (error) => {
        villagesLogger().warn("[villages] founding preparation stopped: %s", String(error));
        try {
          await mutateVillageState((state) => {
            if (state.seed !== seed || state.foundingPreparation?.status !== "pending") return;
            state.foundingPreparation.status = "failed";
            state.foundingPreparation.error = safeFailureMessage(error).slice(0, 300);
          });
        } catch (writeError) {
          villagesLogger().warn(
            "[villages] founding preparation failure could not be recorded: %s",
            String(writeError),
          );
        }
      })
      .finally(() => {
        foundingWork = null;
      });
    return foundingWork;
  }
  async function retryFoundedVillagePreparation(): Promise<VillageSnapshot> {
    // Called only by POST /setup/preparation/retry after the player presses Retry.
    // This explicit action is the authorization; discovery and clock reconciliation never call it.
    const requested = await readVillageState();
    if (requested.foundingPreparation?.status !== "failed") return buildVillageSnapshot();
    let admitted = false;
    await mutateVillageState((state) => {
      admitted = false;
      const marker = state.foundingPreparation;
      if (state.seed !== requested.seed || !marker || marker.status !== "failed") return;
      admitted = true;
      for (const { zone } of privatePreparationRooms(state))
        if (zone.preparation?.status === "failed")
          zone.preparation = { status: "pending", attempt: zone.preparation.attempt };
      marker.status = "pending";
      marker.error = "";
      marker.attempt = undefined;
      marker.stage = "queued";
      marker.stageStartedAt = new Date().toISOString();
    });
    if (!admitted) return buildVillageSnapshot();
    const unfinished = requested.villagers
      .filter((resident) => !requested.foundingPreparation!.completedIds.includes(resident.characterId))
      .map((resident) => resident.characterId);
    for (const job of await backgroundWorkSummaries()) {
      if (
        job.kind === "agenda" &&
        unfinished.includes(job.subjectId) &&
        ["failed", "interrupted", "paused"].includes(job.status)
      )
        await retryBackgroundJob(job.id, job.attempt, randomVillageSeed());
    }
    queueMicrotask(() => {
      void prepareFoundedVillage();
    });
    return buildVillageSnapshot();
  }
  async function foundingPreparationSnapshot(): Promise<VillageSnapshot> {
    const state = await readVillageState();
    if (state.foundingPreparation?.status === "pending")
      queueMicrotask(() => {
        void prepareFoundedVillage();
      });
    return buildVillageSnapshot();
  }
  async function assertFoundedVillageReady(): Promise<void> {
    const marker = (await readVillageState()).foundingPreparation;
    if (marker && marker.status !== "ready")
      throw conflict("The village is still preparing. Retry any failed preparation before entering.");
  }
  return {
    prepareFoundedVillage,
    retryFoundedVillagePreparation,
    foundingPreparationSnapshot,
    assertFoundedVillageReady,
  };
}
export type FoundingPreparationService = ReturnType<typeof createFoundingPreparation>;
