import type { SocialPlan } from "./relationship-types.js";
import type { ResidentPlanningOpportunity } from "./world.js";

export type SocialOutboxEntry = {
  id: string;
  /** A return coordinator owns settlement ordering for this source. */
  catchupBatchId?: string;
  seed: string;
  at: string;
  opportunity: ResidentPlanningOpportunity;
  candidates: SocialPlan[];
  relationshipSnapshot?: import("./relationship-types.js").RelationshipState;
  proposal: { planId?: unknown; encounter?: unknown };
  requiredPlanId?: string;
  requiredPlan?: SocialPlan;
  processed?: boolean;
  error?: string;
  reinterpretRequired?: boolean;
  reinterpreted?: boolean;
  admitted?: Pick<import("./world.js").VillageState, "villagers" | "venues" | "residences" | "timeZone"> &
    Partial<Pick<import("./world.js").VillageState, "projects" | "opening" | "narrative">>;
};
