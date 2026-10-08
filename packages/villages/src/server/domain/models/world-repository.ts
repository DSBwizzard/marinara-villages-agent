import type { VillageState } from "./world.js";

/** Raw saved authority; relationship hydration and side effects belong to its service. */
export interface VillageRepository {
  readAuthority(): Promise<VillageState>;
  mutateAuthority(update: (state: VillageState) => void | false | Promise<void | false>): Promise<void>;
}
