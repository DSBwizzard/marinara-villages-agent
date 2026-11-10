import type { VillageState } from "../models/world.js";
import { backgroundRevision } from "./background-revision.js";

/** Opaque request scope; it is neither an authorization grant nor an owning storage reference. */
export const villageWorldScope = (world: Pick<VillageState, "seed" | "setupAt">) =>
  backgroundRevision([world.seed, world.setupAt]);
