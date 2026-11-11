import type { VillageState } from "./world.js";

export type VillageMemoryRead = {
  memories?: boolean;
};
export type VillageMemoryWrite = Omit<VillageMemoryRead, "memories"> & {
  memories?: boolean | ((state: VillageState) => boolean);
  /** Publication hints only: the repository rechecks the physical saved job under repair admission. */
  sourceJobs?: readonly { slot: string; id: string; instanceId: string; attempt: number; owner: string }[];
};

/** Native authority, with common history loaded explicitly by its consumers. */
export interface VillageRepository {
  /** Short, provider-free acceptance window shared with all authority mutations. */
  withAuthorityLock?<T>(work: () => Promise<T>): Promise<T>;
  readAuthority(options?: VillageMemoryRead): Promise<VillageState>;
  mutateAuthority(
    update: (state: VillageState) => void | false | Promise<void | false>,
    options?: VillageMemoryWrite,
  ): Promise<void>;
}
