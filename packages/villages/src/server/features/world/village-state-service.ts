import { refreshProjectAgreements } from "../../domain/rules/project-lifecycle-rules.js";
import { observeVillageClock, villageNow } from "../../adapters/time/clock-gate.js";
import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import type { VillageState } from "../../domain/models/world.js";
import type { VillageRepository, VillageMemoryRead, VillageMemoryWrite } from "../../domain/models/world-repository.js";
import { normalizeVillageMutation } from "../../domain/rules/world-mutation.js";

/** Clock and native Project views share the Village's one authority publication. */
export function createVillageStateService(repository: VillageRepository) {
  const peekVillageAuthority = () => repository.readAuthority();
  const readVillageAuthority = async (options?: VillageMemoryRead) => {
    await observeVillageClock();
    return repository.readAuthority(options);
  };

  /** Read-only ledger snapshot for feeds and diagnostics; never applies an outbox. */
  async function readVillageSnapshot(options?: VillageMemoryRead): Promise<VillageState> {
    const state = await readVillageAuthority(options);
    refreshProjectAgreements(state);
    return state;
  }

  async function readVillageState(options?: VillageMemoryRead): Promise<VillageState> {
    return readVillageSnapshot(options);
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
  async function mutateVillageState(
    mutate: (state: VillageState) => void,
    options?: VillageMemoryWrite,
  ): Promise<VillageState> {
    let next = defaultVillageState();
    await repository.mutateAuthority(async (state) => {
      normalizeVillageMutation(state, mutate, {
        // A reset can replace the clock inside this mutation. Stamp the resulting world's time.
        now: () => villageNow(state.clock?.advanceMs ?? 0),
        seed: () => Math.random().toString(36).slice(2, 10).padEnd(8, "0"),
      });

      next = state;
    }, options);
    return next;
  }
  async function withVillageSceneAcceptance<T>(
    work: (state: VillageState) => Promise<T>,
    options?: VillageMemoryRead,
  ): Promise<T> {
    // Observe before acquiring the write gate: the clock can itself need a world write.
    await observeVillageClock();
    const accept = async () => work(await repository.readAuthority(options));
    return repository.withAuthorityLock ? repository.withAuthorityLock(accept) : accept();
  }
  return {
    peekVillageAuthority,
    readVillageAuthority,
    readVillageSnapshot,
    readVillageState,
    mutateVillageState,
    withVillageSceneAcceptance,
  };
}
export type VillageStateService = ReturnType<typeof createVillageStateService>;
