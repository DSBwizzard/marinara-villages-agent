import type { VillageState } from "../models/world.js";
import { semanticHash } from "./semantic-contract.js";

/** Opaque request scope; it is neither an authorization grant nor an owning storage reference. */
export const villageWorldScope = (world: Pick<VillageState, "seed" | "setupAt">) =>
  semanticHash([world.seed, world.setupAt]);
