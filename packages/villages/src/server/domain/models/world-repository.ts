import type { VillageState } from "./world.js";

export type VillageMemoryRead = { memories?: boolean };
export type VillageMemoryWrite = { memories?: boolean | ((state: VillageState) => boolean) };

/** Raw saved authority; relationship hydration and side effects belong to its service. */
export interface VillageRepository {
  readAuthority(options?: VillageMemoryRead): Promise<VillageState>;
  mutateAuthority(
    update: (state: VillageState) => void | false | Promise<void | false>,
    options?: VillageMemoryWrite,
  ): Promise<void>;
}
