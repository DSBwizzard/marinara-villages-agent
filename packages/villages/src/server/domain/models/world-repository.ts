import type { VillageState } from "./world.js";

export type VillageMemoryRead = {
  memories?: boolean;
  wishes?: true | readonly string[];
  /** Exact historical Wish after-images needed by this operation. */
  wishEffects?: true | readonly string[] | ((state: VillageState) => readonly string[]);
};
export type VillageMemoryWrite = Omit<VillageMemoryRead, "memories"> & {
  memories?: boolean | ((state: VillageState) => boolean);
  /** Publication hints only: the repository rechecks the physical saved job under repair admission. */
  sourceJobs?: readonly { slot: string; id: string; instanceId: string; attempt: number }[];
};

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
