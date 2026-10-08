import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import type { VillageState } from "../../domain/models/world.js";
import type { VillageRepository } from "../../domain/models/world-repository.js";
import { normalizeVillageMutation } from "../../domain/rules/world-mutation.js";
import type { WorldRelationships } from "./world-relationships.js";

/** Owns hydrated reads and relationship effects, separate from raw document storage. */
export function createVillageStateService(repository: VillageRepository, worldRelationships: () => WorldRelationships) {
  const readVillageAuthority = () => repository.readAuthority();

  /** Read-only ledger snapshot for feeds and diagnostics; never applies an outbox. */
  async function readVillageSnapshot(): Promise<VillageState> {
    const state = await readVillageAuthority();
    if (state.seed) {
      const { readRelationshipState, reconcileRelationships } = worldRelationships();
      state.relationshipContext = await readRelationshipState(state.seed);
      reconcileRelationships(state.relationshipContext, state);
    }
    return state;
  }

  async function readVillageState(): Promise<VillageState> {
    const state = await readVillageSnapshot();
    if (state.seed) {
      const { readRelationshipState, reconcileRelationships } = worldRelationships();
      const { projectSocialActivities, processSocialOutbox, reconcileSocialPlans } = worldRelationships();
      if (await processSocialOutbox(state)) {
        const refreshed = await readVillageAuthority();
        Object.assign(state, refreshed);
        state.relationshipContext = await readRelationshipState(state.seed);
        reconcileRelationships(state.relationshipContext, state);
      }
      reconcileSocialPlans(state);
      projectSocialActivities(state);
    }
    return state;
  }

  /**
   * Apply a change to the village and persist it, retrying on a revision conflict.
   *
   * The founding stamp is applied here rather than inside each mutation so it
   * cannot be forgotten: the village starts keeping its own time at the first
   * write that creates or touches it, and every later write leaves the stamp
   * alone. That is what makes the derived clock stable — `foundedAt` is written
   * once and never recomputed.
   */
  async function mutateVillageState(mutate: (state: VillageState) => void): Promise<VillageState> {
    let next = defaultVillageState();
    await repository.mutateAuthority(async (state) => {
      const relationshipSeed = state.seed;
      if (relationshipSeed) {
        const { readRelationshipState, reconcileRelationships } = worldRelationships();
        state.relationshipContext = await readRelationshipState(relationshipSeed);
        reconcileRelationships(state.relationshipContext, state);
      }
      normalizeVillageMutation(state, relationshipSeed, mutate);

      next = state;
    });
    const { persistRelationshipAuthority } = worldRelationships();
    await persistRelationshipAuthority(next);
    return next;
  }
  return { readVillageAuthority, readVillageSnapshot, readVillageState, mutateVillageState };
}
export type VillageStateService = ReturnType<typeof createVillageStateService>;
