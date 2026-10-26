import type { VillageState } from "./world.js";

export type VillageMemoryRead = { memories?: boolean };
export type VillageMemoryWrite = { memories?: boolean | ((state: VillageState) => boolean) };

/** Raw saved authority; relationship hydration and side effects belong to its service. */
export interface VillageRepository {
  /** Short, provider-free acceptance window shared with all authority mutations. */
  withAuthorityLock?<T>(work: () => Promise<T>): Promise<T>;
  readAuthority(options?: VillageMemoryRead): Promise<VillageState>;
  mutateAuthority(
    update: (state: VillageState) => void | false | Promise<void | false>,
    options?: VillageMemoryWrite,
  ): Promise<void>;
}
